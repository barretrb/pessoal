import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.config import get_settings
from app.database import SessionLocal, init_db
from app.routers import cron, dashboard, plan, webhooks
from app.services.planner import ensure_month_provision
from app.services.seed_data import seed_annual_plan

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_annual_plan(db)
        ensure_month_provision(db, get_settings())
    finally:
        db.close()
    yield


app = FastAPI(
    title="Zero-Input Expense Tracker",
    description="Autonomous personal finance ingestion, AI parsing, Telegram HITL, and analytics.",
    version="2.0.0",
    lifespan=lifespan,
)

app.include_router(webhooks.router)
app.include_router(cron.router)
app.include_router(plan.router)
app.include_router(plan.tx_router)
app.include_router(dashboard.router)


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    return {"status": "ok"}
