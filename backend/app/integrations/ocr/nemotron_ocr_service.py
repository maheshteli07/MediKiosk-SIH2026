"""
nemotron_ocr_service.py – NVIDIA Nemotron-OCR-v2 Integration
============================================================
Calls NVIDIA's hosted Nemotron-OCR-v2 NIM microservice at
https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v2
for state-of-the-art multilingual document and prescription extraction.
"""

from __future__ import annotations

import base64
import logging
from typing import Any, Dict, List

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

DEFAULT_OCR_URL = "https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v2"


def _get_ocr_api_key() -> str:
    """Get the OCR API key from settings or fallback."""
    key = getattr(settings, "nvidia_ocr_api_key", "") or settings.NVIDIA_API_KEY
    if not key:
        raise ValueError("NVIDIA OCR API key is not configured in settings (.env)")
    return key


def _get_ocr_url() -> str:
    return getattr(settings, "nvidia_ocr_url", "") or DEFAULT_OCR_URL


async def nemotron_extract_text(image_bytes: bytes, language: str = "en") -> Dict[str, Any]:
    """
    Extract text from image bytes using NVIDIA Nemotron-OCR-v2.

    Parameters
    ----------
    image_bytes : bytes
        Raw bytes of PNG, JPEG, or other image format.
    language : str
        Language hint (e.g. 'en', 'hi').

    Returns
    -------
    dict with extracted text, lines, confidence, and metadata.
    """
    if not image_bytes:
        return {"text": "", "lines": [], "confidence": 0.0, "provider": "nemotron-ocr-v2"}

    api_key = _get_ocr_api_key()
    endpoint = _get_ocr_url()

    # Detect mime type or default to image/png / image/jpeg
    mime_type = "image/png"
    if image_bytes.startswith(b"\xff\xd8"):
        mime_type = "image/jpeg"
    elif image_bytes.startswith(b"%PDF"):
        mime_type = "application/pdf"

    b64_str = base64.b64encode(image_bytes).decode("utf-8")
    data_uri = f"data:{mime_type};base64,{b64_str}"

    payload = {
        "input": [
            {
                "type": "image_url",
                "url": data_uri,
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(endpoint, json=payload, headers=headers)
            resp.raise_for_status()
            res_json = resp.json()

        # Parse response structure:
        # {"data": [{"index": 0, "text_detections": [...]}]}
        lines: List[str] = []
        confidences: List[float] = []

        data_items = res_json.get("data", [])
        for item in data_items:
            detections = item.get("text_detections", [])
            for det in detections:
                txt = ""
                conf = 1.0
                if isinstance(det, str):
                    txt = det
                elif isinstance(det, dict):
                    # Check common detection payload shapes
                    txt = det.get("text", "") or det.get("label", "")
                    if not txt and "text_prediction" in det:
                        pred = det["text_prediction"]
                        txt = pred.get("text", "") if isinstance(pred, dict) else str(pred)
                        conf = pred.get("confidence", 1.0) if isinstance(pred, dict) else 1.0
                    else:
                        conf = float(det.get("confidence", 1.0))
                
                txt = txt.strip()
                if txt:
                    lines.append(txt)
                    confidences.append(conf)

        full_text = "\n".join(lines).strip()
        avg_conf = round(sum(confidences) / len(confidences), 2) if confidences else 0.95

        logger.info(
            "Nemotron-OCR-v2 extracted %d lines (chars: %d, confidence: %.2f)",
            len(lines), len(full_text), avg_conf
        )

        return {
            "text": full_text,
            "lines": lines,
            "confidence": avg_conf,
            "provider": "nemotron-ocr-v2",
            "model": "nvidia/nemotron-ocr-v2",
        }

    except httpx.HTTPStatusError as exc:
        logger.error(
            "Nemotron-OCR-v2 HTTP %d: %s",
            exc.response.status_code,
            exc.response.text[:300]
        )
        raise RuntimeError(f"Nemotron-OCR-v2 API failed with HTTP {exc.response.status_code}") from exc
    except Exception as exc:
        logger.exception("Nemotron-OCR-v2 request failed: %s", exc)
        raise
