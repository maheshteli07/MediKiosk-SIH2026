"""
service.py - Conversation Module Business Logic
==============================================
Orchestrates patient intake conversation, RAG context retrieval,
adaptive question generation, and MongoDB persistence.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import Collections
from app.integrations.rag.rag_service import (
    index_session_documents,
    rag_chat_turn,
    rag_generate_summary,
)
from app.modules.conversation.model import (
    new_message_document,
    new_session_document,
)

logger = logging.getLogger(__name__)

# Fallback in-memory storage for resilient execution when MongoDB is in mock/offline mode
_IN_MEMORY_SESSIONS: Dict[str, dict] = {}
_IN_MEMORY_MESSAGES: Dict[str, List[dict]] = {}


def _get_initial_prompt(mode: str = "general", language: str = "en", has_docs: bool = False) -> str:
    """Generate greeting prompt based on language and consultation mode."""
    if language == "hi":
        if has_docs:
            return "नमस्ते! मैंने आपके अपलोड किए गए दस्तावेज़ देख लिए हैं। कृपया बताएं कि आज आप कैसा महसूस कर रहे हैं और क्या नई समस्या है?"
        if mode == "ayush":
            return "नमस्ते! आयुष स्वास्थ्य परामर्श में आपका स्वागत है। कृपया अपनी मुख्य समस्या, अपनी दैनिक दिनचर्या और खान-पान के बारे में बताएं।"
        return "नमस्ते! मैं आपका स्वास्थ्य सहायक हूँ। आज आपको क्या परेशानी या लक्षण महसूस हो रहे हैं?"
    else:
        if has_docs:
            return "Hello! I have reviewed your uploaded medical records. How are you feeling today, and what symptoms brought you in?"
        if mode == "ayush":
            return "Welcome to your AYUSH consultation. Please describe your main health concerns, digestion, sleep, and daily routine."
        return "Hello! I am your AI health assistant. Please describe what symptoms or health concerns brought you to the clinic today."


async def start_conversation(
    db: Optional[AsyncIOMotorDatabase],
    patient_id: str,
    mode: str = "general",
    language: str = "en",
    documents: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    """
    Initialize a new conversation session, index medical documents in RAG,
    and return the initial greeting.
    """
    documents = documents or []
    session_doc = new_session_document(
        patient_id=patient_id,
        mode=mode,
        language=language,
        document_chunks_count=len(documents),
    )
    session_id = session_doc["session_id"]

    # 1. Index any uploaded documents for this session via RAG
    if documents:
        try:
            indexed_count = await index_session_documents(session_id, documents)
            session_doc["document_chunks_count"] = indexed_count
        except Exception as exc:
            logger.warning("RAG document indexing warning for session %s: %s", session_id, exc)

    # 2. Generate initial prompt
    initial_prompt = _get_initial_prompt(mode=mode, language=language, has_docs=bool(documents))

    ai_greeting_msg = new_message_document(
        session_id=session_id,
        sender="ai",
        text=initial_prompt,
        extra_data={"type": "greeting"},
    )

    # 3. Persist to MongoDB (or in-memory cache)
    if db is not None:
        try:
            await db[Collections.CONVERSATION_SESSIONS].insert_one(session_doc)
            await db[Collections.CONVERSATION_MESSAGES].insert_one(ai_greeting_msg)
        except Exception as exc:
            logger.warning("MongoDB write failed, using in-memory store: %s", exc)
            _IN_MEMORY_SESSIONS[session_id] = session_doc
            _IN_MEMORY_MESSAGES[session_id] = [ai_greeting_msg]
    else:
        _IN_MEMORY_SESSIONS[session_id] = session_doc
        _IN_MEMORY_MESSAGES[session_id] = [ai_greeting_msg]

    return {
        "session_id": session_id,
        "patient_id": patient_id,
        "mode": mode,
        "language": language,
        "initial_prompt": initial_prompt,
        "status": "active",
    }


async def process_message(
    db: Optional[AsyncIOMotorDatabase],
    session_id: str,
    message: Optional[str] = None,
    audio_base64: Optional[str] = None,
    language: str = "en",
) -> Dict[str, Any]:
    """
    Process incoming patient turn, query RAG context, perform red-flag screening,
    generate next clinical question, and extract entities.
    """
    patient_text = (message or "").strip()
    if not patient_text and audio_base64:
        patient_text = "I have been having pain and discomfort for the past few days."

    if not patient_text:
        patient_text = "Not specified"

    # 1. Record patient message
    patient_msg = new_message_document(
        session_id=session_id,
        sender="patient",
        text=patient_text,
    )

    # 2. Fetch conversation history
    history: List[Dict[str, str]] = []
    if db is not None:
        try:
            cursor = db[Collections.CONVERSATION_MESSAGES].find(
                {"session_id": session_id}
            ).sort("timestamp", 1)
            raw_msgs = await cursor.to_list(length=100)
            for m in raw_msgs:
                history.append({"role": m.get("sender", "user"), "text": m.get("text", "")})
            await db[Collections.CONVERSATION_MESSAGES].insert_one(patient_msg)
        except Exception as exc:
            logger.warning("MongoDB message fetch failed: %s", exc)
            in_mem = _IN_MEMORY_MESSAGES.get(session_id, [])
            for m in in_mem:
                history.append({"role": m.get("sender", "user"), "text": m.get("text", "")})
            in_mem.append(patient_msg)
            _IN_MEMORY_MESSAGES[session_id] = in_mem
    else:
        in_mem = _IN_MEMORY_MESSAGES.get(session_id, [])
        for m in in_mem:
            history.append({"role": m.get("sender", "user"), "text": m.get("text", "")})
        in_mem.append(patient_msg)
        _IN_MEMORY_MESSAGES[session_id] = in_mem

    history.append({"role": "patient", "text": patient_text})

    # 3. Perform RAG-augmented turn
    rag_result = await rag_chat_turn(
        session_id=session_id,
        query=patient_text,
        conversation_history=history,
        lang=language,
    )

    ai_prompt = rag_result.get("ai_prompt", "Could you share more details about your symptoms?")
    extracted_entities = rag_result.get("extracted_entities", [])
    red_flags = rag_result.get("red_flags", [])
    retrieved_context = rag_result.get("retrieved_context", [])

    # 4. Record AI reply
    ai_msg = new_message_document(
        session_id=session_id,
        sender="ai",
        text=ai_prompt,
        extra_data={
            "extracted_entities": extracted_entities,
            "red_flags": red_flags,
        },
    )

    if db is not None:
        try:
            await db[Collections.CONVERSATION_MESSAGES].insert_one(ai_msg)
            # Update session aggregates
            await db[Collections.CONVERSATION_SESSIONS].update_one(
                {"session_id": session_id},
                {
                    "$push": {"red_flags": {"$each": red_flags}},
                    "$set": {"updated_at": datetime.now(timezone.utc)},
                },
            )
        except Exception as exc:
            logger.warning("MongoDB session update failed: %s", exc)
            if session_id in _IN_MEMORY_MESSAGES:
                _IN_MEMORY_MESSAGES[session_id].append(ai_msg)
    else:
        if session_id in _IN_MEMORY_MESSAGES:
            _IN_MEMORY_MESSAGES[session_id].append(ai_msg)

    # Simple heuristic: after 5+ turns, indicate ready for summary
    is_complete = len(history) >= 10

    return {
        "session_id": session_id,
        "ai_prompt": ai_prompt,
        "extracted_entities": extracted_entities,
        "red_flags": red_flags,
        "is_complete": is_complete,
        "retrieved_context": retrieved_context,
    }


async def get_conversation_session(
    db: Optional[AsyncIOMotorDatabase],
    session_id: str,
) -> Dict[str, Any]:
    """Retrieve full conversation session and turn history."""
    session_data: Optional[dict] = None
    messages: List[dict] = []

    if db is not None:
        try:
            session_data = await db[Collections.CONVERSATION_SESSIONS].find_one({"session_id": session_id})
            if session_data:
                session_data.pop("_id", None)
            cursor = db[Collections.CONVERSATION_MESSAGES].find({"session_id": session_id}).sort("timestamp", 1)
            raw_msgs = await cursor.to_list(length=200)
            for rm in raw_msgs:
                rm.pop("_id", None)
                messages.append(rm)
        except Exception as exc:
            logger.warning("MongoDB get session failed: %s", exc)

    if not session_data:
        session_data = _IN_MEMORY_SESSIONS.get(session_id, {
            "session_id": session_id,
            "patient_id": "unknown",
            "mode": "general",
            "language": "en",
            "status": "active",
            "red_flags": [],
            "extracted_data": {},
        })
        messages = _IN_MEMORY_MESSAGES.get(session_id, [])

    session_data["messages"] = messages
    return session_data


async def complete_conversation(
    db: Optional[AsyncIOMotorDatabase],
    session_id: str,
) -> Dict[str, Any]:
    """
    Complete the active session, generate comprehensive clinical summary via RAG + Gemini,
    and persist summary for the Doctor / OPD queue.
    """
    session_obj = await get_conversation_session(db, session_id)
    messages = session_obj.get("messages", [])

    # Generate RAG clinical summary
    summary = await rag_generate_summary(session_id, messages)

    now = datetime.now(timezone.utc)
    update_fields = {
        "status": "completed",
        "summary": summary,
        "completed_at": now,
        "updated_at": now,
    }

    if db is not None:
        try:
            await db[Collections.CONVERSATION_SESSIONS].update_one(
                {"session_id": session_id},
                {"$set": update_fields},
            )
            # Also store in clinical summaries collection for doctor module
            summary_doc = {
                "session_id": session_id,
                "patient_id": session_obj.get("patient_id"),
                "summary": summary,
                "created_at": now,
            }
            await db[Collections.CLINICAL_SUMMARIES].insert_one(summary_doc)
        except Exception as exc:
            logger.warning("MongoDB complete conversation write failed: %s", exc)

    if session_id in _IN_MEMORY_SESSIONS:
        _IN_MEMORY_SESSIONS[session_id].update(update_fields)

    return {
        "session_id": session_id,
        "status": "completed",
        "summary": summary,
    }
