from datetime import datetime, timedelta, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import Settings
from app.database import Base, get_db
from app.main import app
from app.models import AnnualPlan, MerchantMemory, Transaction
from app.schemas import AIExtractionResult
from app.config import get_settings

TEST_API_KEY = "test-secret-key-123"
TEST_DASHBOARD_PASS = "test-dash-pass"


def get_test_settings() -> Settings:
    return Settings(
        API_SECRET_KEY=TEST_API_KEY,
        DASHBOARD_PASSWORD=TEST_DASHBOARD_PASS,
        DATABASE_URL="sqlite://",
        GROQ_API_KEY="gsk_test",
        TELEGRAM_BOT_TOKEN="123:test",
        TELEGRAM_CHAT_ID="999999",
        CONFIDENCE_THRESHOLD=0.85,
        DEDUP_WINDOW_MINUTES=3,
        MONTHLY_BUDGET_LIMIT=5000.0,
        TIMEZONE="America/Sao_Paulo",
    )


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_settings] = get_test_settings
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def auth_headers() -> dict[str, str]:
    return {"X-API-Key": TEST_API_KEY}


def test_ingestion_requires_valid_api_key(client):
    payload = {
        "app": "com.nu.production",
        "title": "Compra aprovada",
        "text": "Compra de R$ 25,00 em Padaria",
        "timestamp": "2026-11-13T12:00:00-03:00",
    }
    resp_missing = client.post("/api/v1/webhook/notification", json=payload)
    assert resp_missing.status_code == 401

    resp_wrong = client.post(
        "/api/v1/webhook/notification",
        json=payload,
        headers={"X-API-Key": "wrong-key"},
    )
    assert resp_wrong.status_code == 403


def test_nubank_single_purchase_confirmed_and_silent_telegram(client, db_session):
    ai_result = AIExtractionResult(
        is_financial_transaction=True,
        type="EXPENSE",
        amount=45.90,
        merchant="Padaria Real",
        installments=1,
        suggested_category="Alimentação",
        confidence=0.94,
        top_categories=["Alimentação", "Supermercado", "Lazer"],
    )

    with (
        patch(
            "app.services.ingestion.parse_notification_with_ai",
            new=AsyncMock(return_value=ai_result),
        ),
        patch(
            "app.services.ingestion.send_confirmed_notification",
            new=AsyncMock(return_value=101),
        ) as mock_tg,
    ):
        resp = client.post(
            "/api/v1/webhook/notification",
            json={
                "app": "com.nu.production",
                "title": "Compra no crédito aprovada",
                "text": "Você gastou R$ 45,90 em Padaria Real.",
                "timestamp": "2026-11-13T10:30:00-03:00",
            },
            headers=auth_headers(),
        )

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "CONFIRMED"
    assert body["merchant"] == "Padaria Real"
    assert body["category"] == "Alimentação"
    assert body["used_ai"] is True
    mock_tg.assert_awaited_once()

    tx = db_session.query(Transaction).first()
    assert tx is not None
    assert tx.amount == Decimal("45.90")
    assert tx.status == "CONFIRMED"
    assert tx.telegram_message_id == 101


def test_installment_purchase_itau(client, db_session):
    ai_result = AIExtractionResult(
        is_financial_transaction=True,
        type="EXPENSE",
        amount=600.00,
        merchant="Magazine Luiza",
        installments=6,
        suggested_category="Compras",
        confidence=0.92,
        top_categories=["Compras", "Outros", "Lazer"],
    )

    with (
        patch(
            "app.services.ingestion.parse_notification_with_ai",
            new=AsyncMock(return_value=ai_result),
        ),
        patch(
            "app.services.ingestion.send_confirmed_notification",
            new=AsyncMock(return_value=102),
        ),
    ):
        resp = client.post(
            "/api/v1/webhook/notification",
            json={
                "app": "com.itau",
                "title": "Itaucard",
                "text": "Compra aprovada no cartao final 1234: R$ 600,00 em 6x em Magazine Luiza.",
                "timestamp": "2026-11-13T14:00:00-03:00",
            },
            headers=auth_headers(),
        )

    assert resp.status_code == 200
    tx = db_session.query(Transaction).first()
    assert tx.installments == 6
    assert tx.amount == Decimal("600.00")


