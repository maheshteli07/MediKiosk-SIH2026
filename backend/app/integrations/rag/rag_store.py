"""
integrations/rag/rag_store.py
=============================
In-process vector and hybrid search store for MediKiosk.
Maintains session-scoped vector indexes with cosine similarity and lexical keyword scoring.
"""

from __future__ import annotations

import logging
import math
import re
from typing import Any, Dict, List, Optional, Tuple

from app.integrations.rag.rag_embedder import embed_text

logger = logging.getLogger(__name__)

# In-memory document storage:
# session_id -> list of {"id": str, "chunk": str, "embedding": list[float], "metadata": dict}
_SESSION_VECTORS: Dict[str, List[dict]] = {}


def _tokenize(text: str) -> List[str]:
    """Lowercase word tokenizer for lexical relevance."""
    return re.findall(r"\w+", text.lower())


def _lexical_similarity(query_tokens: List[str], doc_tokens: List[str]) -> float:
    """Compute normalized token overlap score between query and document."""
    if not query_tokens or not doc_tokens:
        return 0.0
    q_set = set(query_tokens)
    d_set = set(doc_tokens)
    intersection = q_set.intersection(d_set)
    if not intersection:
        return 0.0
    # Jaccard-like term overlap weighted by query match ratio
    return len(intersection) / len(q_set)


def _dot_product(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute dot product of two vectors (equivalent to cosine similarity for unit vectors)."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    return sum(a * b for a, b in zip(vec_a, vec_b))


async def index_documents(
    session_id: str,
    chunks: List[str],
    metadatas: Optional[List[Dict[str, Any]]] = None,
) -> int:
    """
    Embed and index a list of text chunks with optional metadata for a given session.

    Parameters
    ----------
    session_id : str
        Unique identifier for the consultation or case session.
    chunks : list of str
        Cleaned text snippets or document sections to index.
    metadatas : list of dict, optional
        Metadata attributes corresponding to each chunk.

    Returns
    -------
    int : Count of newly indexed chunks.
    """
    if not session_id or not chunks:
        return 0

    if session_id not in _SESSION_VECTORS:
        _SESSION_VECTORS[session_id] = []

    indexed_count = 0
    for i, chunk in enumerate(chunks):
        text = chunk.strip()
        if not text:
            continue

        meta = metadatas[i] if metadatas and i < len(metadatas) else {}
        try:
            vector = await embed_text(text, task_type="RETRIEVAL_DOCUMENT")
            _SESSION_VECTORS[session_id].append({
                "id": f"chunk_{len(_SESSION_VECTORS[session_id]) + 1}",
                "chunk": text,
                "tokens": _tokenize(text),
                "embedding": vector,
                "metadata": meta,
            })
            indexed_count += 1
        except Exception as exc:
            logger.warning("Failed to index chunk for session %s: %s", session_id, exc)

    logger.info("Indexed %d chunks for session %s (total: %d)", indexed_count, session_id, len(_SESSION_VECTORS[session_id]))
    return indexed_count


async def retrieve(
    session_id: str,
    query: str,
    top_k: int = 5,
    min_score: float = 0.0,
) -> List[str]:
    """
    Retrieve top_k most relevant text chunks for a query using hybrid dense + lexical scoring.

    Parameters
    ----------
    session_id : str
        Session identifier.
    query : str
        Patient inquiry, symptom, or question context.
    top_k : int
        Maximum number of matching chunks to return.
    min_score : float
        Minimum composite relevance score threshold.

    Returns
    -------
    List of relevant text chunks sorted by relevance descending.
    """
    results = await retrieve_with_scores(session_id, query, top_k=top_k, min_score=min_score)
    return [item["chunk"] for item in results]


async def retrieve_with_scores(
    session_id: str,
    query: str,
    top_k: int = 5,
    min_score: float = 0.0,
) -> List[Dict[str, Any]]:
    """
    Retrieve top_k matching chunks with similarity scores and metadata.
    """
    if not session_id or not query or not query.strip():
        return []

    stored_entries = _SESSION_VECTORS.get(session_id, [])
    if not stored_entries:
        return []

    query_text = query.strip()
    query_tokens = _tokenize(query_text)

    try:
        query_vector = await embed_text(query_text, task_type="RETRIEVAL_QUERY")
    except Exception as exc:
        logger.error("Failed to embed query for retrieval: %s", exc)
        query_vector = []

    scored_entries = []
    for item in stored_entries:
        dense_score = _dot_product(query_vector, item["embedding"]) if query_vector else 0.0
        lexical_score = _lexical_similarity(query_tokens, item.get("tokens", []))
        
        # Hybrid composite score: 0.6 dense + 0.4 lexical (or pure lexical if dense is 0)
        if dense_score > 0.0:
            composite_score = (0.65 * dense_score) + (0.35 * lexical_score)
        else:
            composite_score = lexical_score

        if composite_score >= min_score:
            scored_entries.append({
                "id": item.get("id"),
                "chunk": item["chunk"],
                "score": round(composite_score, 4),
                "dense_score": round(dense_score, 4),
                "lexical_score": round(lexical_score, 4),
                "metadata": item.get("metadata", {}),
            })

    # Sort descending by composite score
    scored_entries.sort(key=lambda x: x["score"], reverse=True)

    # Fallback: if no scored items pass threshold, return top items by order
    if not scored_entries and stored_entries:
        return [{
            "id": item.get("id"),
            "chunk": item["chunk"],
            "score": 0.5,
            "metadata": item.get("metadata", {}),
        } for item in stored_entries[:top_k]]

    return scored_entries[:top_k]


def get_session_chunks(session_id: str) -> List[Dict[str, Any]]:
    """Return all stored chunks for a session."""
    entries = _SESSION_VECTORS.get(session_id, [])
    return [
        {
            "id": item.get("id"),
            "chunk": item["chunk"],
            "metadata": item.get("metadata", {}),
        }
        for item in entries
    ]


def clear_session(session_id: str) -> None:
    """Evict in-memory stored vector index for a completed or terminated session."""
    if session_id in _SESSION_VECTORS:
        del _SESSION_VECTORS[session_id]
        logger.info("Cleared vector store for session %s", session_id)


def get_indexed_count(session_id: str) -> int:
    """Return count of currently indexed chunks for a session."""
    return len(_SESSION_VECTORS.get(session_id, []))
