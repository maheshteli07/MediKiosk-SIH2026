"""
mock_ai.py – Mock AI Service for Development
Developer 5

Simulates LLM responses for development and testing.
Returns realistic-looking mock data without calling any external API.
"""

import asyncio
from datetime import datetime


async def mock_generate_summary(conversation_data: dict, documents_data: list) -> dict:
    await asyncio.sleep(0.5)
    return {
        "chief_complaint": "Chest pain for 3 days",
        "history_of_present_illness": "Patient is a 42-year-old male presenting with dull aching chest pain for the past 3 days. Pain is 6/10 in intensity, non-radiating, worsens on exertion.",
        "past_medical_history": ["Hypertension", "Type 2 Diabetes"],
        "family_history": ["Father: Myocardial infarction at age 58"],
        "red_flags": [{"description": "Chest pain on exertion", "severity": "high", "category": "cardiac"}],
        "ai_confidence": 0.87,
        "generated_at": datetime.utcnow().isoformat(),
        "source": "mock",
    }


async def mock_extract_info(text: str, extraction_type: str) -> dict:
    await asyncio.sleep(0.3)
    return {"extraction_type": extraction_type, "extracted": {}, "source": "mock"}


async def mock_generate_question(session_data: dict) -> dict:
    await asyncio.sleep(0.2)
    return {
        "question": "Can you describe where exactly you feel the pain and does it spread anywhere?",
        "question_type": "open",
        "options": None,
        "section": "history_of_present_illness",
    }


async def mock_screen_red_flags(text: str) -> list:
    await asyncio.sleep(0.1)
    return []
