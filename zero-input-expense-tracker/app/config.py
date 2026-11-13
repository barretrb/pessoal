from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_CATEGORIES: list[str] = [
    "Alimentação",
    "Supermercado",
    "Transporte",
    "Moradia",
    "Saúde",
    "Lazer",
    "Assinaturas",
    "Educação",
    "Compras",
    "Serviços",
    "Salário",
    "Investimentos",
    "Transferência",
    "Outros",
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    API_SECRET_KEY: str = "dev-secret-key-change-me"
    DASHBOARD_PASSWORD: str = "admin123"

    DATABASE_URL: str = "sqlite:///./finance.db"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    TELEGRAM_WEBHOOK_SECRET: str = ""

    CONFIDENCE_THRESHOLD: float = 0.85
    DEDUP_WINDOW_MINUTES: int = 3
    MONTHLY_BUDGET_LIMIT: float = 0.0
    TIMEZONE: str = "America/Sao_Paulo"


@lru_cache
def get_settings() -> Settings:
    return Settings()
