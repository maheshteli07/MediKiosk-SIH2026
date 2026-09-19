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

    import asyncio
    from app.integrations.ai.llm_service import _get_provider

    provider = await _get_provider()

    # 2. Single unified LLM call using RAG context (3x faster than 3 separate calls)
    try:
        ai_question, extracted_entities, red_flags = await asyncio.wait_for(
            _unified_rag_turn(query, context_str, conversation_history, provider),
            timeout=60.0,
        )
    except asyncio.TimeoutError:
        logger.warning("Unified LLM call timed out, using safe fallback")
        ai_question = "Could you describe your symptoms in more detail, including when they started?"
        extracted_entities = []
        red_flags = []
    except Exception as exc:
        logger.warning("Unified LLM call failed (%s), using safe fallback", exc)
        ai_question = "Could you tell me more about what you're experiencing today?"
        extracted_entities = []
        red_flags = []

    return {
        "ai_prompt": ai_question,
        "extracted_entities": extracted_entities,
        "red_flags": red_flags,
        "retrieved_context": retrieved_chunks,
    }


async def _unified_rag_turn(
    query: str,
    context_str: str,
    history: list,
    provider: str,
) -> tuple:
    """
    Single LLM call that simultaneously:
    1. Generates the next clinical question (grounded in RAG context)
    2. Extracts structured entities from patient query
    3. Screens for red flags
    Returns (ai_question: str, entities: list, red_flags: list)
    """
    # Format last 6 turns of history for context
    recent = history[-6:] if len(history) > 6 else history
    conv_text = "\n".join(
        f"{t.get('role','?').capitalize()}: {t.get('text','')}"
        for t in recent
        if t.get("role") not in ("system_context",)
    )

    rag_block = f"\n--- PATIENT'S UPLOADED MEDICAL RECORDS ---\n{context_str}\n---\n" if context_str else ""

    prompt = f"""You are MediKiosk, a clinical history-taking assistant in an Indian hospital OPD.
{rag_block}
CONVERSATION SO FAR:
{conv_text}

PATIENT JUST SAID: "{query}"

Your task:
1. Generate ONE short, empathetic follow-up question based on what the patient said AND their medical records above.
2. Extract any symptoms/medicines/conditions mentioned by the patient.
3. Identify any clinical red flags (e.g. chest pain, breathlessness, fainting, blood in stool).

RULES:
- Never diagnose. Never prescribe. Only ask and extract.
- Keep the question conversational, patient-friendly, max 2 sentences.
- Use the medical records to ask smarter, more relevant questions.

Return ONLY valid JSON:
{{
  "question": "<your follow-up question here>",
  "entities": [{{"type": "symptom|medicine|condition", "value": "..."}}],
  "red_flags": [{{"description": "...", "severity": "low|medium|high|emergency"}}]
}}"""

    # Route to appropriate provider
    if provider == "ollama":
        from app.integrations.ai.ollama_service import _call_ollama, _extract_json
        raw = await _call_ollama(prompt, system="")
    elif provider == "gemini":
        from app.integrations.ai.gemini_service import _call_gemini_raw
        raw = await _call_gemini_raw(prompt)
    elif provider == "nvidia":
        from app.integrations.ai.nvidia_llm_service import _call_nvidia_raw
        raw = await _call_nvidia_raw(prompt)
    else:
        # mock
        return (
            "Could you tell me more about your symptoms and when they started?",
            [],
            [],
        )

    try:
        from app.integrations.ai.ollama_service import _extract_json
        data = _extract_json(raw)
        question = data.get("question", "Could you describe your symptoms further?")
        entities = [
            {"type": e.get("type", "symptom"), "value": str(e.get("value", ""))}
            for e in data.get("entities", []) if isinstance(e, dict)
        ]
        red_flags = [
            {"description": r.get("description", ""), "severity": r.get("severity", "low"), "category": "general"}
            for r in data.get("red_flags", []) if isinstance(r, dict)
        ]
        return question, entities, red_flags
    except Exception as exc:
        logger.warning("JSON parse failed in unified turn: %s | raw=%s", exc, raw[:200])
        # Extract plain question if JSON fails
        lines = [l.strip() for l in raw.strip().splitlines() if "?" in l]
        question = lines[0] if lines else "Could you describe your symptoms in more detail?"
        return question, [], []


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
