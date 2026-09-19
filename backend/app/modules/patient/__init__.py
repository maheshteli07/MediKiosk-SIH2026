"""
app/modules/patient – Patient & Consultation Backend Module
============================================================
Exports patient module router, service, repository, models, and index setup.
"""

from app.modules.patient.indexes import ensure_patient_indexes
from app.modules.patient.repository import PatientRepository
from app.modules.patient.router import router
from app.modules.patient.service import PatientService

__all__ = [
    "router",
    "PatientService",
    "PatientRepository",
    "ensure_patient_indexes",
]
