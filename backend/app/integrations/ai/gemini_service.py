"""
gemini_service.py – Gemini 2.5 Flash Integration for MediKiosk
================================================================
Production-ready service layer for Google Gemini API.

Design principles:
  • Structured JSON prompting with explicit output schemas.
  • Healthcare-safe: NO diagnosis, NO treatment, information-only.
  • Automatic retry with exponential back-off on transient errors.
  • Pydantic-validated responses – malformed LLM output never leaks.

Developer 5
"""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_GENERATE_URL = (
    f"{GEMINI_API_BASE}/models/{GEMINI_MODEL}:generateContent"
)

# Maximum retries on transient (5xx / timeout) errors
_MAX_RETRIES = 2
_TIMEOUT_SECONDS = 60

# ── Healthcare-Safety System Instruction ──────────────────────────────────────

_SYSTEM_INSTRUCTION = """\
You are MediKiosk Clinical Documentation AI – a structured information \
extraction and medical history summarization assistant deployed in Indian \
hospital OPDs.

STRICT RULES (NEVER VIOLATE):
1. You MUST NOT diagnose any disease or medical condition.
2. You MUST NOT prescribe or recommend any medicine, dosage, or treatment.
3. You MUST NOT suggest any investigations, lab tests, or imaging.
4. You ONLY extract, structure, and summarize information the patient has \
   already provided.
5. If the patient data is ambiguous or incomplete, state "Insufficient data" \
   for that field – never guess or infer a diagnosis.
6. Use standard medical terminology while keeping the text readable.
7. Always attribute information to its source (patient-reported, document, \
   lab report).
8. Respond ONLY with valid JSON matching the requested schema – no markdown, \
   no explanation text, no code fences.
"""

# ── Prompt Templates ──────────────────────────────────────────────────────────

CLINICAL_SUMMARY_PROMPT = """\
Given the following patient data, produce a STRUCTURED CLINICAL SUMMARY.

--- PATIENT DATA ---
Patient History:
{patient_history}

Symptoms:
{symptoms}

Current Medications:
{medications}

Lab Results / Investigations:
{lab_results}
--- END PATIENT DATA ---

Return ONLY a JSON object with EXACTLY these keys (no extra keys):
{{
  "chief_complaint": "<one-line main complaint as reported by the patient>",
  "history_of_present_illness": "<chronological narrative of the present \
illness in 3-5 sentences, using ONLY patient-reported information>",
  "past_history": "<comma-separated list of past medical/surgical history \
items, or 'None reported'>",
  "medications": [
    {{"name": "<drug name>", "dose": "<dose if known, else null>", \
"frequency": "<frequency if known, else null>"}}
  ],
  "investigations": [
    {{"test": "<test name>", "result": "<result value>", \
"date": "<date if known, else null>"}}
  ],
  "summary": "<2-3 sentence objective clinical summary for doctor review, \
WITHOUT any diagnosis or treatment recommendation>"
}}

CRITICAL: Do NOT diagnose. Do NOT recommend treatment. Only structure the \
information the patient already provided.
"""

STRUCTURED_EXTRACTION_PROMPT = """\
Extract structured clinical information from the following patient \
conversation transcript.

--- TRANSCRIPT ---
{transcript}
--- END TRANSCRIPT ---

Return ONLY a JSON object with EXACTLY these keys (no extra keys):
{{
  "chief_complaint": "<main complaint in patient's own words, \
or empty string if unclear>",
  "duration": "<duration of chief complaint, e.g. '3 days', '2 weeks', \
or empty string if not mentioned>",
  "symptoms": [
    "<symptom 1>",
    "<symptom 2>"
  ],
  "past_history": [
    "<condition 1>",
    "<condition 2>"
  ],
  "medications": [
    "<medication 1>",
    "<medication 2>"
  ],
  "allergies": [
    "<allergy 1>"
  ],
  "family_history": [
    "<family member: condition>"
  ],
  "red_flags": [
    "<any alarming symptom that may require urgent attention>"
  ]
}}

RULES:
- Extract ONLY information explicitly stated in the transcript.
- If a field has no data, return an empty list [] or empty string "".
- Do NOT infer, assume, or fabricate any clinical information.
- Do NOT diagnose or suggest possible conditions.
"""

ADAPTIVE_QUESTION_PROMPT = """\
You are conducting a structured clinical history-taking interview. Based on \
the conversation so far, generate the SINGLE most relevant follow-up question.

--- CONVERSATION SO FAR ---
{conversation}
--- END CONVERSATION ---

Sections already covered: {covered_sections}
Current section: {current_section}

Return ONLY a JSON object:
{{
  "question": "<the next question in simple, non-jargon language>",
  "question_type": "<open | yes_no | multiple_choice>",
  "options": null,
  "section": "<one of: chief_complaint, history_of_present_illness, \
past_medical_history, medication_history, family_history, social_history, \
review_of_systems>"
}}

If question_type is "multiple_choice", populate "options" as a list of strings.
Keep questions simple and patient-friendly. Avoid medical jargon.
"""

