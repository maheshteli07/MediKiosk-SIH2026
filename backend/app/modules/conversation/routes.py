"""
modules/conversation/routes.py – Conversation Module Routes
============================================================
Developer 2 owns implementation.  Stub endpoints return HTTP 501.

Endpoints
---------
  POST /api/conversation/start           – Start a session
  POST /api/conversation/message         – Send a message in a session
  GET  /api/conversation/{session_id}    – Fetch a session
  POST /api/conversation/complete        – Complete a session & generate summary
"""

from fastapi import APIRouter, Depends
from app.core.dependencies import get_db
from app.utils.response import error_envelope

router = APIRouter()

_NOT_IMPL = error_envelope("Not yet implemented", code="NOT_IMPLEMENTED", status_code=501)


@router.post("/start", summary="Start a conversation session")
async def start_conversation(db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/message", summary="Send a message in a session")
async def send_message(db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/{session_id}", summary="Fetch a conversation session")
async def get_conversation(session_id: str, db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/complete", summary="Complete session & trigger summary generation")
async def complete_conversation(db=Depends(get_db)):
    return _NOT_IMPL
