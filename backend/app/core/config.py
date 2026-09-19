"""
core/config.py – Application Configuration
===========================================
Centralised Pydantic-Settings class.  Import `settings` everywhere.

Key flags
---------
MOCK_AI_MODE (bool, default True)
    When True all AI / OCR / Speech integrations return canned responses so
    the demo works without any paid API keys.  Set to False in production.

CORS note
---------
CORS_ORIGINS_STR is stored as a raw comma-separated string in .env
(pydantic-settings v2 can't auto-parse List[str] from plain .env without
JSON brackets).  Use `settings.cors_origins_list` (a @property) everywhere
you need the parsed list.  main.py reads that property.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────
    APP_NAME: str = "MediKiosk"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ── Server ─────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── MongoDB ────────────────────────────────────────────────
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "medikiosk"

    # ── JWT ────────────────────────────────────────────────────
    JWT_SECRET: str = "change-this-in-production-use-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60

    # ── AI / LLM ───────────────────────────────────────────────
    MOCK_AI_MODE: bool = True          # ← Master toggle for demo reliability
    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o"
    LLM_BASE_URL: str = "https://api.openai.com/v1"

    # ── Speech ─────────────────────────────────────────────────
    SPEECH_PROVIDER: str = "mock"
    BHASHINI_API_KEY: str = ""
    BHASHINI_BASE_URL: str = "https://dhruva-api.bhashini.gov.in"

    # ── OCR ────────────────────────────────────────────────────
    OCR_PROVIDER: str = "mock"

    # ── FHIR / ABDM / HIS ─────────────────────────────────────
    FHIR_BASE_URL: str = ""
    ABDM_BASE_URL: str = ""
    ABDM_CLIENT_ID: str = ""
    ABDM_CLIENT_SECRET: str = ""
    HIS_BASE_URL: str = ""
    HIS_API_KEY: str = ""

    # ── CORS ───────────────────────────────────────────────────
    # Stored as a plain comma-separated string so .env stays simple.
    # Access the parsed list via settings.CORS_ORIGINS (property below).
    CORS_ORIGINS_STR: str = (
        "http://localhost:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:5173,"
        "http://127.0.0.1:3000"
    )

    @property
    def CORS_ORIGINS(self) -> list[str]:
        """Return CORS_ORIGINS_STR parsed into a list of origin strings."""
        return [o.strip() for o in self.CORS_ORIGINS_STR.split(",") if o.strip()]


# Singleton – import this everywhere
settings = Settings()
