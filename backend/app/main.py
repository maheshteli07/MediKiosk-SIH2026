"""
main.py – MediKiosk FastAPI Application Entry Point

This file:
- Creates the FastAPI app instance
- Configures CORS
- Registers all module routers
- Sets up startup/shutdown events

DO NOT put business logic or route handlers here.
All logic belongs in the respective module files.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Module routers – imported here, implemented in modules/
from app.modules.patient.routes import router as patient_router
from app.modules.conversation.routes import router as conversation_router
from app.modules.documents.routes import router as documents_router
from app.modules.ayush.routes import router as ayush_router
from app.modules.clinical.routes import router as clinical_router
from app.modules.doctor.routes import router as doctor_router

# ============================================================
# App Instance
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="MediKiosk – AI-Powered Patient Case-Taking Software API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================================================
# CORS Middleware
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Route Registration
# ============================================================

app.include_router(patient_router, prefix="/api/patients", tags=["Patient"])
app.include_router(conversation_router, prefix="/api/conversation", tags=["Conversation"])
app.include_router(documents_router, prefix="/api/documents", tags=["Documents"])
app.include_router(ayush_router, prefix="/api/ayush", tags=["AYUSH"])
app.include_router(clinical_router, prefix="/api/clinical", tags=["Clinical"])
app.include_router(doctor_router, prefix="/api", tags=["Doctor & Auth"])

# ============================================================
# Startup / Shutdown Events
# ============================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup."""
    # TODO: Initialize MongoDB connection via app.core.database
    pass

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown."""
    # TODO: Close MongoDB connection
    pass

# ============================================================
# Health Check
# ============================================================

@app.get("/health", tags=["Health"])
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
