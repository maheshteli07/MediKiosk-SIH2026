"""
tesseract_service.py – Tesseract OCR Fallback
Developer 5

Wraps pytesseract as a fallback OCR provider.
Install: pip install pytesseract
"""


async def tesseract_extract(image_bytes: bytes, language: str = "eng") -> dict:
    """
    Extract text from image using Tesseract OCR.
    Used as fallback when PaddleOCR is unavailable.
    """
    # TODO: Implement Tesseract integration
    # import pytesseract
    # from PIL import Image
    # import io
    # image = Image.open(io.BytesIO(image_bytes))
    # text = pytesseract.image_to_string(image, lang=language)
    raise NotImplementedError("Tesseract not yet integrated.")
