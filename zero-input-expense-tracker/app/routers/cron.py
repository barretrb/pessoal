from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.schemas import CronExecutionResponse
from app.security import verify_api_key
from app.services.planner import run_daily_plan_cron

router = APIRouter(prefix="/api/v1/cron", tags=["Cron"])


@router.post(
    "/daily",
    response_model=CronExecutionResponse,
    dependencies=[Depends(verify_api_key)],
)
def trigger_daily_cron(
    target_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> CronExecutionResponse:
    """Execute daily annual_plan check and insert due recurring transactions."""
    return run_daily_plan_cron(db=db, settings=settings, target_date=target_date)
