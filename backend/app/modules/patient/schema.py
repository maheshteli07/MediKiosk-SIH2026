"""
schema.py – Patient Module Pydantic Schemas
Developer 1

Request/Response schemas for the patient module.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PatientCreateSchema(BaseModel):
    """Schema for registering a new patient."""
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    phone: str = Field(..., min_length=10, max_length=15)
    abha_id: Optional[str] = None
    aadhaar: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    language: str = "en"
    consultation_mode: Optional[str] = None


class PatientUpdateSchema(BaseModel):
    """Schema for updating patient details."""
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    consultation_mode: Optional[str] = None


class PatientResponseSchema(BaseModel):
    """Schema for patient API response."""
    id: str
    name: str
    age: int
    gender: str
    phone: str
    abha_id: Optional[str] = None
    language: str
    consultation_mode: Optional[str] = None
    created_at: Optional[datetime] = None
