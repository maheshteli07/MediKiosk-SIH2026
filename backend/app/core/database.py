"""
database.py – MongoDB Database Connection

Provides an async MongoDB client using Motor.
All modules access the database through the functions defined here.

Developer 5 owns this file.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# ---- Module-level client (initialized on startup) ----
_client: AsyncIOMotorClient = None


def get_client() -> AsyncIOMotorClient:
    """Return the Motor client instance."""
    return _client


def get_database():
    """Return the MediKiosk database instance."""
    return _client[settings.MONGO_DB_NAME]


async def connect_to_mongo():
    """Initialize the MongoDB connection. Called on app startup."""
    global _client
    # TODO: Implement connection with error handling and retry
    _client = AsyncIOMotorClient(settings.MONGO_URI)


async def close_mongo_connection():
    """Close the MongoDB connection. Called on app shutdown."""
    global _client
    if _client:
        _client.close()
        _client = None


# ============================================================
# Collection Names – MongoDB collection registry
# ============================================================

class Collections:
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
    INTEGRATION_RECORDS = "integration_records"
    CONSENTS = "consents"
