"""
modules/clinical/routes.py – Clinical Module Routes
====================================================
Developer 4 owns implementation.  Stub endpoints return HTTP 501.

Endpoints
---------
  GET  /api/clinical/{patient_id}            – Clinical history
  POST /api/clinical/summary/generate        – Generate AI summary
  GET  /api/clinical/summary/{patient_id}    – Fetch latest summary
  PUT  /api/clinical/summary/{patient_id}    – Update summary (doctor edit)
  GET  /api/clinical/timeline/{patient_id}   – Get timeline events
  POST /api/clinical/timeline                – Add a timeline event
"""

from fastapi import APIRouter, Depends
from app.core.dependencies import get_db
from app.utils.response import error_envelope

router = APIRouter()

_NOT_IMPL = error_envelope("Not yet implemented", code="NOT_IMPLEMENTED", status_code=501)


@router.get("/{patient_id}", summary="Get clinical history for a patient")
async def get_clinical_history(patient_id: str, db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/summary/generate", summary="Generate AI clinical summary")
async def generate_summary(db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/summary/{patient_id}", summary="Get the latest clinical summary")
async def get_summary(patient_id: str, db=Depends(get_db)):
    return _NOT_IMPL


@router.put("/summary/{patient_id}", summary="Update clinical summary (doctor edit)")
async def update_summary(patient_id: str, db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/timeline/{patient_id}", summary="Get timeline events for a patient")
async def get_timeline(patient_id: str, db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/timeline", summary="Add a timeline event")
async def create_timeline_event(db=Depends(get_db)):
    return _NOT_IMPL
