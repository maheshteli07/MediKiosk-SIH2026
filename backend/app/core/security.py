"""
core/security.py – Lightweight JWT Auth for Hackathon
======================================================
Design
------
This is *not* full production auth.  The goal is demo reliability:

  * Any caller can hit  POST /api/auth/dev-token  with a JSON body
    {"role": "patient"|"doctor", "sub": "<any-id>"}  and receive a signed JWT.
  * Protected routes extract the role from that token via get_current_role().
  * No user database lookup is required – the token itself is the source of
    truth for the hackathon prototype.

Token payload shape
-------------------
  {
    "sub":  "doctor-1",          # caller-supplied identifier
    "role": "doctor",            # "patient" | "doctor"
    "iat":  1700000000,
    "exp":  1700003600
  }
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings
from app.utils.response import success_response, error_envelope

# ── Password hashing (available for future full-auth upgrade) ─────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── Token helpers ─────────────────────────────────────────────────────────────

Role = Literal["patient", "doctor"]


def create_access_token(
    sub: str,
    role: Role,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Sign a JWT with `sub` and `role` claims."""
    now = datetime.now(tz=timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.JWT_EXPIRY_MINUTES))
    payload = {
        "sub": sub,
        "role": role,
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT.
    Returns the payload dict on success, None on any failure.
    """
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        return None


# ── /api/auth router ─────────────────────────────────────────────────────────
# This router is mounted in main.py under /api/auth

router = APIRouter(prefix="/auth", tags=["Auth"])


class DevTokenRequest(BaseModel):
    """Body for the dev-token endpoint."""
    sub: str = "dev-user-1"
    role: Role = "doctor"


class DevTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    expires_in_minutes: int


@router.post(
    "/dev-token",
    summary="Issue a dev/demo JWT (no password required)",
    description=(
        "Hackathon shortcut: issue a signed JWT for any role without a real "
        "login flow.  **Disable or gate-keep this endpoint in production.**"
    ),
)
async def get_dev_token(body: DevTokenRequest):
    """Return a signed JWT for the requested role."""
    token = create_access_token(sub=body.sub, role=body.role)
    return success_response(
        data=DevTokenResponse(
            access_token=token,
            role=body.role,
            expires_in_minutes=settings.JWT_EXPIRY_MINUTES,
        ).model_dump(),
        message="Dev token issued",
    )


@router.get(
    "/me",
    summary="Decode the current JWT and return its claims",
)
async def whoami(
    # Import here to avoid circular – dependencies imports security
    token: str = None,
):
    """
    Convenience endpoint: pass ?token=<jwt> and get back the decoded payload.
    Useful during development/demo.
    """
    if not token:
        raise HTTPException(status_code=400, detail="Pass ?token=<your-jwt>")
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return success_response(data=payload, message="Token decoded")
