"""
nvidia_speech_service.py – NVIDIA Speech-to-Text Integration
============================================================
Integrates with NVIDIA NIM / Riva ASR (Whisper Large V3 / Parakeet)
via NVCF gRPC (grpc.nvcf.nvidia.com:443) using the NVIDIA API Key.
"""

from __future__ import annotations

import asyncio
import io
import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)

# Regional language mapping to Riva BCP-47 language codes
LANGUAGE_MAP = {
    "en": "en-US",
    "hi": "hi-IN",
    "mr": "mr-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "kn": "kn-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "pa": "pa-IN",
    "ur": "ur-IN",
}


def _prepare_audio_pcm_wav(audio_bytes: bytes) -> tuple[bytes, float]:
    """
    Ensures the audio bytes are formatted as 16kHz 16-bit mono PCM WAV,
    which is optimal for NVIDIA Riva / Whisper recognition.
    Returns (pcm_wav_bytes, duration_seconds).
    """
    import wave

    # Fast path: check if already compliant 16kHz 16-bit mono PCM WAV
    try:
        with io.BytesIO(audio_bytes) as in_buf:
            with wave.open(in_buf, "rb") as w:
                if w.getnchannels() == 1 and w.getframerate() == 16000 and w.getsampwidth() == 2:
                    duration = float(w.getnframes()) / 16000.0
                    return audio_bytes, duration
    except Exception:
        pass

    try:
        import soundfile as sf
        import numpy as np

        with io.BytesIO(audio_bytes) as in_buf:
            data, sr = sf.read(in_buf)

        # Convert to mono if multichannel
        if data.ndim > 1:
            data = np.mean(data, axis=1)

        duration = float(len(data)) / float(sr) if sr > 0 else 0.0

        # Resample to 16000 Hz if needed
        if sr != 16000:
            import scipy.signal
            target_samples = int(len(data) * 16000 / sr)
            data = scipy.signal.resample(data, target_samples)

        out_buf = io.BytesIO()
        sf.write(out_buf, data, 16000, format="WAV", subtype="PCM_16")
        return out_buf.getvalue(), duration

    except Exception as exc:
        logger.warning("Audio conversion failed: %s. Using raw bytes directly.", exc)
        return audio_bytes, 0.0



def _sync_nvidia_transcribe(audio_bytes: bytes, language: str) -> dict[str, Any]:
    """Synchronous Riva client call to be run in a worker thread."""
    import riva.client

    api_key = settings.NVIDIA_API_KEY
    server_uri = settings.NVIDIA_RIVA_SERVER
    function_id = settings.NVIDIA_FUNCTION_ID

    if not api_key:
        raise ValueError("NVIDIA_API_KEY is not configured in backend settings.")

    # Normalise language code
    lang_code = LANGUAGE_MAP.get(language.lower(), language)
    if "-" not in lang_code:
        lang_code = f"{lang_code}-IN" if lang_code != "en" else "en-US"

    # Pre-process audio into 16kHz mono PCM WAV
    wav_bytes, duration = _prepare_audio_pcm_wav(audio_bytes)

    logger.info(
        "Invoking NVIDIA Riva ASR (server=%s, function_id=%s, lang=%s, bytes=%d)",
        server_uri, function_id, lang_code, len(wav_bytes)
    )

    auth = riva.client.Auth(
        uri=server_uri,
        use_ssl=True,
        metadata_args=[
            ["function-id", function_id],
            ["authorization", f"Bearer {api_key}"],
        ],
    )

    asr_service = riva.client.ASRService(auth)
    config = riva.client.RecognitionConfig(
        language_code=lang_code,
        max_alternatives=1,
        enable_automatic_punctuation=True,
    )

    response = asr_service.offline_recognize(wav_bytes, config)

    transcripts = []
    total_confidence = 0.0
    alt_count = 0

    for result in response.results:
        for alt in result.alternatives:
            if alt.transcript:
                transcripts.append(alt.transcript.strip())
                if alt.confidence > 0:
                    total_confidence += alt.confidence
                    alt_count += 1

    transcript_text = " ".join(transcripts).strip()
    avg_confidence = round(total_confidence / alt_count, 2) if alt_count > 0 else 0.95

    return {
        "transcript": transcript_text,
        "language": language,
        "language_code": lang_code,
        "confidence": avg_confidence,
        "provider": "nvidia",
        "duration_seconds": round(duration, 2),
    }


async def nvidia_transcribe(audio_bytes: bytes, language: str = "en") -> dict[str, Any]:
    """
    Transcribe audio bytes using NVIDIA Riva / Whisper NIM asynchronously.
    """
    return await asyncio.to_thread(_sync_nvidia_transcribe, audio_bytes, language)
