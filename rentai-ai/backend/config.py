"""環境変数の読み込みと設定値の一元管理。"""
import os

from dotenv import load_dotenv

load_dotenv()

LINE_CHANNEL_ACCESS_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN", "")
LINE_CHANNEL_SECRET = os.getenv("LINE_CHANNEL_SECRET", "")
LINE_SALES_USER_ID = os.getenv("LINE_SALES_USER_ID", "")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
# 要件指定の claude-sonnet-4-20250514 は 2026-06-15 で廃止のため、
# 後継の claude-sonnet-4-6 を既定値とする（環境変数で上書き可能）
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# ダッシュボードの顧客詳細URL（営業通知に埋め込む）
DASHBOARD_BASE_URL = os.getenv("DASHBOARD_BASE_URL", "http://localhost:3000")

# フロントエンドのオリジン（CORS許可用）
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
