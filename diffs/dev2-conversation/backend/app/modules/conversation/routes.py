"""
modules/conversation/routes.py – Conversation Module Endpoints
============================================================
FastAPI routes for interactive patient history intake, AI case-taking,
voice transcript streaming, and clinical summary generation.
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import get_db
from app.modules.conversation.schema import (
    CompleteConversationSchema,
    SendMessageSchema,
    StartConversationSchema,
)
from app.modules.conversation.service import (
    complete_conversation,
    get_conversation_session,
    process_message,
    start_conversation,
)
from app.utils.response import error_envelope, success_response

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/start",
    summary="Start a new conversation session",
    description="Initializes patient consultation session, indexes any uploaded records in RAG, and returns greeting.",
)
async def start_conversation_route(
    body: StartConversationSchema,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """POST /api/conversation/start"""
    try:
        result = await start_conversation(
            db=db,
            patient_id=body.patient_id,
            mode=body.mode,
            language=body.language,
            documents=body.documents,
        )
        return success_response(
            data=result,
            message="Conversation session started successfully",
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as exc:
        logger.exception("Failed to start conversation session")
        return error_envelope(
            message=f"Could not start conversation: {str(exc)}",
            code="CONVERSATION_START_FAILED",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@router.post(
    "/message",
    summary="Send a message in a conversation session",
    description="Processes patient speech/text, runs RAG context query, and returns next question + extracted entities.",
)
async def send_message_route(
    body: SendMessageSchema,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """POST /api/conversation/message"""
    try:
        result = await process_message(
            db=db,
            session_id=body.session_id,
            message=body.message,
            audio_base64=body.audio_base64,
            language=body.language or "en",
        )
        return success_response(
            data=result,
            message="Message processed successfully",
        )
    except Exception as exc:
        logger.exception("Failed to process conversation message")
        return error_envelope(
            message=f"Could not process message: {str(exc)}",
            code="MESSAGE_PROCESS_FAILED",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@router.get(
    "/{session_id}",
    summary="Fetch a conversation session",
    description="Returns session metadata, turn history, and extracted clinical items.",
)
async def get_conversation_route(
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """GET /api/conversation/{session_id}"""
    try:
        result = await get_conversation_session(db=db, session_id=session_id)
        if not result:
            return error_envelope(
                message="Conversation session not found",
                code="SESSION_NOT_FOUND",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return success_response(
            data=result,
            message="Session fetched successfully",
        )
    except Exception as exc:
        logger.exception("Failed to fetch conversation session")
        return error_envelope(
            message=f"Could not fetch session: {str(exc)}",
            code="SESSION_FETCH_FAILED",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@router.post(
    "/complete",
    summary="Complete session & generate clinical summary",
    description="Finalizes conversation, runs RAG summary generation, and stores clinical draft for doctor review.",
)
async def complete_conversation_route(
    body: CompleteConversationSchema,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """POST /api/conversation/complete"""
    try:
        result = await complete_conversation(db=db, session_id=body.session_id)
        return success_response(
            data=result,
            message="Conversation session completed and summary generated",
        )
    except Exception as exc:
        logger.exception("Failed to complete conversation session")
        return error_envelope(
            message=f"Could not complete session: {str(exc)}",
            code="SESSION_COMPLETE_FAILED",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
