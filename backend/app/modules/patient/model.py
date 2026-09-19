"""
app/modules/patient/model.py – Patient Module Model Adapter
===========================================================
Re-exports document shape helpers and factories from `app.modules.patient.models`
for backward compatibility.
"""

from app.modules.patient.models import *

# Legacy alias helper
PATIENT_DOCUMENT_STRUCTURE = {
    "_id": "ObjectId",
    "patient_uid": "str",
    "full_name": "str",
    "age": "int",
    "gender": "str",
    "phone": "str",
    "abha_id": "str | None",
    "address": "str | None",
    "city": "str | None",
    "date_of_birth": "str | None",
    "preferred_language": "str",
    "created_at": "datetime",
    "updated_at": "datetime",
}


def new_patient_document(data: dict) -> dict:
    """Legacy alias for new_patient_doc."""
    return new_patient_doc(data)
