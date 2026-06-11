"""営業ダッシュボード用 管理API。"""
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from models import conversation as conversation_repo
from models import customer as customer_repo
from models.customer import VALID_STATUSES
from services import ai_service, notify_service, scoring_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["dashboard"])


class CustomerUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


@router.get("/customers")
def list_customers(rank: Optional[str] = None, status: Optional[str] = None):
    customers = customer_repo.list_customers(rank=rank, status=status)
    return {"customers": [c.model_dump() for c in customers]}


@router.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    customer = customer_repo.find_by_id(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="customer not found")
    messages = conversation_repo.history(customer.id, limit=200)
    return {
        "customer": customer.model_dump(),
        "conversations": [m.model_dump() for m in messages],
    }


@router.patch("/customers/{customer_id}")
def update_customer(customer_id: str, req: CustomerUpdateRequest):
    customer = customer_repo.find_by_id(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="customer not found")

    fields = {}
    if req.status is not None:
        if req.status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail="invalid status")
        fields["status"] = req.status
    if req.notes is not None:
        fields["notes"] = req.notes
    if not fields:
        raise HTTPException(status_code=400, detail="no fields to update")

    updated = customer_repo.update(customer_id, fields)
    return {"customer": updated.model_dump()}


@router.post("/customers/{customer_id}/followup")
def generate_followup(customer_id: str):
    """status に応じた追客テンプレを生成する。"""
    customer = customer_repo.find_by_id(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="customer not found")
    try:
        template = ai_service.generate_followup(customer)
    except Exception:
        logger.exception("followup generation failed")
        raise HTTPException(status_code=502, detail="AI generation failed")
    return {"template": template}


@router.post("/customers/{customer_id}/rescore")
def rescore_customer(customer_id: str):
    """スコアの再計算（手動トリガーのみ）。"""
    customer = customer_repo.find_by_id(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="customer not found")
    if not customer.hearing_is_complete():
        raise HTTPException(status_code=400, detail="hearing not completed")
    try:
        result = scoring_service.run_scoring(customer)
    except Exception:
        logger.exception("rescoring failed")
        raise HTTPException(status_code=502, detail="AI scoring failed")
    return {"customer": result["customer"].model_dump()}


@router.post("/batch/notify-b")
def run_notify_batch():
    """未通知の B/C ランク顧客への営業通知バッチ。

    Railway/Render の cron や外部スケジューラから毎朝9時に叩く想定。
    """
    count = notify_service.notify_pending_batch()
    return {"notified": count}
