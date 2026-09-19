"""
ai_routes.py – FastAPI Router for AI / Gemini Endpoints
========================================================
Exposes the Gemini-powered clinical AI features via REST.

Routes:
  POST /api/ai/extract        – Extract structured info from transcript
  POST /api/ai/summarize      – Generate clinical summary
  POST /api/ai/next-question  – Generate adaptive interview question
  POST /api/ai/red-flags      – Screen text for clinical red flags

All routes return the standard MediKiosk {success, data, error, meta} envelope.

Developer 5
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter

from app.integrations.ai.ai_schemas import (
    AdaptiveQuestionRequest,
    AdaptiveQuestionResponse,
    ClinicalSummaryRequest,
    ClinicalSummaryResponse,
    ExtractedInfoResponse,
    ExtractInfoRequest,
    RedFlagItem,
    RedFlagScreenRequest,
    RedFlagScreenResponse,
)
from app.integrations.ai.llm_service import (
    extract_structured_info,
    generate_adaptive_question,
    generate_clinical_summary,
    screen_red_flags,
)
from app.utils.response import error_envelope, success_response

logger = logging.getLogger(__name__)

router = APIRouter()


# ── POST /ai/extract ─────────────────────────────────────────────────────────

@router.post(
    "/extract",
    summary="Extract structured clinical info from transcript",
    description=(
        "Sends a raw conversation transcript to Gemini and returns "
        "structured clinical data (chief complaint, symptoms, medications, "
        "allergies, red flags, etc.). Does NOT diagnose."
    ),
    response_model=None,  # we use success_response envelope
)
async def extract_info_route(body: ExtractInfoRequest):
    """POST /api/ai/extract"""
    try:
        result = await extract_structured_info(
            text=body.transcript,
            extraction_type="full_transcript",
        )

        # Validate through Pydantic model (strips unknown keys, applies defaults)
        validated = ExtractedInfoResponse(**result)

        return success_response(
            data=validated.model_dump(),
            message="Structured information extracted successfully",
        )

    except ValueError as exc:
        logger.warning("Extraction validation error: %s", exc)
        return error_envelope(
            message=str(exc),
            code="EXTRACTION_VALIDATION_ERROR",
            status_code=422,
        )
    except RuntimeError as exc:
        logger.error("Gemini API error during extraction: %s", exc)
        return error_envelope(
            message="AI service temporarily unavailable. Please try again.",
            code="AI_SERVICE_ERROR",
            status_code=503,
        )
    except Exception as exc:
        logger.exception("Unexpected error in /ai/extract")
        return error_envelope(
            message="An unexpected error occurred during extraction.",
            code="INTERNAL_ERROR",
            status_code=500,
        )


# ── POST /ai/summarize ───────────────────────────────────────────────────────

@router.post(
    "/summarize",
    summary="Generate structured clinical summary",
    description=(
        "Takes patient history, symptoms, medications, and lab results, "
        "then generates a structured clinical summary via Gemini. "
        "Does NOT diagnose or prescribe."
    ),
    response_model=None,
)
async def summarize_route(body: ClinicalSummaryRequest):
    """POST /api/ai/summarize"""
    try:
        result = await generate_clinical_summary(
            conversation_data={
                "patient_history": body.patient_history,
                "symptoms": body.symptoms,
                "medications": body.medications,
                "lab_results": body.lab_results,
            },
            documents_data=[],
        )

        validated = ClinicalSummaryResponse(**result)

        return success_response(
            data=validated.model_dump(),
            message="Clinical summary generated successfully",
        )

    except ValueError as exc:
        logger.warning("Summary validation error: %s", exc)
        return error_envelope(
            message=str(exc),
            code="SUMMARY_VALIDATION_ERROR",
            status_code=422,
        )
    except RuntimeError as exc:
        logger.error("Gemini API error during summarization: %s", exc)
        return error_envelope(
            message="AI service temporarily unavailable. Please try again.",
            code="AI_SERVICE_ERROR",
            status_code=503,
        )
    except Exception as exc:
        logger.exception("Unexpected error in /ai/summarize")
        return error_envelope(
            message="An unexpected error occurred during summarization.",
            code="INTERNAL_ERROR",
            status_code=500,
        )


# ── POST /ai/next-question ───────────────────────────────────────────────────

@router.post(
    "/next-question",
    summary="Generate adaptive interview question",
    description=(
        "Based on the conversation history and covered sections, "
        "generates the next clinically relevant question to ask the patient."
    ),
    response_model=None,
)
async def next_question_route(body: AdaptiveQuestionRequest):
    """POST /api/ai/next-question"""
    try:
        result = await generate_adaptive_question(
            session_data={
                "conversation": body.conversation,
                "covered_sections": body.covered_sections,
                "current_section": body.current_section,
            }
        )

        validated = AdaptiveQuestionResponse(**result)

        return success_response(
            data=validated.model_dump(),
            message="Adaptive question generated",
        )

    except ValueError as exc:
        logger.warning("Question generation validation error: %s", exc)
        return error_envelope(
            message=str(exc),
            code="QUESTION_VALIDATION_ERROR",
            status_code=422,
        )
    except RuntimeError as exc:
        logger.error("Gemini API error during question generation: %s", exc)
        return error_envelope(
            message="AI service temporarily unavailable. Please try again.",
            code="AI_SERVICE_ERROR",
            status_code=503,
        )
    except Exception as exc:
        logger.exception("Unexpected error in /ai/next-question")
        return error_envelope(
            message="An unexpected error occurred.",
            code="INTERNAL_ERROR",
            status_code=500,
        )


# ── POST /ai/red-flags ───────────────────────────────────────────────────────

@router.post(
    "/red-flags",
    summary="Screen patient text for clinical red flags",
    description=(
        "Analyses patient statements and identifies clinical red flags "
        "that may require urgent medical attention. "
        "Does NOT diagnose – only flags alarming symptoms."
    ),
    response_model=None,
)
async def red_flags_route(body: RedFlagScreenRequest):
    """POST /api/ai/red-flags"""
    try:
        result = await screen_red_flags(text=body.text)

        validated_flags = [
            RedFlagItem(**item) for item in result
            if isinstance(item, dict)
        ]

        model_name = getattr(settings, "NVIDIA_LLM_MODEL", None) or getattr(settings, "LLM_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")
        source_name = getattr(settings, "LLM_PROVIDER", "nvidia")

        response = RedFlagScreenResponse(
            red_flags=validated_flags,
            screened_at=datetime.now(timezone.utc).isoformat(),
            model=model_name,
            source=source_name,
        )

        return success_response(
            data=response.model_dump(),
            message="Red flag screening completed",
        )

    except ValueError as exc:
        logger.warning("Red-flag screening validation error: %s", exc)
        return error_envelope(
            message=str(exc),
            code="REDFLAGS_VALIDATION_ERROR",
            status_code=422,
        )
    except RuntimeError as exc:
        logger.error("Gemini API error during red-flag screening: %s", exc)
        return error_envelope(
            message="AI service temporarily unavailable. Please try again.",
            code="AI_SERVICE_ERROR",
            status_code=503,
        )
    except Exception as exc:
        logger.exception("Unexpected error in /ai/red-flags")
        return error_envelope(
            message="An unexpected error occurred.",
            code="INTERNAL_ERROR",
            status_code=500,
        )
