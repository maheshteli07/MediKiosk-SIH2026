"""
app/modules/patient/schemas.py – Pydantic Models for Patient Module
===================================================================
Pydantic v2 schemas for request validation and response serialization.
"""

from __future__ import annotations

import re
from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.modules.patient.constants import (
    CURRENT_CONSENT_VERSION,
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    ConsentType,
    ConsultationMode,
    Gender,
    SessionStatus,
    SessionStep,
)
from app.utils.validators import is_valid_abha, is_valid_phone, normalize_phone


# ── Helper for Phone Normalization ────────────────────────────────────────────
def _clean_and_format_indian_phone(v: str) -> str:
    """Validate and normalize to E.164-style '+91XXXXXXXXXX'."""
    if not v:
        raise ValueError("Phone number cannot be empty")
    digits = normalize_phone(v)
    if not (len(digits) == 10 and digits[0] in "6789"):
        raise ValueError(f"Invalid Indian 10-digit mobile number: '{v}'")
    return f"+91{digits}"


def _clean_abha_id(v: Optional[str]) -> Optional[str]:
    """Validate and normalize ABHA ID (14 digits, optionally hyphenated)."""
    if v is None or v == "":
        return None
    raw = v.strip().replace("-", "").replace(" ", "")
    if not (len(raw) == 14 and raw.isdigit()):
        raise ValueError("ABHA ID must be a 14-digit numeric identifier")
    # Format as 12-3456-7890-1234 standard display
    return f"{raw[:2]}-{raw[2:6]}-{raw[6:10]}-{raw[10:]}"


