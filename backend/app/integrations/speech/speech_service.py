"""
speech_service.py – Speech Integration: Main Service Interface
Developer 5

Routes speech-to-text requests to Bhashini, Whisper, or mock.
"""

from app.core.config import settings


async def transcribe_audio(audio_bytes: bytes, language: str = "en") -> dict:
    """Transcribe audio to text using the configured speech provider."""
    if settings.SPEECH_PROVIDER == "mock":
        from app.integrations.speech.mock_speech import mock_transcribe
        return await mock_transcribe(audio_bytes, language)
    elif settings.SPEECH_PROVIDER == "bhashini":
        from app.integrations.speech.bhashini_service import bhashini_transcribe
        return await bhashini_transcribe(audio_bytes, language)
    elif settings.SPEECH_PROVIDER == "whisper":
        from app.integrations.speech.whisper_service import whisper_transcribe
        return await whisper_transcribe(audio_bytes, language)
    raise ValueError(f"Unknown speech provider: {settings.SPEECH_PROVIDER}")
