from decimal import Decimal
from sqlalchemy.orm import Session

from app.models import AnnualPlan

DEFAULT_ANNUAL_PLAN_SEED: list[dict] = [
    # Receita Fixa
    {
        "title": "Salário Líquido",
        "type": "INCOME",
        "plan_type": "FIXED",
        "payment_method": "PIX",
        "amount": Decimal("11177.00"),
        "category": "Salário/Receita",
        "day_of_month": 1,
    },
    # Custos Fixos Exatos
    {
        "title": "Inglês",
        "type": "EXPENSE",
        "plan_type": "FIXED",
        "payment_method": "PIX",
        "amount": Decimal("650.00"),
        "category": "Educação",
        "day_of_month": 5,
    },
    {
        "title": "Financiamento Apto",
        "type": "EXPENSE",
        "plan_type": "FIXED",
        "payment_method": "PIX",
        "amount": Decimal("3161.09"),
        "category": "Contas Fixas",
        "day_of_month": 5,
    },
    {
        "title": "Condomínio",
        "type": "EXPENSE",
        "plan_type": "FIXED",
        "payment_method": "PIX",
        "amount": Decimal("1341.21"),
        "category": "Contas Fixas",
        "day_of_month": 5,
    },
    {
        "title": "Plano Cachorro",
        "type": "EXPENSE",
        "plan_type": "FIXED",
        "payment_method": "PIX",
        "amount": Decimal("150.00"),
        "category": "Saúde/Pet",
        "day_of_month": 5,
    },
    {
        "title": "Internet",
        "type": "EXPENSE",
        "plan_type": "FIXED",
        "payment_method": "PIX",
        "amount": Decimal("100.00"),
        "category": "Contas Fixas",
        "day_of_month": 10,
    },
    {
        "title": "Vivo Conta Celular",
        "type": "EXPENSE",
        "plan_type": "FIXED",
        "payment_method": "PIX",
        "amount": Decimal("59.00"),
        "category": "Contas Fixas",
        "day_of_month": 10,
    },
    {
        "title": "Google AI Pro (5 TB)",
        "type": "EXPENSE",
        "plan_type": "FIXED",
        "payment_method": "Cartão",
        "amount": Decimal("96.99"),
        "category": "Software",
        "day_of_month": 14,
    },
    {
        "title": "Diarista",
        "type": "EXPENSE",
        "plan_type": "FIXED",
        "payment_method": "PIX",
        "amount": Decimal("500.00"),
        "category": "Contas Fixas",
        "day_of_month": 15,
    },
    # Contas de Consumo com Média Móvel
    {
        "title": "Energia (Enel)",
        "type": "EXPENSE",
        "plan_type": "ROLLING_AVERAGE",
        "payment_method": "PIX",
        "amount": Decimal("400.00"),
        "category": "Contas Fixas",
        "day_of_month": 10,
    },
    {
        "title": "Naturgy (Gás)",
        "type": "EXPENSE",
        "plan_type": "ROLLING_AVERAGE",
        "payment_method": "PIX",
        "amount": Decimal("105.00"),
        "category": "Contas Fixas",
        "day_of_month": 5,
    },
]


def seed_annual_plan(db: Session) -> int:
    """Idempotently ensure all default Phase 2 annual_plan items exist."""
    existing_titles = {row[0] for row in db.query(AnnualPlan.title).all()}
    inserted = 0
    for item in DEFAULT_ANNUAL_PLAN_SEED:
        if item["title"] in existing_titles:
            continue
        db.add(AnnualPlan(**item, start_month=1, end_month=12, active=True))
        inserted += 1
    if inserted > 0:
        db.commit()
    return inserted
