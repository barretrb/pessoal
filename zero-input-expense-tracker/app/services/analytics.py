import calendar
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

from app.config import DEFAULT_CATEGORIES, Settings
from app.models import AnnualPlan, Category, Transaction

MONTH_NAMES_PT = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]


def get_all_categories(db: Session) -> list[str]:
    result = list(DEFAULT_CATEGORIES)
    seen = set(result)
    for (name,) in db.query(Category.name).order_by(Category.name.asc()).all():
        if name and name not in seen:
            result.append(name)
            seen.add(name)
    for (name,) in db.query(AnnualPlan.category).distinct().all():
        if name and name not in seen:
            result.append(name)
            seen.add(name)
    for (name,) in db.query(Transaction.category).distinct().all():
        if name and name not in seen:
            result.append(name)
            seen.add(name)
    return result


def ensure_category_exists(db: Session, name: str) -> str:
    clean = (name or "").strip()[:64]
    if not clean:
        return "Outros"
    if clean not in DEFAULT_CATEGORIES:
        existing = db.query(Category).filter(Category.name == clean).first()
        if existing is None:
            db.add(Category(name=clean))
            db.flush()
    return clean


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
        if tx.status not in ("CONFIRMED", "ESTIMATED"):
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

    # Consumption bills (ROLLING_AVERAGE): current month tx + 3-month confirmed avg
    period_str = f"{target_year:04d}-{target_month:02d}"
    rolling_plans = (
        db.query(AnnualPlan)
        .filter(
            AnnualPlan.plan_type == "ROLLING_AVERAGE",
            AnnualPlan.active.is_(True),
        )
        .order_by(AnnualPlan.id.asc())
        .all()
    )
    consumption_bills = []
    for plan in rolling_plans:
        current_tx = next(
            (t for t in txs if t.annual_plan_id == plan.id and t.plan_period == period_str),
            None,
        )
        if current_tx is None:
            plan_title_low = plan.title.lower()
            current_tx = next(
                (
                    t
                    for t in txs
                    if t.type == "EXPENSE"
                    and (
                        plan_title_low in t.merchant.lower()
                        or t.merchant.lower() in plan_title_low
                    )
                ),
                None,
            )

        confirmed_hist = (
            db.query(Transaction)
            .filter(
                Transaction.type == "EXPENSE",
                Transaction.status == "CONFIRMED",
                Transaction.annual_plan_id == plan.id,
            )
            .order_by(Transaction.occurred_at.desc(), Transaction.id.desc())
            .limit(3)
            .all()
        )
        if confirmed_hist:
            avg_val = sum(Decimal(t.amount) for t in confirmed_hist) / Decimal(len(confirmed_hist))
            avg_val = avg_val.quantize(Decimal("0.01"))
        else:
            avg_val = Decimal(plan.amount)

        cur_amount = Decimal(current_tx.amount) if current_tx else Decimal(plan.amount)
        consumption_bills.append(
            {
                "plan_id": plan.id,
                "title": plan.title,
                "due_day": plan.day_of_month,
                "payment_method": plan.payment_method,
                "transaction_id": current_tx.id if current_tx else None,
                "status": current_tx.status if current_tx else "NOT_PROVISIONED",
                "current_amount": float(cur_amount),
                "current_amount_brl": format_brl(cur_amount),
                "provisioned_amount": float(plan.amount),
                "provisioned_amount_brl": format_brl(plan.amount),
                "rolling_avg_3m": float(avg_val),
                "rolling_avg_3m_brl": format_brl(avg_val),
                "confirmed_months": len(confirmed_hist),
            }
        )

    return {
        "year": target_year,
        "month": target_month,
        "period": period_str,
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
        "consumption_bills": consumption_bills,
        "transactions": txs[:50],
    }


