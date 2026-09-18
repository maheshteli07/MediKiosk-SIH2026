"""schema.py - Conversation Module Schemas - Developer 2"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StartConversationSchema(BaseModel):
    patient_id: str
    mode: str
    language: str = 'en'

class SendMessageSchema(BaseModel):
    session_id: str
    message: Optional[str] = None
    audio_base64: Optional[str] = None
