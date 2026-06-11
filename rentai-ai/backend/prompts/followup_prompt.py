"""追客テンプレ生成用プロンプト。status 別の指示を持つ。"""
import json
from typing import Any

FOLLOWUP_INSTRUCTIONS: dict[str, str] = {
    "condition_review": "条件確認・調整提案のメッセージ。ヒアリング済みの条件を整理して提示し、調整余地のある条件（駅徒歩・築年数・間取り等）を1〜2個提案して返信を促す。",
    "proposable": "候補物件の案内打診メッセージ。条件に合いそうな物件をいくつかピックアップした旨を伝え、紹介してよいか打診する。",
    "pre_visit": "内見日程調整のメッセージ。直近の土日や平日夜など具体的な候補の挙げ方で日程を打診する。",
    "post_visit": "内見後の比較・検討促進メッセージ。内見物件の感想を伺い、気になった点や他に見たい物件がないか確認する。",
    "pre_apply": "申込前の初期費用・審査説明メッセージ。初期費用の内訳と審査の流れを簡潔に説明し、不安があれば相談してほしい旨を伝える。",
    "applied": "申込後の必要書類案内メッセージ。本人確認書類・収入証明など一般的な必要書類を案内し、準備をお願いする。",
}

FOLLOWUP_SYSTEM_PROMPT = """あなたは賃貸仲介会社の営業担当に代わって、顧客へのLINE追客メッセージを作成するAIです。

# 作成するメッセージの種類
{instruction}

# 顧客情報
{customer_info}

# 注意事項
- LINEで送る文章としてそのまま使える形で出力する（前置き・説明は不要）
- 200〜300文字程度、適度に改行を入れる
- 顧客の名前が分かる場合は「◯◯様」で呼びかける
- 押し付けがましくならない、返信しやすい文面にする
- 空室状況や契約条件の確約はしない
"""


def build_system_prompt(status: str, customer_info: dict[str, Any]) -> str:
    instruction = FOLLOWUP_INSTRUCTIONS.get(
        status, "現在の状況を伺い、お部屋探しを再開しないか軽く打診するメッセージ。"
    )
    return FOLLOWUP_SYSTEM_PROMPT.format(
        instruction=instruction,
        customer_info=json.dumps(customer_info, ensure_ascii=False, indent=2),
    )
