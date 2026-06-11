"""営業担当への通知サービス。

通知タイミング:
- S / A: ヒアリング完了直後（即時）
- B: 翌朝9時バッチ（POST /api/batch/notify-b を cron 等で叩く）
- C: 追客シーケンス（3日後・1週間後 — 同バッチエンドポイントを利用）
- D: 通知なし
"""
import logging
from datetime import datetime, timezone

import config
from models import customer as customer_repo
from models.customer import Customer
from services import line_service

logger = logging.getLogger(__name__)

IMMEDIATE_RANKS = {"S", "A"}


def _yen_fmt(v) -> str:
    return f"{v}万円以内" if v is not None else "未回答"


def build_sales_message(customer: Customer) -> str:
    name = customer.display_name or "お客"
    income = (
        f"（年収{customer.income_annual}万）" if customer.income_annual else ""
    )
    credit = customer.credit_concern or "なし"
    suggestions = ""
    if customer.flexible_conditions:
        suggestions = "・".join(customer.flexible_conditions)

    lines = [
        f"【{customer.score_rank}ランク顧客】新規問い合わせ",
        "",
        f"👤 {name}様",
        f"📅 引越し時期：{customer.move_date or '未回答'}",
        f"💰 家賃：{_yen_fmt(customer.rent_max)}",
        f"💴 初期費用：{_yen_fmt(customer.initial_cost_max)}",
        f"📍 エリア：{customer.desired_area or '未回答'}",
        f"🏠 間取り：{customer.floor_plan or '未回答'}",
        f"👥 同居人数：{customer.num_people if customer.num_people is not None else '未回答'}人",
        f"👔 職業：{customer.occupation or '未回答'}{income}",
        f"⚠️ 審査不安：{credit}",
        "",
        "【AI診断】",
        customer.score_reason or "（診断理由なし）",
    ]
    if customer.score_rank in IMMEDIATE_RANKS:
        lines += [
            "",
            "【推奨アクション】",
            "→ 本日中に候補物件を提案してください",
        ]
        if suggestions:
            lines.append(f"→ 条件調整の余地あり（{suggestions}）")
    lines += [
        "",
        f"[顧客詳細を見る] {config.DASHBOARD_BASE_URL}/customers/{customer.id}",
    ]
    return "\n".join(lines)


def notify_sales(customer: Customer) -> bool:
    """営業担当のLINEに顧客サマリを通知する。"""
    if not config.LINE_SALES_USER_ID:
        logger.warning("LINE_SALES_USER_ID 未設定のため営業通知をスキップ")
        return False
    ok = line_service.push_message(
        config.LINE_SALES_USER_ID, [build_sales_message(customer)]
    )
    if ok:
        customer_repo.update(
            customer.id,
            {"sales_notified_at": datetime.now(timezone.utc).isoformat()},
        )
    return ok


def notify_if_immediate(customer: Customer) -> bool:
    """S/Aランクなら即時通知する。"""
    if customer.score_rank in IMMEDIATE_RANKS:
        return notify_sales(customer)
    return False


def notify_pending_batch() -> int:
    """未通知の B/C ランク顧客を通知する（バッチ用）。

    cron（例: 毎朝9時）から POST /api/batch/notify-b 経由で実行する。
    """
    count = 0
    for rank in ("B", "C"):
        for c in customer_repo.list_customers(rank=rank):
            if c.sales_notified_at is None and c.hearing_completed:
                if notify_sales(c):
                    count += 1
    return count
