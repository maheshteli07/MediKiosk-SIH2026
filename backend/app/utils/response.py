"""
response.py – Standardized API Response Helpers

All API routes should return responses via these helpers
to ensure a consistent response envelope across the entire API.
"""

from typing import Any, Optional
from fastapi.responses import JSONResponse


def success_response(data: Any = None, message: str = "Success", status_code: int = 200):
    """Return a standardized success response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data,
        },
    )


def error_response(message: str, status_code: int = 400, details: Optional[Any] = None):
    """Return a standardized error response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "details": details,
        },
    )


def paginated_response(data: list, total: int, page: int, page_size: int):
    """Return a standardized paginated list response."""
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": data,
            "pagination": {
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size,
            },
        },
    )