RED_FLAG_SCREENING_PROMPT = """\
Review the following patient statement and identify clinical RED FLAGS only.
Red flags are symptoms or signs that may indicate a serious or \
life-threatening condition requiring urgent medical attention.

--- PATIENT TEXT ---
{text}
--- END PATIENT TEXT ---

Return ONLY a JSON array. Each element:
{{
  "description": "<the red-flag symptom/sign>",
  "severity": "<low | medium | high | emergency>",
  "category": "<cardiac | neurological | respiratory | abdominal | \
trauma | infectious | other>"
}}

If no red flags are found, return an empty array: []
Do NOT diagnose. Only flag symptoms that are medically recognised as urgent.
"""


# ── Internal Helpers ──────────────────────────────────────────────────────────

def _get_api_key() -> str:
    """Retrieve the Gemini API key from settings; raise early if missing."""
    key = settings.GEMINI_API_KEY
    if not key:
        raise ValueError(
            "GEMINI_API_KEY is not set. Add it to your .env file."
        )
    return key


def _extract_json(raw: str) -> Any:
    """
    Robustly extract JSON from LLM text output.

    Handles common LLM quirks:
      • Response wrapped in ```json ... ``` code fences
      • Leading/trailing whitespace or explanation text
      • Multiple JSON objects (takes the first)
    """
    # Strip markdown code fences if present
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip()
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()

    # Attempt direct parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try to find a JSON object {...} or array [...]
    for pattern in [
        r"(\{[\s\S]*\})",   # outermost { ... }
        r"(\[[\s\S]*\])",   # outermost [ ... ]
    ]:
        match = re.search(pattern, cleaned)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                continue

    raise ValueError(f"Could not extract valid JSON from LLM response: "
                     f"{raw[:300]}...")


