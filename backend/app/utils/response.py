"""
utils/response.py – Standard API Response Envelope
====================================================
Every route in the API should return via one of these helpers so that the
frontend can rely on a predictable shape regardless of the endpoint.

Envelope shape
--------------
  {
    "success": true | false,
    "data":    <payload> | null,
    "error":   null | { "code": "...", "message": "..." },
    "meta":    null | { "page": 1, "page_size": 20, "total": 100, ... }
  }

This shape mirrors what the frontend's mockApi.js returns so that swapping
mock ↔ real API requires zero frontend changes.
"""

from __future__ import annotations

from typing import Any, Optional

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


# ── Internal envelope builder ─────────────────────────────────────────────────

def _envelope(
    *,
    success: bool,
    data: Any = None,
    error: Optional[dict] = None,
    meta: Optional[dict] = None,
) -> dict:
    return jsonable_encoder({
        "success": success,
        "data": data,
        "error": error,
        "meta": meta,
    })


# ── Public helpers ────────────────────────────────────────────────────────────

def success_response(
    data: Any = None,
    *,
    message: str = "OK",
    status_code: int = 200,
    meta: Optional[dict] = None,
) -> JSONResponse:
    """
    Return a 2xx success envelope.

    Parameters
    ----------
    data        The payload (dict, list, str, etc.)
    message     Optional human-readable message (goes into meta)
    status_code HTTP status code (default 200)
    meta        Extra metadata dict – merged with the auto-generated meta
    """
    full_meta = {"message": message}
    if meta:
        full_meta.update(meta)
    return JSONResponse(
        status_code=status_code,
        content=_envelope(success=True, data=data, meta=full_meta),
    )


def error_envelope(
    message: str,
    *,
    code: str = "ERROR",
    status_code: int = 400,
    details: Any = None,
) -> JSONResponse:
    """
    Return a 4xx/5xx error envelope.

    Parameters
    ----------
    message     Human-readable error message
    code        Machine-readable error code string (e.g. "NOT_FOUND")
    status_code HTTP status code
    details     Extra debug info (validation errors, stack info, etc.)
    """
    error_body: dict = {"code": code, "message": message}
    if details is not None:
        error_body["details"] = details
    return JSONResponse(
        status_code=status_code,
        content=_envelope(success=False, error=error_body),
    )


def paginated_response(
    data: list,
    *,
    total: int,
    page: int,
    page_size: int,
    message: str = "OK",
) -> JSONResponse:
    """
    Return a success envelope with pagination metadata.

    Parameters
    ----------
    data        The list of items for the current page
    total       Total number of items across all pages
    page        Current page number (1-indexed)
    page_size   Number of items per page
    """
    total_pages = max(1, (total + page_size - 1) // page_size)
    meta = {
        "message": message,
        "pagination": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }
    return JSONResponse(
        status_code=200,
        content=_envelope(success=True, data=data, meta=meta),
    )


def created_response(data: Any = None, *, message: str = "Created") -> JSONResponse:
    """Shortcut for 201 Created."""
    return success_response(data=data, message=message, status_code=201)


def no_content_response() -> JSONResponse:
    """Shortcut for 204 No Content."""
    return JSONResponse(status_code=204, content=None)
