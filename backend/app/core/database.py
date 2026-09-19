"""
core/database.py – Async MongoDB Connection (Motor)
====================================================
Lifecycle
---------
  connect_to_mongo()       – call on app startup
  close_mongo_connection() – call on app shutdown

Usage in routes
---------------
  from app.core.dependencies import get_db
  async def my_route(db=Depends(get_db)): ...

Collection names are centralised in the `Collections` registry below so that
every module uses a string constant, never a raw string literal.
"""

from __future__ import annotations

import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

logger = logging.getLogger(__name__)

# Module-level state – initialised once on startup
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


# ── Public accessors ───────────────────────────────────────────────────────────

def get_client() -> AsyncIOMotorClient:
    """Return the live Motor client.  Raises if not yet connected."""
    if _client is None:
        raise RuntimeError("MongoDB client is not initialised. Did startup run?")
    return _client


def get_database() -> AsyncIOMotorDatabase | None:
    """Return the MediKiosk Motor database handle or None if not yet connected."""
    return _db


# ── Lifecycle ──────────────────────────────────────────────────────────────────

async def connect_to_mongo() -> None:
    """
    Create the Motor client and verify connectivity via a server ping.
    Called from main.py startup hook.
    """
    global _client, _db
    logger.info("Connecting to MongoDB at %s …", settings.MONGO_URI)
    _client = AsyncIOMotorClient(
        settings.MONGO_URI,
        serverSelectionTimeoutMS=5_000,   # fail fast during boot
    )
    _db = _client[settings.MONGO_DB_NAME]

    # Ping to surface connection errors early
    try:
        await _client.admin.command("ping")
        logger.info("MongoDB connected  (db=%s)", settings.MONGO_DB_NAME)
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "MongoDB ping failed – continuing anyway (MOCK_AI_MODE=%s). Error: %s",
            settings.MOCK_AI_MODE,
            exc,
        )


async def close_mongo_connection() -> None:
    """Close the Motor client.  Called from main.py shutdown hook."""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB connection closed.")


# ── FastAPI dependency ─────────────────────────────────────────────────────────

def get_db() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency: yields the Motor database instance.
    Use with Depends(get_db) in route functions.
    """
    return get_database()


# ── Collection name registry ───────────────────────────────────────────────────

class Collections:
    """Single source of truth for every MongoDB collection name."""

    PATIENTS = "patients"
    CONVERSATION_SESSIONS = "conversation_sessions"
    CONVERSATION_MESSAGES = "conversation_messages"
    DOCUMENTS = "documents"
    DOCUMENT_EXTRACTIONS = "document_extractions"
    AYUSH_HISTORIES = "ayush_histories"
    CLINICAL_HISTORIES = "clinical_histories"
    CLINICAL_SUMMARIES = "clinical_summaries"
    TIMELINE_EVENTS = "timeline_events"
    DOCTOR_USERS = "doctor_users"
    VERIFICATION_RECORDS = "verification_records"
    INTEGRATION_LOGS = "integration_logs"
    CONSENTS = "consents"
    DEV_TOKENS = "dev_tokens"          # lightweight token log for hackathon
