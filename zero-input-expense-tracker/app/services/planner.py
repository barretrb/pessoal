import calendar
from datetime import date, datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import AnnualPlan, Transaction
from app.schemas import CronExecutionResponse, ReconcileResponse
from app.services.ai_parser import normalize_text
from app.services.analytics import get_local_now


def is_plan_active_for_month(plan: AnnualPlan, month: int) -> bool:
    if not plan.active:
        return False
    if plan.start_month <= plan.end_month:
        return plan.start_month <= month <= plan.end_month
    return month >= plan.start_month or month <= plan.end_month


def ensure_month_provision(
    db: Session,
    settings: Settings,
    target_date: date | None = None,
) -> CronExecutionResponse:
    """
    Provision all active annual_plan items for the target month (idempotent).
    - Salário / INCOME (FIXED): launched as CONFIRMED.
    - FIXED & ROLLING_AVERAGE EXPENSE: launched as ESTIMATED on day 1 (or startup),
      so Saldo Livre starts at Receitas - (Fixos + Médias).
    """
    if target_date is None:
        target_date = get_local_now(settings.TIMEZONE).date()

    period = f"{target_date.year:04d}-{target_date.month:02d}"
    days_in_month = calendar.monthrange(target_date.year, target_date.month)[1]

    try:
        local_tz = ZoneInfo(settings.TIMEZONE)
    except Exception:
        local_tz = timezone.utc

    plans = db.query(AnnualPlan).filter(AnnualPlan.active.is_(True)).all()
    created_ids: list[int] = []
    skipped_count = 0

    for plan in plans:
        if not is_plan_active_for_month(plan, target_date.month):
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

        due_day = min(plan.day_of_month, days_in_month)
        occurred_utc = datetime(
            target_date.year, target_date.month, due_day, 8, 0, 0, tzinfo=local_tz
        ).astimezone(timezone.utc)

        tx_status = "CONFIRMED" if plan.type == "INCOME" else "ESTIMATED"
        tx = Transaction(
            source="FIXED_PLAN",
            app_name="annual_plan",
            raw_title=plan.title,
            raw_text=f"Provisão mensal ({plan.plan_type}) - {period}",
            type=plan.type,
            amount=plan.amount,
            merchant=plan.title,
            merchant_normalized=normalize_text(plan.title) or "plano_anual",
            installments=1,
            category=plan.category,
            confidence=1.0,
            status=tx_status,
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


def run_daily_plan_cron(
    db: Session,
    settings: Settings,
    target_date: date | None = None,
) -> CronExecutionResponse:
    """
    Daily cron entrypoint: ensures the current month's fixed & rolling provisions exist.
    Idempotent via (annual_plan_id, YYYY-MM).
    """
    return ensure_month_provision(db=db, settings=settings, target_date=target_date)


def recalculate_rolling_average(db: Session, annual_plan_id: int) -> Decimal | None:
    """
    Recalculate average of the last 3 CONFIRMED transactions for a ROLLING_AVERAGE plan
    and persist it back to annual_plan.amount.
    """
    plan = db.query(AnnualPlan).filter(AnnualPlan.id == annual_plan_id).first()
    if plan is None or plan.plan_type != "ROLLING_AVERAGE":
        return None

    recent_confirmed = (
        db.query(Transaction)
        .filter(
            Transaction.annual_plan_id == annual_plan_id,
            Transaction.status == "CONFIRMED",
        )
        .order_by(Transaction.occurred_at.desc(), Transaction.id.desc())
        .limit(3)
        .all()
    )
    if not recent_confirmed:
        return Decimal(plan.amount)

    total = sum(Decimal(tx.amount) for tx in recent_confirmed)
    avg = (total / Decimal(len(recent_confirmed))).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    plan.amount = avg
    db.commit()
    db.refresh(plan)
    return avg


def reconcile_transaction_amount(
    db: Session, transaction_id: int, real_amount: Decimal
) -> ReconcileResponse:
    """
    Replace an ESTIMATED (or existing) transaction's amount with the real paid value,
    mark it CONFIRMED, and recalculate the 3-month rolling average if applicable.
    """
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if tx is None:
        raise ValueError("Transaction not found")

    tx.amount = real_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    tx.status = "CONFIRMED"
    db.commit()
    db.refresh(tx)

    new_avg: Decimal | None = None
    if tx.annual_plan_id is not None:
        new_avg = recalculate_rolling_average(db, tx.annual_plan_id)

    return ReconcileResponse(
        transaction_id=tx.id,
        annual_plan_id=tx.annual_plan_id,
        amount=Decimal(tx.amount),
        status=tx.status,
        new_rolling_average=new_avg,
    )


def find_matching_rolling_tx(
    db: Session, merchant_text: str, period: str
) -> Transaction | None:
    """Match incoming notification (e.g. Enel / Naturgy) to the month's ROLLING_AVERAGE provision."""
    norm = normalize_text(merchant_text)
    if not norm:
        return None

    rolling_plans = (
        db.query(AnnualPlan)
        .filter(AnnualPlan.active.is_(True), AnnualPlan.plan_type == "ROLLING_AVERAGE")
        .all()
    )
    for plan in rolling_plans:
        plan_tokens = [t for t in normalize_text(plan.title).split() if len(t) >= 3]
        if any(tok in norm for tok in plan_tokens):
            tx = (
                db.query(Transaction)
                .filter(
                    Transaction.annual_plan_id == plan.id,
                    Transaction.plan_period == period,
                )
                .first()
            )
            if tx is not None:
                return tx
    return None


def find_matching_fixed_card_tx(
    db: Session, amount_dec: Decimal, merchant_text: str, period: str
) -> Transaction | None:
    """
    Prevent duplicate when a credit-card FIXED_PLAN item (e.g. Google AI Pro R$ 96.99)
    generates a push notification within +/- R$ 1.00 in the same month.
    """
    norm = normalize_text(merchant_text)
    card_plans = (
        db.query(AnnualPlan)
        .filter(
            AnnualPlan.active.is_(True),
            AnnualPlan.plan_type == "FIXED",
            AnnualPlan.payment_method == "Cartão",
        )
        .all()
    )
    for plan in card_plans:
        tx = (
            db.query(Transaction)
            .filter(
                Transaction.annual_plan_id == plan.id,
                Transaction.plan_period == period,
            )
            .first()
        )
        if tx is None:
            continue
        diff = abs(Decimal(tx.amount) - amount_dec)
        if diff <= Decimal("1.00"):
            return tx
        plan_tokens = [t for t in normalize_text(plan.title).split() if len(t) >= 4]
        if any(tok in norm for tok in plan_tokens) and diff <= Decimal("5.00"):
            return tx
    return None
