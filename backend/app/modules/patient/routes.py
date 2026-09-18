"""
routes.py – Patient Module Routes
Developer 1

Endpoints:
  POST   /api/patients                – Register new patient
  GET    /api/patients/{patient_id}   – Get patient by ID
  PUT    /api/patients/{patient_id}   – Update patient details
"""

from fastapi import APIRouter, Depends
from app.core.dependencies import get_db
from app.modules.patient.schema import PatientCreateSchema, PatientUpdateSchema

router = APIRouter()


@router.post("/")
async def create_patient(data: PatientCreateSchema, db=Depends(get_db)):
    """Register a new patient."""
    # TODO: Implement via patient service
    raise NotImplementedError


@router.get("/{patient_id}")
async def get_patient(patient_id: str, db=Depends(get_db)):
    """Get a patient by ID."""
    # TODO: Implement via patient service
    raise NotImplementedError


@router.put("/{patient_id}")
async def update_patient(patient_id: str, data: PatientUpdateSchema, db=Depends(get_db)):
    """Update patient details."""
    # TODO: Implement via patient service
    raise NotImplementedError
