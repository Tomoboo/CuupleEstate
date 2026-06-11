"""LINE Messaging API の送受信処理。"""
import base64
import hashlib
import hmac
import logging

import httpx

import config

logger = logging.getLogger(__name__)

LINE_API_BASE = "https://api.line.me/v2/bot"

FALLBACK_MESSAGE = (
    "申し訳ありません、ただいま混み合っております。\n"
    "しばらくお待ちください。担当者より改めてご連絡いたします。"
)


def verify_signature(body: bytes, signature: str) -> bool:
    """X-Line-Signature ヘッダーを検証する。"""
    if not signature:
        return False
    mac = hmac.new(
        config.LINE_CHANNEL_SECRET.encode("utf-8"), body, hashlib.sha256
    ).digest()
    expected = base64.b64encode(mac).decode("utf-8")
    return hmac.compare_digest(expected, signature)


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {config.LINE_CHANNEL_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }


def _to_message_objects(texts: list[str]) -> list[dict]:
    # LINE は1リクエスト5通まで
    return [{"type": "text", "text": t[:5000]} for t in texts[:5]]


def reply_message(reply_token: str, texts: list[str]) -> bool:
    """応答メッセージを送信する。失敗時は False。"""
    payload = {"replyToken": reply_token, "messages": _to_message_objects(texts)}
    try:
        res = httpx.post(
            f"{LINE_API_BASE}/message/reply",
            json=payload,
            headers=_headers(),
            timeout=10.0,
        )
        if res.status_code != 200:
            logger.error("LINE reply failed: %s %s", res.status_code, res.text)
            return False
        return True
    except httpx.HTTPError as e:
        logger.error("LINE reply error: %s", e)
        return False


def push_message(to: str, texts: list[str]) -> bool:
    """プッシュメッセージを送信する。失敗時は False。"""
    payload = {"to": to, "messages": _to_message_objects(texts)}
    try:
        res = httpx.post(
            f"{LINE_API_BASE}/message/push",
            json=payload,
            headers=_headers(),
            timeout=10.0,
        )
        if res.status_code != 200:
            logger.error("LINE push failed: %s %s", res.status_code, res.text)
            return False
        return True
    except httpx.HTTPError as e:
        logger.error("LINE push error: %s", e)
        return False


def get_profile_name(line_user_id: str) -> str | None:
    """ユーザーの表示名を取得する。"""
    try:
        res = httpx.get(
            f"{LINE_API_BASE}/profile/{line_user_id}",
            headers=_headers(),
            timeout=10.0,
        )
        if res.status_code == 200:
            return res.json().get("displayName")
    except httpx.HTTPError as e:
        logger.warning("LINE profile fetch error: %s", e)
    return None
