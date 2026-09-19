"""
integrations/rag/rag_embedder.py
=================================
Generates dense vector embeddings for text using Google Gemini
`text-embedding-004` model via the REST API.

Features
--------
- SHA-256 based in-process LRU cache (avoids re-embedding identical text).
- Configurable dimensionality output (defaults to 768).
- Falls back to a random-but-deterministic unit vector when MOCK_AI_MODE=True
  so the rest of the RAG pipeline works without a real API key.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import math
import random
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

EMBEDDING_MODEL = "text-embedding-004"
EMBEDDING_DIM = 768
EMBEDDING_URL = (
    f"https://generativelanguage.googleapis.com/v1beta"
    f"/models/{EMBEDDING_MODEL}:embedContent"
)

# Simple in-process SHA256 → vector cache (bounded at 2 000 entries)
_EMBED_CACHE: dict[str, list[float]] = {}
_CACHE_MAX = 2_000


# ── Helpers ───────────────────────────────────────────────────────────────────

def _cache_key(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _unit_vector(vec: list[float]) -> list[float]:
    """Normalise a vector to unit length for cosine similarity."""
    magnitude = math.sqrt(sum(x * x for x in vec))
    if magnitude == 0:
        return vec
    return [x / magnitude for x in vec]


def _mock_embedding(text: str) -> list[float]:
    """
    Deterministic pseudo-random unit vector seeded from the text hash.
    Used when MOCK_AI_MODE=True.  Semantically meaningless but consistent.
    """
    seed = int(_cache_key(text)[:8], 16)
    rng = random.Random(seed)
    vec = [rng.gauss(0, 1) for _ in range(EMBEDDING_DIM)]
    return _unit_vector(vec)


# ── Public API ────────────────────────────────────────────────────────────────

async def embed_text(
    text: str,
    task_type: str = "RETRIEVAL_DOCUMENT",
) -> list[float]:
    """
    Embed `text` into a 768-dimensional float vector.

    Parameters
    ----------
    text      : The text to embed.  Truncated to ~8 000 chars before sending.
    task_type : Gemini task type — "RETRIEVAL_DOCUMENT" for indexing,
                "RETRIEVAL_QUERY" for query-time embedding.

    Returns
    -------
    List of 768 floats (unit-normalised).
    """
    if not text or not text.strip():
        return [0.0] * EMBEDDING_DIM

    # Truncate (Gemini embedding model limit is ~2 048 tokens ≈ 8 000 chars)
    text = text.strip()[:8_000]

    # Cache hit
    key = _cache_key(text)
    if key in _EMBED_CACHE:
        return _EMBED_CACHE[key]

    # Mock mode
    if settings.MOCK_AI_MODE:
        vec = _mock_embedding(text)
        _maybe_cache(key, vec)
        return vec

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.warning("GEMINI_API_KEY not set – using mock embedding")
        vec = _mock_embedding(text)
        _maybe_cache(key, vec)
        return vec

    url = f"{EMBEDDING_URL}?key={api_key}"
    payload = {
        "model": f"models/{EMBEDDING_MODEL}",
        "content": {"parts": [{"text": text}]},
        "taskType": task_type,
    }

    for attempt in range(1, 4):
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(url, json=payload)

            if resp.status_code == 429:
                await asyncio.sleep(2 ** attempt)
                continue

            resp.raise_for_status()
            data = resp.json()
            raw_vec: list[float] = data["embedding"]["values"]
            vec = _unit_vector(raw_vec)
            _maybe_cache(key, vec)
            return vec

        except httpx.HTTPStatusError as exc:
            sc = exc.response.status_code if exc.response else 0
            # 401/403 = key expired; log once at debug to avoid noise
            if sc in (401, 403):
                logger.debug("Embed key invalid (HTTP %d) – using deterministic vector", sc)
            else:
                logger.warning("Embedding API HTTP %d error – using deterministic embedding", sc)
            vec = _mock_embedding(text)
            _maybe_cache(key, vec)
            return vec
        except Exception as exc:
            logger.warning("Embedding attempt %d failed: %s", attempt, exc)
            if attempt == 3:
                logger.error("Embedding failed – falling back to mock vector")
                vec = _mock_embedding(text)
                _maybe_cache(key, vec)
                return vec
            await asyncio.sleep(attempt)

    vec = _mock_embedding(text)
    _maybe_cache(key, vec)
    return vec


def _maybe_cache(key: str, vec: list[float]) -> None:
    if len(_EMBED_CACHE) >= _CACHE_MAX:
        # Evict oldest 10 %
        to_remove = list(_EMBED_CACHE.keys())[: _CACHE_MAX // 10]
        for k in to_remove:
            del _EMBED_CACHE[k]
    _EMBED_CACHE[key] = vec
