import calendar
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import AnnualPlan, Transaction
from app.schemas import CronExecutionResponse
from app.services.ai_parser import normalize_text
from app.services.analytics import get_local_now


def is_plan_active_for_month(plan: AnnualPlan, month: int) -> bool:
    if not plan.active:
        return False
    if plan.start_month <= plan.end_month:
        return plan.start_month <= month <= plan.end_month
    # Handles wrap-around ranges like Nov..Feb
    return month >= plan.start_month or month <= plan.end_month


def run_daily_plan_cron(
    db: Session,
    settings: Settings,
    target_date: date | None = None,
) -> CronExecutionResponse:
    """
    Check active annual_plan items due on target_date (default: today in local timezone)
    and insert them into transactions with source='FIXED_PLAN' idempotently.
    """
    if target_date is None:
        target_date = get_local_now(settings.TIMEZONE).date()

    period = f"{target_date.year:04d}-{target_date.month:02d}"
    days_in_month = calendar.monthrange(target_date.year, target_date.month)[1]

    try:
        local_tz = ZoneInfo(settings.TIMEZONE)
    except Exception:
        local_tz = timezone.utc

    occurred_utc = datetime(
        target_date.year, target_date.month, target_date.day, 8, 0, 0, tzinfo=local_tz
    ).astimezone(timezone.utc)

    plans = db.query(AnnualPlan).filter(AnnualPlan.active.is_(True)).all()

    created_ids: list[int] = []
    skipped_count = 0

    for plan in plans:
        if not is_plan_active_for_month(plan, target_date.month):
            continue

        effective_due_day = min(plan.day_of_month, days_in_month)
        if effective_due_day != target_date.day:
            continue

        already_exists = (
            db.query(Transaction)
            .filter(
                Transaction.annual_plan_id == plan.id,
                Transaction.plan_period == period,
            )
            .first()
        )
        if already_exists is not None:
            skipped_count += 1
            continue

        tx = Transaction(
            source="FIXED_PLAN",
            app_name="annual_plan",
            raw_title=plan.title,
            raw_text=f"Lançamento automático do plano anual ({period})",
            type=plan.type,
            amount=plan.amount,
            merchant=plan.title,
            merchant_normalized=normalize_text(plan.title) or "plano_anual",
            installments=1,
            category=plan.category,
            confidence=1.0,
            status="CONFIRMED",
            occurred_at=occurred_utc,
            annual_plan_id=plan.id,
            plan_period=period,
        )
        db.add(tx)
        db.flush()
        created_ids.append(tx.id)

    db.commit()
    return CronExecutionResponse(
        target_date=target_date.isoformat(),
        period=period,
        created_count=len(created_ids),
        skipped_count=skipped_count,
        created_ids=created_ids,
    )
