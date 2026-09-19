"""
llm_service.py – AI Integration: LLM Service Interface
======================================================
Unified interface for LLM interactions.
Selects the appropriate backend (NVIDIA NIM, Gemini, Ollama, or mock) based on
a live health-check that runs once at startup.

Auto-Fallback Order:
  1. NVIDIA NIM  — if NVIDIA_API_KEY is set and endpoint responds in < 8s
  2. Gemini      — if GEMINI_API_KEY is set and endpoint responds in < 10s
  3. Ollama      — if Ollama is running locally (http://localhost:11434)
  4. Mock        — always works, returns canned responses

Manual override: set LLM_PROVIDER=nvidia|gemini|ollama|mock in .env to skip
auto-detection and force a specific backend.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Runtime-resolved provider (cached after first health check) ──────────────
_resolved_provider: Optional[str] = None   # "nvidia" | "gemini" | "ollama" | "mock"
_provider_lock = asyncio.Lock()


# ── Health checks ─────────────────────────────────────────────────────────────

async def _check_nvidia(timeout: float = 8.0) -> bool:
    """Return True if NVIDIA NIM responds within timeout."""
    key = settings.NVIDIA_API_KEY or settings.LLM_API_KEY
    if not key:
        return False
    url = f"{settings.NVIDIA_LLM_BASE_URL.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.NVIDIA_LLM_MODEL,
        "messages": [{"role": "user", "content": "ping"}],
        "max_tokens": 5,
        "stream": False,
    }
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                url,
                json=payload,
                headers={"Authorization": f"Bearer {key}"},
            )
        ok = resp.status_code == 200
        if ok:
            logger.info("[LLM-Router] NVIDIA NIM responded OK (status 200)")
        else:
            logger.warning("[LLM-Router] NVIDIA NIM returned HTTP %d", resp.status_code)
        return ok
    except Exception as exc:
        logger.warning("[LLM-Router] NVIDIA NIM check failed: %s", exc)
        return False


async def _check_gemini(timeout: float = 10.0) -> bool:
    """Return True if Gemini API key is valid and responds within timeout."""
    key = settings.GEMINI_API_KEY
    if not key:
        return False
    model = settings.GEMINI_MODEL or "gemini-2.5-flash"
    url = (
        f"https://generativelanguage.googleapis.com/v1beta"
        f"/models/{model}:generateContent?key={key}"
    )
    payload = {
        "contents": [{"parts": [{"text": "ping"}]}],
        "generationConfig": {"maxOutputTokens": 5},
    }
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, json=payload)
        ok = resp.status_code == 200
        if ok:
            logger.info("[LLM-Router] Gemini responded OK (status 200)")
        else:
            logger.warning("[LLM-Router] Gemini returned HTTP %d", resp.status_code)
        return ok
    except Exception as exc:
        logger.warning("[LLM-Router] Gemini check failed: %s", exc)
        return False


async def _check_ollama(timeout: float = 5.0) -> bool:
    """Return True if Ollama is running locally."""
    base = settings.OLLAMA_BASE_URL if hasattr(settings, "OLLAMA_BASE_URL") else "http://localhost:11434"
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(f"{base}/api/tags")
        ok = resp.status_code == 200
        if ok:
            models = [m.get("name", "") for m in resp.json().get("models", [])]
            logger.info("[LLM-Router] Ollama available, models: %s", models)
        return ok
    except Exception as exc:
        logger.warning("[LLM-Router] Ollama check failed: %s", exc)
        return False


# ── Provider resolution ───────────────────────────────────────────────────────

async def resolve_provider() -> str:
    """
    Determine the best available LLM provider.
    Result is cached globally after the first call.

    Priority: nvidia > gemini > ollama > mock
    Manual override via LLM_PROVIDER env var skips auto-detection.
    """
    global _resolved_provider

    if _resolved_provider is not None:
        return _resolved_provider

    async with _provider_lock:
        # Double-checked locking
        if _resolved_provider is not None:
            return _resolved_provider

        # Manual override?
        manual = settings.LLM_PROVIDER.lower() if settings.LLM_PROVIDER else ""
        if manual in ("mock",) or settings.MOCK_AI_MODE:
            _resolved_provider = "mock"
            logger.info("[LLM-Router] Provider forced to MOCK")
            return _resolved_provider

        if manual == "nvidia":
            logger.info("[LLM-Router] Provider forced to NVIDIA NIM (no health check)")
            _resolved_provider = "nvidia"
            return _resolved_provider

        if manual == "gemini":
            logger.info("[LLM-Router] Provider forced to Gemini (no health check)")
            _resolved_provider = "gemini"
            return _resolved_provider

        if manual == "ollama":
            logger.info("[LLM-Router] Provider forced to Ollama (no health check)")
            _resolved_provider = "ollama"
            return _resolved_provider

        # Auto-detect: run all health checks concurrently
        logger.info("[LLM-Router] Auto-detecting best available LLM provider...")
        nvidia_ok, gemini_ok, ollama_ok = await asyncio.gather(
            _check_nvidia(),
            _check_gemini(),
            _check_ollama(),
        )

        if nvidia_ok:
            _resolved_provider = "nvidia"
        elif gemini_ok:
            _resolved_provider = "gemini"
        elif ollama_ok:
            _resolved_provider = "ollama"
        else:
            _resolved_provider = "mock"

        logger.info(
            "[LLM-Router] Auto-selected provider: %s  "
            "(nvidia=%s, gemini=%s, ollama=%s)",
            _resolved_provider.upper(),
            nvidia_ok, gemini_ok, ollama_ok,
        )
        return _resolved_provider


def reset_provider_cache() -> None:
    """Force re-detection on next call (useful for testing / hot-reload)."""
    global _resolved_provider
    _resolved_provider = None


# ── Legacy helpers (kept for backward compat) ─────────────────────────────────

def _use_mock() -> bool:
    """Determine whether to use mock AI based on settings."""
    return settings.MOCK_AI_MODE or settings.LLM_PROVIDER == "mock"


def _is_nvidia() -> bool:
    """Determine whether to use NVIDIA NIM LLM (static check, no ping)."""
    if _use_mock():
        return False
    return (
        settings.LLM_PROVIDER.lower() == "nvidia"
        or (bool(settings.NVIDIA_API_KEY) and settings.LLM_PROVIDER.lower() not in ("gemini", "ollama"))
    )


# ── Routing helpers ───────────────────────────────────────────────────────────

async def _get_provider() -> str:
    """Return the active provider, auto-resolving if needed."""
    if _use_mock():
        return "mock"
    # If already resolved, return immediately (no I/O cost)
    if _resolved_provider is not None:
        return _resolved_provider
    return await resolve_provider()


# ── Public API ────────────────────────────────────────────────────────────────

async def generate_clinical_summary(conversation_data: dict, documents_data: list) -> dict:
    """
    Generate a structured clinical summary from conversation and document data.
    Routes to best available provider: NVIDIA NIM -> Gemini -> Ollama -> Mock.
    """
    provider = await _get_provider()

    if provider == "mock":
        from app.integrations.ai.mock_ai import mock_generate_summary
        return await mock_generate_summary(conversation_data, documents_data)

    if provider == "nvidia":
        try:
            from app.integrations.ai.nvidia_llm_service import nvidia_generate_clinical_summary
            return await nvidia_generate_clinical_summary(
                patient_history=conversation_data.get("patient_history", ""),
                symptoms=conversation_data.get("symptoms", []),
                medications=conversation_data.get("medications", []),
                lab_results=conversation_data.get("lab_results", []),
            )
        except Exception as exc:
            logger.warning("[LLM-Router] NVIDIA failed, falling back: %s", exc)
            reset_provider_cache()

    if provider in ("gemini", "nvidia"):  # nvidia fell through
        try:
            from app.integrations.ai.gemini_service import gemini_generate_clinical_summary
            return await gemini_generate_clinical_summary(
                patient_history=conversation_data.get("patient_history", ""),
                symptoms=conversation_data.get("symptoms", []),
                medications=conversation_data.get("medications", []),
                lab_results=conversation_data.get("lab_results", []),
            )
        except Exception as exc:
            logger.warning("[LLM-Router] Gemini failed, falling back: %s", exc)

    if provider in ("ollama", "nvidia", "gemini"):
        try:
            from app.integrations.ai.ollama_service import ollama_generate_clinical_summary
            return await ollama_generate_clinical_summary(
                patient_history=conversation_data.get("patient_history", ""),
                symptoms=conversation_data.get("symptoms", []),
                medications=conversation_data.get("medications", []),
                lab_results=conversation_data.get("lab_results", []),
            )
        except Exception as exc:
            logger.warning("[LLM-Router] Ollama failed, using mock: %s", exc)

    from app.integrations.ai.mock_ai import mock_generate_summary
    return await mock_generate_summary(conversation_data, documents_data)


async def extract_structured_info(text: str, extraction_type: str = "patient_turn") -> dict:
    """Extract structured clinical information from free text using LLM."""
    provider = await _get_provider()

    if provider == "mock":
        from app.integrations.ai.mock_ai import mock_extract_info
        return await mock_extract_info(text, extraction_type)

    if provider == "nvidia":
        try:
            from app.integrations.ai.nvidia_llm_service import nvidia_extract_structured_info
            return await nvidia_extract_structured_info(transcript=text)
        except Exception as exc:
            logger.warning("[LLM-Router] NVIDIA extract failed, falling back: %s", exc)
            reset_provider_cache()

    if provider in ("gemini", "nvidia"):
        try:
            from app.integrations.ai.gemini_service import gemini_extract_structured_info
            return await gemini_extract_structured_info(transcript=text)
        except Exception as exc:
            logger.warning("[LLM-Router] Gemini extract failed: %s", exc)

    if provider in ("ollama", "nvidia", "gemini"):
        try:
            from app.integrations.ai.ollama_service import ollama_extract_structured_info
            return await ollama_extract_structured_info(transcript=text)
        except Exception as exc:
            logger.warning("[LLM-Router] Ollama extract failed, using mock: %s", exc)

    from app.integrations.ai.mock_ai import mock_extract_info
    return await mock_extract_info(text, extraction_type)


async def generate_adaptive_question(session_data: dict) -> dict:
    """Generate the next adaptive question for the conversation."""
    provider = await _get_provider()

    if provider == "mock":
        from app.integrations.ai.mock_ai import mock_generate_question
        return await mock_generate_question(session_data)

    if provider == "nvidia":
        try:
            from app.integrations.ai.nvidia_llm_service import nvidia_generate_adaptive_question
            return await nvidia_generate_adaptive_question(session_data)
        except Exception as exc:
            logger.warning("[LLM-Router] NVIDIA question failed, falling back: %s", exc)
            reset_provider_cache()

    if provider in ("gemini", "nvidia"):
        try:
            from app.integrations.ai.gemini_service import gemini_generate_adaptive_question
            return await gemini_generate_adaptive_question(session_data)
        except Exception as exc:
            logger.warning("[LLM-Router] Gemini question failed: %s", exc)

    if provider in ("ollama", "nvidia", "gemini"):
        try:
            from app.integrations.ai.ollama_service import ollama_generate_adaptive_question
            return await ollama_generate_adaptive_question(session_data)
        except Exception as exc:
            logger.warning("[LLM-Router] Ollama question failed, using mock: %s", exc)

    from app.integrations.ai.mock_ai import mock_generate_question
    return await mock_generate_question(session_data)


async def screen_red_flags(text: str) -> list:
    """Screen text for clinical red flags and emergency indicators."""
    provider = await _get_provider()

    if provider == "mock":
        from app.integrations.ai.mock_ai import mock_screen_red_flags
        return await mock_screen_red_flags(text)

    if provider == "nvidia":
        try:
            from app.integrations.ai.nvidia_llm_service import nvidia_screen_red_flags
            return await nvidia_screen_red_flags(text)
        except Exception as exc:
            logger.warning("[LLM-Router] NVIDIA red flags failed, falling back: %s", exc)
            reset_provider_cache()

    if provider in ("gemini", "nvidia"):
        try:
            from app.integrations.ai.gemini_service import gemini_screen_red_flags
            return await gemini_screen_red_flags(text)
        except Exception as exc:
            logger.warning("[LLM-Router] Gemini red flags failed: %s", exc)

    if provider in ("ollama", "nvidia", "gemini"):
        try:
            from app.integrations.ai.ollama_service import ollama_screen_red_flags
            return await ollama_screen_red_flags(text)
        except Exception as exc:
            logger.warning("[LLM-Router] Ollama red flags failed, using mock: %s", exc)

    from app.integrations.ai.mock_ai import mock_screen_red_flags
    return await mock_screen_red_flags(text)
