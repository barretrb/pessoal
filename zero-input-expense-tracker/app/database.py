from collections.abc import Generator
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""


def build_engine(database_url: str | None = None):
    url = database_url or get_settings().DATABASE_URL
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(
        url,
        connect_args=connect_args,
        pool_pre_ping=not url.startswith("sqlite"),
        future=True,
    )


engine = build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)


def ensure_schema_migrations(target_engine=None) -> None:
    """Safely add new columns to existing annual_plan tables if upgrading in-place."""
    eng = target_engine or engine
    inspector = inspect(eng)
    if "annual_plan" not in inspector.get_table_names():
        return
    existing_cols = {col["name"] for col in inspector.get_columns("annual_plan")}
    with eng.begin() as conn:
        if "plan_type" not in existing_cols:
            conn.execute(
                text("ALTER TABLE annual_plan ADD COLUMN plan_type VARCHAR(24) NOT NULL DEFAULT 'FIXED'")
            )
        if "payment_method" not in existing_cols:
            conn.execute(
                text("ALTER TABLE annual_plan ADD COLUMN payment_method VARCHAR(24) NOT NULL DEFAULT 'PIX'")
            )


def init_db() -> None:
    """Create all tables if they do not exist and apply lightweight migrations."""
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    ensure_schema_migrations(engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
