from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AnnualPlan(Base):
    __tablename__ = "annual_plan"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    type: Mapped[str] = mapped_column(String(16), nullable=False)  # INCOME | EXPENSE
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    day_of_month: Mapped[int] = mapped_column(Integer, nullable=False)
    start_month: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    end_month: Mapped[int] = mapped_column(Integer, nullable=False, default=12)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        UniqueConstraint("annual_plan_id", "plan_period", name="uq_plan_period"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="NOTIFICATION")
    app_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    raw_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(16), nullable=False)  # EXPENSE | INCOME
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, index=True)
    merchant: Mapped[str] = mapped_column(String(150), nullable=False)
    merchant_normalized: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    installments: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    category: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="CONFIRMED", index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    telegram_message_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    annual_plan_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("annual_plan.id", ondelete="SET NULL"), nullable=True, index=True
    )
    plan_period: Mapped[str | None] = mapped_column(String(7), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class MerchantMemory(Base):
    __tablename__ = "merchant_memory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    merchant_normalized: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    merchant_display: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    hit_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