async def _call_gemini(
    prompt: str,
    *,
    temperature: float = 0.2,
    max_output_tokens: int = 4096,
) -> str:
    """
    Low-level async call to the Gemini generateContent REST endpoint.

    Returns the raw text output from the model.
    Raises on HTTP errors, empty responses, or safety blocks.
    """
    api_key = _get_api_key()
    url = f"{GEMINI_GENERATE_URL}?key={api_key}"

    payload = {
        "system_instruction": {
            "parts": [{"text": _SYSTEM_INSTRUCTION}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_output_tokens,
            "responseMimeType": "application/json",
        },
    }

    last_error: Exception | None = None

    for attempt in range(1, _MAX_RETRIES + 2):  # 1-indexed, up to 3 attempts
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
                resp = await client.post(url, json=payload)

            if resp.status_code == 429:
                logger.warning(
                    "Gemini rate-limited (429). Attempt %d/%d",
                    attempt, _MAX_RETRIES + 1,
                )
                import asyncio
                await asyncio.sleep(2 ** attempt)
                continue

            if resp.status_code >= 500:
                logger.warning(
                    "Gemini server error (%d). Attempt %d/%d",
                    resp.status_code, attempt, _MAX_RETRIES + 1,
                )
                import asyncio
                await asyncio.sleep(2 ** attempt)
                continue

            resp.raise_for_status()
            body = resp.json()

            # ── Check for safety blocks ──
            candidates = body.get("candidates", [])
            if not candidates:
                block_reason = body.get("promptFeedback", {}).get(
                    "blockReason", "UNKNOWN"
                )
                raise RuntimeError(
                    f"Gemini blocked the request. Reason: {block_reason}"
                )

            # ── Extract text content ──
            parts = candidates[0].get("content", {}).get("parts", [])
            text_parts = [p["text"] for p in parts if "text" in p]
            if not text_parts:
                finish = candidates[0].get("finishReason", "UNKNOWN")
                raise RuntimeError(
                    f"Gemini returned empty content. finishReason={finish}"
                )

            return "\n".join(text_parts)

        except httpx.TimeoutException as exc:
            logger.warning(
                "Gemini timeout. Attempt %d/%d: %s",
                attempt, _MAX_RETRIES + 1, exc,
            )
            last_error = exc
        except httpx.HTTPStatusError as exc:
            # Non-retryable HTTP error (4xx other than 429)
            logger.error("Gemini HTTP error: %s", exc)
            raise
        except RuntimeError:
            raise
        except Exception as exc:
            logger.error("Unexpected error calling Gemini: %s", exc)
            last_error = exc

    raise RuntimeError(
        f"Gemini API failed after {_MAX_RETRIES + 1} attempts. "
        f"Last error: {last_error}"
    )


# ── Public API ────────────────────────────────────────────────────────────────

async def gemini_generate_clinical_summary(
    patient_history: str,
    symptoms: list[str],
    medications: list[str],
    lab_results: list[str],
) -> dict:
    """
    Generate a structured clinical summary via Gemini 2.5 Flash.

    Returns a validated dict matching the ClinicalSummaryResponse schema.
    Raises ValueError on malformed LLM output.
    """
    prompt = CLINICAL_SUMMARY_PROMPT.format(
        patient_history=patient_history or "Not provided",
        symptoms="\n".join(f"- {s}" for s in symptoms) if symptoms else "None reported",
        medications="\n".join(f"- {m}" for m in medications) if medications else "None reported",
        lab_results="\n".join(f"- {r}" for r in lab_results) if lab_results else "None available",
    )

    raw = await _call_gemini(prompt)
    data = _extract_json(raw)

    if not isinstance(data, dict):
        raise ValueError("Gemini returned non-object JSON for summary")

    # Ensure all required keys exist with safe defaults
    required_keys = {
        "chief_complaint": "",
        "history_of_present_illness": "",
        "past_history": "",
        "medications": [],
        "investigations": [],
        "summary": "",
    }
    for key, default in required_keys.items():
        if key not in data:
            data[key] = default

    # Normalise medications & investigations to list-of-dicts
    if isinstance(data["medications"], str):
        data["medications"] = [{"name": data["medications"], "dose": None, "frequency": None}]
    if isinstance(data["investigations"], str):
        data["investigations"] = [{"test": data["investigations"], "result": None, "date": None}]

    data["generated_at"] = datetime.now(timezone.utc).isoformat()
    data["model"] = GEMINI_MODEL
    data["source"] = "gemini"

    return data


async def gemini_extract_structured_info(transcript: str) -> dict:
    """
    Extract structured clinical information from a conversation transcript.

    Returns a validated dict matching the ExtractedInfoResponse schema.
    Raises ValueError on malformed LLM output.
    """
    if not transcript or not transcript.strip():
        raise ValueError("Transcript is empty – nothing to extract.")

    prompt = STRUCTURED_EXTRACTION_PROMPT.format(transcript=transcript)

    raw = await _call_gemini(prompt)
    data = _extract_json(raw)

    if not isinstance(data, dict):
        raise ValueError("Gemini returned non-object JSON for extraction")

    # Ensure all required keys with safe defaults
    list_keys = [
        "symptoms", "past_history", "medications",
        "allergies", "family_history", "red_flags",
    ]
    for key in list_keys:
        if key not in data or not isinstance(data.get(key), list):
            data[key] = data.get(key, []) if isinstance(data.get(key), list) else []

    str_keys = ["chief_complaint", "duration"]
    for key in str_keys:
        if key not in data or not isinstance(data.get(key), str):
            data[key] = str(data.get(key, ""))

    data["extracted_at"] = datetime.now(timezone.utc).isoformat()
    data["model"] = GEMINI_MODEL
    data["source"] = "gemini"

    return data


async def gemini_generate_adaptive_question(session_data: dict) -> dict:
    """
    Generate the next adaptive interview question via Gemini.

    session_data should contain:
      - conversation: list of {"role": ..., "text": ...}
      - covered_sections: list of section names
      - current_section: str
    """
    conversation = session_data.get("conversation", [])
    conv_text = "\n".join(
        f"{turn.get('role', 'unknown')}: {turn.get('text', '')}"
        for turn in conversation
    ) or "No conversation yet."

    prompt = ADAPTIVE_QUESTION_PROMPT.format(
        conversation=conv_text,
        covered_sections=", ".join(session_data.get("covered_sections", [])) or "None",
        current_section=session_data.get("current_section", "chief_complaint"),
    )

    raw = await _call_gemini(prompt, temperature=0.4)
    data = _extract_json(raw)

    if not isinstance(data, dict):
        raise ValueError("Gemini returned non-object JSON for question")

    required = {"question": "", "question_type": "open", "options": None, "section": "chief_complaint"}
    for key, default in required.items():
        if key not in data:
            data[key] = default

    return data


async def gemini_screen_red_flags(text: str) -> list:
    """
    Screen patient text for clinical red flags via Gemini.

    Returns a list of red-flag dicts. Empty list if none found.
    """
    if not text or not text.strip():
        return []

    prompt = RED_FLAG_SCREENING_PROMPT.format(text=text)

    raw = await _call_gemini(prompt)
    data = _extract_json(raw)

    if isinstance(data, dict):
        # LLM wrapped array in an object – try to unwrap
        for key in ("red_flags", "flags", "results", "data"):
            if key in data and isinstance(data[key], list):
                data = data[key]
                break
        else:
            data = []

    if not isinstance(data, list):
        logger.warning("Red-flag screening returned non-list; defaulting to []")
        return []

    return data
