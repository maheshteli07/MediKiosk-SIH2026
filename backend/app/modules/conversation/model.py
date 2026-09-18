"""model.py - Conversation Module Document Model - Developer 2
Collections: conversation_sessions, conversation_messages"""
from datetime import datetime

def new_session_document(patient_id: str, mode: str, language: str) -> dict:
    now = datetime.utcnow()
    return {
        'patient_id': patient_id,
        'mode': mode,
        'language': language,
        'status': 'active',
        'red_flags': [],
        'extracted_data': {},
        'started_at': now,
        'completed_at': None,
    }
