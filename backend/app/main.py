"""
app/main.py – MediKiosk FastAPI Application Entry Point
========================================================
This file:
  * Creates and configures the FastAPI app
  * Adds CORS middleware
  * Registers the global exception handler (returns standard envelope)
  * Wires startup / shutdown DB lifecycle hooks
  * Mounts all module routers
  * Exposes the health check at GET /api/health

DO NOT add business logic or route handlers here.
All domain logic belongs in the respective module files.
"""

from __future__ import annotations

import logging
import traceback

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection

# ── Auth router (lives in security.py for hackathon convenience) ──────────────
from app.core.security import router as auth_router

# ── Module routers ─────────────────────────────────────────────────────────────
from app.modules.patient.routes import router as patient_router
from app.modules.conversation.routes import router as conversation_router
from app.modules.documents.routes import router as documents_router
from app.modules.ayush.routes import router as ayush_router
from app.modules.clinical.routes import router as clinical_router
from app.modules.doctor.routes import router as doctor_router

# ── AI / Gemini router ─────────────────────────────────────────────────────────
from app.integrations.ai.ai_routes import router as ai_router

# ── Speech router ──────────────────────────────────────────────────────────────
from app.integrations.speech.speech_routes import router as speech_router

# ── Response helpers ───────────────────────────────────────────────────────────
from app.utils.response import error_envelope

logger = logging.getLogger(__name__)

# ── Logging setup ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s – %(message)s",
)

# ─────────────────────────────────────────────────────────────────────────────
# FastAPI app instance
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "MediKiosk – AI-Powered Patient Case-Taking System\n\n"
        f"**MOCK_AI_MODE**: `{settings.MOCK_AI_MODE}` "
        "(all AI integrations return canned responses when True)"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ─────────────────────────────────────────────────────────────────────────────
# CORS Middleware
# ─────────────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],      # useful for pagination
)

# ─────────────────────────────────────────────────────────────────────────────
# Global exception handlers
# Return the standard {success, data, error, meta} envelope on every error
# so the frontend never receives an unexpected shape.
# ─────────────────────────────────────────────────────────────────────────────

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Convert FastAPI HTTPExceptions into the standard error envelope."""
    return error_envelope(
        message=str(exc.detail),
        code=f"HTTP_{exc.status_code}",
        status_code=exc.status_code,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all for unhandled exceptions.
    Returns 500 with the standard envelope.
    Logs the full traceback for debugging.
    """
    logger.error(
        "Unhandled exception on %s %s\n%s",
        request.method,
        request.url,
        traceback.format_exc(),
    )
    detail = traceback.format_exc() if settings.DEBUG else None
    return error_envelope(
        message="An unexpected server error occurred.",
        code="INTERNAL_SERVER_ERROR",
        status_code=500,
        details=detail,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Startup / Shutdown lifecycle
# ─────────────────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event() -> None:
    """Connect to MongoDB on startup."""
    logger.info("Starting %s v%s (MOCK_AI_MODE=%s) …",
                settings.APP_NAME, settings.APP_VERSION, settings.MOCK_AI_MODE)
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Disconnect from MongoDB cleanly on shutdown."""
    await close_mongo_connection()
    logger.info("%s shut down cleanly.", settings.APP_NAME)


# ─────────────────────────────────────────────────────────────────────────────
# Route Registration
# ─────────────────────────────────────────────────────────────────────────────

API_PREFIX = "/api"

# Auth (dev-token, whoami)
app.include_router(auth_router,         prefix=f"{API_PREFIX}")

# Domain modules
app.include_router(patient_router,      prefix=f"{API_PREFIX}/patients",    tags=["Patients"])
app.include_router(conversation_router, prefix=f"{API_PREFIX}/conversation", tags=["Conversation"])
app.include_router(documents_router,    prefix=f"{API_PREFIX}/documents",    tags=["Documents"])
app.include_router(ayush_router,        prefix=f"{API_PREFIX}/ayush",        tags=["AYUSH"])
app.include_router(clinical_router,     prefix=f"{API_PREFIX}/clinical",     tags=["Clinical"])
app.include_router(doctor_router,       prefix=f"{API_PREFIX}/doctor",       tags=["Doctor"])

# AI / Gemini
app.include_router(ai_router,           prefix=f"{API_PREFIX}/ai",          tags=["AI"])

# Speech / ASR
app.include_router(speech_router,       prefix=f"{API_PREFIX}/speech",      tags=["Speech"])


# ─────────────────────────────────────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────────────────────────────────────

@app.get(
    f"{API_PREFIX}/health",
    tags=["Health"],
    summary="Service health check",
    description="Returns app version and MOCK_AI_MODE flag. No auth required.",
)
async def health_check() -> dict:
    """
    Lightweight liveness probe.
    Returns the standard success envelope with version and mode info.
    """
    return {
        "success": True,
        "data": {
            "status": "ok",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
            "mock_ai_mode": settings.MOCK_AI_MODE,
        },
        "error": None,
        "meta": {"message": "Service is healthy"},
    }
