"""
app/modules/patient/indexes.py – Patient Module Database Indexing
==================================================================
Provides database index initialization for MongoDB collections managed by
the patient module (`patients`, `consents`, `patient_sessions`).
"""

from __future__ import annotations

import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING

from app.modules.patient.models import (
    CONSENTS_COLLECTION,
    PATIENTS_COLLECTION,
    PATIENT_SESSIONS_COLLECTION,
)

logger = logging.getLogger(__name__)


async def ensure_patient_indexes(db: AsyncIOMotorDatabase) -> None:
    """
    Ensure all required indexes exist for the patient module collections.
    Safe to call during application startup.
    """
    logger.info("Ensuring database indexes for patient module...")

    # ── Patients Indexes ────────────
    patients_indexes = [
        IndexModel([("phone", ASCENDING)], unique=True, name="idx_patients_phone"),
        IndexModel([("patient_uid", ASCENDING)], unique=True, name="idx_patients_patient_uid"),
        IndexModel([("abha_id", ASCENDING)], unique=True, sparse=True, name="idx_patients_abha_id"),
        IndexModel([("created_at", DESCENDING)], name="idx_patients_created_at"),
    ]
    await db[PATIENTS_COLLECTION].create_indexes(patients_indexes)

    # ── Consents Indexes ────────────
    consents_indexes = [
        IndexModel([("session_id", ASCENDING)], name="idx_consents_session_id"),
        IndexModel([("patient_id", ASCENDING)], name="idx_consents_patient_id"),
        IndexModel([("granted_at", DESCENDING)], name="idx_consents_granted_at"),
    ]
    await db[CONSENTS_COLLECTION].create_indexes(consents_indexes)

    # ── Patient Sessions Indexes ────
    sessions_indexes = [
        IndexModel([("patient_id", ASCENDING)], name="idx_sessions_patient_id"),
        IndexModel([("status", ASCENDING)], name="idx_sessions_status"),
        IndexModel([("expires_at", ASCENDING)], name="idx_sessions_expires_at"),
        IndexModel([("kiosk_id", ASCENDING)], name="idx_sessions_kiosk_id"),
        IndexModel([("started_at", DESCENDING)], name="idx_sessions_started_at"),
    ]
    await db[PATIENT_SESSIONS_COLLECTION].create_indexes(sessions_indexes)

    logger.info("Patient module database indexes verified.")
