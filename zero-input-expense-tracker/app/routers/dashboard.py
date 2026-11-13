from decimal import Decimal
from pathlib import Path
from fastapi import APIRouter, Depends, Form, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.config import DEFAULT_CATEGORIES, Settings, get_settings
from app.database import get_db
from app.models import AnnualPlan
from app.security import (
    SESSION_COOKIE_NAME,
    SESSION_MAX_AGE_SECONDS,
    create_session_token,
    get_dashboard_session,
    verify_dashboard_password,
)
from app.services.analytics import compute_monthly_summary

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
    plans = db.query(AnnualPlan).order_by(AnnualPlan.day_of_month.asc()).all()

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={
            "summary": summary,
            "plans": plans,
            "categories": DEFAULT_CATEGORIES,
        },
    )


@router.post("/dashboard/plan", include_in_schema=False)
def add_plan_from_dashboard(
    title: str = Form(...),
    type: str = Form(...),
    amount: Decimal = Form(...),
    category: str = Form(...),
    day_of_month: int = Form(...),
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