def test_pix_income_and_expense_balance(client, db_session):
    pix_in = AIExtractionResult(
        is_financial_transaction=True,
        type="INCOME",
        amount=1500.00,
        merchant="Empresa XYZ",
        installments=1,
        suggested_category="Salário",
        confidence=0.97,
        top_categories=["Salário", "Transferência", "Outros"],
    )
    pix_out = AIExtractionResult(
        is_financial_transaction=True,
        type="EXPENSE",
        amount=200.00,
        merchant="Posto Shell",
        installments=1,
        suggested_category="Transporte",
        confidence=0.95,
        top_categories=["Transporte", "Serviços", "Outros"],
    )

    with (
        patch(
            "app.services.ingestion.parse_notification_with_ai",
            new=AsyncMock(side_effect=[pix_in, pix_out]),
        ),
        patch(
            "app.services.ingestion.send_confirmed_notification",
            new=AsyncMock(return_value=200),
        ) as mock_tg,
    ):
        r1 = client.post(
            "/api/v1/webhook/notification",
            json={
                "app": "br.com.intermedium",
                "title": "Pix recebido",
                "text": "Você recebeu um Pix de R$ 1.500,00 de Empresa XYZ.",
                "timestamp": "2026-11-13T09:00:00-03:00",
            },
            headers=auth_headers(),
        )
        r2 = client.post(
            "/api/v1/webhook/notification",
            json={
                "app": "br.com.intermedium",
                "title": "Pix enviado",
                "text": "Pix enviado de R$ 200,00 para Posto Shell.",
                "timestamp": "2026-11-13T11:00:00-03:00",
            },
            headers=auth_headers(),
        )

    assert r1.json()["type"] == "INCOME"
    assert r2.json()["type"] == "EXPENSE"
    # Second call should report saldo_livre = 1500 - 200 = 1300
    assert mock_tg.call_args_list[1].kwargs["saldo_livre"] == 1300.0


@pytest.mark.parametrize(
    "title,text",
    [
        ("Oferta Imperdível!", "Ganhe 15% de cashback usando seu cartão hoje!"),
        ("Fatura fechada", "Sua fatura de novembro no valor de R$ 2.340,00 fechou."),
        ("Compra recusada", "Sua compra de R$ 120,00 em Amazon foi negada por limite."),
    ],
)
def test_marketing_and_non_transaction_ignored(client, db_session, title, text):
    ignored_result = AIExtractionResult(
        is_financial_transaction=False,
        type="IGNORE",
        amount=0.0,
        merchant="",
        installments=1,
        suggested_category="Outros",
        confidence=0.99,
    )

    with (
        patch(
            "app.services.ingestion.parse_notification_with_ai",
            new=AsyncMock(return_value=ignored_result),
        ),
        patch(
            "app.services.ingestion.send_confirmed_notification",
            new=AsyncMock(),
        ) as mock_tg,
    ):
        resp = client.post(
            "/api/v1/webhook/notification",
            json={
                "app": "com.nu.production",
                "title": title,
                "text": text,
                "timestamp": "2026-11-13T15:00:00-03:00",
            },
            headers=auth_headers(),
        )

    assert resp.status_code == 200
    assert resp.json()["status"] == "IGNORED"
    assert db_session.query(Transaction).count() == 0
    mock_tg.assert_not_called()


def test_deduplication_google_pay_plus_bank_app_within_3_minutes(client, db_session):
    gpay_ai = AIExtractionResult(
        is_financial_transaction=True,
        type="EXPENSE",
        amount=89.90,
        merchant="Carrefour",
        installments=1,
        suggested_category="Supermercado",
        confidence=0.95,
    )
    bank_ai = AIExtractionResult(
        is_financial_transaction=True,
        type="EXPENSE",
        amount=89.90,
        merchant="Carrefour Express",
        installments=1,
        suggested_category="Supermercado",
        confidence=0.95,
    )

    with (
        patch(
            "app.services.ingestion.parse_notification_with_ai",
            new=AsyncMock(side_effect=[gpay_ai, bank_ai]),
        ),
        patch(
            "app.services.ingestion.send_confirmed_notification",
            new=AsyncMock(return_value=301),
        ) as mock_tg,
    ):
        r1 = client.post(
            "/api/v1/webhook/notification",
            json={
                "app": "com.google.android.apps.walletnfcrel",
                "title": "Carrefour",
                "text": "Pagamento de R$ 89,90 aprovado com Google Pay.",
                "timestamp": "2026-11-13T16:00:00-03:00",
            },
            headers=auth_headers(),
        )
        r2 = client.post(
            "/api/v1/webhook/notification",
            json={
                "app": "com.nu.production",
                "title": "Compra aprovada",
                "text": "Compra de R$ 89,90 em Carrefour Express.",
                "timestamp": "2026-11-13T16:01:45-03:00",
            },
            headers=auth_headers(),
        )

    assert r1.json()["status"] == "CONFIRMED"
    assert r2.json()["status"] == "DUPLICATE"
    assert db_session.query(Transaction).count() == 1
    assert mock_tg.await_count == 1


