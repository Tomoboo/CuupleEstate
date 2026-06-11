"""Claude API 呼び出しサービス。

- ヒアリング会話（返信生成 + 項目抽出）
- スコアリング + 顧客向け診断返信生成
- 追客テンプレ生成
"""
import json
import logging
import re
import time
from typing import Any, Optional

import anthropic

import config
from models.conversation import ConversationMessage, to_claude_messages
from models.customer import Customer, HEARING_FIELDS
from prompts import followup_prompt, hearing_prompt, scoring_prompt

logger = logging.getLogger(__name__)

# SDK 自体も 429/5xx を自動リトライする（max_retries）。
# さらに上位でレート制限の長い retry-after に備えて1回だけ待機リトライする。
_client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY, max_retries=3)


def _call_claude(system: str, messages: list[dict], max_tokens: int = 1500) -> str:
    """Claude を呼び出してテキストを返す。レート制限時は待機して1回リトライ。"""
    for attempt in range(2):
        try:
            response = _client.messages.create(
                model=config.ANTHROPIC_MODEL,
                max_tokens=max_tokens,
                system=system,
                messages=messages,
            )
            if response.stop_reason == "refusal":
                raise RuntimeError("Claude が応答を拒否しました")
            text_parts = [b.text for b in response.content if b.type == "text"]
            return "".join(text_parts)
        except anthropic.RateLimitError:
            if attempt == 0:
                logger.warning("Rate limited. 20秒待機してリトライします")
                time.sleep(20)
                continue
            raise
    raise RuntimeError("unreachable")


def _extract_json(text: str) -> dict[str, Any]:
    """応答テキストから JSON オブジェクトを取り出す（コードフェンス対応）。"""
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fence:
        text = fence.group(1)
    else:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end > start:
            text = text[start : end + 1]
    return json.loads(text)


def hearing_turn(
    customer: Customer, history: list[ConversationMessage]
) -> dict[str, Any]:
    """ヒアリングの1ターンを処理する。

    Returns:
        {"reply": str, "fields": dict, "hearing_completed": bool}
    """
    known = {f: getattr(customer, f) for f in HEARING_FIELDS}
    system = hearing_prompt.build_system_prompt(known)
    messages = to_claude_messages(history)
    if not messages:
        return {
            "reply": hearing_prompt.WELCOME_MESSAGE,
            "fields": {},
            "hearing_completed": False,
        }

    raw = _call_claude(system, messages)
    try:
        data = _extract_json(raw)
    except (json.JSONDecodeError, ValueError):
        # JSONで返らなかった場合は本文をそのまま返信として扱う
        logger.warning("ヒアリング応答のJSONパースに失敗: %s", raw[:200])
        return {"reply": raw, "fields": {}, "hearing_completed": False}

    fields = {
        k: v
        for k, v in (data.get("fields") or {}).items()
        if k in HEARING_FIELDS and v is not None
    }
    return {
        "reply": data.get("reply") or "ありがとうございます！",
        "fields": fields,
        "hearing_completed": bool(data.get("hearing_completed")),
    }


def score_customer(customer: Customer) -> dict[str, Any]:
    """ヒアリング結果をスコアリングし、診断返信文も生成する。"""
    hearing = {f: getattr(customer, f) for f in HEARING_FIELDS}
    hearing["display_name"] = customer.display_name
    system = scoring_prompt.build_system_prompt()
    messages = [{"role": "user", "content": scoring_prompt.build_user_message(hearing)}]
    raw = _call_claude(system, messages, max_tokens=2000)
    return _extract_json(raw)


def generate_followup(customer: Customer) -> str:
    """顧客の status に応じた追客メッセージを生成する。"""
    info = {
        "display_name": customer.display_name,
        "status": customer.status,
        **{f: getattr(customer, f) for f in HEARING_FIELDS},
        "score_rank": customer.score_rank,
        "score_reason": customer.score_reason,
    }
    system = followup_prompt.build_system_prompt(customer.status, info)
    messages = [{"role": "user", "content": "追客メッセージを作成してください。"}]
    return _call_claude(system, messages, max_tokens=800).strip()
