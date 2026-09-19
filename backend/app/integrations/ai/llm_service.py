"""
llm_service.py – AI Integration: LLM Service Interface
Developer 5

Abstract interface for LLM interactions.
Selects the appropriate backend (real Gemini or mock) based on settings.

When LLM_PROVIDER="gemini" (or MOCK_AI_MODE=false), routes to gemini_service.
When LLM_PROVIDER="mock" (or MOCK_AI_MODE=true), routes to mock_ai.
"""

from app.core.config import settings


def _use_mock() -> bool:
    """Determine whether to use mock AI based on settings."""
    return settings.MOCK_AI_MODE or settings.LLM_PROVIDER == "mock"


async def generate_clinical_summary(conversation_data: dict, documents_data: list) -> dict:
    """
    Generate a structured clinical summary from conversation and document data.
    Routes to real Gemini or mock based on settings.
    """
    if _use_mock():
        from app.integrations.ai.mock_ai import mock_generate_summary
        return await mock_generate_summary(conversation_data, documents_data)

    from app.integrations.ai.gemini_service import gemini_generate_clinical_summary
    return await gemini_generate_clinical_summary(
        patient_history=conversation_data.get("patient_history", ""),
        symptoms=conversation_data.get("symptoms", []),
        medications=conversation_data.get("medications", []),
        lab_results=conversation_data.get("lab_results", []),
    )


async def extract_structured_info(text: str, extraction_type: str) -> dict:
    """Extract structured clinical information from free text using LLM."""
    if _use_mock():
        from app.integrations.ai.mock_ai import mock_extract_info
        return await mock_extract_info(text, extraction_type)

    from app.integrations.ai.gemini_service import gemini_extract_structured_info
    return await gemini_extract_structured_info(transcript=text)


async def generate_adaptive_question(session_data: dict) -> dict:
    """Generate the next adaptive question for the conversation."""
    if _use_mock():
        from app.integrations.ai.mock_ai import mock_generate_question
        return await mock_generate_question(session_data)

    from app.integrations.ai.gemini_service import gemini_generate_adaptive_question
    return await gemini_generate_adaptive_question(session_data)


async def screen_red_flags(text: str) -> list:
    """Screen text for clinical red flags and emergency indicators."""
    if _use_mock():
        from app.integrations.ai.mock_ai import mock_screen_red_flags
        return await mock_screen_red_flags(text)

    from app.integrations.ai.gemini_service import gemini_screen_red_flags
    return await gemini_screen_red_flags(text)
