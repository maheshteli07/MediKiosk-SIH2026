"""
mock_speech.py – Mock Speech Service for Development
Developer 5
"""

import asyncio


async def mock_transcribe(audio_bytes: bytes, language: str) -> dict:
    await asyncio.sleep(0.5)
    return {
        "transcript": "I have been having chest pain for the last three days.",
        "language": language,
        "confidence": 0.93,
        "provider": "mock",
        "duration_seconds": 4.2,
    }
