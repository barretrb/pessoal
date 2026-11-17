import logging
import httpx

from app.config import DEFAULT_CATEGORIES, Settings
from app.services.analytics import format_brl

logger = logging.getLogger(__name__)


def build_top_3_categories(
    suggested_category: str, top_categories: list[str] | None = None
) -> list[str]:
    """Ensure exactly 3 unique valid categories for Telegram Inline Keyboard."""
    candidates: list[str] = []
    for cat in [suggested_category, *(top_categories or [])]:
        if cat and cat not in candidates:
            candidates.append(cat)
    for fallback in DEFAULT_CATEGORIES:
        if len(candidates) >= 3:
            break
        if fallback not in candidates:
            candidates.append(fallback)
    return candidates[:3]


async def _telegram_post(
    settings: Settings, method: str, payload: dict
) -> dict | None:
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN not configured; skipping %s", method)
        return None
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/{method}"
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()


async def send_confirmed_notification(
    settings: Settings,
    amount: float,
    merchant: str,
    category: str,
    saldo_livre: float,
    transaction_id: int | None = None,
) -> int | None:
    if not settings.TELEGRAM_CHAT_ID:
        return None

    text = (
        f"✅ R$ {format_brl(amount)} em {merchant} ({category}) | "
        f"Saldo Livre do Mês: R$ {format_brl(saldo_livre)}"
    )
    payload: dict = {
        "chat_id": settings.TELEGRAM_CHAT_ID,
        "text": text,
        "disable_notification": True,
    }
    if transaction_id is not None:
        payload["reply_markup"] = {
            "inline_keyboard": [
                [{"text": "✏️ Editar / Categoria", "callback_data": f"edit:{transaction_id}"}]
            ]
        }
    res = await _telegram_post(settings, "sendMessage", payload)
    if res and res.get("ok"):
        return res["result"]["message_id"]
    return None


async def send_hitl_category_prompt(
    settings: Settings,
    transaction_id: int,
    amount: float,
    merchant: str,
    tx_type: str,
    categories: list[str],
) -> int | None:
    if not settings.TELEGRAM_CHAT_ID:
        return None

    label = "Entrada" if tx_type == "INCOME" else "Gasto"
    text = (
        f"🤔 {label} pendente de confirmação:\n"
        f"💰 R$ {format_brl(amount)} em *{merchant}*\n"
        f"Selecione a categoria correta:"
    )
    keyboard = [
        [
            {"text": cat, "callback_data": f"cat:{transaction_id}:{cat}"}
            for cat in categories[:3]
        ]
    ]
    res = await _telegram_post(
        settings,
        "sendMessage",
        {
            "chat_id": settings.TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "Markdown",
            "reply_markup": {"inline_keyboard": keyboard},
        },
    )
    if res and res.get("ok"):
        return res["result"]["message_id"]
    return None


async def send_edit_category_keyboard(
    settings: Settings,
    chat_id: int | str,
    tx_id: int,
    amount: float,
    merchant: str,
    current_category: str,
    categories: list[str],
    callback_query_id: str | None = None,
) -> None:
    if callback_query_id:
        await _telegram_post(
            settings,
            "answerCallbackQuery",
            {"callback_query_id": callback_query_id},
        )
    keyboard = []
    row = []
    for cat in categories:
        row.append({"text": cat, "callback_data": f"cat:{tx_id}:{cat}"})
        if len(row) == 3:
            keyboard.append(row)
            row = []
    if row:
        keyboard.append(row)

    text = (
        f"✏️ *Editar #{tx_id}*: R$ {format_brl(amount)} em *{merchant}*\n"
        f"Categoria atual: _{current_category}_\n\n"
        f"Toque em uma categoria abaixo ou envie:\n"
        f"`/editar {tx_id} Novo Nome | Categoria`\n"
        f"`/excluir {tx_id}`"
    )
    await _telegram_post(
        settings,
        "sendMessage",
        {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown",
            "reply_markup": {"inline_keyboard": keyboard},
        },
    )


async def send_message_with_keyboard(
    settings: Settings,
    chat_id: int | str,
    text: str,
    inline_keyboard: list[list[dict]],
) -> None:
    if not settings.TELEGRAM_BOT_TOKEN:
        return
    await _telegram_post(
        settings,
        "sendMessage",
        {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown",
            "reply_markup": {"inline_keyboard": inline_keyboard},
        },
    )


async def answer_callback_and_update_message(
    settings: Settings,
    callback_query_id: str,
    chat_id: int | str,
    message_id: int,
    amount: float,
    merchant: str,
    category: str,
    saldo_livre: float,
) -> None:
    await _telegram_post(
        settings,
        "answerCallbackQuery",
        {
            "callback_query_id": callback_query_id,
            "text": f"Salvo como {category}!",
        },
    )
    updated_text = (
        f"✅ R$ {format_brl(amount)} em {merchant} ({category}) | "
        f"Saldo Livre do Mês: R$ {format_brl(saldo_livre)}"
    )
    await _telegram_post(
        settings,
        "editMessageText",
        {
            "chat_id": chat_id,
            "message_id": message_id,
            "text": updated_text,
            "reply_markup": {
                "inline_keyboard": [
                    [{"text": "✏️ Editar / Categoria", "callback_data": f"edit_msg_noop"}]
                ]
            },
        },
    )


async def send_plain_message(
    settings: Settings, chat_id: int | str, text: str
) -> None:
    await _telegram_post(
        settings,
        "sendMessage",
        {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
    )
