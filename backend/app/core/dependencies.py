"""
dependencies.py – FastAPI Dependency Injection

Reusable FastAPI dependencies (for use with Depends()).
Includes:
- get_db: database dependency
- get_current_doctor: JWT auth dependency

Developer 5 owns this file.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.database import get_database
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_db():
    """Dependency: return the Motor database instance."""
    return get_database()


async def get_current_doctor(token: str = Depends(oauth2_scheme)):
    """
    Dependency: extract and validate the current authenticated doctor from JWT.
    Raises HTTP 401 if token is missing or invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    doctor_id: str = payload.get("sub")
    if doctor_id is None:
        raise credentials_exception
    # TODO: Fetch doctor from DB and verify still active
    return {"doctor_id": doctor_id, "payload": payload}
