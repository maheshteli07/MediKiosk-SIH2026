"""
app/modules/doctor/service.py – Doctor Module Business Logic
============================================================
Handles doctor patient queue aggregation, full patient case retrieval,
clinical summary verification, and final sign-offs.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import Collections
from app.modules.patient.models import serialize_doc, to_object_id
from app.modules.doctor.model import new_verification_record

logger = logging.getLogger(__name__)


def _to_iso(val: Any) -> Any:
    """Helper to convert datetime objects to ISO strings."""
    if isinstance(val, datetime):
        return val.isoformat()
    return val


class DoctorService:
    """Service layer for doctor workflows."""

    @staticmethod
    async def get_patient_queue(
        db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Retrieve paginated patient queue for doctor review.
        Merges patient_sessions with patients and clinical_summaries records.
        """
        sessions_cursor = (
            db[Collections.CONVERSATION_SESSIONS]
            .find({})
            .sort("started_at", -1)
            .skip(skip)
            .limit(limit)
        )
        session_docs = await sessions_cursor.to_list(length=limit)
        total_sessions = await db[Collections.CONVERSATION_SESSIONS].count_documents({})

        # If no conversation_sessions found, check patient_sessions collection
        if not session_docs:
            patient_sessions_cursor = (
                db["patient_sessions"]
                .find({})
                .sort("started_at", -1)
                .skip(skip)
                .limit(limit)
            )
            session_docs = await patient_sessions_cursor.to_list(length=limit)
            total_sessions = await db["patient_sessions"].count_documents({})

        queue_items = []

        # If still no sessions in DB, list registered patients directly
        if not session_docs:
            patients_cursor = (
                db[Collections.PATIENTS]
                .find({})
                .sort("created_at", -1)
                .skip(skip)
                .limit(limit)
            )
            patients_docs = await patients_cursor.to_list(length=limit)
            total_patients = await db[Collections.PATIENTS].count_documents({})

            for pat in patients_docs:
                p_id = str(pat["_id"])
                summary = await db[Collections.CLINICAL_SUMMARIES].find_one({"patient_id": p_id})
                summary = serialize_doc(summary) or {}
                queue_items.append({
                    "id": p_id,
                    "session_id": p_id,
                    "patient_id": p_id,
                    "patient_uid": pat.get("patient_uid", f"MK-2026-{p_id[:6]}"),
                    "patient_name": pat.get("full_name", "Unknown Patient"),
                    "age": pat.get("age", 0),
                    "gender": pat.get("gender", "Unknown"),
                    "phone": pat.get("phone", ""),
                    "consultation_mode": pat.get("consultation_mode", "general"),
                    "status": summary.get("status", "needs_check"),
                    "wait_time": "10 mins",
                    "red_flags_count": len(summary.get("red_flags", [])),
                    "chief_complaint": summary.get("chief_complaint", "General consultation"),
                    "created_at": _to_iso(pat.get("created_at")),
                })
            return queue_items, total_patients

        for s_doc in session_docs:
            s_dict = serialize_doc(s_doc)
            p_id = s_dict.get("patient_id")
            patient = None
            if p_id:
                oid = to_object_id(p_id)
                query = {"$or": [{"_id": oid}]} if oid else {"$or": []}
                query["$or"].append({"patient_uid": p_id})
                query["$or"].append({"_id": p_id})
                patient = await db[Collections.PATIENTS].find_one(query)
            patient = serialize_doc(patient) or {}

            summary = await db[Collections.CLINICAL_SUMMARIES].find_one(
                {"$or": [{"patient_id": p_id}, {"session_id": s_dict.get("id")}]}
            )
            summary = serialize_doc(summary) or {}

            queue_items.append({
                "id": summary.get("id") or s_dict.get("id") or str(p_id),
                "session_id": s_dict.get("id"),
                "patient_id": str(p_id) if p_id else str(patient.get("id", "")),
                "patient_uid": patient.get("patient_uid", f"MK-2026-{str(p_id)[:6] if p_id else '000000'}"),
                "patient_name": patient.get("full_name", "Unknown Patient"),
                "age": patient.get("age", 0),
                "gender": patient.get("gender", "Unknown"),
                "phone": patient.get("phone", ""),
                "consultation_mode": s_dict.get("consultation_mode") or s_dict.get("mode") or "general",
                "status": summary.get("status") or s_dict.get("status") or "needs_check",
                "wait_time": "10 mins",
                "red_flags_count": len(summary.get("red_flags", [])),
                "chief_complaint": summary.get("chief_complaint") or "Intake consultation",
                "created_at": _to_iso(s_dict.get("started_at") or patient.get("created_at")),
            })

        return queue_items, total_sessions

    @staticmethod
    async def get_patient_case(db: AsyncIOMotorDatabase, patient_id: str) -> Dict[str, Any]:
        """
        Fetch full patient case details for doctor review.
        """
        oid = to_object_id(patient_id)
        query = {"$or": [{"_id": oid}]} if oid else {"$or": []}
        query["$or"].append({"patient_uid": patient_id})
        query["$or"].append({"_id": patient_id})

        patient_doc = await db[Collections.PATIENTS].find_one(query)
        if not patient_doc and not oid:
            summary_doc = await db[Collections.CLINICAL_SUMMARIES].find_one({"_id": to_object_id(patient_id)})
            if summary_doc:
                target_p_id = summary_doc.get("patient_id")
                if target_p_id:
                    patient_doc = await db[Collections.PATIENTS].find_one({"_id": to_object_id(target_p_id)})

        if not patient_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient or case with ID '{patient_id}' not found.",
            )

        pat = serialize_doc(patient_doc)
        p_id_str = pat["id"]

        session_doc = await db["patient_sessions"].find_one(
            {"patient_id": p_id_str}, sort=[("started_at", -1)]
        )
        if not session_doc:
            session_doc = await db[Collections.CONVERSATION_SESSIONS].find_one(
                {"patient_id": p_id_str}, sort=[("started_at", -1)]
            )
        session = serialize_doc(session_doc) or {}

        summary_doc = await db[Collections.CLINICAL_SUMMARIES].find_one(
            {"$or": [{"patient_id": p_id_str}, {"patient_id": pat.get("patient_uid")}]},
            sort=[("generated_at", -1)]
        )
        summary = serialize_doc(summary_doc)

        if not summary:
            summary = {
                "id": f"sum-{p_id_str}",
                "patient_id": p_id_str,
                "chief_complaint": "General health intake consultation",
                "history_of_present_illness": "Patient registered via MediKiosk intake portal.",
                "past_medical_history": [],
                "family_history": [],
                "social_history": None,
                "review_of_systems": {},
                "red_flags": [],
                "ai_confidence": 0.92,
                "status": "needs_check",
                "doctor_notes": None,
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }

        docs_cursor = db[Collections.DOCUMENTS].find(
            {"$or": [{"patient_id": p_id_str}, {"patient_id": pat.get("patient_uid")}]}
        )
        raw_docs = await docs_cursor.to_list(length=50)
        documents = [serialize_doc(d) for d in raw_docs]

        msgs_cursor = db[Collections.CONVERSATION_MESSAGES].find(
            {"$or": [{"patient_id": p_id_str}, {"session_id": session.get("id")}]}
        ).sort("timestamp", 1)
        raw_msgs = await msgs_cursor.to_list(length=100)
        messages = [serialize_doc(m) for m in raw_msgs]

        ayush_doc = await db[Collections.AYUSH_HISTORIES].find_one(
            {"$or": [{"patient_id": p_id_str}, {"patient_id": pat.get("patient_uid")}]}
        )
        ayush_history = serialize_doc(ayush_doc)

        timeline_cursor = db[Collections.TIMELINE_EVENTS].find(
            {"$or": [{"patient_id": p_id_str}, {"patient_id": pat.get("patient_uid")}]}
        ).sort("timestamp", -1)
        raw_timeline = await timeline_cursor.to_list(length=50)
        timeline = [serialize_doc(t) for t in raw_timeline]

        return {
            "patient_id": p_id_str,
            "patient_uid": pat.get("patient_uid"),
            "patient_name": pat.get("full_name"),
            "age": pat.get("age"),
            "gender": pat.get("gender"),
            "phone": pat.get("phone"),
            "abha_id": pat.get("abha_id"),
            "address": pat.get("address"),
            "city": pat.get("city"),
            "preferred_language": pat.get("preferred_language", "en"),
            "session_id": session.get("id"),
            "consultation_mode": session.get("consultation_mode") or session.get("mode") or "general",
            "session_status": session.get("status", "completed"),
            "clinical_summary": summary,
            "documents": documents,
            "conversation_history": messages,
            "ayush_history": ayush_history,
            "timeline_events": timeline,
        }

    @staticmethod
    async def verify_summary(
        db: AsyncIOMotorDatabase, summary_id: str, doctor_id: str, notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Mark a clinical summary as verified / checked with doctor notes.
        """
        now = datetime.now(timezone.utc)
        oid = to_object_id(summary_id)
        query = {"_id": oid} if oid else {"$or": [{"_id": summary_id}, {"patient_id": summary_id}]}

        summary = await db[Collections.CLINICAL_SUMMARIES].find_one(query)

        if not summary:
            new_sum = {
                "patient_id": summary_id,
                "chief_complaint": "Intake consultation",
                "status": "needs_check",
                "doctor_notes": notes,
                "verified_at": now,
                "generated_at": now,
            }
            res = await db[Collections.CLINICAL_SUMMARIES].insert_one(new_sum)
            new_sum["_id"] = res.inserted_id
            summary = new_sum
        else:
            await db[Collections.CLINICAL_SUMMARIES].update_one(
                {"_id": summary["_id"]},
                {"$set": {"status": "needs_check", "doctor_notes": notes, "verified_at": now}}
            )
            summary["status"] = "needs_check"
            summary["doctor_notes"] = notes
            summary["verified_at"] = now

        rec = new_verification_record(summary_id=str(summary["_id"]), doctor_id=doctor_id)
        rec["doctor_notes"] = notes
        rec["verified_at"] = now
        await db[Collections.VERIFICATION_RECORDS].insert_one(rec)

        logger.info("Doctor %s verified summary %s", doctor_id, summary_id)
        return serialize_doc(summary)

    @staticmethod
    async def finalize_summary(
        db: AsyncIOMotorDatabase, summary_id: str, doctor_id: str
    ) -> Dict[str, Any]:
        """
        Finalize and sign off on a clinical summary (set status to doctor_approved).
        """
        now = datetime.now(timezone.utc)
        oid = to_object_id(summary_id)
        query = {"_id": oid} if oid else {"$or": [{"_id": summary_id}, {"patient_id": summary_id}]}

        summary = await db[Collections.CLINICAL_SUMMARIES].find_one(query)

        if not summary:
            new_sum = {
                "patient_id": summary_id,
                "chief_complaint": "Intake consultation",
                "status": "doctor_approved",
                "finalized_at": now,
                "generated_at": now,
            }
            res = await db[Collections.CLINICAL_SUMMARIES].insert_one(new_sum)
            new_sum["_id"] = res.inserted_id
            summary = new_sum
        else:
            await db[Collections.CLINICAL_SUMMARIES].update_one(
                {"_id": summary["_id"]},
                {"$set": {"status": "doctor_approved", "finalized_at": now}}
            )
            summary["status"] = "doctor_approved"
            summary["finalized_at"] = now

        await db[Collections.VERIFICATION_RECORDS].update_one(
            {"summary_id": str(summary["_id"])},
            {"$set": {"status": "doctor_approved", "doctor_id": doctor_id, "finalized_at": now}},
            upsert=True
        )

        logger.info("Doctor %s finalized summary %s", doctor_id, summary_id)
        return serialize_doc(summary)
