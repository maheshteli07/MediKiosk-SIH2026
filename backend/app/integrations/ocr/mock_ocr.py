"""
mock_ocr.py – Mock OCR Service for Development
Developer 5
"""

import asyncio


async def mock_extract_text(image_bytes: bytes, language: str = "en") -> dict:
    await asyncio.sleep(0.8)
    return {
        "raw_text": "Patient Name: Ramesh Kumar\nDate: 15/01/2024\nRx:\nMetformin 500mg - 1 tablet twice daily\nAmlodipine 5mg - 1 tablet once daily\nDr. Sharma\nReg No: MH-12345",
        "structured": {
            "patient_name": "Ramesh Kumar",
            "date": "2024-01-15",
            "medications": ["Metformin 500mg", "Amlodipine 5mg"],
            "doctor": "Dr. Sharma",
        },
        "confidence": 0.91,
        "provider": "mock",
    }
