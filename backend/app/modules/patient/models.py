"""
app/modules/patient/models.py – MongoDB Document Shape Helpers
==============================================================
Provides collection name constants, UID generators, document factory functions,
and ObjectId/datetime serialization utilities.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId

from app.modules.patient.constants import (
    CURRENT_CONSENT_VERSION,
    DEFAULT_LANGUAGE,
    DEFAULT_SESSION_TIMEOUT_MINUTES,
    SessionStatus,
    SessionStep,
)

# ── MongoDB Collection Names ──────────────────────────────────────────────────
PATIENTS_COLLECTION = "patients"
CONSENTS_COLLECTION = "consents"
PATIENT_SESSIONS_COLLECTION = "patient_sessions"


# ── UID Generator ─────────────────────────────────────────────────────────────
def generate_patient_uid() -> str:
    """
    Generate a human-friendly patient UID.
    Format: MK-2026-XXXXXX (e.g. MK-2026-894210)
    """
    random_digits = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    return f"MK-2026-{random_digits}"


# ── MongoDB Helpers ───────────────────────────────────────────────────────────
def to_object_id(id_val: Any) -> Optional[ObjectId]:
    """Safely convert a string or ObjectId to ObjectId; returns None on failure."""
    if isinstance(id_val, ObjectId):
        return id_val
    if not isinstance(id_val, str) or not ObjectId.is_valid(id_val):
        return None
    try:
        return ObjectId(id_val)
    except (InvalidId, Exception):
        return None


def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Convert a MongoDB document into a JSON-friendly dict:
    - Replaces `_id` (ObjectId) with string `id`
    - Converts any nested ObjectIds to strings
    """
    if doc is None:
        return None
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out["id"] = str(v)
        elif isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, list):
            out[k] = [str(item) if isinstance(item, ObjectId) else item for item in v]
        elif isinstance(v, dict):
            out[k] = serialize_doc(v)
        else:
            out[k] = v
    return out


# ── Document Factories ────────────────────────────────────────────────────────
def new_patient_doc(data: Dict[str, Any]) -> Dict[str, Any]:
    """Factory creating a new patient record with timezone-aware UTC datetimes."""
    now = datetime.now(timezone.utc)
    return {
        "patient_uid": data.get("patient_uid") or generate_patient_uid(),
        "full_name": data.get("full_name", "").strip(),
        "phone": data.get("phone", "").strip(),
        "age": int(data.get("age", 0)),
        "gender": data.get("gender"),
        "date_of_birth": data.get("date_of_birth"),
        "abha_id": data.get("abha_id"),
        "address": data.get("address"),
        "city": data.get("city"),
        "preferred_language": data.get("preferred_language", DEFAULT_LANGUAGE),
        "emergency_contact": data.get("emergency_contact"),
        "created_at": now,
        "updated_at": now,
    }


def new_consent_doc(
    *,
    session_id: str,
    consent_type: str,
    granted: bool,
    consent_version: str = CURRENT_CONSENT_VERSION,
    language: str = DEFAULT_LANGUAGE,
    patient_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> Dict[str, Any]:
    """Factory creating a single immutable consent record."""
    now = datetime.now(timezone.utc)
    return {
        "patient_id": str(patient_id) if patient_id else None,
        "session_id": str(session_id),
        "consent_type": consent_type,
        "granted": granted,
        "consent_version": consent_version,
        "language": language,
        "granted_at": now,
        "revoked_at": None,
        "ip_address": ip_address,
        "user_agent": user_agent,
    }


def new_session_doc(
    *,
    patient_id: Optional[str] = None,
    kiosk_id: Optional[str] = None,
    language: str = DEFAULT_LANGUAGE,
    timeout_minutes: int = DEFAULT_SESSION_TIMEOUT_MINUTES,
) -> Dict[str, Any]:
    """Factory creating a new patient session record."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=timeout_minutes)
    return {
        "patient_id": str(patient_id) if patient_id else None,
        "status": SessionStatus.ACTIVE.value,
        "current_step": SessionStep.WELCOME.value,
        "completed_steps": [SessionStep.WELCOME.value],
        "language": language,
        "consultation_mode": None,
        "consent_given": False,
        "started_at": now,
        "last_activity_at": now,
        "expires_at": expires_at,
        "ended_at": None,
        "kiosk_id": kiosk_id,
    }
