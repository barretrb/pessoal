from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field


class NotificationPayload(BaseModel):
    app: str = Field(..., min_length=1, max_length=100)
    title: str = Field(default="", max_length=255)
    text: str = Field(..., min_length=1)
    timestamp: datetime


class AIExtractionResult(BaseModel):
    is_financial_transaction: bool
    type: Literal["EXPENSE", "INCOME", "IGNORE"]
    amount: float = Field(default=0.0, ge=0.0)
    merchant: str = Field(default="")
    installments: int = Field(default=1, ge=1)
    suggested_category: str = Field(default="Outros")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    top_categories: list[str] = Field(default_factory=list)


class IngestionResponse(BaseModel):
    status: Literal["CONFIRMED", "PENDING", "IGNORED", "DUPLICATE"]
    transaction_id: int | None = None
    type: str | None = None
    amount: Decimal | None = None
    merchant: str | None = None
    category: str | None = None
    confidence: float | None = None
    used_memory: bool = False
    used_ai: bool = False
    message: str


class AnnualPlanCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    type: Literal["INCOME", "EXPENSE"]
    amount: Decimal = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=64)
    day_of_month: int = Field(..., ge=1, le=31)
    start_month: int = Field(default=1, ge=1, le=12)
    end_month: int = Field(default=12, ge=1, le=12)
    active: bool = True


class AnnualPlanUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    type: Literal["INCOME", "EXPENSE"] | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    category: str | None = Field(default=None, min_length=1, max_length=64)
    day_of_month: int | None = Field(default=None, ge=1, le=31)
    start_month: int | None = Field(default=None, ge=1, le=12)
    end_month: int | None = Field(default=None, ge=1, le=12)
    active: bool | None = None


class AnnualPlanOut(BaseModel):
    id: int
    title: str
    type: str
    amount: Decimal
    category: str
    day_of_month: int
    start_month: int
    end_month: int
    active: bool

    model_config = {"from_attributes": True}


class CronExecutionResponse(BaseModel):
    target_date: str
    period: str
    created_count: int
    skipped_count: int
    created_ids: list[int]
