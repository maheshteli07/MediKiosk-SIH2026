"""
model.py – Patient Module MongoDB Document Model
Developer 1

Defines the MongoDB document structure for the patients collection.
Not an ORM model — documents are plain dicts validated via schemas.
This file documents the collection schema and provides a factory function.
"""

from datetime import datetime


# MongoDB Collection: patients
PATIENT_DOCUMENT_STRUCTURE = {
    "_id": "ObjectId",
    "name": "str",
    "age": "int",
    "gender": "str – Male | Female | Other",
    "phone": "str – 10-digit",
    "abha_id": "str | None",
    "aadhaar": "str | None – store masked",
    "address": "str | None",
    "date_of_birth": "str | None – ISO date",
    "language": "str – language code e.g. 'en', 'hi'",
    "consultation_mode": "str | None – general | ayush",
    "consent_given": "bool",
    "consent_timestamp": "datetime | None",
    "created_at": "datetime",
    "updated_at": "datetime",
}


def new_patient_document(data: dict) -> dict:
    """
    Factory function to create a properly structured patient document
    ready for MongoDB insertion.
    """
    now = datetime.utcnow()
    return {
        "name": data.get("name"),
        "age": data.get("age"),
        "gender": data.get("gender"),
        "phone": data.get("phone"),
        "abha_id": data.get("abha_id"),
        "aadhaar": data.get("aadhaar"),
        "address": data.get("address"),
        "date_of_birth": data.get("date_of_birth"),
        "language": data.get("language", "en"),
        "consultation_mode": data.get("consultation_mode"),
        "consent_given": False,
        "consent_timestamp": None,
        "created_at": now,
        "updated_at": now,
    }
