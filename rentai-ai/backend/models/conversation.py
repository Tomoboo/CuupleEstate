"""会話履歴モデルとリポジトリ操作。"""
from typing import Literal, Optional

from pydantic import BaseModel

from db.supabase_client import get_client


class ConversationMessage(BaseModel):
    id: Optional[str] = None
    customer_id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: Optional[str] = None


def save(customer_id: str, role: str, content: str) -> None:
    get_client().table("conversations").insert(
        {"customer_id": customer_id, "role": role, "content": content}
    ).execute()


def history(customer_id: str, limit: int = 40) -> list[ConversationMessage]:
    """新しい順に limit 件取得し、時系列順に並べ替えて返す。"""
    res = (
        get_client()
        .table("conversations")
        .select("*")
        .eq("customer_id", customer_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    rows = list(reversed(res.data))
    return [ConversationMessage(**row) for row in rows]


def to_claude_messages(messages: list[ConversationMessage]) -> list[dict]:
    """Claude API の messages 形式に変換する。

    API は user/assistant の交互を要求しないが、先頭は user である必要が
    あるため、先頭の assistant 連続分は除外する。
    """
    result = [{"role": m.role, "content": m.content} for m in messages]
    while result and result[0]["role"] != "user":
        result.pop(0)
    return result
