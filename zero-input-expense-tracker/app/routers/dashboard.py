from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from fastapi import APIRouter, Depends, Form, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.config import DEFAULT_CATEGORIES, Settings, get_settings
from app.database import get_db
from app.models import AnnualPlan, Transaction
from app.security import (
    SESSION_COOKIE_NAME,
    SESSION_MAX_AGE_SECONDS,
    create_session_token,
    get_dashboard_session,
    verify_dashboard_password,
)
from app.services.ai_parser import normalize_text
from app.services.analytics import (
    MONTH_NAMES_PT,
    compute_monthly_summary,
    compute_yearly_summary,
    get_local_now,
    query_detailed_transactions,
)
from app.services.planner import reconcile_transaction_amount

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter(tags=["Dashboard"])


@router.get("/", include_in_schema=False)
def root_redirect() -> RedirectResponse:
    return RedirectResponse(url="/dashboard", status_code=302)


@router.get("/login", response_class=HTMLResponse, include_in_schema=False)
def login_page(request: Request, error: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="login.html",
        context={"error": error},
    )


@router.post("/login", include_in_schema=False)
def login_submit(
    request: Request,
    password: str = Form(...),
    settings: Settings = Depends(get_settings),
):
    if not verify_dashboard_password(password, settings):
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={"error": "Senha incorreta."},
            status_code=401,
        )
    response = RedirectResponse(url="/dashboard", status_code=303)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=create_session_token(settings),
        max_age=SESSION_MAX_AGE_SECONDS,
        httponly=True,
        samesite="lax",
    )
    return response


@router.get("/logout", include_in_schema=False)
def logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie(SESSION_COOKIE_NAME)
    return response


@router.get("/dashboard", response_class=HTMLResponse)
def dashboard_view(
    request: Request,
    month: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    authenticated: bool = Depends(get_dashboard_session),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    if not authenticated:
        return RedirectResponse(url="/login", status_code=303)

    target_year: int | None = None
    target_month: int | None = None
    if month:
        y_str, m_str = month.split("-")
        target_year = int(y_str)
        target_month = max(1, min(12, int(m_str)))

    summary = compute_monthly_summary(
        db=db, settings=settings, year=target_year, month=target_month
    )
    yearly = compute_yearly_summary(
        db=db, settings=settings, year=summary["year"]
    )
    plans = db.query(AnnualPlan).order_by(AnnualPlan.day_of_month.asc()).all()

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={
            "summary": summary,
            "yearly": yearly,
            "plans": plans,
            "categories": DEFAULT_CATEGORIES,
        },
    )


