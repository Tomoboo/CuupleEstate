"""顧客モデルとリポジトリ操作。"""
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel

from db.supabase_client import get_client

# ヒアリングで収集する項目（1〜7 が必須、8〜10 は任意）
REQUIRED_HEARING_FIELDS = [
    "move_date",
    "desired_area",
    "rent_max",
    "initial_cost_max",
    "floor_plan",
    "num_people",
    "occupation",
    "income_annual",
]
OPTIONAL_HEARING_FIELDS = [
    "has_guarantor",
    "credit_concern",
    "must_conditions",
    "flexible_conditions",
]
HEARING_FIELDS = REQUIRED_HEARING_FIELDS + OPTIONAL_HEARING_FIELDS

VALID_STATUSES = [
    "hearing",
    "condition_review",
    "proposable",
    "pre_visit",
    "post_visit",
    "pre_apply",
    "applied",
    "screening",
    "pre_contract",
    "contracted",
]


class Customer(BaseModel):
    id: str
    line_user_id: str
    display_name: Optional[str] = None
    created_at: Optional[str] = None

    move_date: Optional[str] = None
    desired_area: Optional[str] = None
    rent_max: Optional[int] = None
    initial_cost_max: Optional[int] = None
    floor_plan: Optional[str] = None
    num_people: Optional[int] = None
    occupation: Optional[str] = None
    income_annual: Optional[int] = None
    has_guarantor: Optional[bool] = None
    credit_concern: Optional[str] = None
    must_conditions: Optional[list[str]] = None
    flexible_conditions: Optional[list[str]] = None

    score_rank: Optional[str] = None
    score_urgency: Optional[int] = None
    score_budget: Optional[int] = None
    score_initial_cost: Optional[int] = None
    score_credit_risk: Optional[int] = None
    score_condition_overload: Optional[int] = None
    score_reason: Optional[str] = None

    status: str = "hearing"
    hearing_completed: bool = False
    last_contacted_at: Optional[str] = None
    sales_notified_at: Optional[str] = None
    notes: Optional[str] = None

    def hearing_is_complete(self) -> bool:
        """必須7項目（職業・年収は2カラム）が全て揃っているか。"""
        return all(getattr(self, f) is not None for f in REQUIRED_HEARING_FIELDS)


def find_by_line_user_id(line_user_id: str) -> Optional[Customer]:
    res = (
        get_client()
        .table("customers")
        .select("*")
        .eq("line_user_id", line_user_id)
        .limit(1)
        .execute()
    )
    return Customer(**res.data[0]) if res.data else None


def find_by_id(customer_id: str) -> Optional[Customer]:
    res = (
        get_client()
        .table("customers")
        .select("*")
        .eq("id", customer_id)
        .limit(1)
        .execute()
    )
    return Customer(**res.data[0]) if res.data else None


def create(line_user_id: str, display_name: Optional[str] = None) -> Customer:
    res = (
        get_client()
        .table("customers")
        .insert({"line_user_id": line_user_id, "display_name": display_name})
        .execute()
    )
    return Customer(**res.data[0])


def update(customer_id: str, fields: dict[str, Any]) -> Customer:
    res = (
        get_client()
        .table("customers")
        .update(fields)
        .eq("id", customer_id)
        .execute()
    )
    return Customer(**res.data[0])


def touch_last_contacted(customer_id: str) -> None:
    update(customer_id, {"last_contacted_at": datetime.now(timezone.utc).isoformat()})


def list_customers(rank: Optional[str] = None, status: Optional[str] = None) -> list[Customer]:
    q = get_client().table("customers").select("*").order("created_at", desc=True)
    if rank:
        q = q.eq("score_rank", rank)
    if status:
        q = q.eq("status", status)
    return [Customer(**row) for row in q.execute().data]
