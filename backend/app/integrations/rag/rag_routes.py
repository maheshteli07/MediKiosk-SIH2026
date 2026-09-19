"""
integrations/rag/rag_routes.py
==============================
FastAPI router for direct RAG operations:
- Document indexing & vector storage
- Semantic & hybrid retrieval with similarity scores
- Session vector lifecycle management
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.integrations.rag.rag_service import index_session_documents
from app.integrations.rag.rag_store import (
    clear_session,
    get_indexed_count,
    get_session_chunks,
    retrieve_with_scores,
)
from app.utils.response import error_envelope, success_response

logger = logging.getLogger(__name__)

router = APIRouter()


class IndexDocumentsRequest(BaseModel):
    session_id: str = Field(..., description="Session identifier")
    documents: List[Any] = Field(..., description="List of raw strings or document objects with ocr_text/summary")


class QueryRAGRequest(BaseModel):
    session_id: str = Field(..., description="Session identifier")
    query: str = Field(..., description="Search query or clinical symptom context")
    top_k: int = Field(default=5, description="Number of results to retrieve")
    min_score: float = Field(default=0.0, description="Minimum relevance score")


@router.post(
    "/index",
    summary="Index documents into RAG vector store",
    description="Chunks and embeds medical records/OCR extractions into the session vector store.",
)
async def index_rag_documents(body: IndexDocumentsRequest):
    """POST /api/rag/index"""
    try:
        count = await index_session_documents(
            session_id=body.session_id,
            documents=body.documents,
        )
        return success_response(
            data={
                "session_id": body.session_id,
                "indexed_chunks": count,
                "total_session_chunks": get_indexed_count(body.session_id),
            },
            message=f"Successfully indexed {count} chunks for session {body.session_id}",
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as exc:
        logger.exception("Failed to index RAG documents")
        return error_envelope(
            message=f"Failed to index documents: {str(exc)}",
            code="RAG_INDEX_ERROR",
            status_code=500,
        )


@router.post(
    "/query",
    summary="Query RAG vector store",
    description="Performs hybrid similarity retrieval against indexed patient records.",
)
async def query_rag_store(body: QueryRAGRequest):
    """POST /api/rag/query"""
    try:
        results = await retrieve_with_scores(
            session_id=body.session_id,
            query=body.query,
            top_k=body.top_k,
            min_score=body.min_score,
        )
        return success_response(
            data={
                "session_id": body.session_id,
                "query": body.query,
                "match_count": len(results),
                "results": results,
            },
            message="RAG query executed successfully",
        )
    except Exception as exc:
        logger.exception("Failed to query RAG store")
        return error_envelope(
            message=f"Failed to query RAG store: {str(exc)}",
            code="RAG_QUERY_ERROR",
            status_code=500,
        )


@router.get(
    "/session/{session_id}",
    summary="Get RAG session status & chunks",
    description="Returns metadata and indexed chunks for an active session.",
)
async def get_rag_session_info(session_id: str):
    """GET /api/rag/session/{session_id}"""
    chunks = get_session_chunks(session_id)
    return success_response(
        data={
            "session_id": session_id,
            "chunk_count": len(chunks),
            "chunks": chunks,
        },
        message="RAG session info retrieved",
    )


@router.delete(
    "/session/{session_id}",
    summary="Clear RAG session index",
    description="Evicts in-memory vector store for the session.",
)
async def clear_rag_session(session_id: str):
    """DELETE /api/rag/session/{session_id}"""
    clear_session(session_id)
    return success_response(
        data={"session_id": session_id, "status": "cleared"},
        message=f"RAG index cleared for session {session_id}",
    )
