"""model.py - Clinical Module Document Model - Developer 4
Collections: clinical_summaries, timeline_events"""
from datetime import datetime

def new_clinical_summary_document(patient_id: str) -> dict:
    return {
        'patient_id': patient_id,
        'chief_complaint': None,
        'history_of_present_illness': None,
        'past_medical_history': [],
        'family_history': [],
        'social_history': None,
        'review_of_systems': {},
        'red_flags': [],
        'ai_confidence': None,
        'status': 'draft',
        'doctor_notes': None,
        'generated_at': datetime.utcnow(),
        'verified_at': None,
        'finalized_at': None,
    }
