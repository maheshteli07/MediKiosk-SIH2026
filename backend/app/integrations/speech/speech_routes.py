"""
speech_routes.py – FastAPI Router for Speech-to-Text Endpoints
==============================================================
Exposes speech-to-text endpoints supporting audio file uploads (multipart)
or base64 encoded audio payloads.
"""

from __future__ import annotations

import base64
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.integrations.speech.speech_service import transcribe_audio
from app.utils.response import error_envelope, success_response

logger = logging.getLogger(__name__)

router = APIRouter()


class Base64TranscribeRequest(BaseModel):
    audio_base64: str
    language: str = "en"


@router.post(
    "/transcribe",
    summary="Transcribe audio to text",
    description=(
        "Accepts an audio file (WAV, WebM, MP3, OGG) via multipart/form-data "
        "and transcribes it to text using NVIDIA Speech AI / Riva Whisper."
    ),
)
async def transcribe_audio_file(
    file: UploadFile = File(...),
    language: str = Form("en"),
):
    """POST /api/speech/transcribe (multipart file upload)"""
    try:
        audio_bytes = await file.read()
        if not audio_bytes:
            return error_envelope(
                message="Uploaded audio file is empty.",
                code="EMPTY_AUDIO_FILE",
                status_code=400,
            )

        result = await transcribe_audio(audio_bytes, language=language)
        return success_response(
            data=result,
            message="Speech transcribed successfully",
        )

    except ValueError as exc:
        logger.warning("Transcription parameter error: %s", exc)
        return error_envelope(
            message=str(exc),
            code="SPEECH_TRANSCRIPTION_ERROR",
            status_code=422,
        )
    except Exception as exc:
        logger.exception("Unexpected error in /speech/transcribe: %s", exc)
        return error_envelope(
            message=f"Speech transcription failed: {exc}",
            code="SPEECH_SERVICE_ERROR",
            status_code=500,
        )


@router.post(
    "/transcribe-base64",
    summary="Transcribe base64-encoded audio",
    description="Accepts base64-encoded audio payload for quick JSON client calls.",
)
async def transcribe_audio_base64(body: Base64TranscribeRequest):
    """POST /api/speech/transcribe-base64"""
    try:
        # Strip data URL prefix if present (e.g. data:audio/webm;base64,...)
        payload = body.audio_base64
        if "," in payload:
            payload = payload.split(",", 1)[1]

        audio_bytes = base64.b64decode(payload)
        if not audio_bytes:
            return error_envelope(
                message="Decoded audio data is empty.",
                code="EMPTY_AUDIO_DATA",
                status_code=400,
            )

        result = await transcribe_audio(audio_bytes, language=body.language)
        return success_response(
            data=result,
            message="Speech transcribed successfully",
        )

    except Exception as exc:
        logger.exception("Error in /speech/transcribe-base64: %s", exc)
        return error_envelope(
            message=f"Speech transcription failed: {exc}",
            code="SPEECH_SERVICE_ERROR",
            status_code=500,
        )
