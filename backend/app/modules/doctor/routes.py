"""
modules/doctor/routes.py – Doctor Module Routes
================================================
Doctor-facing API endpoints for patient queue retrieval, full case review,
summary verification, and clinical sign-offs.
Protected by require_doctor dependency.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import (
    PaginationParams,
    get_db,
    pagination_params,
    require_doctor,
)
from app.modules.doctor.schema import VerifySummarySchema
from app.modules.doctor.service import DoctorService
from app.utils.response import (
    error_envelope,
    paginated_response,
    success_response,
)

router = APIRouter()

_NOT_IMPL = error_envelope("Integration not yet implemented", code="NOT_IMPLEMENTED", status_code=501)


@router.get("/patients", summary="Get patient queue for the doctor")
async def get_patient_queue(
    pagination: PaginationParams = Depends(pagination_params),
    doctor: dict = Depends(require_doctor),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    """Fetch paginated patient queue for active/completed kiosk consultations."""
    queue, total = await DoctorService.get_patient_queue(
        db, skip=pagination.skip, limit=pagination.page_size
    )
    return paginated_response(
        data=queue,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        message="Patient queue retrieved successfully",
    )


@router.get("/patients/{patient_id}", summary="Get full patient case")
async def get_patient_case(
    patient_id: str,
    doctor: dict = Depends(require_doctor),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    """Fetch complete patient case record including clinical summary, history, and documents."""
    case_data = await DoctorService.get_patient_case(db, patient_id)
    return success_response(data=case_data, message="Patient case details retrieved")


@router.put("/summary/{summary_id}/verify", summary="Mark a clinical summary as verified")
async def verify_summary(
    summary_id: str,
    payload: VerifySummarySchema = Body(default_factory=VerifySummarySchema),
    doctor: dict = Depends(require_doctor),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    """Mark a clinical summary as verified / reviewed with doctor notes."""
    doctor_id = doctor.get("sub", "doc-001")
    updated = await DoctorService.verify_summary(
        db, summary_id, doctor_id=doctor_id, notes=payload.doctor_notes
    )
    return success_response(data=updated, message="Clinical summary verified successfully")


@router.post("/summary/{summary_id}/finalize", summary="Finalize and sign off on a summary")
async def finalize_summary(
    summary_id: str,
    doctor: dict = Depends(require_doctor),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Any:
    """Finalize and sign off on a clinical summary (status: doctor_approved)."""
    doctor_id = doctor.get("sub", "doc-001")
    finalized = await DoctorService.finalize_summary(db, summary_id, doctor_id=doctor_id)
    return success_response(data=finalized, message="Clinical summary finalized and signed off")


@router.post("/integrations/fhir", summary="Push patient data to FHIR server")
async def push_fhir(doctor: dict = Depends(require_doctor), db: AsyncIOMotorDatabase = Depends(get_db)) -> Any:
    return _NOT_IMPL


@router.post("/integrations/abdm", summary="Push patient data to ABDM")
async def push_abdm(doctor: dict = Depends(require_doctor), db: AsyncIOMotorDatabase = Depends(get_db)) -> Any:
    return _NOT_IMPL


@router.post("/integrations/his", summary="Push patient data to HIS")
async def push_his(doctor: dict = Depends(require_doctor), db: AsyncIOMotorDatabase = Depends(get_db)) -> Any:
    return _NOT_IMPL


@router.get("/integrations/status/{patient_id}", summary="Get integration push status")
async def get_integration_status(patient_id: str, doctor: dict = Depends(require_doctor), db: AsyncIOMotorDatabase = Depends(get_db)) -> Any:
    return _NOT_IMPL
