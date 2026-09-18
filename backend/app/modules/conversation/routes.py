"""routes.py - Conversation Module Routes - Developer 2"""
from fastapi import APIRouter, Depends
from app.core.dependencies import get_db
router = APIRouter()

@router.post("/start")
async def start_conversation(db=Depends(get_db)):
    raise NotImplementedError

@router.post("/message")
async def send_message(db=Depends(get_db)):
    raise NotImplementedError

@router.get("/{session_id}")
async def get_conversation(session_id: str, db=Depends(get_db)):
    raise NotImplementedError

@router.post("/complete")
async def complete_conversation(db=Depends(get_db)):
    raise NotImplementedError
