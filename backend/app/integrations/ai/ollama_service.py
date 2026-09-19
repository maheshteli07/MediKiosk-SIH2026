"""
ollama_service.py – Ollama Local LLM Integration for MediKiosk
===============================================================
Provides the same 4 clinical AI functions as gemini_service / nvidia_llm_service
but runs against a locally hosted Ollama instance (OpenAI-compatible API).

Default base URL : http://localhost:11434
Default model    : llama3.2:1b  (fastest, fits on most machines)

Change OLLAMA_MODEL in .env to use a larger model, e.g.:
  - llama3.1:8b      (better quality, needs ~8 GB RAM)
  - gemma2:9b        (Google model, good for Indian languages)
  - mistral:7b       (very fast, good JSON output)
  - phi3:mini        (tiny, only needs 4 GB RAM)
"""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

OLLAMA_BASE_URL = settings.OLLAMA_BASE_URL
OLLAMA_MODEL = settings.OLLAMA_MODEL
_TIMEOUT = 90.0  # local models can be slow on first load


# ── System prompt ─────────────────────────────────────────────────────────────

_SYSTEM = (
    "You are MediKiosk Clinical Documentation AI – a structured information "
    "extraction and medical history summarization assistant deployed in Indian hospital OPDs. "
    "RULES: Never diagnose. Never prescribe. Only extract and structure patient-provided info. "
    "Respond ONLY with valid JSON matching the schema – no markdown, no code fences, no explanation."
)


# ── JSON extractor ─────────────────────────────────────────────────────────────

def _extract_json(raw: str) -> Any:
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("```").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    for pattern in [r"(\{[\s\S]*\})", r"(\[[\s\S]*\])"]:
        m = re.search(pattern, cleaned)
        if m:
            try:
                return json.loads(m.group(1))
            except json.JSONDecodeError:
                continue
    raise ValueError(f"Could not extract JSON from Ollama response: {raw[:200]}")


# ── Core API caller ───────────────────────────────────────────────────────────

async def _call_ollama(prompt: str, system: str = _SYSTEM) -> str:
    """Call Ollama chat completions (OpenAI-compatible endpoint)."""
    url = f"{OLLAMA_BASE_URL.rstrip('/')}/v1/chat/completions"
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "stream": False,
        "temperature": 0.2,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
    data = resp.json()
    content = data["choices"][0]["message"]["content"].strip()
    if not content:
        raise RuntimeError("Ollama returned empty response")
    return content


# ── Clinical prompts (same structure as nvidia / gemini services) ─────────────

_SUMMARY_PROMPT = """\
Given the following patient data, produce a STRUCTURED CLINICAL SUMMARY.

--- PATIENT DATA ---
Patient History: {patient_history}
Symptoms: {symptoms}
Current Medications: {medications}
Lab Results: {lab_results}
--- END PATIENT DATA ---

Return ONLY a JSON object with these keys:
{{
  "chief_complaint": "",
  "history_of_present_illness": "",
  "past_history": "",
  "medications": [{{"name": "", "dose": null, "frequency": null}}],
  "investigations": [{{"test": "", "result": "", "date": null}}],
  "summary": ""
}}
Return strictly valid JSON. No diagnosis. No treatment recommendations."""

_EXTRACTION_PROMPT = """\
Extract structured clinical information from this patient transcript.

--- TRANSCRIPT ---
{transcript}
--- END TRANSCRIPT ---

Return ONLY a JSON object:
{{
  "chief_complaint": "",
  "duration": "",
  "symptoms": [],
  "past_history": [],
  "medications": [],
  "allergies": [],
  "family_history": [],
  "red_flags": []
}}
Extract ONLY what is explicitly stated. Return strictly valid JSON."""

_QUESTION_PROMPT = """\
You are conducting a structured clinical history-taking interview.
Based on the conversation so far, generate the SINGLE most relevant follow-up question.

--- CONVERSATION ---
{conversation}
--- END CONVERSATION ---

Sections covered: {covered_sections}
Current section: {current_section}

Return ONLY a JSON object:
{{
  "question": "",
  "question_type": "open",
  "options": null,
  "section": ""
}}
Keep the question simple and patient-friendly. Return strictly valid JSON."""

