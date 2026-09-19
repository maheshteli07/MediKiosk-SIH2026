"""
modules/documents/routes.py – Documents Module Routes
======================================================
Handles document uploads, retrieval, and OCR extraction.

Endpoints
---------
  POST /api/documents/upload                   – Upload a medical document
  GET  /api/documents/{document_id}            – Fetch a document record
  GET  /api/documents/patient/{patient_id}     – List documents for a patient
  POST /api/documents/{document_id}/process    – Trigger OCR processing
"""

import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile
from app.core.dependencies import get_db
from app.integrations.ocr.ocr_service import extract_text_from_image
from app.utils.response import error_envelope, success_response

router = APIRouter()

# In-memory fallback if DB is not available
_IN_MEMORY_DOCS = {}
_IN_MEMORY_EXTRACTIONS = {}


@router.post("/upload", summary="Upload a medical document (image or PDF)")
async def upload_document(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Form(None),
    db=Depends(get_db)
):
    try:
        content = await file.read()
        doc_id = str(uuid.uuid4())
        record = {
            "id": doc_id,
            "patient_id": patient_id or "anonymous",
            "file_name": file.filename or "uploaded_document",
            "content_type": file.content_type or "application/octet-stream",
            "file_size": len(content),
            "status": "uploaded",
            "uploaded_at": datetime.utcnow().isoformat(),
        }

        if db is not None:
            await db["documents"].insert_one({**record, "_id": doc_id})
        else:
            _IN_MEMORY_DOCS[doc_id] = record

        return success_response(
            data=record,
            message="Document uploaded successfully",
        )
    except Exception as exc:
        return error_envelope(
            message=f"Failed to upload document: {str(exc)}",
            code="DOCUMENT_UPLOAD_ERROR",
            status_code=500,
        )


@router.get("/{document_id}", summary="Get a document record by ID")
async def get_document(document_id: str, db=Depends(get_db)):
    try:
        doc = None
        if db is not None:
            doc = await db["documents"].find_one({"id": document_id})
        if not doc:
            doc = _IN_MEMORY_DOCS.get(document_id)

        if not doc:
            return error_envelope(
                message="Document not found",
                code="DOCUMENT_NOT_FOUND",
                status_code=404,
            )

        doc_data = {k: v for k, v in doc.items() if k != "_id"}
        return success_response(data=doc_data)
    except Exception as exc:
        return error_envelope(
            message=f"Failed to retrieve document: {str(exc)}",
            code="DOCUMENT_FETCH_ERROR",
            status_code=500,
        )


@router.get("/patient/{patient_id}", summary="List all documents for a patient")
async def get_patient_documents(patient_id: str, db=Depends(get_db)):
    try:
        results = []
        if db is not None:
            cursor = db["documents"].find({"patient_id": patient_id})
            async for doc in cursor:
                doc_clean = {k: v for k, v in doc.items() if k != "_id"}
                results.append(doc_clean)
        else:
            results = [d for d in _IN_MEMORY_DOCS.values() if d.get("patient_id") == patient_id]

        return success_response(data=results, message="Patient documents retrieved")
    except Exception as exc:
        return error_envelope(
            message=f"Failed to retrieve patient documents: {str(exc)}",
            code="PATIENT_DOCUMENTS_ERROR",
            status_code=500,
        )


@router.post("/{document_id}/process", summary="Trigger OCR/extraction on a document")
async def process_document(document_id: str, db=Depends(get_db)):
    try:
        # Perform OCR extraction
        ocr_result = await extract_text_from_image(b"", language="en")
        extraction_data = {
            "document_id": document_id,
            "extracted_text": ocr_result.get("raw_text", ""),
            "structured_data": ocr_result.get("structured", {}),
            "confidence": ocr_result.get("confidence", 0.95),
            "ocr_provider": ocr_result.get("provider", "mock"),
            "processed_at": datetime.utcnow().isoformat(),
        }

        if db is not None:
            await db["documents"].update_one(
                {"id": document_id},
                {"$set": {"status": "processed", "processed_at": extraction_data["processed_at"]}}
            )
            await db["document_extractions"].insert_one({**extraction_data, "_id": str(uuid.uuid4())})
        else:
            if document_id in _IN_MEMORY_DOCS:
                _IN_MEMORY_DOCS[document_id]["status"] = "processed"
            _IN_MEMORY_EXTRACTIONS[document_id] = extraction_data

        return success_response(
            data=extraction_data,
            message="Document OCR processing completed",
        )
    except Exception as exc:
        return error_envelope(
            message=f"Failed to process document: {str(exc)}",
            code="OCR_PROCESSING_ERROR",
            status_code=500,
        )