@router.get("/transactions", response_class=HTMLResponse)
def transactions_view(
    request: Request,
    year: int | None = Query(default=None, ge=2020, le=2100),
    month: int | None = Query(default=None, ge=0, le=12),
    category: str | None = Query(default=None),
    tx_type: str | None = Query(default=None),
    source: str | None = Query(default=None),
    status: str | None = Query(default=None),
    q: str | None = Query(default=None),
    min_amount: str | None = Query(default=None),
    max_amount: str | None = Query(default=None),
    authenticated: bool = Depends(get_dashboard_session),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    if not authenticated:
        return RedirectResponse(url="/login", status_code=303)

    local_now = get_local_now(settings.TIMEZONE)
    effective_year = year or local_now.year
    effective_month = local_now.month if month is None else month

    def parse_float(val: str | None) -> float | None:
        if val is None or not val.strip():
            return None
        try:
            return float(val.replace(",", "."))
        except ValueError:
            return None

    min_val = parse_float(min_amount)
    max_val = parse_float(max_amount)

    result = query_detailed_transactions(
        db=db,
        settings=settings,
        year=effective_year,
        month=effective_month if effective_month > 0 else None,
        category=category or None,
        tx_type=tx_type or None,
        source=source or None,
        status=status or None,
        search=q or None,
        min_amount=min_val,
        max_amount=max_val,
    )

    return templates.TemplateResponse(
        request=request,
        name="transactions.html",
        context={
            "result": result,
            "categories": DEFAULT_CATEGORIES,
            "month_names": MONTH_NAMES_PT,
            "filters": {
                "year": effective_year,
                "month": effective_month,
                "category": category or "",
                "tx_type": tx_type or "",
                "source": source or "",
                "status": status or "",
                "q": q or "",
                "min_amount": min_amount or "",
                "max_amount": max_amount or "",
            },
        },
    )


@router.post("/dashboard/reconcile", include_in_schema=False)
def reconcile_from_dashboard(
    transaction_id: int = Form(...),
    real_amount: Decimal = Form(...),
    month: str | None = Form(default=None),
    authenticated: bool = Depends(get_dashboard_session),
    db: Session = Depends(get_db),
):
    if not authenticated:
        return RedirectResponse(url="/login", status_code=303)
    if real_amount > 0:
        try:
            reconcile_transaction_amount(db, transaction_id, real_amount)
        except ValueError:
            pass
    redirect_url = f"/dashboard?month={month}" if month else "/dashboard"
    return RedirectResponse(url=redirect_url, status_code=303)


@router.post("/dashboard/income", include_in_schema=False)
def add_manual_from_dashboard(
    title: str = Form(...),
    amount: Decimal = Form(...),
    category: str = Form(default="Salário/Receita"),
    tx_type: str = Form(default="INCOME"),
    month: str | None = Form(default=None),
    authenticated: bool = Depends(get_dashboard_session),
    db: Session = Depends(get_db),
):
    if not authenticated:
        return RedirectResponse(url="/login", status_code=303)
    if tx_type in ("INCOME", "EXPENSE") and amount > 0 and title.strip():
        occ = datetime.now(timezone.utc)
        if month and len(month) == 7 and "-" in month:
            try:
                y_str, m_str = month.split("-")
                occ = datetime(int(y_str), int(m_str), min(occ.day, 28), 12, 0, tzinfo=timezone.utc)
            except Exception:
                pass
        merchant_display = title.strip()
        tx = Transaction(
            source="MANUAL",
            app_name="Dashboard",
            raw_title=merchant_display,
            raw_text=f"Lançamento rápido: {merchant_display}",
            type=tx_type,
            amount=amount,
            merchant=merchant_display,
            merchant_normalized=normalize_text(merchant_display) or "manual",
            installments=1,
            category=category,
            confidence=1.0,
            status="CONFIRMED",
            occurred_at=occ,
        )
        db.add(tx)
        db.commit()
    redirect_url = f"/dashboard?month={month}" if month else "/dashboard"
    return RedirectResponse(url=redirect_url, status_code=303)


@router.post("/dashboard/plan", include_in_schema=False)
def add_plan_from_dashboard(
    title: str = Form(...),
    type: str = Form(...),
    amount: Decimal = Form(...),
    category: str = Form(...),
    day_of_month: int = Form(...),
    plan_type: str = Form(default="FIXED"),
    payment_method: str = Form(default="PIX"),
    authenticated: bool = Depends(get_dashboard_session),
    db: Session = Depends(get_db),
):
    if not authenticated:
        return RedirectResponse(url="/login", status_code=303)
    if type in ("INCOME", "EXPENSE") and amount > 0 and 1 <= day_of_month <= 31:
        plan = AnnualPlan(
            title=title.strip(),
            type=type,
            amount=amount,
            category=category,
            day_of_month=day_of_month,
            plan_type=plan_type if plan_type in ("FIXED", "ROLLING_AVERAGE") else "FIXED",
            payment_method=payment_method if payment_method in ("PIX", "Cartão") else "PIX",
            active=True,
        )
        db.add(plan)
        db.commit()
    return RedirectResponse(url="/dashboard", status_code=303)


@router.post("/dashboard/plan/{plan_id}/delete", include_in_schema=False)
def delete_plan_from_dashboard(
    plan_id: int,
    authenticated: bool = Depends(get_dashboard_session),
    db: Session = Depends(get_db),
):
    if not authenticated:
        return RedirectResponse(url="/login", status_code=303)
    plan = db.query(AnnualPlan).filter(AnnualPlan.id == plan_id).first()
    if plan is not None:
        db.delete(plan)
        db.commit()
    return RedirectResponse(url="/dashboard", status_code=303)
