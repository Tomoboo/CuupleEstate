"""賃貸SNS反響AI成約支援システム — FastAPI エントリポイント。

起動:
    uvicorn main:app --reload --port 8000
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
from routers import dashboard, webhook

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(title="RentAI — 賃貸SNS反響AI成約支援システム")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}
