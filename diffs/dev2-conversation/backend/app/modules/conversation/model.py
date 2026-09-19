"""
model.py - Conversation Module Document Model
Collections: conversation_sessions, conversation_messages
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def new_session_document(
    patient_id: str,
    mode: str = "general",
    language: str = "en",
    document_chunks_count: int = 0,
) -> Dict[str, Any]:
    """Create a new conversation session record."""
    now = datetime.now(timezone.utc)
    return {
        "session_id": str(uuid.uuid4()),
        "patient_id": patient_id,
        "mode": mode,
        "language": language,
        "status": "active",  # active | completed | cancelled
        "red_flags": [],
        "extracted_data": {
            "symptoms": [],
            "medications": [],
            "past_history": [],
            "allergies": [],
        },
        "document_chunks_count": document_chunks_count,
        "summary": None,
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
    }


def new_message_document(
    session_id: str,
    sender: str,  # patient | ai | system
    text: str,
    extra_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Create a new conversation turn message record."""
    now = datetime.now(timezone.utc)
    return {
        "message_id": str(uuid.uuid4()),
        "session_id": session_id,
        "sender": sender,
        "text": text,
        "extra_data": extra_data or {},
        "timestamp": now,
    }
