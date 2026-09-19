"""schema.py - Doctor Module Schemas"""
from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

class DoctorLoginSchema(BaseModel):
    username: str
    password: str

class VerifySummarySchema(BaseModel):
    model_config = ConfigDict(extra="ignore")
    doctor_notes: Optional[str] = None
    status: Optional[str] = "needs_check"

class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    doctor_id: str
    name: str

class PatientQueueItemSchema(BaseModel):
    id: str
    session_id: str
    patient_id: str
    patient_uid: str
    patient_name: str
    age: int
    gender: str
    phone: str
    consultation_mode: str
    status: str
    wait_time: Optional[str] = "10 mins"
    red_flags_count: int = 0
    chief_complaint: Optional[str] = None
    created_at: Optional[datetime] = None

class PatientCaseResponseSchema(BaseModel):
    patient_id: str
    patient_uid: str
    patient_name: str
    age: int
    gender: str
    phone: str
    abha_id: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    preferred_language: Optional[str] = "en"
    session_id: Optional[str] = None
    consultation_mode: Optional[str] = "general"
    session_status: Optional[str] = "active"
    clinical_summary: Optional[Dict[str, Any]] = None
    documents: List[Dict[str, Any]] = Field(default_factory=list)
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)
    ayush_history: Optional[Dict[str, Any]] = None
    timeline_events: List[Dict[str, Any]] = Field(default_factory=list)

