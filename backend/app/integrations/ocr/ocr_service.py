"""
ocr_service.py – OCR Integration: Main Service Interface
Developer 5

Routes OCR requests to the configured provider (PaddleOCR, Tesseract, or mock).
"""

from app.core.config import settings


async def extract_text_from_image(image_bytes: bytes, language: str = "en") -> dict:
    """Extract text from an image using the configured OCR provider."""
    provider = settings.OCR_PROVIDER.lower() if hasattr(settings, "OCR_PROVIDER") else "mock"
    if provider in ("nemotron", "nemotron-ocr-v2", "nemotron_ocr", "nvidia", "nvidia_ocr"):
        from app.integrations.ocr.nemotron_ocr_service import nemotron_extract_text
        return await nemotron_extract_text(image_bytes, language)
    elif provider == "mock":
        from app.integrations.ocr.mock_ocr import mock_extract_text
        return await mock_extract_text(image_bytes, language)
    elif provider == "paddleocr":
        from app.integrations.ocr.paddleocr_service import paddleocr_extract
        return await paddleocr_extract(image_bytes, language)
    elif provider == "tesseract":
        from app.integrations.ocr.tesseract_service import tesseract_extract
        return await tesseract_extract(image_bytes, language)
    raise ValueError(f"Unknown OCR provider: {settings.OCR_PROVIDER}")



async def classify_document(image_bytes: bytes) -> str:
    """Classify a document as prescription, lab_report, discharge_summary, etc."""
    # TODO: Implement document classification
    return "unknown"
