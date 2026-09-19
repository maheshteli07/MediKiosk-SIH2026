"""
app/modules/patient/router.py – Patient & Consultation API Endpoints
====================================================================
FastAPI router declaring all API routes for patient registration, identification,
language preference, consent management, consultation mode selection, and
session lifecycle & step progression.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Query, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import (
    PaginationParams,
    get_current_role,
    get_db,
    pagination_params,
)
from app.modules.patient.schemas import (
    AdvanceStepRequest,
    EndSessionRequest,
    PatientCreateSchema,
    PatientIdentifyRequest,
    PatientUpdateSchema,
    RecordConsentRequest,
    RevokeConsentRequest,
    SetConsultationModeRequest,
    SetLanguageRequest,
    StartSessionRequest,
)
from app.modules.patient.service import PatientService
from app.utils.response import (
    created_response,
    paginated_response,
    success_response,
)

router = APIRouter()


# ── Patient Management Endpoints ──────────────────────────────────────────────

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new patient",
    description="Register a new patient or return existing record if phone/ABHA matches.",
)
async def register_patient(
    data: PatientCreateSchema,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    patient, token = await PatientService.register_patient(db, data)
    return created_response(
        data={"patient": patient, "access_token": token, "token_type": "bearer"},
        message="Patient registered successfully",
    )


@router.post(
    "/identify",
    summary="Identify existing patient",
    description="Find patient by phone number or ABHA ID.",
)
async def identify_patient(
    data: PatientIdentifyRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    patient = await PatientService.identify_patient(db, data)
    return success_response(data=patient, message="Patient identified")


@router.get(
    "/languages/supported",
    summary="List supported languages",
    description="Fetch list of 11 Indian languages + English supported by MediKiosk.",
)
async def get_supported_languages() -> Any:
    languages = PatientService.list_supported_languages()
    return success_response(
        data={"languages": [l.model_dump() for l in languages], "default": "en"},
        message="Supported languages retrieved",
    )


@router.get(
    "/consultation-modes",
    summary="List consultation modes",
    description="Fetch available intake modes (General Clinical History, AYUSH / Ayurveda).",
)
async def list_consultation_modes() -> Any:
    modes = PatientService.list_consultation_modes()
    return success_response(
        data={"modes": [m.model_dump() for m in modes]},
        message="Consultation modes retrieved",
    )


# ── Session Management & Lifecycle ────────────────────────────────────────────

@router.post(
    "/sessions/start",
    status_code=status.HTTP_201_CREATED,
    summary="Start new patient session",
    description="Initialize a new patient intake session starting at step 'welcome'.",
)
async def start_session(
    data: StartSessionRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    session = await PatientService.start_session(db, data)
    return created_response(data=session, message="Session started successfully")


@router.get(
    "/sessions/{session_id}",
    summary="Get patient session by ID",
    description="Fetch active session state and trigger automatic inactivity expiration check.",
)
async def get_session(
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    session = await PatientService.get_session_by_id(db, session_id)
    return success_response(data=session, message="Session state retrieved")


@router.post(
    "/sessions/{session_id}/language",
    summary="Set session language",
    description="Update UI language for active session and sync to patient record.",
)
async def set_session_language(
    session_id: str,
    data: SetLanguageRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    session = await PatientService.set_session_language(db, session_id, data)
    return success_response(data=session, message=f"Language set to '{data.language}'")


@router.post(
    "/sessions/{session_id}/consent",
    summary="Record patient consent",
    description="Record immutable consent items (data collection, AI processing, ABDM sharing).",
)
async def record_consent(
    session_id: str,
    data: RecordConsentRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    result = await PatientService.record_session_consent(
        db, session_id, data, client_ip=client_ip, user_agent=user_agent
    )
    return success_response(data=result, message="Consent decision recorded")


@router.get(
    "/sessions/{session_id}/consent",
    summary="Get session consent status",
    description="Fetch consent status and historical consent log for a session.",
)
async def get_consent_status(
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    result = await PatientService.get_session_consent_status(db, session_id)
    return success_response(data=result, message="Consent status retrieved")


@router.post(
    "/sessions/{session_id}/consent/revoke",
    summary="Revoke session consent",
    description="Revoke consent for session; prevents workflow advancement until renewed.",
)
async def revoke_consent(
    session_id: str,
    data: RevokeConsentRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    result = await PatientService.revoke_session_consent(db, session_id, data)
    return success_response(data=result, message="Consent revoked successfully")


@router.post(
    "/sessions/{session_id}/mode",
    summary="Set consultation mode",
    description="Select intake mode ('general' or 'ayush'). Requires granted patient consent.",
)
async def set_consultation_mode(
    session_id: str,
    data: SetConsultationModeRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    session = await PatientService.set_consultation_mode(db, session_id, data)
    return success_response(
        data=session, message=f"Consultation mode set to '{data.mode.value}'"
    )


@router.post(
    "/sessions/{session_id}/advance",
    summary="Advance session workflow step",
    description="Advance to next step or navigate backward. Enforces consent and mode gating.",
)
async def advance_step(
    session_id: str,
    data: AdvanceStepRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    session = await PatientService.advance_session_step(db, session_id, data)
    return success_response(
        data=session, message=f"Transitioned to step '{data.target_step.value}'"
    )


@router.post(
    "/sessions/{session_id}/heartbeat",
    summary="Session keepalive heartbeat",
    description="Refresh last activity timestamp and extend 30-minute expiration window.",
)
async def session_heartbeat(
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    res = await PatientService.session_heartbeat(db, session_id)
    return success_response(data=res, message="Heartbeat acknowledged")


@router.post(
    "/sessions/{session_id}/end",
    summary="End session",
    description="Mark patient session as completed or abandoned.",
)
async def end_session(
    session_id: str,
    data: EndSessionRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    session = await PatientService.end_session(db, session_id, data)
    return success_response(data=session, message=f"Session ended ({data.status.value})")


@router.get(
    "/sessions/{session_id}/context",
    summary="Get session context for downstream modules",
    description="Public context reader endpoint consumed by conversation, docs, ayush, etc.",
)
async def get_session_context(
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    context = await PatientService.get_session_context(db, session_id)
    return success_response(data=context, message="Session context retrieved")


# ── Patient Record Access Endpoints ───────────────────────────────────────────

@router.get(
    "/",
    summary="List patients",
    description="Retrieve paginated list of registered patients.",
)
async def list_patients(
    pagination: PaginationParams = Depends(pagination_params),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    patients, total = await PatientService.PatientRepository.list_patients(
        db, skip=pagination.skip, limit=pagination.page_size
    )
    return paginated_response(
        patients,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        message="Patients listed successfully",
    )


@router.get(
    "/{patient_id}",
    summary="Get patient details by ID",
    description="Fetch patient profile by ObjectId or patient_uid with role-based checks.",
)
async def get_patient(
    patient_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_role),
) -> Any:
    patient = await PatientService.get_patient_by_id(db, patient_id, current_user)
    return success_response(data=patient, message="Patient details retrieved")


@router.put(
    "/{patient_id}",
    summary="Update patient details",
    description="Update patient demographic or contact details.",
)
async def update_patient(
    patient_id: str,
    data: PatientUpdateSchema,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_role),
) -> Any:
    patient = await PatientService.update_patient_details(
        db, patient_id, data, current_user
    )
    return success_response(data=patient, message="Patient details updated successfully")


@router.get(
    "/{patient_id}/sessions",
    summary="List patient session history",
    description="List all past and active intake sessions for a patient.",
)
async def list_patient_sessions(
    patient_id: str,
    pagination: PaginationParams = Depends(pagination_params),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_role),
) -> Any:
    sessions, total = await PatientService.list_patient_sessions(
        db, patient_id, current_user, skip=pagination.skip, limit=pagination.page_size
    )
    return paginated_response(
        sessions,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        message="Patient session history retrieved",
    )
