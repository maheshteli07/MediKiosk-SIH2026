"""schema.py - Doctor Module Schemas - Developer 5"""
from pydantic import BaseModel
from typing import Optional

class DoctorLoginSchema(BaseModel):
    username: str
    password: str

class VerifySummarySchema(BaseModel):
    doctor_notes: Optional[str] = None

class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    doctor_id: str
    name: str
