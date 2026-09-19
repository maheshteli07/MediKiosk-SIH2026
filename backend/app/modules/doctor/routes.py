"""
modules/doctor/routes.py – Doctor Module Routes
================================================
Developer 5 owns implementation.  Stub endpoints return HTTP 501.
Auth protected endpoints use require_doctor dependency.

Note: /api/auth/login and /api/auth/dev-token live in core/security.py
      and are mounted at /api/auth in main.py.

Endpoints (prefix: /api/doctor)
---------------------------------
  GET  /api/doctor/patients                        – Patient queue
  GET  /api/doctor/patients/{patient_id}           – Full patient case
  PUT  /api/doctor/summary/{summary_id}/verify     – Mark summary verified
  POST /api/doctor/summary/{summary_id}/finalize   – Finalize and sign off
  POST /api/doctor/integrations/fhir               – Push to FHIR
  POST /api/doctor/integrations/abdm               – Push to ABDM
  POST /api/doctor/integrations/his                – Push to HIS
  GET  /api/doctor/integrations/status/{patient_id}– Integration status
"""

from fastapi import APIRouter, Depends
from app.core.dependencies import get_db, require_doctor
from app.utils.response import error_envelope

router = APIRouter()

_NOT_IMPL = error_envelope("Not yet implemented", code="NOT_IMPLEMENTED", status_code=501)


@router.get("/patients", summary="Get patient queue for the doctor")
async def get_patient_queue(doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/patients/{patient_id}", summary="Get full patient case")
async def get_patient_case(patient_id: str, doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.put("/summary/{summary_id}/verify", summary="Mark a clinical summary as verified")
async def verify_summary(summary_id: str, doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/summary/{summary_id}/finalize", summary="Finalize and sign off on a summary")
async def finalize_summary(summary_id: str, doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/integrations/fhir", summary="Push patient data to FHIR server")
async def push_fhir(doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/integrations/abdm", summary="Push patient data to ABDM")
async def push_abdm(doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/integrations/his", summary="Push patient data to HIS")
async def push_his(doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/integrations/status/{patient_id}", summary="Get integration push status")
async def get_integration_status(patient_id: str, doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL
