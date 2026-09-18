"""model.py - Doctor Module Document Model - Developer 5
Collections: doctor_users, verification_records, integration_records"""
from datetime import datetime

def new_doctor_document(username: str, hashed_password: str, name: str, role: str = 'doctor') -> dict:
    return {
        'username': username,
        'hashed_password': hashed_password,
        'name': name,
        'role': role,
        'specialization': None,
        'registration_number': None,
        'is_active': True,
        'created_at': datetime.utcnow(),
    }

def new_verification_record(summary_id: str, doctor_id: str) -> dict:
    return {
        'summary_id': summary_id,
        'doctor_id': doctor_id,
        'status': 'pending',
        'doctor_notes': None,
        'verified_at': None,
        'finalized_at': None,
        'created_at': datetime.utcnow(),
    }
