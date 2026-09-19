"""
integrations/rag/rag_service.py
===============================
Retrieval-Augmented Generation (RAG) service for MediKiosk.
Bridges OCR/medical document retrieval with Gemini clinical reasoning to provide
context-grounded adaptive questioning and comprehensive clinical summarization.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from app.integrations.ai.llm_service import (
    extract_structured_info,
    generate_adaptive_question,
    generate_clinical_summary,
    screen_red_flags,
)
from app.integrations.rag.rag_store import clear_session, index_documents, retrieve

logger = logging.getLogger(__name__)


def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks for finer-grained retrieval."""
    if not text:
        return []
    text = text.strip()
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start += chunk_size - overlap
    return chunks


async def index_session_documents(session_id: str, documents: List[Any]) -> int:
    """
    Extract, chunk, and index patient documents (OCR text, lab results, prescriptions).

    Parameters
    ----------
    session_id : str
        The active consultation session ID.
    documents : list of dict or str
        Documents uploaded or scanned during patient intake.

    Returns
    -------
    int : Total number of indexed chunks.
    """
    if not session_id or not documents:
        return 0

    all_chunks: List[str] = []

    for doc in documents:
        if isinstance(doc, str):
            all_chunks.extend(_chunk_text(doc))
        elif isinstance(doc, dict):
            # Extract possible text fields from document schema or OCR results
            text_parts = []
            for field in ("ocr_text", "text", "extracted_text", "summary", "content", "title", "description"):
                val = doc.get(field)
                if val and isinstance(val, str):
                    text_parts.append(val)
            
            # Extract structured entities if present (e.g. diagnoses, meds)
            if "diagnoses" in doc and isinstance(doc["diagnoses"], list):
                text_parts.append("Diagnoses: " + ", ".join(str(d) for d in doc["diagnoses"]))
            if "medicines" in doc and isinstance(doc["medicines"], list):
                text_parts.append("Medicines: " + ", ".join(str(m) for m in doc["medicines"]))
            if "investigations" in doc and isinstance(doc["investigations"], list):
                text_parts.append("Investigations: " + ", ".join(str(i) for i in doc["investigations"]))

            full_doc_text = " \n ".join(text_parts)
            if full_doc_text.strip():
                all_chunks.extend(_chunk_text(full_doc_text))

    if not all_chunks:
        return 0

    return await index_documents(session_id, all_chunks)


async def rag_chat_turn(
    session_id: str,
    query: str,
    conversation_history: List[Dict[str, str]],
    lang: str = "en",
) -> Dict[str, Any]:
    """
    Perform a RAG-augmented conversation turn:
    1. Retrieve relevant medical document context based on the patient's statement.
    2. Screen for clinical red flags.
    3. Generate the next clinically informed question using retrieved context.
    4. Extract structured clinical entities from the turn.

    Parameters
    ----------
    session_id : str
        Active consultation session ID.
    query : str
        Latest patient input (voice transcript or text).
    conversation_history : list of {"role": str, "text": str}
        Prior conversation turns.
    lang : str
        Selected language (e.g., 'en', 'hi').

    Returns
    -------
    dict with ai_prompt, extracted_entities, red_flags, retrieved_context.
    """
    # 1. Retrieve top matching document chunks
    retrieved_chunks = await retrieve(session_id, query, top_k=3)
    context_str = "\n---\n".join(retrieved_chunks) if retrieved_chunks else ""

    # 2. Screen red flags in patient's message
    red_flags = await screen_red_flags(query)

    # 3. Format history and augment with RAG context
    formatted_conversation = list(conversation_history)
    if context_str:
        formatted_conversation.insert(
            0,
            {
                "role": "system_context",
                "text": f"Relevant patient medical records and lab documents:\n{context_str}",
            },
        )

    # 4. Generate next adaptive question
    session_data = {
        "conversation": formatted_conversation,
        "covered_sections": [],
        "current_section": "history_of_present_illness",
    }
    question_resp = await generate_adaptive_question(session_data)
    ai_question = question_resp.get("question", "Could you tell me more about your symptoms?")

    # 5. Extract structured entities from latest patient message
    extraction_resp = await extract_structured_info(query, extraction_type="patient_turn")
    extracted_entities = []
    
    if isinstance(extraction_resp, dict):
        for k in ("symptoms", "medications", "past_history", "allergies"):
            items = extraction_resp.get(k, [])
            if isinstance(items, list):
                for item in items:
                    extracted_entities.append({"type": k, "value": str(item)})

    return {
        "ai_prompt": ai_question,
        "extracted_entities": extracted_entities,
        "red_flags": red_flags,
        "retrieved_context": retrieved_chunks,
    }


async def rag_generate_summary(
    session_id: str,
    conversation_history: List[Dict[str, str]],
) -> Dict[str, Any]:
    """
    Generate a complete, structured clinical summary combining conversation transcript
    and all relevant indexed document context.
    """
    # Retrieve broad context
    all_chunks = await retrieve(session_id, "medical history diagnosis medication lab report", top_k=10)

    # Build conversation narrative
    transcript_lines = []
    for turn in conversation_history:
        role = turn.get("role", turn.get("sender", "unknown"))
        text = turn.get("text", turn.get("message", ""))
        transcript_lines.append(f"{role.capitalize()}: {text}")
    
    transcript_text = "\n".join(transcript_lines)

    conversation_data = {
        "patient_history": transcript_text,
        "symptoms": [],
        "medications": [],
        "lab_results": all_chunks,
    }

    summary = await generate_clinical_summary(
        conversation_data=conversation_data,
        documents_data=[{"chunk": c} for c in all_chunks],
    )

    # Clean up session vector store after completion
    clear_session(session_id)

    return summary
