"""service.py - Conversation Module Business Logic - Developer 2"""
async def start_conversation(patient_id: str, mode: str, language: str) -> dict:
    raise NotImplementedError

async def process_message(session_id: str, message: str, audio_bytes: bytes = None) -> dict:
    raise NotImplementedError

async def get_conversation_session(session_id: str) -> dict:
    raise NotImplementedError

async def complete_conversation(session_id: str) -> dict:
    raise NotImplementedError
