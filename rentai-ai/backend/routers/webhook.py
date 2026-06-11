"""LINE Webhook 受信ルーター。

処理フロー:
  LINEメッセージ受信
    → 署名検証
    → 顧客の検索/新規作成
    → ヒアリング継続（Claude）
    → 返信送信 + 会話履歴保存
    → ヒアリング完了時: スコアリング → 診断返信 → 営業通知(S/A即時)
"""
import json
import logging

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request

from models import conversation as conversation_repo
from models import customer as customer_repo
from services import ai_service, line_service, notify_service, scoring_service
from prompts.hearing_prompt import WELCOME_MESSAGE

logger = logging.getLogger(__name__)

router = APIRouter(tags=["webhook"])


@router.post("/webhook")
async def line_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_line_signature: str = Header(default=""),
):
    body = await request.body()
    if not line_service.verify_signature(body, x_line_signature):
        raise HTTPException(status_code=401, detail="invalid signature")

    payload = json.loads(body)
    for event in payload.get("events", []):
        if event.get("type") != "message":
            continue
        message = event.get("message", {})
        if message.get("type") != "text":
            continue
        # Claude 呼び出しに時間がかかるためバックグラウンドで処理し、
        # LINE には即時 200 を返す（応答は push で送る場合あり）
        background_tasks.add_task(
            process_text_message,
            event["source"]["userId"],
            message.get("text", ""),
            event.get("replyToken", ""),
        )

    return {"status": "ok"}


def process_text_message(line_user_id: str, text: str, reply_token: str) -> None:
    customer = None
    try:
        customer = customer_repo.find_by_line_user_id(line_user_id)
        is_new = customer is None
        if is_new:
            display_name = line_service.get_profile_name(line_user_id)
            customer = customer_repo.create(line_user_id, display_name)

        conversation_repo.save(customer.id, "user", text)

        if is_new:
            # 新規顧客: ウェルカムメッセージでヒアリング開始
            _send(reply_token, line_user_id, [WELCOME_MESSAGE])
            conversation_repo.save(customer.id, "assistant", WELCOME_MESSAGE)
            customer_repo.touch_last_contacted(customer.id)
            return

        if customer.hearing_completed:
            # ヒアリング済みの顧客: 通常対応（ヒアリングBotと同じ会話エンジンで応答）
            history = conversation_repo.history(customer.id)
            result = ai_service.hearing_turn(customer, history)
            _send(reply_token, line_user_id, [result["reply"]])
            conversation_repo.save(customer.id, "assistant", result["reply"])
            customer_repo.touch_last_contacted(customer.id)
            return

        # ヒアリング継続
        history = conversation_repo.history(customer.id)
        result = ai_service.hearing_turn(customer, history)

        if result["fields"]:
            customer = customer_repo.update(customer.id, result["fields"])

        hearing_done = result["hearing_completed"] or customer.hearing_is_complete()

        if not hearing_done:
            _send(reply_token, line_user_id, [result["reply"]])
            conversation_repo.save(customer.id, "assistant", result["reply"])
            customer_repo.touch_last_contacted(customer.id)
            return

        # ヒアリング完了 → スコアリング → 診断返信 → 営業通知
        scoring = scoring_service.run_scoring(customer)
        scored_customer = scoring["customer"]
        diagnosis = scoring["customer_reply"] or result["reply"]

        _send(reply_token, line_user_id, [diagnosis])
        conversation_repo.save(customer.id, "assistant", diagnosis)
        customer_repo.touch_last_contacted(customer.id)

        notify_service.notify_if_immediate(scored_customer)

    except Exception:
        logger.exception("webhook processing failed for %s", line_user_id)
        # エラー時フォールバック
        _send(reply_token, line_user_id, [line_service.FALLBACK_MESSAGE])
        if customer is not None:
            try:
                conversation_repo.save(
                    customer.id, "assistant", line_service.FALLBACK_MESSAGE
                )
            except Exception:
                logger.exception("failed to save fallback message")


def _send(reply_token: str, line_user_id: str, texts: list[str]) -> None:
    """reply token で送信し、失敗時（期限切れ等）は push にフォールバック。"""
    if reply_token and line_service.reply_message(reply_token, texts):
        return
    line_service.push_message(line_user_id, texts)
