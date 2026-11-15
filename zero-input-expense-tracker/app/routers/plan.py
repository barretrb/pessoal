from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AnnualPlan, Transaction
from app.schemas import (
    AnnualPlanCreate,
    AnnualPlanOut,
    AnnualPlanUpdate,
    ManualTransactionCreate,
    ReconcileRequest,
    ReconcileResponse,
    TransactionOut,
)
from app.security import verify_api_key
from app.services.ai_parser import normalize_text
from app.services.planner import reconcile_transaction_amount

router = APIRouter(
    prefix="/api/v1/annual-plan",
    tags=["Annual Plan"],
    dependencies=[Depends(verify_api_key)],
)

tx_router = APIRouter(
    prefix="/api/v1/transactions",
    tags=["Transactions"],
    dependencies=[Depends(verify_api_key)],
)


@router.get("", response_model=list[AnnualPlanOut])
def list_annual_plans(db: Session = Depends(get_db)) -> list[AnnualPlan]:
    return db.query(AnnualPlan).order_by(AnnualPlan.day_of_month.asc()).all()


@router.post("", response_model=AnnualPlanOut, status_code=status.HTTP_201_CREATED)
def create_annual_plan(
    payload: AnnualPlanCreate, db: Session = Depends(get_db)
) -> AnnualPlan:
    plan = AnnualPlan(**payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.patch("/{plan_id}", response_model=AnnualPlanOut)
def update_annual_plan(
    plan_id: int, payload: AnnualPlanUpdate, db: Session = Depends(get_db)
) -> AnnualPlan:
    plan = db.query(AnnualPlan).filter(AnnualPlan.id == plan_id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Annual plan item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_annual_plan(plan_id: int, db: Session = Depends(get_db)) -> None:
    plan = db.query(AnnualPlan).filter(AnnualPlan.id == plan_id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Annual plan item not found")
    db.delete(plan)
    db.commit()


@tx_router.patch("/{tx_id}/reconcile", response_model=ReconcileResponse)
def reconcile_transaction(
    tx_id: int,
    payload: ReconcileRequest,
    db: Session = Depends(get_db),
) -> ReconcileResponse:
    try:
        return reconcile_transaction_amount(db, tx_id, payload.amount)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@tx_router.post("/manual", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_manual_transaction(
    payload: ManualTransactionCreate,
    db: Session = Depends(get_db),
) -> Transaction:
    occ = payload.occurred_at or datetime.now(timezone.utc)
    if occ.tzinfo is None:
        occ = occ.replace(tzinfo=timezone.utc)
    else:
        occ = occ.astimezone(timezone.utc)
    merchant_display = payload.merchant.strip()
    tx = Transaction(
        source="MANUAL",
        app_name="Dashboard",
        raw_title=merchant_display,
        raw_text=f"Lançamento manual: {merchant_display}",
        type=payload.type,
        amount=payload.amount,
        merchant=merchant_display,
        merchant_normalized=normalize_text(merchant_display) or "manual",
        installments=1,
        category=payload.category,
        confidence=1.0,
        status="CONFIRMED",
        occurred_at=occ,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx
