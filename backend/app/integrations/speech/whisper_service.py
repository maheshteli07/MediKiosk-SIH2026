"""
whisper_service.py – OpenAI Whisper Fallback STT
Developer 5

Uses OpenAI Whisper as a fallback for speech-to-text.
"""


async def whisper_transcribe(audio_bytes: bytes, language: str) -> dict:
    """Transcribe audio using OpenAI Whisper."""
    # TODO: Implement Whisper API or local model integration
    raise NotImplementedError("Whisper integration not yet implemented.")
