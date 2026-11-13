import json
import re
import unicodedata
import httpx
from sqlalchemy.orm import Session

from app.config import DEFAULT_CATEGORIES, Settings
from app.models import MerchantMemory
from app.schemas import AIExtractionResult, NotificationPayload

_BRL_AMOUNT_RE = re.compile(r"R\$\s*([\d\.]+,\d{2})", re.IGNORECASE)
_INSTALLMENTS_RE = re.compile(
    r"(?:em\s+)?(\d{1,2})\s*(?:x|vezes|parcelas?)", re.IGNORECASE
)

_IGNORE_HINTS = (
    "recusada",
    "negada",
    "cancelada",
    "saldo insuficiente",
    "fatura fechada",
    "fechamento da fatura",
    "vence em",
    "promocao",
    "desconto",
    "oferta",
    "cashback",
    "aproveite",
    "emprestimo",
    "codigo de verificacao",
    "token",
)

_INCOME_HINTS = (
    "pix recebido",
    "transferencia recebida",
    "voce recebeu",
    "credito em conta",
    "deposito recebido",
    "salario",
    "reembolso",
)

_EXPENSE_HINTS = (
    "compra aprovada",
    "compra no credito",
    "compra no debito",
    "pix enviado",
    "pagamento aprovado",
    "pagamento realizado",
    "voce pagou",
    "gasto",
    "pagou",
    "debito",
)


def normalize_text(value: str) -> str:
    """Lowercase, strip accents, and collapse non-alphanumeric characters."""
    decomposed = unicodedata.normalize("NFKD", value or "")
    ascii_only = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", ascii_only.lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def extract_brl_amount(text: str) -> float | None:
    match = _BRL_AMOUNT_RE.search(text or "")
    if not match:
        return None
    raw = match.group(1).replace(".", "").replace(",", ".")
    try:
        value = float(raw)
        return value if value > 0 else None
    except ValueError:
        return None


def extract_installments(text: str) -> int:
    match = _INSTALLMENTS_RE.search(text or "")
    if not match:
        return 1
    try:
        qty = int(match.group(1))
        return qty if 1 <= qty <= 48 else 1
    except ValueError:
        return 1


def find_merchant_memory(db: Session, merchant_name: str) -> MerchantMemory | None:
    normalized = normalize_text(merchant_name)
    if not normalized:
        return None
    return (
        db.query(MerchantMemory)
        .filter(MerchantMemory.merchant_normalized == normalized)
        .first()
    )


def try_deterministic_memory_match(
    db: Session, payload: NotificationPayload
) -> tuple[AIExtractionResult | None, MerchantMemory | None]:
    """
    Check merchant_memory BEFORE calling the LLM.
    If the notification clearly describes a financial transaction (amount + verb)
    and matches a known merchant in merchant_memory, skip the LLM call completely.
    """
    combined_raw = f"{payload.title} {payload.text}".strip()
    combined_norm = normalize_text(combined_raw)

    if any(hint in combined_norm for hint in _IGNORE_HINTS):
        return None, None

    amount = extract_brl_amount(combined_raw)
    if amount is None:
        return None, None

    tx_type: str | None = None
    if any(hint in combined_norm for hint in _INCOME_HINTS):
        tx_type = "INCOME"
    elif any(hint in combined_norm for hint in _EXPENSE_HINTS):
        tx_type = "EXPENSE"

    if tx_type is None:
        return None, None

    memories = db.query(MerchantMemory).all()
    # Prefer longest merchant_normalized match to avoid partial false hits
    memories.sort(key=lambda m: len(m.merchant_normalized), reverse=True)
    for mem in memories:
        if mem.merchant_normalized and re.search(
            rf"\b{re.escape(mem.merchant_normalized)}\b", combined_norm
        ):
            result = AIExtractionResult(
                is_financial_transaction=True,
                type=tx_type,  # type: ignore[arg-type]
                amount=amount,
                merchant=mem.merchant_display,
                installments=extract_installments(combined_raw),
                suggested_category=mem.category,
                confidence=0.98,
                top_categories=[mem.category],
            )
            return result, mem

    return None, None


def build_system_prompt() -> str:
    categories_str = ", ".join(DEFAULT_CATEGORIES)
    return (
        "You are a financial notification parser for Brazilian banks and digital wallets "
        "(Nubank, Itaú, Inter, Bradesco, Santander, Banco do Brasil, C6, BTG, Mercado Pago, "
        "PicPay, Google Pay, Apple Pay).\n"
        "Extract structured transaction data from the push notification and return ONLY valid JSON.\n\n"
        f"Allowed categories: [{categories_str}].\n\n"
        "JSON schema:\n"
        "{\n"
        '  "is_financial_transaction": boolean,\n'
        '  "type": "EXPENSE" | "INCOME" | "IGNORE",\n'
        '  "amount": number,\n'
        '  "merchant": string,\n'
        '  "installments": integer,\n'
        '  "suggested_category": string,\n'
        '  "confidence": number (0.0 to 1.0),\n'
        '  "top_categories": [string, string, string]\n'
        "}\n\n"
        "Rules:\n"
        "1. Set is_financial_transaction=false and type='IGNORE' for marketing/promos, "
        "cashback offers, loan offers, closed invoice notices ('fatura fechada'), "
        "declined/cancelled purchases ('compra recusada', 'negada'), or OTP codes.\n"
        "2. For PIX received / salary / refunds / transfers in, set type='INCOME'.\n"
        "3. For card purchases, PIX sent, bill payments, set type='EXPENSE'.\n"
        "4. Extract installments as integer (default 1 if single payment / à vista).\n"
        "5. Provide top_categories with 3 most likely categories from the allowed list, "
        "starting with suggested_category.\n"
        "6. Set confidence < 0.85 if the merchant name is ambiguous (e.g., generic person name on PIX, "
        "unrecognized store, or vague description)."
    )


async def parse_notification_with_ai(
    payload: NotificationPayload, settings: Settings
) -> AIExtractionResult:
    """Call Groq OpenAI-compatible Chat Completions API in JSON mode."""
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not configured")

    user_content = (
        f"App: {payload.app}\n"
        f"Title: {payload.title}\n"
        f"Text: {payload.text}\n"
        f"Timestamp: {payload.timestamp.isoformat()}"
    )

    url = f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": settings.GROQ_MODEL,
        "temperature": 0.0,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": build_system_prompt()},
            {"role": "user", "content": user_content},
        ],
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(url, headers=headers, json=body)
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    parsed = json.loads(content)
    return AIExtractionResult.model_validate(parsed)
