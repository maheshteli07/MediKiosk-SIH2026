"""
app/modules/patient/service.py – Patient Module Business Logic
==============================================================
Encapsulates all domain rules, access validation, session progression checks,
and PII-masked logging for the patient module.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.core.security import create_access_token
from app.modules.patient.constants import (
    CONSULTATION_MODE_DETAILS,
    CURRENT_CONSENT_VERSION,
    DEFAULT_LANGUAGE,
    DEFAULT_SESSION_TIMEOUT_MINUTES,
    STEP_INDEX_MAP,
    SUPPORTED_LANGUAGES,
    ConsentType,
    ConsultationMode,
    SessionStatus,
    SessionStep,
)
from app.modules.patient.models import (
    new_consent_doc,
    new_patient_doc,
    new_session_doc,
)
from app.modules.patient.repository import PatientRepository
from app.modules.patient.schemas import (
    AdvanceStepRequest,
    ConsultationModeItemSchema,
    EndSessionRequest,
    LanguageItemSchema,
    PatientCreateSchema,
    PatientIdentifyRequest,
    PatientUpdateSchema,
    RecordConsentRequest,
    RevokeConsentRequest,
    SetConsultationModeRequest,
    SetLanguageRequest,
    StartSessionRequest,
)

logger = logging.getLogger(__name__)


# ── PII Masking Helpers for Safe Logging ──────────────────────────────────────
def mask_phone(phone: Optional[str]) -> str:
    """Mask phone number: e.g. +919876543210 -> +91******3210."""
    if not phone:
        return "[EMPTY_PHONE]"
    digits = phone.replace("+", "")
    if len(digits) >= 10:
        return f"+{digits[:2]}******{digits[-4:]}"
    return "******" + digits[-2:] if len(digits) > 2 else "******"


def mask_name(name: Optional[str]) -> str:
    """Mask full name: e.g. 'John Doe' -> 'J*** D**'."""
    if not name:
        return "[EMPTY_NAME]"
    parts = name.strip().split()
    masked = [p[0] + "*" * (len(p) - 1) if len(p) > 1 else p + "*" for p in parts]
    return " ".join(masked)


# ── Session Timeout Helper ───────────────────────────────────────────────────
def get_session_timeout_minutes() -> int:
    """Get session timeout in minutes from settings or default to 30."""
    return getattr(settings, "SESSION_TIMEOUT_MINUTES", DEFAULT_SESSION_TIMEOUT_MINUTES)


class PatientService:
    """Service layer coordinating business logic for the patient module."""

    # ── Patient Registration & Identification ─────────────────────────────────

    @staticmethod
    async def register_patient(
        db: AsyncIOMotorDatabase, data: PatientCreateSchema
    ) -> Tuple[Dict[str, Any], Optional[str]]:
        """
        Register a new patient or return an existing matching record (idempotent).
        Returns (patient_record, access_token).
        """
        logger.info(
            "Registering patient – name: %s, phone: %s",
            mask_name(data.full_name),
            mask_phone(data.phone),
        )

        # 1. Check existing by phone
        existing = await PatientRepository.find_patient_by_phone(db, data.phone)
        if not existing and data.abha_id:
            existing = await PatientRepository.find_patient_by_abha(db, data.abha_id)

        if existing:
            logger.info("Found existing patient uid=%s; returning existing record", existing.get("patient_uid"))
            token = create_access_token(sub=existing["id"], role="patient")
            return existing, token

        # 2. Create new patient document
        patient_dict = new_patient_doc(data.model_dump())
        created = await PatientRepository.create_patient(db, patient_dict)
        logger.info("New patient registered successfully: uid=%s", created.get("patient_uid"))

        # 3. Issue JWT access token for patient role
        token = create_access_token(sub=created["id"], role="patient")
        return created, token

    @staticmethod
    async def identify_patient(
        db: AsyncIOMotorDatabase, data: PatientIdentifyRequest
    ) -> Dict[str, Any]:
        """Look up patient by phone or ABHA ID."""
        logger.info("Identifying patient by phone=%s, abha=%s", mask_phone(data.phone), bool(data.abha_id))
        patient = None
        if data.phone:
            patient = await PatientRepository.find_patient_by_phone(db, data.phone)
        if not patient and data.abha_id:
            patient = await PatientRepository.find_patient_by_abha(db, data.abha_id)

        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found with the provided identifier(s).",
            )
        return patient

    @staticmethod
    async def get_patient_by_id(
        db: AsyncIOMotorDatabase,
        patient_id: str,
        current_user: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Fetch patient by ID with RBAC check (patient can only view own record)."""
        patient = await PatientRepository.find_patient_by_id(db, patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient with ID '{patient_id}' not found.",
            )

        # RBAC Check: If patient role, ensure token sub matches
        if current_user:
            role = current_user.get("role")
            sub = current_user.get("sub")
            if role == "patient" and sub not in (patient["id"], patient.get("patient_uid")):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not authorized to view another patient's medical records.",
                )

        return patient

    @staticmethod
    async def update_patient_details(
        db: AsyncIOMotorDatabase,
        patient_id: str,
        data: PatientUpdateSchema,
        current_user: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Update patient details (partial update) with RBAC validation."""
        patient = await PatientService.get_patient_by_id(db, patient_id, current_user)

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return patient

        # If phone is being updated, verify uniqueness
        if "phone" in update_data:
            existing_phone = await PatientRepository.find_patient_by_phone(db, update_data["phone"])
            if existing_phone and existing_phone["id"] != patient["id"]:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Phone number is already associated with another patient.",
                )

        updated = await PatientRepository.update_patient(db, patient["id"], update_data)
        logger.info("Updated patient details for uid=%s", patient.get("patient_uid"))
        return updated

    # ── Language Management ───────────────────────────────────────────────────

    @staticmethod
    def list_supported_languages() -> List[LanguageItemSchema]:
        """Return list of all configured Indian and international languages."""
        return [
            LanguageItemSchema(
                code=v["code"],
                name=v["name"],
                native_name=v["native_name"],
                script=v.get("script"),
            )
            for v in SUPPORTED_LANGUAGES.values()
        ]

    @staticmethod
    async def set_session_language(
        db: AsyncIOMotorDatabase, session_id: str, data: SetLanguageRequest
    ) -> Dict[str, Any]:
        """
        Update language for active session and sync to patient's preferred language.
        """
        session = await PatientService.get_active_session(db, session_id)

        update_fields: Dict[str, Any] = {"language": data.language}
        updated_session = await PatientRepository.update_session(db, session_id, update_fields)

        # Sync to patient record if patient is attached
        if session.get("patient_id"):
            await PatientRepository.update_patient(
                db, session["patient_id"], {"preferred_language": data.language}
            )

        logger.info("Session %s language updated to '%s'", session_id, data.language)
        return updated_session

    # ── Consent Management ────────────────────────────────────────────────────

    @staticmethod
    async def record_session_consent(
        db: AsyncIOMotorDatabase,
        session_id: str,
        data: RecordConsentRequest,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Record consent entries for a patient session (append-only history).
        Enables session consent_given flag if required consents are granted.
        """
        session = await PatientService.get_active_session(db, session_id)

        patient_id = session.get("patient_id")
        consent_docs = []
        has_primary_consent = False

        for item in data.consents:
            doc = new_consent_doc(
                session_id=session_id,
                consent_type=item.consent_type.value,
                granted=item.granted,
                consent_version=data.consent_version or CURRENT_CONSENT_VERSION,
                language=data.language or session.get("language", DEFAULT_LANGUAGE),
                patient_id=patient_id,
                ip_address=client_ip,
                user_agent=user_agent,
            )
            consent_docs.append(doc)
            # Primary consent for data collection or AI processing
            if item.consent_type in (ConsentType.DATA_COLLECTION, ConsentType.AI_PROCESSING) and item.granted:
                has_primary_consent = True

        inserted = await PatientRepository.insert_consents(db, consent_docs)

        # Update session consent_given status
        all_consents = await PatientRepository.get_consents_by_session(db, session_id)
        active_valid_consents = [c for c in all_consents if c.get("granted") and not c.get("revoked_at")]
        consent_given = len(active_valid_consents) > 0 and has_primary_consent

        await PatientRepository.update_session(
            db,
            session_id,
            {
                "consent_given": consent_given,
                "last_activity_at": datetime.now(timezone.utc),
            },
        )

        logger.info(
            "Recorded %d consent item(s) for session %s (consent_given=%s)",
            len(inserted),
            session_id,
            consent_given,
        )

        return {
            "session_id": session_id,
            "consent_given": consent_given,
            "consents": all_consents,
            "latest_consent_version": data.consent_version,
            "language": data.language,
        }

    @staticmethod
    async def get_session_consent_status(
        db: AsyncIOMotorDatabase, session_id: str
    ) -> Dict[str, Any]:
        """Fetch consent status and history for a given session."""
        session = await PatientService.get_session_by_id(db, session_id)
        consents = await PatientRepository.get_consents_by_session(db, session_id)

        active_consents = [c for c in consents if c.get("granted") and not c.get("revoked_at")]
        latest_version = consents[0].get("consent_version") if consents else CURRENT_CONSENT_VERSION
        language = consents[0].get("language") if consents else session.get("language", DEFAULT_LANGUAGE)

        return {
            "session_id": session_id,
            "consent_given": session.get("consent_given", False) and len(active_consents) > 0,
            "consents": consents,
            "latest_consent_version": latest_version,
            "language": language,
        }

    @staticmethod
    async def revoke_session_consent(
        db: AsyncIOMotorDatabase, session_id: str, data: RevokeConsentRequest
    ) -> Dict[str, Any]:
        """
        Revoke consent for a session. Gating logic prevents session from advancing
        further until new consent is recorded.
        """
        session = await PatientService.get_active_session(db, session_id)

        types = [t.value for t in data.consent_types] if data.consent_types else None
        now = datetime.now(timezone.utc)
        revoked_count = await PatientRepository.revoke_session_consents(db, session_id, types, now)

        # Set session consent_given to False
        await PatientRepository.update_session(
            db,
            session_id,
            {
                "consent_given": False,
                "last_activity_at": now,
            },
        )

        logger.warning(
            "Revoked %d consent item(s) for session %s (reason: %s)",
            revoked_count,
            session_id,
            data.reason or "Patient revoked consent",
        )

        return await PatientService.get_session_consent_status(db, session_id)

    # ── Consultation Mode ─────────────────────────────────────────────────────

    @staticmethod
    def list_consultation_modes() -> List[ConsultationModeItemSchema]:
        """List available consultation modes with descriptions and capabilities."""
        return [
            ConsultationModeItemSchema(
                mode=v["mode"],
                name=v["name"],
                description=v["description"],
                features=v["features"],
            )
            for v in CONSULTATION_MODE_DETAILS.values()
        ]

    @staticmethod
    async def set_consultation_mode(
        db: AsyncIOMotorDatabase, session_id: str, data: SetConsultationModeRequest
    ) -> Dict[str, Any]:
        """
        Set consultation mode (general or ayush).
        CRITICAL RULE: Consent MUST be granted before selecting a consultation mode.
        """
        session = await PatientService.get_active_session(db, session_id)

        # Gating rule: Consent must be granted
        if not session.get("consent_given"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient consent must be granted before selecting a consultation mode.",
            )

        updated = await PatientRepository.update_session(
            db,
            session_id,
            {
                "consultation_mode": data.mode.value,
                "last_activity_at": datetime.now(timezone.utc),
            },
        )

        logger.info("Session %s consultation mode set to '%s'", session_id, data.mode.value)
        return updated

    # ── Session Lifecycle & Step Progression ──────────────────────────────────

    @staticmethod
    async def start_session(
        db: AsyncIOMotorDatabase, data: StartSessionRequest
    ) -> Dict[str, Any]:
        """Initialize a new patient session starting at 'welcome'."""
        timeout_minutes = get_session_timeout_minutes()

        # Validate patient if provided
        if data.patient_id:
            patient = await PatientRepository.find_patient_by_id(db, data.patient_id)
            if not patient:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Patient ID '{data.patient_id}' not found.",
                )

        session_doc = new_session_doc(
            patient_id=data.patient_id,
            kiosk_id=data.kiosk_id,
            language=data.language or DEFAULT_LANGUAGE,
            timeout_minutes=timeout_minutes,
        )

        created = await PatientRepository.create_session(db, session_doc)
        logger.info("Started new patient session id=%s (kiosk=%s)", created["id"], data.kiosk_id)
        return created

    @staticmethod
    async def get_session_by_id(
        db: AsyncIOMotorDatabase, session_id: str
    ) -> Dict[str, Any]:
        """Fetch session and handle automatic expiration check."""
        session = await PatientRepository.find_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session '{session_id}' not found.",
            )

        # Check for expiration
        now = datetime.now(timezone.utc)
        expires_at = session.get("expires_at")
        if expires_at:
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if now > expires_at and session.get("status") == SessionStatus.ACTIVE.value:
                # Mark as expired
                await PatientRepository.update_session(
                    db,
                    session_id,
                    {
                        "status": SessionStatus.EXPIRED.value,
                        "ended_at": now,
                    },
                )
                session["status"] = SessionStatus.EXPIRED.value
                session["ended_at"] = now
                logger.info("Session %s has expired due to inactivity", session_id)

        return session

    @staticmethod
    async def get_active_session(
        db: AsyncIOMotorDatabase, session_id: str
    ) -> Dict[str, Any]:
        """Fetch session and assert that it is active and not expired."""
        session = await PatientService.get_session_by_id(db, session_id)
        current_status = session.get("status")

        if current_status == SessionStatus.EXPIRED.value:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Session has expired due to 30 minutes of inactivity. Please start a new session.",
            )

        if current_status != SessionStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session is currently '{current_status}' and cannot accept updates.",
            )

        return session

    @staticmethod
    async def advance_session_step(
        db: AsyncIOMotorDatabase, session_id: str, data: AdvanceStepRequest
    ) -> Dict[str, Any]:
        """
        Advance or navigate between session steps.
        Enforces ordered workflow progression, consent gates, and mode selection gates.
        """
        session = await PatientService.get_active_session(db, session_id)

        current_step = SessionStep(session.get("current_step", SessionStep.WELCOME.value))
        target_step = data.target_step

        current_idx = STEP_INDEX_MAP[current_step]
        target_idx = STEP_INDEX_MAP[target_step]
        completed_steps = session.get("completed_steps", [])

        # ── Transition Rule 1: Backwards navigation is always allowed ─────────
        is_backward = target_idx < current_idx

        # ── Transition Rule 2: Forward progression must be step-by-step or previously completed
        if not is_backward and target_idx > current_idx + 1:
            # Check if target was previously completed
            if target_step.value not in completed_steps:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Cannot jump directly from '{current_step.value}' to '{target_step.value}'. "
                        "Workflow steps must be traversed sequentially."
                    ),
                )

        # ── Transition Rule 3: Gating beyond consent ──────────────────────────
        consent_idx = STEP_INDEX_MAP[SessionStep.CONSENT]
        if target_idx > consent_idx and not session.get("consent_given"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Cannot advance to '{target_step.value}'. "
                    "Patient consent must be explicitly granted before continuing intake."
                ),
            )

        # ── Transition Rule 4: Gating beyond consultation mode ─────────────────
        mode_idx = STEP_INDEX_MAP[SessionStep.CONSULTATION_MODE]
        if target_idx > mode_idx and not session.get("consultation_mode"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Cannot advance to '{target_step.value}'. "
                    "A consultation mode ('general' or 'ayush') must be selected first."
                ),
            )

        # Prepare update
        now = datetime.now(timezone.utc)
        timeout_minutes = get_session_timeout_minutes()
        new_expires_at = now + timedelta(minutes=timeout_minutes)

        if target_step.value not in completed_steps:
            completed_steps.append(target_step.value)

        update_fields: Dict[str, Any] = {
            "current_step": target_step.value,
            "completed_steps": completed_steps,
            "last_activity_at": now,
            "expires_at": new_expires_at,
        }

        # If completed step reached, mark completed
        if target_step == SessionStep.COMPLETED:
            update_fields["status"] = SessionStatus.COMPLETED.value
            update_fields["ended_at"] = now

        updated = await PatientRepository.update_session(db, session_id, update_fields)
        logger.info(
            "Session %s transitioned from '%s' to '%s'",
            session_id,
            current_step.value,
            target_step.value,
        )
        return updated

    @staticmethod
    async def session_heartbeat(
        db: AsyncIOMotorDatabase, session_id: str
    ) -> Dict[str, Any]:
        """Refresh last activity and extend session expiry."""
        session = await PatientService.get_active_session(db, session_id)

        now = datetime.now(timezone.utc)
        timeout_minutes = get_session_timeout_minutes()
        new_expires = now + timedelta(minutes=timeout_minutes)

        await PatientRepository.update_session_activity(db, session_id, now, new_expires)

        return {
            "session_id": session_id,
            "status": session.get("status"),
            "last_activity_at": now,
            "expires_at": new_expires,
        }

    @staticmethod
    async def end_session(
        db: AsyncIOMotorDatabase, session_id: str, data: EndSessionRequest
    ) -> Dict[str, Any]:
        """Mark a session as completed or abandoned."""
        session = await PatientService.get_session_by_id(db, session_id)
        if session.get("status") not in (SessionStatus.ACTIVE.value, SessionStatus.EXPIRED.value):
            return session

        now = datetime.now(timezone.utc)
        updated = await PatientRepository.update_session(
            db,
            session_id,
            {
                "status": data.status.value,
                "ended_at": now,
            },
        )
        logger.info("Session %s marked as '%s'", session_id, data.status.value)
        return updated

    @staticmethod
    async def list_patient_sessions(
        db: AsyncIOMotorDatabase,
        patient_id: str,
        current_user: Optional[Dict[str, Any]] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """List past sessions for a patient with RBAC validation."""
        # Verify patient exists
        patient = await PatientService.get_patient_by_id(db, patient_id, current_user)
        return await PatientRepository.list_sessions_by_patient(db, patient["id"], skip, limit)

    # ── Context Helper for Other Modules ──────────────────────────────────────

    @staticmethod
    async def get_session_context(
        db: AsyncIOMotorDatabase, session_id: str
    ) -> Dict[str, Any]:
        """
        Public helper designed for consumption by downstream modules
        (conversation, documents, ayush, clinical, doctor).

        Returns:
            {
                "session_id": str,
                "patient_id": str | None,
                "language": str,
                "consultation_mode": str | None,
                "consent_given": bool,
                "current_step": str,
                "status": str,
            }
        """
        session = await PatientRepository.find_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session '{session_id}' not found.",
            )

        return {
            "session_id": session.get("id"),
            "patient_id": session.get("patient_id"),
            "language": session.get("language", DEFAULT_LANGUAGE),
            "consultation_mode": session.get("consultation_mode"),
            "consent_given": session.get("consent_given", False),
            "current_step": session.get("current_step", SessionStep.WELCOME.value),
            "status": session.get("status", SessionStatus.ACTIVE.value),
        }
