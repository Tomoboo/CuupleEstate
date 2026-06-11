"""スコアリングロジック。

スコア算出（5観点）は Claude が行い、最終ランクはバックエンド側の
determine_rank で決定的に判定する（AIの返すランクは参考値）。
"""
import logging
from typing import Any

from models import customer as customer_repo
from models.customer import Customer
from services import ai_service

logger = logging.getLogger(__name__)

SCORE_KEYS = [
    "score_urgency",
    "score_budget",
    "score_initial_cost",
    "score_credit_risk",
    "score_condition_overload",
]


def determine_rank(scores: dict) -> str:
    total = sum(scores.values())
    urgency = scores["urgency"]
    budget = scores["budget"]

    if urgency >= 4 and budget >= 4 and total >= 20:
        return "S"
    elif urgency >= 3 and budget >= 3 and total >= 16:
        return "A"
    elif total >= 12:
        return "B"
    elif total >= 8:
        return "C"
    else:
        return "D"


def _clamp(v: Any) -> int:
    try:
        return max(1, min(5, int(v)))
    except (TypeError, ValueError):
        return 3


def run_scoring(customer: Customer) -> dict[str, Any]:
    """Claude でスコアリングを実行し、結果を DB に保存する。

    Returns:
        {
          "customer": 更新後の Customer,
          "customer_reply": 顧客への診断返信文,
          "condition_suggestions": [...],
        }
    """
    result = ai_service.score_customer(customer)

    scores = {
        "urgency": _clamp(result.get("score_urgency")),
        "budget": _clamp(result.get("score_budget")),
        "initial_cost": _clamp(result.get("score_initial_cost")),
        "credit_risk": _clamp(result.get("score_credit_risk")),
        "condition_overload": _clamp(result.get("score_condition_overload")),
    }
    rank = determine_rank(scores)

    updated = customer_repo.update(
        customer.id,
        {
            "score_urgency": scores["urgency"],
            "score_budget": scores["budget"],
            "score_initial_cost": scores["initial_cost"],
            "score_credit_risk": scores["credit_risk"],
            "score_condition_overload": scores["condition_overload"],
            "score_rank": rank,
            "score_reason": result.get("score_reason"),
            "hearing_completed": True,
            "status": "condition_review",
        },
    )
    logger.info("scored customer %s -> rank %s", customer.id, rank)

    return {
        "customer": updated,
        "customer_reply": result.get("customer_reply"),
        "condition_suggestions": result.get("condition_suggestions") or [],
    }
