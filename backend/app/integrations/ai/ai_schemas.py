"""
ai_schemas.py – Pydantic Request/Response Schemas for AI Endpoints
===================================================================
Clean, validated models for the /api/ai/* routes.

All output models enforce the healthcare-safe contract:
no diagnosis fields, no treatment recommendations.

Developer 5
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


# ── Request Schemas ───────────────────────────────────────────────────────────

class ClinicalSummaryRequest(BaseModel):
    """Input for POST /api/ai/summarize"""

    patient_history: str = Field(
        ...,
        min_length=1,
        description="Free-text patient history narrative",
        examples=["42-year-old male presenting with chest pain for 3 days"],
    )
    symptoms: list[str] = Field(
        default_factory=list,
        description="List of reported symptoms",
        examples=[["chest pain", "shortness of breath", "fatigue"]],
    )
    medications: list[str] = Field(
        default_factory=list,
        description="List of current medications",
        examples=[["Metformin 500mg", "Amlodipine 5mg"]],
    )
    lab_results: list[str] = Field(
        default_factory=list,
        description="List of lab results / investigation findings",
        examples=[["HbA1c: 7.2%", "BP: 140/90 mmHg"]],
    )


class ExtractInfoRequest(BaseModel):
    """Input for POST /api/ai/extract"""

    transcript: str = Field(
        ...,
        min_length=10,
        description="Raw conversation transcript text",
        examples=[
            "Doctor: What brings you here today?\n"
            "Patient: I have been having headaches for the past 2 weeks. "
            "They are usually in the morning and get better by afternoon."
        ],
    )


class AdaptiveQuestionRequest(BaseModel):
    """Input for POST /api/ai/next-question"""

    conversation: list[dict] = Field(
        default_factory=list,
        description="Conversation history as list of {role, text} dicts",
    )
    covered_sections: list[str] = Field(
        default_factory=list,
        description="Sections already covered in the interview",
    )
    current_section: str = Field(
        default="chief_complaint",
        description="Section currently being explored",
    )


class RedFlagScreenRequest(BaseModel):
    """Input for POST /api/ai/red-flags"""

    text: str = Field(
        ...,
        min_length=5,
        description="Patient statement to screen for red flags",
    )


# ── Response Schemas ──────────────────────────────────────────────────────────

class MedicationItem(BaseModel):
    name: str
    dose: Optional[str] = None
    frequency: Optional[str] = None


class InvestigationItem(BaseModel):
    test: str
    result: Optional[str] = None
    date: Optional[str] = None


class ClinicalSummaryResponse(BaseModel):
    """Output of POST /api/ai/summarize"""

    chief_complaint: str = ""
    history_of_present_illness: str = ""
    past_history: str = ""
    medications: list[MedicationItem] = Field(default_factory=list)
    investigations: list[InvestigationItem] = Field(default_factory=list)
    summary: str = ""
    generated_at: str = ""
    model: str = ""
    source: str = ""


class ExtractedInfoResponse(BaseModel):
    """Output of POST /api/ai/extract"""

    chief_complaint: str = ""
    duration: str = ""
    symptoms: list[str] = Field(default_factory=list)
    past_history: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    family_history: list[str] = Field(default_factory=list)
    red_flags: list[str] = Field(default_factory=list)
    extracted_at: str = ""
    model: str = ""
    source: str = ""


class AdaptiveQuestionResponse(BaseModel):
    """Output of POST /api/ai/next-question"""

    question: str
    question_type: str = "open"
    options: Optional[list[str]] = None
    section: str = "chief_complaint"


class RedFlagItem(BaseModel):
    description: str
    severity: str = "low"
    category: str = "other"


class RedFlagScreenResponse(BaseModel):
    """Output of POST /api/ai/red-flags"""

    red_flags: list[RedFlagItem] = Field(default_factory=list)
    screened_at: str = ""
    model: str = ""
    source: str = ""
