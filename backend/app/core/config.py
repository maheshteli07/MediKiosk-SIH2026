"""Centralised, type-safe environment configuration for MediKiosk.

Import the single ``settings`` instance from this module; modules must not
create their own ``Settings`` objects.
"""

from __future__ import annotations

from typing import Annotated, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings read from the backend ``.env`` file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_name: str = "MediKiosk"
    app_version: str = "1.0.0"
    environment: Literal["development", "testing", "production"] = "development"
    debug: bool = True

    # Database
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "medikiosk"

    # Security. JWT implementation belongs to a later backend part.
    jwt_secret: str = Field(min_length=1)
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = Field(default=60, gt=0)

    # CORS values use comma-separated .env values rather than JSON arrays.
    cors_allowed_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173"]
    )

    # AI mode controls whether future integrations use canned responses.
    mock_ai_mode: bool = True

    # Upload limits used by a future document-upload module.
    max_upload_size_mb: int = Field(default=10, gt=0)
    allowed_upload_extensions: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["pdf", "jpg", "jpeg", "png"]
    )

    @field_validator("cors_allowed_origins", "allowed_upload_extensions", mode="before")
    @classmethod
    def split_comma_separated_values(cls, value: str | list[str]) -> list[str]:
        """Normalise comma-separated environment values and discard blanks."""
        if isinstance(value, str):
            values = value.split(",")
        else:
            values = value

        cleaned = [item.strip() for item in values if item.strip()]
        if not cleaned:
            raise ValueError("must contain at least one non-empty value")
        return cleaned

    # Compatibility aliases let the current application use the new settings
    # foundation without changing unrelated modules in this configuration task.
    @property
    def APP_NAME(self) -> str:
        return self.app_name

    @property
    def APP_VERSION(self) -> str:
        return self.app_version

    @property
    def APP_ENV(self) -> str:
        return self.environment

    @property
    def DEBUG(self) -> bool:
        return self.debug

    @property
    def MONGO_URI(self) -> str:
        return self.mongodb_uri

    @property
    def MONGO_DB_NAME(self) -> str:
        return self.mongodb_db_name

    @property
    def JWT_SECRET(self) -> str:
        return self.jwt_secret

    @property
    def JWT_ALGORITHM(self) -> str:
        return self.jwt_algorithm

    @property
    def JWT_EXPIRY_MINUTES(self) -> int:
        return self.jwt_expiration_minutes

    @property
    def MOCK_AI_MODE(self) -> bool:
        return self.mock_ai_mode

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return self.cors_allowed_origins


# Singleton: future modules should use ``from app.core.config import settings``.
settings = Settings()
