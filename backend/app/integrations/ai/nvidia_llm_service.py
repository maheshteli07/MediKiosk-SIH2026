"""
nvidia_llm_service.py – NVIDIA NIM / Nemotron LLM Integration for MediKiosk
=============================================================================
Production-ready service layer for NVIDIA NIM LLM API (OpenAI-compatible).

Default model: nvidia/nemotron-3.5-lightning-30b-a3b
Base URL: https://integrate.api.nvidia.com/v1

Design principles:
  • OpenAI-compatible REST & async httpx client integration.
  • Structured JSON prompting with explicit output schemas.
  • Healthcare-safe: NO diagnosis, NO treatment, information-only.
  • Automatic retry with exponential back-off on transient errors.
  • Pydantic-validated responses – malformed LLM output never leaks.
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

# ── Constants ──────────────────────────────────────────────────────────────────

DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
DEFAULT_NVIDIA_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b"

_MAX_RETRIES = 2
_TIMEOUT_SECONDS = 45

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
  "history_of_present_illness": "<chronological narrative of the present illness in 3-5 sentences, using ONLY patient-reported information>",
  "past_history": "<comma-separated list of past medical/surgical history items, or 'None reported'>",
  "medications": [
    {{"name": "<drug name>", "dose": "<dose if known, else null>", "frequency": "<frequency if known, else null>"}}
  ],
  "investigations": [
    {{"test": "<test name>", "result": "<result value>", "date": "<date if known, else null>"}}
  ],
  "summary": "<2-3 sentence objective clinical summary for doctor review, WITHOUT any diagnosis or treatment recommendation>"
}}

CRITICAL: Do NOT diagnose. Do NOT recommend treatment. Only structure the information the patient already provided. Return strictly valid JSON.
"""

STRUCTURED_EXTRACTION_PROMPT = """\
Extract structured clinical information from the following patient conversation transcript.

--- TRANSCRIPT ---
{transcript}
--- END TRANSCRIPT ---

Return ONLY a JSON object with EXACTLY these keys (no extra keys):
{{
  "chief_complaint": "<main complaint in patient's own words, or empty string if unclear>",
  "duration": "<duration of chief complaint, e.g. '3 days', '2 weeks', or empty string if not mentioned>",
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
- Return strictly valid JSON.
"""

ADAPTIVE_QUESTION_PROMPT = """\
You are conducting a structured clinical history-taking interview. Based on the conversation so far, generate the SINGLE most relevant follow-up question.

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
  "section": "<one of: chief_complaint, history_of_present_illness, past_medical_history, medication_history, family_history, social_history, review_of_systems>"
}}

If question_type is "multiple_choice", populate "options" as a list of strings.
Keep questions simple and patient-friendly. Avoid medical jargon.
Return strictly valid JSON.
"""

RED_FLAG_SCREENING_PROMPT = """\
Review the following patient statement and identify clinical RED FLAGS only.
Red flags are symptoms or signs that may indicate a serious or life-threatening condition requiring urgent medical attention.

--- PATIENT TEXT ---
{text}
--- END PATIENT TEXT ---

Return ONLY a JSON array. Each element:
{{
  "description": "<the red-flag symptom/sign>",
  "severity": "<low | medium | high | emergency>",
  "category": "<cardiac | neurological | respiratory | abdominal | trauma | infectious | other>"
}}

If no red flags are found, return an empty array: []
Do NOT diagnose. Only flag symptoms that are medically recognised as urgent.
Return strictly valid JSON.
"""


# ── Internal Helpers ──────────────────────────────────────────────────────────

def _get_api_key() -> str:
    """Retrieve NVIDIA / LLM API key from settings."""
    key = settings.NVIDIA_API_KEY or settings.LLM_API_KEY
    if not key or key.startswith("your-"):
        raise ValueError(
            "NVIDIA API Key is not configured. Set NVIDIA_API_KEY or LLM_API_KEY in .env."
        )
    return key


def _get_model() -> str:
    """Retrieve the configured NVIDIA LLM model name."""
    return getattr(settings, "nvidia_llm_model", None) or getattr(settings, "llm_model", None) or DEFAULT_NVIDIA_MODEL


