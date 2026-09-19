"""
core/dependencies.py – Shared FastAPI Dependencies
===================================================
All reusable Depends() callables live here.

Available dependencies
----------------------
get_db()              → AsyncIOMotorDatabase
get_current_role()    → {"sub": str, "role": "patient"|"doctor"}
require_doctor()      → same dict, but raises 403 if role != "doctor"
require_patient()     → same dict, but raises 403 if role != "patient"
pagination_params()   → PaginationParams(page, page_size, skip)
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.database import get_database
from app.core.security import decode_access_token
from motor.motor_asyncio import AsyncIOMotorDatabase

# ── Database ──────────────────────────────────────────────────────────────────

def get_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency: return the live Motor database handle."""
    return get_database()


# ── Auth / Role ───────────────────────────────────────────────────────────────

_bearer = HTTPBearer(auto_error=False)

Role = Literal["patient", "doctor"]


async def get_current_role(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """
    Extract and validate the JWT from the Authorization: Bearer <token> header.

    Returns
    -------
    dict  {"sub": str, "role": "patient"|"doctor"}

    Raises
    ------
    HTTP 401 if the header is missing or the token is invalid/expired.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    role = payload.get("role")
    if role not in ("patient", "doctor"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing a valid role claim",
        )
    return {"sub": payload.get("sub"), "role": role, "payload": payload}


async def require_doctor(
    current: dict = Depends(get_current_role),
) -> dict:
    """Dependency: allow only requests with role == 'doctor'."""
    if current["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor access required",
        )
    return current


async def require_patient(
    current: dict = Depends(get_current_role),
) -> dict:
    """Dependency: allow only requests with role == 'patient'."""
    if current["role"] != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient access required",
        )
    return current


# ── Pagination ────────────────────────────────────────────────────────────────

@dataclass
class PaginationParams:
    page: int
    page_size: int
    skip: int   # pre-computed MongoDB skip value


def pagination_params(page: int = 1, page_size: int = 20) -> PaginationParams:
    """
    FastAPI dependency: parse & validate pagination query params.

    Query params
    ------------
    page       Page number (1-indexed, default 1)
    page_size  Items per page (default 20, max 100)
    """
    page = max(1, page)
    page_size = min(max(1, page_size), 100)
    skip = (page - 1) * page_size
    return PaginationParams(page=page, page_size=page_size, skip=skip)
