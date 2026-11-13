from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AnnualPlan
from app.schemas import AnnualPlanCreate, AnnualPlanOut, AnnualPlanUpdate
from app.security import verify_api_key

router = APIRouter(
    prefix="/api/v1/annual-plan",
    tags=["Annual Plan"],
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
