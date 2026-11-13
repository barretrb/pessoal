import hmac
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.models import Transaction
from app.schemas import IngestionResponse, NotificationPayload
from app.security import verify_api_key
from app.services.analytics import compute_monthly_summary, format_brl
from app.services.ingestion import process_notification, upsert_merchant_memory
from app.services.telegram_bot import (
    answer_callback_and_update_message,
    send_plain_message,
)

router = APIRouter(prefix="/api/v1/webhook", tags=["Webhooks"])


@router.post(
    "/notification",
    response_model=IngestionResponse,
    dependencies=[Depends(verify_api_key)],
)
async def ingest_notification(
    payload: NotificationPayload,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> IngestionResponse:
    """Ingest push notification from MacroDroid, filter/extract via memory/AI, deduplicate, and notify."""
    return await process_notification(db=db, payload=payload, settings=settings)


@router.post("/telegram")
async def telegram_webhook(
    request: Request,
    x_telegram_secret: str | None = Header(
        default=None, alias="X-Telegram-Bot-Api-Secret-Token"
    ),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    """Handle Telegram Bot API webhook updates (HITL inline keyboard callbacks & commands)."""
    if settings.TELEGRAM_WEBHOOK_SECRET:
        if not x_telegram_secret or not hmac.compare_digest(
            x_telegram_secret, settings.TELEGRAM_WEBHOOK_SECRET
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid Telegram webhook secret",
            )

    update = await request.json()

    # 1. Handle Inline Keyboard Callback (HITL categorization)
    callback = update.get("callback_query")
    if callback:
        data: str = callback.get("data", "")
        callback_id: str = callback["id"]
        message = callback.get("message", {})
        chat_id = message.get("chat", {}).get("id")
        message_id = message.get("message_id")

        if data.startswith("cat:"):
            parts = data.split(":", 2)
            if len(parts) == 3 and parts[1].isdigit():
                tx_id = int(parts[1])
                chosen_category = parts[2]
                tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
                if tx is not None:
                    tx.category = chosen_category
                    tx.status = "CONFIRMED"
                    db.commit()
                    db.refresh(tx)

                    upsert_merchant_memory(db, tx.merchant, chosen_category)
                    summary = compute_monthly_summary(db, settings)

                    if chat_id is not None and message_id is not None:
                        await answer_callback_and_update_message(
                            settings=settings,
                            callback_query_id=callback_id,
                            chat_id=chat_id,
                            message_id=message_id,
                            amount=float(tx.amount),
                            merchant=tx.merchant,
                            category=chosen_category,
                            saldo_livre=summary["saldo_livre"],
                        )
                    return {"ok": True, "transaction_id": tx.id, "category": chosen_category}

        return {"ok": True, "ignored": True}

    # 2. Handle simple text commands (/saldo or /resumo)
    msg = update.get("message")
    if msg and isinstance(msg.get("text"), str):
        text = msg["text"].strip().lower()
        chat_id = msg.get("chat", {}).get("id")
        if text in ("/saldo", "/resumo") and chat_id is not None:
            if not settings.TELEGRAM_CHAT_ID or str(chat_id) == str(settings.TELEGRAM_CHAT_ID):
                summary = compute_monthly_summary(db, settings)
                reply = (
                    f"📊 *Resumo ({summary['period']})*\n"
                    f"Entradas: R$ {summary['total_income_brl']}\n"
                    f"Saídas Fixas: R$ {summary['fixed_expenses_brl']}\n"
                    f"Saídas Variáveis: R$ {summary['variable_expenses_brl']}\n"
                    f"Saldo Livre: R$ {format_brl(summary['saldo_livre'])}"
                )
                await send_plain_message(settings, chat_id, reply)

    return {"ok": True}