def compute_yearly_summary(
    db: Session,
    settings: Settings,
    year: int | None = None,
) -> dict:
    local_now = get_local_now(settings.TIMEZONE)
    target_year = year or local_now.year

    try:
        local_tz = ZoneInfo(settings.TIMEZONE)
    except Exception:
        local_tz = timezone.utc

    start_local = datetime(target_year, 1, 1, 0, 0, 0, tzinfo=local_tz)
    end_local = datetime(target_year, 12, 31, 23, 59, 59, 999999, tzinfo=local_tz)
    txs = (
        db.query(Transaction)
        .filter(
            Transaction.occurred_at >= start_local.astimezone(timezone.utc),
            Transaction.occurred_at <= end_local.astimezone(timezone.utc),
            Transaction.status.in_(["CONFIRMED", "ESTIMATED"]),
        )
        .all()
    )

    monthly_data = {
        m: {
            "income": Decimal("0.00"),
            "fixed": Decimal("0.00"),
            "variable": Decimal("0.00"),
            "tx_count": 0,
        }
        for m in range(1, 13)
    }

    for tx in txs:
        occ = tx.occurred_at
        if occ.tzinfo is None:
            occ = occ.replace(tzinfo=timezone.utc)
        m = occ.astimezone(local_tz).month
        amt = Decimal(tx.amount)
        monthly_data[m]["tx_count"] += 1
        if tx.type == "INCOME":
            monthly_data[m]["income"] += amt
        elif tx.type == "EXPENSE":
            if tx.source == "FIXED_PLAN":
                monthly_data[m]["fixed"] += amt
            else:
                monthly_data[m]["variable"] += amt

    months_out = []
    tot_inc = Decimal("0.00")
    tot_fix = Decimal("0.00")
    tot_var = Decimal("0.00")

    for m in range(1, 13):
        inc = monthly_data[m]["income"]
        fix = monthly_data[m]["fixed"]
        var = monthly_data[m]["variable"]
        exp = fix + var
        saldo = inc - exp
        tot_inc += inc
        tot_fix += fix
        tot_var += var
        months_out.append(
            {
                "month": m,
                "label": MONTH_NAMES_PT[m - 1],
                "income": float(inc),
                "income_brl": format_brl(inc),
                "fixed_expenses": float(fix),
                "fixed_expenses_brl": format_brl(fix),
                "variable_expenses": float(var),
                "variable_expenses_brl": format_brl(var),
                "total_expenses": float(exp),
                "total_expenses_brl": format_brl(exp),
                "saldo_livre": float(saldo),
                "saldo_livre_brl": format_brl(saldo),
                "tx_count": monthly_data[m]["tx_count"],
            }
        )

    tot_exp = tot_fix + tot_var
    tot_saldo = tot_inc - tot_exp
    return {
        "year": target_year,
        "months": months_out,
        "totals": {
            "income": float(tot_inc),
            "income_brl": format_brl(tot_inc),
            "fixed_expenses": float(tot_fix),
            "fixed_expenses_brl": format_brl(tot_fix),
            "variable_expenses": float(tot_var),
            "variable_expenses_brl": format_brl(tot_var),
            "total_expenses": float(tot_exp),
            "total_expenses_brl": format_brl(tot_exp),
            "saldo_livre": float(tot_saldo),
            "saldo_livre_brl": format_brl(tot_saldo),
        },
    }


def query_detailed_transactions(
    db: Session,
    settings: Settings,
    year: int | None = None,
    month: int | None = None,
    category: str | None = None,
    tx_type: str | None = None,
    source: str | None = None,
    status: str | None = None,
    search: str | None = None,
    min_amount: float | None = None,
    max_amount: float | None = None,
) -> dict:
    local_now = get_local_now(settings.TIMEZONE)
    target_year = year or local_now.year

    try:
        local_tz = ZoneInfo(settings.TIMEZONE)
    except Exception:
        local_tz = timezone.utc

    if month and 1 <= month <= 12:
        start_utc, end_utc, _ = get_month_bounds(target_year, month, settings.TIMEZONE)
    else:
        start_utc = datetime(target_year, 1, 1, 0, 0, 0, tzinfo=local_tz).astimezone(timezone.utc)
        end_utc = datetime(target_year, 12, 31, 23, 59, 59, 999999, tzinfo=local_tz).astimezone(timezone.utc)

    query = db.query(Transaction).filter(
        Transaction.occurred_at >= start_utc,
        Transaction.occurred_at <= end_utc,
    )
    if category:
        query = query.filter(Transaction.category == category)
    if tx_type:
        query = query.filter(Transaction.type == tx_type)
    if source:
        query = query.filter(Transaction.source == source)
    if status:
        query = query.filter(Transaction.status == status)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= Decimal(str(min_amount)))
    if max_amount is not None:
        query = query.filter(Transaction.amount <= Decimal(str(max_amount)))

    rows = query.order_by(Transaction.occurred_at.desc(), Transaction.id.desc()).all()

    if search and search.strip():
        q_low = search.strip().lower()
        rows = [
            t
            for t in rows
            if q_low in (t.merchant or "").lower()
            or q_low in (t.category or "").lower()
            or q_low in (t.raw_title or "").lower()
            or q_low in (t.raw_text or "").lower()
        ]

    tot_inc = sum(
        (Decimal(t.amount) for t in rows if t.type == "INCOME" and t.status in ("CONFIRMED", "ESTIMATED")),
        Decimal("0.00"),
    )
    tot_exp = sum(
        (Decimal(t.amount) for t in rows if t.type == "EXPENSE" and t.status in ("CONFIRMED", "ESTIMATED")),
        Decimal("0.00"),
    )
    net = tot_inc - tot_exp

    return {
        "year": target_year,
        "month": month,
        "transactions": rows,
        "total_count": len(rows),
        "total_income": float(tot_inc),
        "total_income_brl": format_brl(tot_inc),
        "total_expense": float(tot_exp),
        "total_expense_brl": format_brl(tot_exp),
        "net": float(net),
        "net_brl": format_brl(net),
    }
