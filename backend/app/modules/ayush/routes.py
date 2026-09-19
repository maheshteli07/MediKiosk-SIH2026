"""
modules/ayush/routes.py – AYUSH Module Routes
=============================================
Developer 4 owns implementation.  Stub endpoints return HTTP 501.

Endpoints
---------
  POST /api/ayush/{patient_id}   – Create AYUSH history record
  GET  /api/ayush/{patient_id}   – Get AYUSH history
  PUT  /api/ayush/{patient_id}   – Update AYUSH history
"""

from fastapi import APIRouter, Depends
from app.core.dependencies import get_db
from app.utils.response import error_envelope

router = APIRouter()

_NOT_IMPL = error_envelope("Not yet implemented", code="NOT_IMPLEMENTED", status_code=501)


@router.post("/{patient_id}", summary="Create AYUSH history record")
async def create_ayush_history(patient_id: str, db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/{patient_id}", summary="Get AYUSH history for a patient")
async def get_ayush_history(patient_id: str, db=Depends(get_db)):
    return _NOT_IMPL


@router.put("/{patient_id}", summary="Update AYUSH history")
async def update_ayush_history(patient_id: str, db=Depends(get_db)):
    return _NOT_IMPL