def test_merchant_memory_skips_ai_call(client, db_session):
    db_session.add(
        MerchantMemory(
            merchant_normalized="ifood",
            merchant_display="iFood",
            category="Alimentação",
            hit_count=3,
        )
    )
    db_session.commit()

    with (
        patch(
            "app.services.ingestion.parse_notification_with_ai",
            new=AsyncMock(),
        ) as mock_ai,
        patch(
            "app.services.ingestion.send_confirmed_notification",
            new=AsyncMock(return_value=401),
        ),
    ):
        resp = client.post(
            "/api/v1/webhook/notification",
            json={
                "app": "com.nu.production",
                "title": "Compra aprovada",
                "text": "Compra aprovada no crédito de R$ 62,50 em iFood.",
                "timestamp": "2026-11-13T19:30:00-03:00",
            },
            headers=auth_headers(),
        )

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "CONFIRMED"
    assert body["used_memory"] is True
    assert body["used_ai"] is False
    assert body["category"] == "Alimentação"
    mock_ai.assert_not_called()


def test_low_confidence_hitl_telegram_callback_flow(client, db_session):
    low_conf_ai = AIExtractionResult(
        is_financial_transaction=True,
        type="EXPENSE",
        amount=150.00,
        merchant="Joao Carlos",
        installments=1,
        suggested_category="Transferência",
        confidence=0.62,
        top_categories=["Transferência", "Serviços", "Lazer"],
    )

    with (
        patch(
            "app.services.ingestion.parse_notification_with_ai",
            new=AsyncMock(return_value=low_conf_ai),
        ),
        patch(
            "app.services.ingestion.send_hitl_category_prompt",
            new=AsyncMock(return_value=501),
        ) as mock_prompt,
    ):
        resp = client.post(
            "/api/v1/webhook/notification",
            json={
                "app": "com.nu.production",
                "title": "Pix enviado",
                "text": "Você enviou R$ 150,00 para Joao Carlos.",
                "timestamp": "2026-11-13T17:00:00-03:00",
            },
            headers=auth_headers(),
        )

    assert resp.status_code == 200
    tx_id = resp.json()["transaction_id"]
    assert resp.json()["status"] == "PENDING"
    mock_prompt.assert_awaited_once()

    # Simulate user clicking "Serviços" inline button in Telegram
    with patch(
        "app.routers.webhooks.answer_callback_and_update_message",
        new=AsyncMock(),
    ) as mock_answer:
        cb_resp = client.post(
            "/api/v1/webhook/telegram",
            json={
                "callback_query": {
                    "id": "cbq-123",
                    "data": f"cat:{tx_id}:Serviços",
                    "message": {
                        "message_id": 501,
                        "chat": {"id": 999999},
                    },
                }
            },
        )

    assert cb_resp.status_code == 200
    mock_answer.assert_awaited_once()

    tx = db_session.query(Transaction).filter(Transaction.id == tx_id).first()
    assert tx.status == "CONFIRMED"
    assert tx.category == "Serviços"

    mem = (
        db_session.query(MerchantMemory)
        .filter(MerchantMemory.merchant_normalized == "joao carlos")
        .first()
    )
    assert mem is not None
    assert mem.category == "Serviços"


def test_annual_plan_daily_cron_idempotency(client, db_session):
    db_session.add_all(
        [
            AnnualPlan(
                title="Salário Mensal",
                type="INCOME",
                amount=Decimal("8000.00"),
                category="Salário",
                day_of_month=5,
                active=True,
            ),
            AnnualPlan(
                title="Condomínio",
                type="EXPENSE",
                amount=Decimal("950.00"),
                category="Moradia",
                day_of_month=10,
                active=True,
            ),
        ]
    )
    db_session.commit()

    r1 = client.post(
        "/api/v1/cron/daily?target_date=2026-11-05",
        headers=auth_headers(),
    )
    assert r1.status_code == 200
    assert r1.json()["created_count"] == 1
    assert r1.json()["skipped_count"] == 0

    # Re-run same day -> idempotent
    r2 = client.post(
        "/api/v1/cron/daily?target_date=2026-11-05",
        headers=auth_headers(),
    )
    assert r2.status_code == 200
    assert r2.json()["created_count"] == 0
    assert r2.json()["skipped_count"] == 1

    tx = db_session.query(Transaction).first()
    assert tx.source == "FIXED_PLAN"
    assert tx.merchant == "Salário Mensal"


def test_dashboard_auth_and_render(client):
    unauth = client.get("/dashboard", follow_redirects=False)
    assert unauth.status_code == 303
    assert unauth.headers["location"] == "/login"

    login = client.post(
        "/login",
        data={"password": TEST_DASHBOARD_PASS},
        follow_redirects=False,
    )
    assert login.status_code == 303

    dash = client.get("/dashboard")
    assert dash.status_code == 200
    assert "Burn Rate Mensal" in dash.text
    assert "Saldo Livre do Mês" in dash.text