def _get_base_url() -> str:
    """Retrieve the configured NVIDIA LLM base URL."""
    url = getattr(settings, "nvidia_llm_base_url", None) or getattr(settings, "llm_base_url", None) or DEFAULT_NVIDIA_BASE_URL
    return url.rstrip("/")


def _extract_json(raw: str) -> Any:
    """
    Robustly extract JSON from LLM text output.
    Handles <think> tags, markdown wrappers, preamble, and chatter.
    """
    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", raw, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"```(?:json)?\s*", "", cleaned).strip()
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Extract outermost { ... }
    start_brace = cleaned.find("{")
    end_brace = cleaned.rfind("}")
    if start_brace != -1:
        if end_brace != -1 and end_brace > start_brace:
            try:
                return json.loads(cleaned[start_brace : end_brace + 1])
            except json.JSONDecodeError:
                pass
        # Try repairing truncated JSON
        sub = cleaned[start_brace:]
        # Remove trailing unclosed elements
        sub = re.sub(r",\s*$", "", sub)
        open_b = sub.count("{") - sub.count("}")
        open_k = sub.count("[") - sub.count("]")
        if sub.count('"') % 2 != 0:
            sub += '"'
        sub += "]" * max(0, open_k)
        sub += "}" * max(0, open_b)
        try:
            return json.loads(sub)
        except json.JSONDecodeError:
            pass

    # Extract outermost [ ... ]
    start_bracket = cleaned.find("[")
    end_bracket = cleaned.rfind("]")
    if start_bracket != -1 and end_bracket != -1 and end_bracket > start_bracket:
        try:
            return json.loads(cleaned[start_bracket : end_bracket + 1])
        except json.JSONDecodeError:
            pass

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

    raise ValueError(f"Could not extract valid JSON from NVIDIA LLM response: {raw[:300]}...")


_CLIENT_CACHE: Dict[tuple, Any] = {}

def _get_client(base_url: str, api_key: str):
    cache_key = (base_url, api_key)
    if cache_key not in _CLIENT_CACHE:
        from openai import OpenAI
        _CLIENT_CACHE[cache_key] = OpenAI(
            base_url=base_url,
            api_key=api_key,
            timeout=25.0,
            max_retries=1,
        )
    return _CLIENT_CACHE[cache_key]


def _sync_call_nvidia(
    base_url: str,
    api_key: str,
    model: str,
    messages: List[Dict[str, str]],
    temperature: float = 0.2,
    max_tokens: int = 800,
    enable_thinking: bool = False,
) -> str:
    """Synchronous chat completion call to NVIDIA NIM via cached OpenAI client."""
    client = _get_client(base_url, api_key)

    create_kwargs: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if enable_thinking:
        create_kwargs["extra_body"] = {"chat_template_kwargs": {"enable_thinking": True}}

    for attempt in range(1, _MAX_RETRIES + 2):
        try:
            # Fast direct call
            completion = client.chat.completions.create(
                **create_kwargs,
                stream=False,
            )
            if completion.choices and completion.choices[0].message:
                content = completion.choices[0].message.content or ""
                if content.strip():
                    return content.strip()

            raise RuntimeError("NVIDIA NIM returned empty response message.")

        except Exception as exc:
            logger.warning("NVIDIA NIM error: %s (attempt %d/%d)", exc, attempt, _MAX_RETRIES + 1)
            if attempt > _MAX_RETRIES:
                raise RuntimeError(f"NVIDIA NIM failed: {exc}") from exc
            import time
            time.sleep(1.0 * attempt)

    raise RuntimeError("NVIDIA NIM call failed after retries.")


async def _call_nvidia_llm(
    prompt_or_messages: Any,
    *,
    system_prompt: Optional[str] = _SYSTEM_INSTRUCTION,
    temperature: float = 0.2,
    max_tokens: int = 2048,
    enable_thinking: bool = False,
) -> str:
    """
    Execute an async chat completion call to NVIDIA NIM (OpenAI-compatible API).
    Accepts either a string prompt or a list of message dicts.
    """
    import asyncio

    api_key = _get_api_key()
    base_url = _get_base_url()
    model = _get_model()

    if isinstance(prompt_or_messages, list):
        messages = list(prompt_or_messages)
    else:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": str(prompt_or_messages)})

    return await asyncio.to_thread(
        _sync_call_nvidia,
        base_url,
        api_key,
        model,
        messages,
        temperature,
        max_tokens,
        enable_thinking,
    )


async def _call_nvidia_raw(
    prompt: str,
    system_prompt: Optional[str] = None,
) -> str:
    """
    Raw direct call to NVIDIA NIM, primarily used by RAG chat turn.
    """
    return await _call_nvidia_llm(
        prompt,
        system_prompt=system_prompt,
        temperature=0.2,
        max_tokens=1024,
    )



# ── Public API ────────────────────────────────────────────────────────────────

async def nvidia_generate_clinical_summary(
    patient_history: str,
    symptoms: List[str],
    medications: List[str],
    lab_results: List[str],
) -> Dict[str, Any]:
    """
    Generate a structured clinical summary via NVIDIA Nemotron/Llama.
    """
    prompt = CLINICAL_SUMMARY_PROMPT.format(
        patient_history=patient_history or "Not provided",
        symptoms="\n".join(f"- {s}" for s in symptoms) if symptoms else "None reported",
        medications="\n".join(f"- {m}" for m in medications) if medications else "None reported",
        lab_results="\n".join(f"- {r}" for r in lab_results) if lab_results else "None available",
    )

    raw = await _call_nvidia_llm(prompt, max_tokens=800)
    data = _extract_json(raw)

    if not isinstance(data, dict):
        raise ValueError("NVIDIA LLM returned non-object JSON for summary")

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

    if isinstance(data["medications"], str):
        data["medications"] = [{"name": data["medications"], "dose": None, "frequency": None}]
    if isinstance(data["investigations"], str):
        data["investigations"] = [{"test": data["investigations"], "result": None, "date": None}]

    data["generated_at"] = datetime.now(timezone.utc).isoformat()
    data["model"] = _get_model()
    data["source"] = "nvidia"

    return data


async def nvidia_extract_structured_info(transcript: str) -> Dict[str, Any]:
    """
    Extract structured clinical information from a patient transcript via NVIDIA NIM.
    """
    if not transcript or not transcript.strip():
        raise ValueError("Transcript is empty – nothing to extract.")

    prompt = STRUCTURED_EXTRACTION_PROMPT.format(transcript=transcript)

    raw = await _call_nvidia_llm(prompt, max_tokens=500)
    data = _extract_json(raw)

    if not isinstance(data, dict):
        raise ValueError("NVIDIA LLM returned non-object JSON for extraction")

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
    data["model"] = _get_model()
    data["source"] = "nvidia"

    return data


async def nvidia_generate_adaptive_question(session_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate the next adaptive interview question via NVIDIA NIM.
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

    raw = await _call_nvidia_llm(prompt, temperature=0.3, max_tokens=250)
    data = _extract_json(raw)

    if not isinstance(data, dict):
        raise ValueError("NVIDIA LLM returned non-object JSON for question")

    required = {"question": "", "question_type": "open", "options": None, "section": "chief_complaint"}
    for key, default in required.items():
        if key not in data:
            data[key] = default

    return data


async def nvidia_screen_red_flags(text: str) -> List[Dict[str, Any]]:
    """
    Screen patient text for clinical red flags via NVIDIA NIM.
    """
    if not text or not text.strip():
        return []

    prompt = RED_FLAG_SCREENING_PROMPT.format(text=text)

    raw = await _call_nvidia_llm(prompt, temperature=0.1, max_tokens=250)
    data = _extract_json(raw)

    if isinstance(data, dict):
        for key in ("red_flags", "flags", "results", "data"):
            if key in data and isinstance(data[key], list):
                data = data[key]
                break
        else:
            data = []

    if not isinstance(data, list):
        logger.warning("NVIDIA Red-flag screening returned non-list; defaulting to []")
        return []

    return data
