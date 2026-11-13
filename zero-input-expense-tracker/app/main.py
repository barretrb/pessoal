from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.database import init_db
from app.routers import cron, dashboard, plan, webhooks


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Zero-Input Expense Tracker",
    description="Autonomous personal finance ingestion, AI parsing, Telegram HITL, and analytics.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(webhooks.router)
app.include_router(cron.router)
app.include_router(plan.router)
app.include_router(dashboard.router)


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    return {"status": "ok"}
