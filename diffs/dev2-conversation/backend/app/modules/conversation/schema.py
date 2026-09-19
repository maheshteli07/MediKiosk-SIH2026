"""
schema.py - Conversation Module Schemas
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class StartConversationSchema(BaseModel):
    patient_id: str = Field(..., description="ID of the registered patient")
    mode: str = Field(default="general", description="Consultation mode: general | ayush")
    language: str = Field(default="en", description="Language code: en | hi | te | ta | kn")
    documents: Optional[List[Any]] = Field(default=[], description="Uploaded documents or OCR extractions")


class SendMessageSchema(BaseModel):
    session_id: str = Field(..., description="Active session ID")
    message: Optional[str] = Field(default=None, description="Patient text message")
    audio_base64: Optional[str] = Field(default=None, description="Optional raw audio base64")
    language: Optional[str] = Field(default="en", description="Language code")


class CompleteConversationSchema(BaseModel):
    session_id: str = Field(..., description="Active session ID to complete")


class ExtractedEntity(BaseModel):
    type: str
    value: str


class RedFlagItemSchema(BaseModel):
    description: str
    severity: str = "medium"
    category: Optional[str] = "other"


class MessageItem(BaseModel):
    message_id: Optional[str] = None
    sender: str
    text: str
    timestamp: Optional[Any] = None
    extra_data: Optional[Dict[str, Any]] = None


class MessageResponseSchema(BaseModel):
    session_id: str
    ai_prompt: str
    extracted_entities: List[Dict[str, Any]] = []
    red_flags: List[Dict[str, Any]] = []
    is_complete: bool = False
    retrieved_context: Optional[List[str]] = []


class ConversationSessionResponseSchema(BaseModel):
    session_id: str
    patient_id: str
    mode: str
    language: str
    status: str
    messages: List[Dict[str, Any]] = []
    red_flags: List[Dict[str, Any]] = []
    extracted_data: Dict[str, Any] = {}
    summary: Optional[Dict[str, Any]] = None
    created_at: Optional[Any] = None
    completed_at: Optional[Any] = None