# ── Patient Schemas ───────────────────────────────────────────────────────────
class PatientCreateSchema(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    full_name: str = Field(..., min_length=2, max_length=100, description="Full legal name of patient")
    phone: str = Field(..., description="10-digit Indian mobile number")
    age: int = Field(..., ge=0, le=120, description="Age in completed years")
    gender: Gender = Field(..., description="Gender identity")
    date_of_birth: Optional[str] = Field(None, description="Date of birth in YYYY-MM-DD format")
    abha_id: Optional[str] = Field(None, description="14-digit Ayushman Bharat Health Account ID")
    address: Optional[str] = Field(None, max_length=255, description="Residential address")
    city: Optional[str] = Field(None, max_length=100, description="City / District")
    preferred_language: str = Field(default=DEFAULT_LANGUAGE, description="Preferred language code")
    emergency_contact: Optional[Dict[str, Any]] = Field(
        None,
        description="Emergency contact details (e.g. name, phone, relation)",
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return _clean_and_format_indian_phone(v)

    @field_validator("abha_id")
    @classmethod
    def validate_abha(cls, v: Optional[str]) -> Optional[str]:
        return _clean_abha_id(v)

    @field_validator("preferred_language")
    @classmethod
    def validate_lang(cls, v: str) -> str:
        code = v.lower().strip()
        if code not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported language '{v}'. Supported: {', '.join(SUPPORTED_LANGUAGES.keys())}"
            )
        return code


class PatientUpdateSchema(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[Gender] = None
    date_of_birth: Optional[str] = None
    abha_id: Optional[str] = None
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    preferred_language: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None

    @field_validator("abha_id")
    @classmethod
    def validate_abha(cls, v: Optional[str]) -> Optional[str]:
        return _clean_abha_id(v)

    @field_validator("preferred_language")
    @classmethod
    def validate_lang(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        code = v.lower().strip()
        if code not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported language '{v}'. Supported: {', '.join(SUPPORTED_LANGUAGES.keys())}"
            )
        return code


class PatientIdentifyRequest(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    phone: Optional[str] = Field(None, description="Mobile number")
    abha_id: Optional[str] = Field(None, description="ABHA ID")

    @model_validator(mode="after")
    def check_at_least_one_identifier(self) -> "PatientIdentifyRequest":
        if not self.phone and not self.abha_id:
            raise ValueError("Either phone number or ABHA ID must be provided to identify patient")
        if self.phone:
            self.phone = _clean_and_format_indian_phone(self.phone)
        if self.abha_id:
            self.abha_id = _clean_abha_id(self.abha_id)
        return self


class PatientResponseSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., description="MongoDB Document ID string")
    patient_uid: str = Field(..., description="Human-friendly ID e.g. MK-2026-000123")
    full_name: str
    phone: str
    age: int
    gender: str
    date_of_birth: Optional[str] = None
    abha_id: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    preferred_language: str = DEFAULT_LANGUAGE
    emergency_contact: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


class PatientAuthResponse(BaseModel):
    patient: PatientResponseSchema
    access_token: Optional[str] = None
    token_type: str = "bearer"


# ── Language Schemas ──────────────────────────────────────────────────────────
class LanguageItemSchema(BaseModel):
    code: str
    name: str
    native_name: str
    script: Optional[str] = None


class LanguageListResponse(BaseModel):
    languages: List[LanguageItemSchema]
    default: str = DEFAULT_LANGUAGE


class SetLanguageRequest(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    language: str = Field(..., description="Supported ISO language code")

    @field_validator("language")
    @classmethod
    def validate_code(cls, v: str) -> str:
        code = v.lower().strip()
        if code not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported language code '{v}'. Supported: {', '.join(SUPPORTED_LANGUAGES.keys())}"
            )
        return code


# ── Consent Schemas ───────────────────────────────────────────────────────────
class ConsentItemRequest(BaseModel):
    consent_type: ConsentType = Field(..., description="Category of consent")
    granted: bool = Field(..., description="True if patient agreed, False otherwise")
    consent_version: str = Field(default=CURRENT_CONSENT_VERSION)
    language: str = Field(default=DEFAULT_LANGUAGE)


class RecordConsentRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    consents: List[ConsentItemRequest] = Field(
        ...,
        min_length=1,
        description="List of individual consent decisions",
    )
    consent_version: str = Field(default=CURRENT_CONSENT_VERSION)
    language: str = Field(default=DEFAULT_LANGUAGE)

    @field_validator("language")
    @classmethod
    def validate_lang(cls, v: str) -> str:
        code = v.lower().strip()
        if code not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language '{v}'")
        return code


class ConsentResponseItem(BaseModel):
    id: str
    patient_id: Optional[str] = None
    session_id: str
    consent_type: str
    granted: bool
    consent_version: str
    language: str
    granted_at: datetime
    revoked_at: Optional[datetime] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class SessionConsentStatusResponse(BaseModel):
    session_id: str
    consent_given: bool
    consents: List[ConsentResponseItem]
    latest_consent_version: Optional[str] = None
    language: Optional[str] = None


class RevokeConsentRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    consent_types: Optional[List[ConsentType]] = Field(
        None,
        description="Specific consent types to revoke; if omitted, all consents for this session are revoked",
    )
    reason: Optional[str] = Field(None, max_length=200, description="Optional reason for revocation")


# ── Consultation Mode Schemas ─────────────────────────────────────────────────
class ConsultationModeItemSchema(BaseModel):
    mode: str
    name: str
    description: str
    features: List[str]


class ConsultationModeListResponse(BaseModel):
    modes: List[ConsultationModeItemSchema]


class SetConsultationModeRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    mode: ConsultationMode = Field(..., description="Consultation mode: 'general' or 'ayush'")


# ── Session Schemas ───────────────────────────────────────────────────────────
class StartSessionRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    patient_id: Optional[str] = Field(None, description="Optional MongoDB patient ID if known")
    kiosk_id: Optional[str] = Field(None, description="Kiosk terminal identifier")
    language: str = Field(default=DEFAULT_LANGUAGE, description="Session UI language")

    @field_validator("language")
    @classmethod
    def validate_lang(cls, v: str) -> str:
        code = v.lower().strip()
        if code not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language '{v}'")
        return code


class AdvanceStepRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    target_step: SessionStep = Field(..., description="Desired next or previous step")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional step-specific payload")


class HeartbeatResponse(BaseModel):
    session_id: str
    status: str
    last_activity_at: datetime
    expires_at: datetime


class EndSessionRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: SessionStatus = Field(
        default=SessionStatus.COMPLETED,
        description="Target status ('completed' or 'abandoned')",
    )
    reason: Optional[str] = Field(None, max_length=255, description="Reason for ending session")

    @field_validator("status")
    @classmethod
    def validate_end_status(cls, v: SessionStatus) -> SessionStatus:
        if v not in (SessionStatus.COMPLETED, SessionStatus.ABANDONED):
            raise ValueError("End status must be either 'completed' or 'abandoned'")
        return v


class SessionResponseSchema(BaseModel):
    id: str
    patient_id: Optional[str] = None
    status: str
    current_step: str
    completed_steps: List[str]
    language: str
    consultation_mode: Optional[str] = None
    consent_given: bool
    started_at: datetime
    last_activity_at: datetime
    expires_at: datetime
    ended_at: Optional[datetime] = None
    kiosk_id: Optional[str] = None


class SessionContextResponse(BaseModel):
    session_id: str
    patient_id: Optional[str] = None
    language: str
    consultation_mode: Optional[str] = None
    consent_given: bool
    current_step: str
    status: str
