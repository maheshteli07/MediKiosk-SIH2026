"""model.py - AYUSH Module Document Model - Developer 4
Collection: ayush_histories"""
from datetime import datetime

def new_ayush_history_document(patient_id: str, data: dict) -> dict:
    now = datetime.utcnow()
    return {
        'patient_id': patient_id,
        'prakriti': data.get('prakriti'),
        'vikriti': data.get('vikriti'),
        'agni': data.get('agni'),
        'koshtha': data.get('koshtha'),
        'ahara': data.get('ahara'),
        'vihara': data.get('vihara'),
        'nidana': data.get('nidana', []),
        'samprapti': data.get('samprapti'),
        'trividha_pariksha': data.get('trividha_pariksha', {}),
        'ashtavidha_pariksha': data.get('ashtavidha_pariksha', {}),
        'dashavidha_pariksha': data.get('dashavidha_pariksha', {}),
        'created_at': now,
        'updated_at': now,
    }
