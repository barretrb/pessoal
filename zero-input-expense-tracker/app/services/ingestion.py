from datetime import datetime, timedelta, timezone
from decimal import Decimal
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import MerchantMemory, Transaction
from app.schemas import IngestionResponse, NotificationPayload
from app.services.ai_parser import (
    find_merchant_memory,
    normalize_text,
    parse_notification_with_ai,
    try_deterministic_memory_match,
)
from app.services.analytics import compute_monthly_summary
from app.services.telegram_bot import (
    build_top_3_categories,
    send_confirmed_notification,
    send_hitl_category_prompt,
)


def to_utc(dt: datetime, tz_name: str) -> datetime:
    if dt.tzinfo is None:
        try:
            tz = ZoneInfo(tz_name)
        except Exception:
            tz = timezone.utc
        dt = dt.replace(tzinfo=tz)
    return dt.astimezone(timezone.utc)


def upsert_merchant_memory(
    db: Session, merchant_display: str, category: str
) -> MerchantMemory:
    normalized = normalize_text(merchant_display)
    existing = (
        db.query(MerchantMemory)
        .filter(MerchantMemory.merchant_normalized == normalized)
        .first()
    )
    if existing:
        existing.category = category
        existing.merchant_display = merchant_display
        existing.hit_count += 1
        db.commit()
        db.refresh(existing)
        return existing

    mem = MerchantMemory(
        merchant_normalized=normalized,
        merchant_display=merchant_display,
        category=category,
        hit_count=1,
    )
    db.add(mem)
    db.commit()
    db.refresh(mem)
    return mem


async def process_notification(
    db: Session, payload: NotificationPayload, settings: Settings
) -> IngestionResponse:
    occurred_utc = to_utc(payload.timestamp, settings.TIMEZONE)

    used_memory = False
    used_ai = False

    # 1. Check merchant_memory BEFORE calling AI
    extraction, memory = try_deterministic_memory_match(db, payload)
    if extraction is not None and memory is not None:
        used_memory = True
        memory.hit_count += 1
        db.flush()
    else:
        # 2. Call AI Parser (Groq llama-3.3-70b-versatile)
        extraction = await parse_notification_with_ai(payload, settings)
        used_ai = True

        if (
            not extraction.is_financial_transaction
            or extraction.type == "IGNORE"
            or extraction.amount <= 0
        ):
            return IngestionResponse(
                status="IGNORED",
                used_memory=False,
                used_ai=True,
                message="Notification ignored (non-financial, promotional, or declined).",
            )

        # Post-extraction merchant_memory lookup
        mem = find_merchant_memory(db, extraction.merchant)
        if mem is not None:
            extraction.suggested_category = mem.category
            extraction.confidence = max(extraction.confidence, 0.95)
            used_memory = True
            mem.hit_count += 1
            db.flush()

    amount_dec = Decimal(f"{extraction.amount:.2f}")

    # 3. Deduplication: same amount & type within DEDUP_WINDOW_MINUTES
    window = timedelta(minutes=settings.DEDUP_WINDOW_MINUTES)
    existing_dup = (
        db.query(Transaction)
        .filter(
            Transaction.amount == amount_dec,
            Transaction.type == extraction.type,
            Transaction.occurred_at >= occurred_utc - window,
            Transaction.occurred_at <= occurred_utc + window,
        )
        .first()
    )
    if existing_dup is not None:
        db.rollback()
        return IngestionResponse(
            status="DUPLICATE",
            transaction_id=existing_dup.id,
            type=existing_dup.type,
            amount=existing_dup.amount,
            merchant=existing_dup.merchant,
            category=existing_dup.category,
            confidence=existing_dup.confidence,
            used_memory=used_memory,
            used_ai=used_ai,
            message=f"Duplicate transaction ignored within {settings.DEDUP_WINDOW_MINUTES}-minute window.",
        )

    # 4. Determine confirmation status & persist
    tx_status = (
        "CONFIRMED"
        if extraction.confidence >= settings.CONFIDENCE_THRESHOLD
        else "PENDING"
    )
    merchant_display = extraction.merchant.strip() or "Estabelecimento"
    merchant_norm = normalize_text(merchant_display) or "estabelecimento"

    tx = Transaction(
        source="NOTIFICATION",
        app_name=payload.app,
        raw_title=payload.title,
        raw_text=payload.text,
        type=extraction.type,
        amount=amount_dec,
        merchant=merchant_display,
        merchant_normalized=merchant_norm,
        installments=extraction.installments,
        category=extraction.suggested_category,
        confidence=extraction.confidence,
        status=tx_status,
        occurred_at=occurred_utc,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    # 5. Telegram notification / HITL flow
    if tx_status == "CONFIRMED":
        summary = compute_monthly_summary(db, settings)
        msg_id = await send_confirmed_notification(
            settings=settings,
            amount=float(tx.amount),
            merchant=tx.merchant,
            category=tx.category,
            saldo_livre=summary["saldo_livre"],
        )
    else:
        top_3 = build_top_3_categories(
            extraction.suggested_category, extraction.top_categories
        )
        msg_id = await send_hitl_category_prompt(
            settings=settings,
            transaction_id=tx.id,
            amount=float(tx.amount),
            merchant=tx.merchant,
            tx_type=tx.type,
            categories=top_3,
        )

    if msg_id is not None:
        tx.telegram_message_id = msg_id
        db.commit()

    return IngestionResponse(
        status=tx_status,  # type: ignore[arg-type]
        transaction_id=tx.id,
        type=tx.type,
        amount=tx.amount,
        merchant=tx.merchant,
        category=tx.category,
        confidence=tx.confidence,
        used_memory=used_memory,
        used_ai=used_ai,
        message=f"Transaction saved as {tx_status}.",
    )
