"""schema.py - Clinical Module Schemas - Developer 4"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TimelineEventSchema(BaseModel):
    patient_id: str
    date: str
    title: str
    description: Optional[str] = None
    source: str = 'conversation'

class ClinicalSummaryUpdateSchema(BaseModel):
    chief_complaint: Optional[str] = None
    history_of_present_illness: Optional[str] = None
    past_medical_history: Optional[List[str]] = None
    family_history: Optional[List[str]] = None
    review_of_systems: Optional[dict] = None
    red_flags: Optional[List[dict]] = None
    doctor_notes: Optional[str] = None
