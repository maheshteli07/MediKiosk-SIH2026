"""
validators.py – Shared Backend Validation Utilities

Pure validation functions used across multiple modules.
These supplement Pydantic model validation for business-rule checks.
"""

import re


def is_valid_phone(phone: str) -> bool:
    """Validate a 10-digit Indian mobile number (starts with 6-9)."""
    cleaned = re.sub(r"\s+", "", phone)
    return bool(re.match(r"^[6-9]\d{9}$", cleaned))


def is_valid_aadhaar(aadhaar: str) -> bool:
    """Validate a 12-digit Aadhaar number."""
    cleaned = re.sub(r"[\s-]", "", aadhaar)
    return bool(re.match(r"^\d{12}$", cleaned))


def is_valid_abha(abha: str) -> bool:
    """Validate a 14-digit ABHA ID (with or without hyphens)."""
    cleaned = re.sub(r"-", "", abha)
    return bool(re.match(r"^\d{14}$", cleaned))


def is_valid_age(age: int) -> bool:
    """Validate age is within the acceptable range."""
    return isinstance(age, int) and 1 <= age <= 120
