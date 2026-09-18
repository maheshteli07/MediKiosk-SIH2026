"""
llm_service.py – AI Integration: LLM Service Interface
Developer 5

Abstract interface for LLM interactions.
Selects the appropriate backend (real or mock) based on settings.
"""

from app.core.config import settings


async def generate_clinical_summary(conversation_data: dict, documents_data: list) -> dict:
    """
    Generate a structured clinical summary from conversation and document data.
    Routes to real LLM or mock based on LLM_PROVIDER setting.
    """
    if settings.LLM_PROVIDER == "mock":
        from app.integrations.ai.mock_ai import mock_generate_summary
        return await mock_generate_summary(conversation_data, documents_data)
    # TODO: Implement real LLM call
    raise NotImplementedError


async def extract_structured_info(text: str, extraction_type: str) -> dict:
    """Extract structured clinical information from free text using LLM."""
    if settings.LLM_PROVIDER == "mock":
        from app.integrations.ai.mock_ai import mock_extract_info
        return await mock_extract_info(text, extraction_type)
    # TODO: Implement real LLM extraction
    raise NotImplementedError


async def generate_adaptive_question(session_data: dict) -> dict:
    """Generate the next adaptive question for the conversation."""
    if settings.LLM_PROVIDER == "mock":
        from app.integrations.ai.mock_ai import mock_generate_question
        return await mock_generate_question(session_data)
    # TODO: Implement real adaptive question generation
    raise NotImplementedError


async def screen_red_flags(text: str) -> list:
    """Screen text for clinical red flags and emergency indicators."""
    if settings.LLM_PROVIDER == "mock":
        from app.integrations.ai.mock_ai import mock_screen_red_flags
        return await mock_screen_red_flags(text)
    # TODO: Implement real red-flag screening
    raise NotImplementedError
