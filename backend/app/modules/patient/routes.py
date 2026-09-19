"""
modules/patient/routes.py – Patient Module Routes
==================================================
Developer 1 owns implementation.  Stub endpoints return HTTP 501 until
the service layer is wired in.

Endpoints
---------
  POST   /api/patients/              – Register new patient
  GET    /api/patients/{patient_id}  – Get patient by ID
  PUT    /api/patients/{patient_id}  – Update patient details
"""

from fastapi import APIRouter, Depends
from app.core.dependencies import get_db, get_current_role
from app.modules.patient.schema import PatientCreateSchema, PatientUpdateSchema
from app.utils.response import error_envelope

router = APIRouter()

_NOT_IMPL = error_envelope("Not yet implemented", code="NOT_IMPLEMENTED", status_code=501)


@router.post("/", summary="Register a new patient")
async def create_patient(data: PatientCreateSchema, db=Depends(get_db)):
    """Register a new patient.  Developer 1 – implement in service.py."""
    return _NOT_IMPL


@router.get("/{patient_id}", summary="Get patient by ID")
async def get_patient(patient_id: str, db=Depends(get_db)):
    """Fetch a patient record by ID."""
    return _NOT_IMPL


@router.put("/{patient_id}", summary="Update patient details")
async def update_patient(patient_id: str, data: PatientUpdateSchema, db=Depends(get_db)):
    """Update an existing patient record."""
    return _NOT_IMPL
