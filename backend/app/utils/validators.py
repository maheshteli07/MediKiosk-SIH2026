"""
utils/validators.py – Shared Pydantic / business-rule validators
================================================================
These functions are used both as standalone checks in service layer code
and as Pydantic field validators via @field_validator.

File / upload validators
-------------------------
validate_upload_file(file, allowed_types, max_size_mb)

Patient-ID validators
---------------------
is_valid_phone(phone)      – 10-digit Indian mobile
is_valid_aadhaar(aadhaar)  – 12-digit Aadhaar
is_valid_abha(abha)        – 14-digit ABHA Health ID
is_valid_age(age)          – 1–120
"""

from __future__ import annotations

import re
from typing import List, Optional

from fastapi import HTTPException, UploadFile, status


# ── Phone / Patient-ID ────────────────────────────────────────────────────────

def is_valid_phone(phone: str) -> bool:
    """True for a 10-digit Indian mobile number starting with 6-9."""
    cleaned = re.sub(r"[\s\-\(\)]", "", phone)
    return bool(re.fullmatch(r"[6-9]\d{9}", cleaned))


def is_valid_aadhaar(aadhaar: str) -> bool:
    """True for a 12-digit Aadhaar number (spaces/hyphens stripped)."""
    cleaned = re.sub(r"[\s\-]", "", aadhaar)
    return bool(re.fullmatch(r"\d{12}", cleaned))


def is_valid_abha(abha: str) -> bool:
    """True for a 14-digit ABHA Health ID (hyphens stripped)."""
    cleaned = re.sub(r"\-", "", abha)
    return bool(re.fullmatch(r"\d{14}", cleaned))


def is_valid_age(age: int) -> bool:
    """True if age is an integer in [1, 120]."""
    return isinstance(age, int) and 1 <= age <= 120


def is_valid_patient_id(patient_id: str) -> bool:
    """
    True for an alphanumeric patient ID (6–24 chars).
    Pattern: MK-YYYYMMDD-XXXXXX  or any alphanumeric slug.
    """
    return bool(re.fullmatch(r"[A-Za-z0-9\-_]{6,32}", patient_id))


def normalize_phone(phone: str) -> str:
    """Strip non-digit chars and remove leading +91 / 0."""
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    elif digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    return digits


# ── File / upload ─────────────────────────────────────────────────────────────

# Default allowed MIME types for medical document uploads
DEFAULT_ALLOWED_TYPES: List[str] = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "application/pdf",
]

DEFAULT_MAX_SIZE_MB: float = 10.0


async def validate_upload_file(
    file: UploadFile,
    allowed_types: Optional[List[str]] = None,
    max_size_mb: float = DEFAULT_MAX_SIZE_MB,
) -> bytes:
    """
    Validate an uploaded file's MIME type and size.

    Parameters
    ----------
    file          FastAPI UploadFile object
    allowed_types List of permitted MIME types (defaults to medical docs)
    max_size_mb   Maximum allowed file size in megabytes

    Returns
    -------
    bytes         The file content (so callers don't need to re-read)

    Raises
    ------
    HTTPException 415 – unsupported media type
    HTTPException 413 – file too large
    """
    allowed = allowed_types or DEFAULT_ALLOWED_TYPES
    max_bytes = int(max_size_mb * 1024 * 1024)

    # MIME check
    content_type = file.content_type or ""
    if content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"File type '{content_type}' is not allowed. "
                f"Accepted: {', '.join(allowed)}"
            ),
        )

    # Size check (read into memory – fine for ≤10 MB medical docs)
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File size {len(contents) / 1024 / 1024:.1f} MB exceeds "
                f"the {max_size_mb} MB limit."
            ),
        )

    # Rewind so downstream code can re-read if needed
    await file.seek(0)
    return contents


def validate_file_extension(filename: str, allowed_extensions: Optional[List[str]] = None) -> bool:
    """
    Check that a filename ends with an allowed extension.
    Complements MIME-type checking as a second line of defence.
    """
    allowed = allowed_extensions or [".jpg", ".jpeg", ".png", ".webp", ".heic", ".pdf"]
    suffix = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return suffix in allowed
