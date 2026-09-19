"""
app/modules/patient/repository.py – Patient Module Database Operations
======================================================================
Raw Motor async operations for patients, consents, and patient_sessions collections.
No business logic or validation belongs here.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.modules.patient.models import (
    CONSENTS_COLLECTION,
    PATIENTS_COLLECTION,
    PATIENT_SESSIONS_COLLECTION,
    serialize_doc,
    to_object_id,
)


class PatientRepository:
    """Repository handling all MongoDB CRUD for patient-related collections."""

    # ── Patient Operations ────────────────────────────────────────────────────

    @staticmethod
    async def create_patient(db: AsyncIOMotorDatabase, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a new patient document and return the full serialized record."""
        result = await db[PATIENTS_COLLECTION].insert_one(doc)
        doc["_id"] = result.inserted_id
        return serialize_doc(doc)

    @staticmethod
    async def find_patient_by_id(
        db: AsyncIOMotorDatabase, patient_id: str
    ) -> Optional[Dict[str, Any]]:
        """Look up patient by _id (ObjectId or string) or patient_uid."""
        oid = to_object_id(patient_id)
        query = {"$or": [{"_id": oid}]} if oid else {"$or": []}
        query["$or"].append({"patient_uid": patient_id})
        query["$or"].append({"_id": patient_id})

        doc = await db[PATIENTS_COLLECTION].find_one(query)
        return serialize_doc(doc)

    @staticmethod
    async def find_patient_by_phone(
        db: AsyncIOMotorDatabase, phone: str
    ) -> Optional[Dict[str, Any]]:
        """Look up patient by normalized phone number."""
        doc = await db[PATIENTS_COLLECTION].find_one({"phone": phone})
        return serialize_doc(doc)

    @staticmethod
    async def find_patient_by_abha(
        db: AsyncIOMotorDatabase, abha_id: str
    ) -> Optional[Dict[str, Any]]:
        """Look up patient by ABHA ID."""
        doc = await db[PATIENTS_COLLECTION].find_one({"abha_id": abha_id})
        return serialize_doc(doc)

    @staticmethod
    async def update_patient(
        db: AsyncIOMotorDatabase, patient_id: str, update_fields: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Apply partial update to patient record and return updated doc."""
        oid = to_object_id(patient_id)
        query = {"_id": oid} if oid else {"patient_uid": patient_id}

        update_fields["updated_at"] = datetime.now(timezone.utc)
        await db[PATIENTS_COLLECTION].update_one(query, {"$set": update_fields})
        doc = await db[PATIENTS_COLLECTION].find_one(query)
        return serialize_doc(doc)

    @staticmethod
    async def list_patients(
        db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Dict[str, Any]], int]:
        """List patients with pagination."""
        total = await db[PATIENTS_COLLECTION].count_documents({})
        cursor = db[PATIENTS_COLLECTION].find({}).sort("created_at", -1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [serialize_doc(d) for d in docs], total

    # ── Consent Operations ────────────────────────────────────────────────────

    @staticmethod
    async def insert_consents(
        db: AsyncIOMotorDatabase, consent_docs: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Insert multiple consent records (history append-only)."""
        if not consent_docs:
            return []
        result = await db[CONSENTS_COLLECTION].insert_many(consent_docs)
        for idx, inserted_id in enumerate(result.inserted_ids):
            consent_docs[idx]["_id"] = inserted_id
        return [serialize_doc(d) for d in consent_docs]

    @staticmethod
    async def get_consents_by_session(
        db: AsyncIOMotorDatabase, session_id: str
    ) -> List[Dict[str, Any]]:
        """Get all consent records for a session in reverse chronological order."""
        cursor = (
            db[CONSENTS_COLLECTION]
            .find({"session_id": str(session_id)})
            .sort("granted_at", -1)
        )
        docs = await cursor.to_list(length=100)
        return [serialize_doc(d) for d in docs]

    @staticmethod
    async def get_consents_by_patient(
        db: AsyncIOMotorDatabase, patient_id: str
    ) -> List[Dict[str, Any]]:
        """Get all consents associated with a patient."""
        cursor = (
            db[CONSENTS_COLLECTION]
            .find({"patient_id": str(patient_id)})
            .sort("granted_at", -1)
        )
        docs = await cursor.to_list(length=100)
        return [serialize_doc(d) for d in docs]

    @staticmethod
    async def revoke_session_consents(
        db: AsyncIOMotorDatabase,
        session_id: str,
        consent_types: Optional[List[str]] = None,
        revoked_at: Optional[datetime] = None,
    ) -> int:
        """
        Mark consent records for a session as revoked.
        If consent_types is specified, only revokes those types.
        """
        rev_time = revoked_at or datetime.now(timezone.utc)
        filter_q: Dict[str, Any] = {
            "session_id": str(session_id),
            "revoked_at": None,
        }
        if consent_types:
            filter_q["consent_type"] = {"$in": consent_types}

        result = await db[CONSENTS_COLLECTION].update_many(
            filter_q,
            {"$set": {"revoked_at": rev_time, "granted": False}},
        )
        return result.modified_count

    # ── Session Operations ────────────────────────────────────────────────────

    @staticmethod
    async def create_session(
        db: AsyncIOMotorDatabase, session_doc: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Insert a new session document."""
        result = await db[PATIENT_SESSIONS_COLLECTION].insert_one(session_doc)
        session_doc["_id"] = result.inserted_id
        return serialize_doc(session_doc)

    @staticmethod
    async def find_session_by_id(
        db: AsyncIOMotorDatabase, session_id: str
    ) -> Optional[Dict[str, Any]]:
        """Find a session by its _id."""
        oid = to_object_id(session_id)
        query = {"_id": oid} if oid else {"_id": session_id}
        doc = await db[PATIENT_SESSIONS_COLLECTION].find_one(query)
        return serialize_doc(doc)

    @staticmethod
    async def update_session(
        db: AsyncIOMotorDatabase, session_id: str, update_fields: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update fields on a session."""
        oid = to_object_id(session_id)
        query = {"_id": oid} if oid else {"_id": session_id}
        await db[PATIENT_SESSIONS_COLLECTION].update_one(query, {"$set": update_fields})
        doc = await db[PATIENT_SESSIONS_COLLECTION].find_one(query)
        return serialize_doc(doc)

    @staticmethod
    async def update_session_activity(
        db: AsyncIOMotorDatabase,
        session_id: str,
        last_activity_at: datetime,
        expires_at: datetime,
    ) -> Optional[Dict[str, Any]]:
        """Refresh heartbeat and expiration timestamp."""
        oid = to_object_id(session_id)
        query = {"_id": oid} if oid else {"_id": session_id}
        await db[PATIENT_SESSIONS_COLLECTION].update_one(
            query,
            {"$set": {"last_activity_at": last_activity_at, "expires_at": expires_at}},
        )
        doc = await db[PATIENT_SESSIONS_COLLECTION].find_one(query)
        return serialize_doc(doc)

    @staticmethod
    async def list_sessions_by_patient(
        db: AsyncIOMotorDatabase, patient_id: str, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Dict[str, Any]], int]:
        """List all sessions belonging to a specific patient."""
        query = {"patient_id": str(patient_id)}
        total = await db[PATIENT_SESSIONS_COLLECTION].count_documents(query)
        cursor = (
            db[PATIENT_SESSIONS_COLLECTION]
            .find(query)
            .sort("started_at", -1)
            .skip(skip)
            .limit(limit)
        )
        docs = await cursor.to_list(length=limit)
        return [serialize_doc(d) for d in docs], total
