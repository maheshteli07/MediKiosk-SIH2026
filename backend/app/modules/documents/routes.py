"""
modules/documents/routes.py – Documents Module Routes
======================================================
Developer 3 owns implementation.  Stub endpoints return HTTP 501.

Endpoints
---------
  POST /api/documents/upload                   – Upload a medical document
  GET  /api/documents/{document_id}            – Fetch a document record
  GET  /api/documents/patient/{patient_id}     – List documents for a patient
  POST /api/documents/{document_id}/process    – Trigger OCR processing
"""

from fastapi import APIRouter, Depends, File, UploadFile
from app.core.dependencies import get_db
from app.utils.response import error_envelope

router = APIRouter()

_NOT_IMPL = error_envelope("Not yet implemented", code="NOT_IMPLEMENTED", status_code=501)


@router.post("/upload", summary="Upload a medical document (image or PDF)")
async def upload_document(file: UploadFile = File(...), db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/{document_id}", summary="Get a document record by ID")
async def get_document(document_id: str, db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/patient/{patient_id}", summary="List all documents for a patient")
async def get_patient_documents(patient_id: str, db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/{document_id}/process", summary="Trigger OCR/extraction on a document")
async def process_document(document_id: str, db=Depends(get_db)):
    return _NOT_IMPL