_RED_FLAG_PROMPT = """\
Review this patient statement and identify clinical RED FLAGS only.

--- PATIENT TEXT ---
{text}
--- END PATIENT TEXT ---

Return ONLY a JSON array. Each item:
{{"description": "", "severity": "low|medium|high|emergency", "category": ""}}

If no red flags, return: []
Return strictly valid JSON."""


# ── Public API ────────────────────────────────────────────────────────────────

async def ollama_generate_clinical_summary(
    patient_history: str,
    symptoms: List[str],
    medications: List[str],
    lab_results: List[str],
) -> Dict[str, Any]:
    prompt = _SUMMARY_PROMPT.format(
        patient_history=patient_history or "Not provided",
        symptoms="\n".join(f"- {s}" for s in symptoms) if symptoms else "None reported",
        medications="\n".join(f"- {m}" for m in medications) if medications else "None reported",
        lab_results="\n".join(f"- {r}" for r in lab_results) if lab_results else "None available",
    )
    raw = await _call_ollama(prompt)
    data = _extract_json(raw)
    if not isinstance(data, dict):
        raise ValueError("Ollama returned non-object JSON for summary")
    defaults = {
        "chief_complaint": "", "history_of_present_illness": "",
        "past_history": "", "medications": [], "investigations": [], "summary": "",
    }
    for k, v in defaults.items():
        data.setdefault(k, v)
    data["generated_at"] = datetime.now(timezone.utc).isoformat()
    data["model"] = OLLAMA_MODEL
    data["source"] = "ollama"
    return data


async def ollama_extract_structured_info(transcript: str) -> Dict[str, Any]:
    if not transcript or not transcript.strip():
        raise ValueError("Transcript is empty")
    prompt = _EXTRACTION_PROMPT.format(transcript=transcript)
    raw = await _call_ollama(prompt)
    data = _extract_json(raw)
    if not isinstance(data, dict):
        raise ValueError("Ollama returned non-object JSON for extraction")
    list_keys = ["symptoms", "past_history", "medications", "allergies", "family_history", "red_flags"]
    for k in list_keys:
        if not isinstance(data.get(k), list):
            data[k] = []
    for k in ["chief_complaint", "duration"]:
        if not isinstance(data.get(k), str):
            data[k] = str(data.get(k, ""))
    data["extracted_at"] = datetime.now(timezone.utc).isoformat()
    data["model"] = OLLAMA_MODEL
    data["source"] = "ollama"
    return data


async def ollama_generate_adaptive_question(session_data: Dict[str, Any]) -> Dict[str, Any]:
    conversation = session_data.get("conversation", [])
    conv_text = "\n".join(
        f"{t.get('role', 'unknown')}: {t.get('text', '')}"
        for t in conversation
    ) or "No conversation yet."
    prompt = _QUESTION_PROMPT.format(
        conversation=conv_text,
        covered_sections=", ".join(session_data.get("covered_sections", [])) or "None",
        current_section=session_data.get("current_section", "chief_complaint"),
    )
    raw = await _call_ollama(prompt)
    data = _extract_json(raw)
    if not isinstance(data, dict):
        raise ValueError("Ollama returned non-object JSON for question")
    defaults = {"question": "", "question_type": "open", "options": None, "section": "chief_complaint"}
    for k, v in defaults.items():
        data.setdefault(k, v)
    return data


async def ollama_screen_red_flags(text: str) -> List[Dict[str, Any]]:
    if not text or not text.strip():
        return []
    prompt = _RED_FLAG_PROMPT.format(text=text)
    raw = await _call_ollama(prompt)
    data = _extract_json(raw)
    if isinstance(data, dict):
        for key in ("red_flags", "flags", "results", "data"):
            if key in data and isinstance(data[key], list):
                data = data[key]
                break
        else:
            data = []
    if not isinstance(data, list):
        return []
    return data
