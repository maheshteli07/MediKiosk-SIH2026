"""schema.py - Documents Module Schemas - Developer 3"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentResponseSchema(BaseModel):
    id: str
    patient_id: str
    file_name: str
    file_type: str
    status: str
    uploaded_at: Optional[datetime] = None

class DocumentExtractionSchema(BaseModel):
    document_id: str
    extracted_text: Optional[str] = None
    structured_data: Optional[dict] = None
    ocr_provider: str = 'mock'
    confidence: Optional[float] = None
