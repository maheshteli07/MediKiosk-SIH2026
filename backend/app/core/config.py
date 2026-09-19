"""Centralised, type-safe environment configuration for MediKiosk.

Import the single ``settings`` instance from this module; modules must not
create their own ``Settings`` objects.
"""

from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import AliasChoices, Field, field_validator
try:
    from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict
except ImportError:
    from pydantic_settings import BaseSettings, SettingsConfigDict  # type: ignore
    NoDecode = object  # type: ignore


class Settings(BaseSettings):
    """Application settings read from the backend ``.env`` file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        """Prefer this project's .env over unrelated machine environment values."""
        return init_settings, dotenv_settings, env_settings, file_secret_settings

    # Application
    app_name: str = "MediKiosk"
    app_version: str = "1.0.0"
    environment: Literal["development", "testing", "production"] = "development"
    debug: bool = True

    # Database
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "medikiosk"

    # Security. JWT implementation belongs to a later backend part.
    jwt_secret: str = Field(default="change-this-in-local-development", min_length=1)
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = Field(default=60, gt=0)

    # CORS values use comma-separated .env values rather than JSON arrays.
    cors_allowed_origins: Union[list[str], str] = Field(
        default_factory=lambda: ["http://localhost:5173"]
    )

    # AI / LLM
    mock_ai_mode: bool = False
    llm_provider: str = "nvidia"
    llm_api_key: str = ""
    llm_model: str = "nvidia/nemotron-3-super-120b-a12b"
    llm_base_url: str = "https://integrate.api.nvidia.com/v1"

    # Gemini (used when llm_provider="gemini")
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Ollama (used when llm_provider="ollama")
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:1b"

    # NVIDIA NIM (used when llm_provider="nvidia")
    nvidia_llm_model: str = "nvidia/nemotron-3-super-120b-a12b"

    nvidia_llm_base_url: str = "https://integrate.api.nvidia.com/v1"

    # Speech
    speech_provider: str = "nvidia"
    bhashini_api_key: str = ""
    bhashini_base_url: str = "https://dhruva-api.bhashini.gov.in"

    # NVIDIA Riva / NIM ASR (used when speech_provider="nvidia")
    nvidia_api_key: str = ""
    nvidia_speech_api_key: str = ""
    nvidia_riva_server: str = "grpc.nvcf.nvidia.com:443"
    nvidia_function_id: str = "b702f636-f60c-4a3d-a6f4-f3568c13bd7d"

    # OCR
    ocr_provider: str = "nemotron"
    nvidia_ocr_api_key: str = ""
    nvidia_ocr_url: str = "https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v2"


    # FHIR / ABDM / HIS
    fhir_base_url: str = ""
    abdm_base_url: str = ""
    abdm_client_id: str = ""
    abdm_client_secret: str = ""
    his_base_url: str = ""
    his_api_key: str = ""

    # Upload limits used by a future document-upload module.
    max_upload_size_mb: int = Field(default=10, gt=0)
    allowed_upload_extensions: Union[list[str], str] = Field(
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
    def LLM_PROVIDER(self) -> str:
        return self.llm_provider

    @property
    def LLM_API_KEY(self) -> str:
        return self.llm_api_key

    @property
    def LLM_MODEL(self) -> str:
        return self.llm_model

    @property
    def LLM_BASE_URL(self) -> str:
        return self.llm_base_url

    @property
    def GEMINI_API_KEY(self) -> str:
        return self.gemini_api_key

    @property
    def GEMINI_MODEL(self) -> str:
        return self.gemini_model

    @property
    def SPEECH_PROVIDER(self) -> str:
        return self.speech_provider

    @property
    def BHASHINI_API_KEY(self) -> str:
        return self.bhashini_api_key

    @property
    def BHASHINI_BASE_URL(self) -> str:
        return self.bhashini_base_url

    @property
    def NVIDIA_API_KEY(self) -> str:
        return self.nvidia_api_key

    @property
    def NVIDIA_LLM_MODEL(self) -> str:
        return self.nvidia_llm_model

    @property
    def NVIDIA_LLM_BASE_URL(self) -> str:
        return self.nvidia_llm_base_url

    @property
    def NVIDIA_RIVA_SERVER(self) -> str:
        return self.nvidia_riva_server

    @property
    def NVIDIA_FUNCTION_ID(self) -> str:
        return self.nvidia_function_id

    @property
    def OLLAMA_BASE_URL(self) -> str:
        return self.ollama_base_url

    @property
    def OLLAMA_MODEL(self) -> str:
        return self.ollama_model

    @property
    def OCR_PROVIDER(self) -> str:
        return self.ocr_provider

    @property
    def NVIDIA_SPEECH_API_KEY(self) -> str:
        return self.nvidia_speech_api_key or self.nvidia_api_key

    @property
    def NVIDIA_OCR_API_KEY(self) -> str:
        return self.nvidia_ocr_api_key or self.nvidia_api_key

    @property
    def NVIDIA_OCR_URL(self) -> str:
        return self.nvidia_ocr_url


    @property
    def FHIR_BASE_URL(self) -> str:
        return self.fhir_base_url

    @property
    def ABDM_BASE_URL(self) -> str:
        return self.abdm_base_url

    @property
    def ABDM_CLIENT_ID(self) -> str:
        return self.abdm_client_id

    @property
    def ABDM_CLIENT_SECRET(self) -> str:
        return self.abdm_client_secret

    @property
    def HIS_BASE_URL(self) -> str:
        return self.his_base_url

    @property
    def HIS_API_KEY(self) -> str:
        return self.his_api_key

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return self.cors_allowed_origins


# Singleton: future modules should use ``from app.core.config import settings``.
settings = Settings()
