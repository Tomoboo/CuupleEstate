"""Supabase クライアントのシングルトン。"""
from functools import lru_cache

from supabase import Client, create_client

import config


@lru_cache(maxsize=1)
def get_client() -> Client:
    if not config.SUPABASE_URL or not config.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です")
    return create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
