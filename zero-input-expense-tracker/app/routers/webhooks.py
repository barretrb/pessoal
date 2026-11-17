import hmac
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.models import Transaction
from app.schemas import IngestionResponse, NotificationPayload
from app.security import verify_api_key
from app.services.ai_parser import normalize_text
from app.services.analytics import (
    compute_monthly_summary,
    ensure_category_exists,
    format_brl,
    get_all_categories,
    query_detailed_transactions,
)
from app.services.ingestion import process_notification, upsert_merchant_memory
from app.services.telegram_bot import (
    answer_callback_and_update_message,
    send_edit_category_keyboard,
    send_message_with_keyboard,
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


def _format_tx_list(txs: list[Transaction], header: str) -> tuple[str, list[list[dict]]]:
    if not txs:
        return f"{header}\nNenhum lançamento encontrado.", []
    lines = [header]
    keyboard: list[list[dict]] = []
    row: list[dict] = []
    for tx in txs[:8]:
        sign = "+" if tx.type == "INCOME" else "-"
        dt_str = tx.occurred_at.strftime("%d/%m")
        lines.append(
            f"`#{tx.id}` {dt_str} · *{tx.merchant}* ({tx.category}) · {sign}R$ {format_brl(float(tx.amount))}"
        )
        row.append({"text": f"✏️ #{tx.id} {tx.merchant[:12]}", "callback_data": f"edit:{tx.id}"})
        if len(row) == 2:
            keyboard.append(row)
            row = []
    if row:
        keyboard.append(row)
    lines.append("\n_Toque em um botão para trocar categoria ou envie `/editar ID Nome | Categoria`_")
    return "\n".join(lines), keyboard


@router.post("/telegram")
async def telegram_webhook(
    request: Request,
    x_telegram_secret: str | None = Header(
        default=None, alias="X-Telegram-Bot-Api-Secret-Token"
    ),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    """Handle Telegram Bot API webhook updates (HITL callbacks & query/edit commands)."""
    if settings.TELEGRAM_WEBHOOK_SECRET:
        if not x_telegram_secret or not hmac.compare_digest(
            x_telegram_secret, settings.TELEGRAM_WEBHOOK_SECRET
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid Telegram webhook secret",
            )

    update = await request.json()

    # 1. Handle Inline Keyboard Callback
    callback = update.get("callback_query")
    if callback:
        data: str = callback.get("data", "")
        callback_id: str = callback["id"]
        message = callback.get("message", {})
        chat_id = message.get("chat", {}).get("id")
        message_id = message.get("message_id")

        if data.startswith("edit:"):
            tx_id_str = data.split(":", 1)[1]
            if tx_id_str.isdigit() and chat_id is not None:
                tx = db.query(Transaction).filter(Transaction.id == int(tx_id_str)).first()
                if tx is not None:
                    await send_edit_category_keyboard(
                        settings=settings,
                        chat_id=chat_id,
                        tx_id=tx.id,
                        amount=float(tx.amount),
                        merchant=tx.merchant,
                        current_category=tx.category,
                        categories=get_all_categories(db),
                        callback_query_id=callback_id,
                    )
                    return {"ok": True, "action": "edit_menu", "transaction_id": tx.id}

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

    # 2. Handle Chat Commands (/saldo, /ultimos, /buscar, /editar, /excluir, /ajuda)
    msg = update.get("message")
    if msg and isinstance(msg.get("text"), str):
        raw_text = msg["text"].strip()
        lower = raw_text.lower()
        chat_id = msg.get("chat", {}).get("id")
        if chat_id is None:
            return {"ok": True}
        if settings.TELEGRAM_CHAT_ID and str(chat_id) != str(settings.TELEGRAM_CHAT_ID):
            return {"ok": True, "ignored": True}

        if lower in ("/saldo", "/resumo"):
            summary = compute_monthly_summary(db, settings)
            reply = (
                f"📊 *Resumo ({summary['period']})*\n"
                f"Entradas: R$ {summary['total_income_brl']}\n"
                f"Fixos & Médias: R$ {summary['fixed_expenses_brl']}\n"
                f"Variáveis (Cartão): R$ {summary['variable_expenses_brl']}\n"
                f"Saldo Livre: R$ {format_brl(summary['saldo_livre'])}"
            )
            await send_plain_message(settings, chat_id, reply)
            return {"ok": True, "command": "saldo"}

        if lower in ("/ultimos", "/listar", "/gastos"):
            summary = compute_monthly_summary(db, settings)
            res = query_detailed_transactions(
                db, settings, year=summary["year"], month=summary["month"]
            )
            txt, kb = _format_tx_list(res["transactions"], f"🧾 *Últimos lançamentos ({summary['period']}):*")
            if kb:
                await send_message_with_keyboard(settings, chat_id, txt, kb)
            else:
                await send_plain_message(settings, chat_id, txt)
            return {"ok": True, "command": "ultimos"}

        if lower.startswith("/buscar "):
            term = raw_text[8:].strip()
            summary = compute_monthly_summary(db, settings)
            res = query_detailed_transactions(
                db, settings, year=summary["year"], month=summary["month"], search=term
            )
            txt, kb = _format_tx_list(res["transactions"], f"🔎 *Busca por '{term}' ({summary['period']}):*")
            if kb:
                await send_message_with_keyboard(settings, chat_id, txt, kb)
            else:
                await send_plain_message(settings, chat_id, txt)
            return {"ok": True, "command": "buscar"}

        if lower.startswith("/editar"):
            rest = raw_text[7:].strip()
            parts = rest.split(None, 1)
            if not parts or not parts[0].isdigit():
                await send_plain_message(
                    settings,
                    chat_id,
                    "Uso: `/editar <ID> <Novo Nome> | <Categoria>`\nEx: `/editar 18 99 | Transporte/Viagem`\nOu apenas `/editar 18` para escolher categoria.",
                )
                return {"ok": True, "command": "editar_help"}

            tx_id = int(parts[0])
            tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
            if tx is None:
                await send_plain_message(settings, chat_id, f"❌ Lançamento `#{tx_id}` não encontrado.")
                return {"ok": True, "command": "editar_not_found"}

            if len(parts) == 1:
                await send_edit_category_keyboard(
                    settings=settings,
                    chat_id=chat_id,
                    tx_id=tx.id,
                    amount=float(tx.amount),
                    merchant=tx.merchant,
                    current_category=tx.category,
                    categories=get_all_categories(db),
                )
                return {"ok": True, "command": "editar_menu"}

            arg = parts[1].strip()
            all_cats = get_all_categories(db)
            cat_map = {c.lower(): c for c in all_cats}

            if "|" in arg:
                new_merch, new_cat = [s.strip() for s in arg.split("|", 1)]
                if new_merch:
                    tx.merchant = new_merch
                    tx.merchant_normalized = normalize_text(new_merch) or tx.merchant_normalized
                if new_cat:
                    resolved_cat = cat_map.get(new_cat.lower()) or ensure_category_exists(db, new_cat)
                    tx.category = resolved_cat
            elif arg.lower() in cat_map:
                tx.category = cat_map[arg.lower()]
            else:
                tx.merchant = arg
                tx.merchant_normalized = normalize_text(arg) or tx.merchant_normalized

            tx.status = "CONFIRMED"
            db.commit()
            db.refresh(tx)
            upsert_merchant_memory(db, tx.merchant, tx.category)
            summary = compute_monthly_summary(db, settings)
            await send_plain_message(
                settings,
                chat_id,
                f"✅ Atualizado `#{tx.id}`: R$ {format_brl(float(tx.amount))} em *{tx.merchant}* ({tx.category}) | Saldo Livre: R$ {format_brl(summary['saldo_livre'])}",
            )
            return {"ok": True, "command": "editar", "transaction_id": tx.id}

        if lower.startswith("/excluir "):
            id_str = raw_text[9:].strip()
            if id_str.isdigit():
                tx = db.query(Transaction).filter(Transaction.id == int(id_str)).first()
                if tx is not None:
                    merch = tx.merchant
                    amt = float(tx.amount)
                    db.delete(tx)
                    db.commit()
                    summary = compute_monthly_summary(db, settings)
                    await send_plain_message(
                        settings,
                        chat_id,
                        f"🗑️ Excluído `#{id_str}` ({merch} - R$ {format_brl(amt)}) | Saldo Livre: R$ {format_brl(summary['saldo_livre'])}",
                    )
                    return {"ok": True, "command": "excluir", "deleted_id": int(id_str)}
            await send_plain_message(settings, chat_id, f"❌ Lançamento `#{id_str}` não encontrado.")
            return {"ok": True, "command": "excluir_not_found"}

        if lower in ("/ajuda", "/help", "/start"):
            help_txt = (
                "🤖 *Comandos do FinControl*\n"
                "• `/saldo` — resumo e Saldo Livre do mês\n"
                "• `/ultimos` — últimos lançamentos com botão de edição\n"
                "• `/buscar <termo>` — buscar gastos (ex: `/buscar 99`)\n"
                "• `/editar <ID>` — trocar categoria por botão\n"
                "• `/editar <ID> <Nome> | <Categoria>` — renomear e categorizar\n"
                "• `/excluir <ID>` — remover lançamento"
            )
            await send_plain_message(settings, chat_id, help_txt)
            return {"ok": True, "command": "ajuda"}

    return {"ok": True}
