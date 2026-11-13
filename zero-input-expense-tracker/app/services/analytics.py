import calendar
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import Transaction


def format_brl(value: Decimal | float) -> str:
    amount = float(value)
    formatted = f"{amount:,.2f}"
    return formatted.replace(",", "X").replace(".", ",").replace("X", ".")


def get_local_now(tz_name: str) -> datetime:
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = timezone.utc
    return datetime.now(tz)


def get_month_bounds(year: int, month: int, tz_name: str) -> tuple[datetime, datetime, int]:
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = timezone.utc
    days_in_month = calendar.monthrange(year, month)[1]
    start_local = datetime(year, month, 1, 0, 0, 0, tzinfo=tz)
    end_local = datetime(year, month, days_in_month, 23, 59, 59, 999999, tzinfo=tz)
    return start_local.astimezone(timezone.utc), end_local.astimezone(timezone.utc), days_in_month


def compute_monthly_summary(
    db: Session,
    settings: Settings,
    year: int | None = None,
    month: int | None = None,
) -> dict:
    local_now = get_local_now(settings.TIMEZONE)
    target_year = year or local_now.year
    target_month = month or local_now.month

    start_utc, end_utc, days_in_month = get_month_bounds(
        target_year, target_month, settings.TIMEZONE
    )

    txs = (
        db.query(Transaction)
        .filter(
            Transaction.occurred_at >= start_utc,
            Transaction.occurred_at <= end_utc,
        )
        .order_by(Transaction.occurred_at.desc(), Transaction.id.desc())
        .all()
    )

    total_income = Decimal("0.00")
    fixed_expenses = Decimal("0.00")
    variable_expenses = Decimal("0.00")
    pending_count = 0
    category_totals: dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
    daily_expenses: dict[int, Decimal] = defaultdict(lambda: Decimal("0.00"))

    try:
        local_tz = ZoneInfo(settings.TIMEZONE)
    except Exception:
        local_tz = timezone.utc

    for tx in txs:
        if tx.status == "PENDING":
            pending_count += 1
            continue
        if tx.status != "CONFIRMED":
            continue

        amount = Decimal(tx.amount)
        if tx.type == "INCOME":
            total_income += amount
        elif tx.type == "EXPENSE":
            if tx.source == "FIXED_PLAN":
                fixed_expenses += amount
            else:
                variable_expenses += amount
            category_totals[tx.category] += amount

            occ = tx.occurred_at
            if occ.tzinfo is None:
                occ = occ.replace(tzinfo=timezone.utc)
            local_day = occ.astimezone(local_tz).day
            daily_expenses[local_day] += amount

    total_expenses = fixed_expenses + variable_expenses
    saldo_livre = total_income - total_expenses

    budget_limit = (
        Decimal(str(settings.MONTHLY_BUDGET_LIMIT))
        if settings.MONTHLY_BUDGET_LIMIT > 0
        else total_income
    )

    # Build Burn Rate series (cumulative actual vs linear planned limit)
    labels: list[str] = []
    actual_cumulative: list[float] = []
    planned_cumulative: list[float] = []
    running = Decimal("0.00")
    limit_float = float(budget_limit)

    for day in range(1, days_in_month + 1):
        labels.append(f"{day:02d}")
        running += daily_expenses.get(day, Decimal("0.00"))
        actual_cumulative.append(round(float(running), 2))
        planned_cumulative.append(round(limit_float * (day / days_in_month), 2))

    # Category breakdown sorted descending
    total_exp_float = float(total_expenses) if total_expenses > 0 else 0.0
    category_breakdown = []
    for cat, val in sorted(category_totals.items(), key=lambda kv: kv[1], reverse=True):
        val_float = round(float(val), 2)
        pct = round((val_float / total_exp_float) * 100, 1) if total_exp_float > 0 else 0.0
        category_breakdown.append(
            {
                "category": cat,
                "total": val_float,
                "total_brl": format_brl(val),
                "percentage": pct,
            }
        )

    return {
        "year": target_year,
        "month": target_month,
        "period": f"{target_year:04d}-{target_month:02d}",
        "total_income": float(total_income),
        "total_income_brl": format_brl(total_income),
        "fixed_expenses": float(fixed_expenses),
        "fixed_expenses_brl": format_brl(fixed_expenses),
        "variable_expenses": float(variable_expenses),
        "variable_expenses_brl": format_brl(variable_expenses),
        "total_expenses": float(total_expenses),
        "total_expenses_brl": format_brl(total_expenses),
        "saldo_livre": float(saldo_livre),
        "saldo_livre_brl": format_brl(saldo_livre),
        "budget_limit": limit_float,
        "budget_limit_brl": format_brl(budget_limit),
        "pending_count": pending_count,
        "burn_rate": {
            "labels": labels,
            "actual": actual_cumulative,
            "planned": planned_cumulative,
        },
        "category_breakdown": category_breakdown,
        "transactions": txs[:50],
    }
