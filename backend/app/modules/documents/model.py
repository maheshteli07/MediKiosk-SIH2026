"""model.py - Documents Module Document Model - Developer 3
Collections: documents, document_extractions"""
from datetime import datetime

def new_document_document(patient_id: str, filename: str, file_type: str, file_path: str) -> dict:
    return {
        'patient_id': patient_id,
        'file_name': filename,
        'file_type': file_type,
        'file_path': file_path,
        'status': 'uploaded',
        'uploaded_at': datetime.utcnow(),
        'processed_at': None,
    }
