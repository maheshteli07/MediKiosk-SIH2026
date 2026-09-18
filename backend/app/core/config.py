"""
config.py – Application Configuration

Uses pydantic-settings to load and validate environment variables.
All configuration is centralized here. Import `settings` everywhere.

Developer 5 owns this file.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MediKiosk"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # MongoDB
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "medikiosk"

    # JWT
    JWT_SECRET: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60

    # AI / LLM
    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o"
    LLM_BASE_URL: str = "https://api.openai.com/v1"

    # Speech
    SPEECH_PROVIDER: str = "mock"
    BHASHINI_API_KEY: str = ""
    BHASHINI_BASE_URL: str = "https://dhruva-api.bhashini.gov.in"

    # OCR
    OCR_PROVIDER: str = "mock"

    # FHIR / ABDM / HIS
    FHIR_BASE_URL: str = ""
    ABDM_BASE_URL: str = ""
    ABDM_CLIENT_ID: str = ""
    ABDM_CLIENT_SECRET: str = ""
    HIS_BASE_URL: str = ""
    HIS_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
