"""
app/modules/patient/constants.py – Patient Module Constants and Enums
=====================================================================
Contains all static configuration, supported languages, consultation modes,
session steps, transition rules, and timeout defaults.
"""

from enum import Enum
from typing import Dict, List, Set


# ── Supported Languages ────────────────────────────────────────────────────────
# 11 Indian Languages + English ISO 639-1 / 639-2 codes
SUPPORTED_LANGUAGES: Dict[str, Dict[str, str]] = {
    "en": {"code": "en", "name": "English", "native_name": "English", "script": "Latn"},
    "hi": {"code": "hi", "name": "Hindi", "native_name": "हिन्दी", "script": "Deva"},
    "kn": {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ", "script": "Knda"},
    "ta": {"code": "ta", "name": "Tamil", "native_name": "தமிழ்", "script": "Taml"},
    "te": {"code": "te", "name": "Telugu", "native_name": "తెలుగు", "script": "Telu"},
    "ml": {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം", "script": "Mlym"},
    "mr": {"code": "mr", "name": "Marathi", "native_name": "मराठी", "script": "Deva"},
    "bn": {"code": "bn", "name": "Bengali", "native_name": "বাংলা", "script": "Beng"},
    "gu": {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી", "script": "Gujr"},
    "pa": {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ", "script": "Guru"},
    "or": {"code": "or", "name": "Odia", "native_name": "ଓଡ଼ିଆ", "script": "Orya"},
}

DEFAULT_LANGUAGE = "en"


# ── Consultation Mode ─────────────────────────────────────────────────────────
class ConsultationMode(str, Enum):
    GENERAL = "general"
    AYUSH = "ayush"


CONSULTATION_MODE_DETAILS: Dict[str, Dict[str, any]] = {
    ConsultationMode.GENERAL.value: {
        "mode": ConsultationMode.GENERAL.value,
        "name": "General Clinical History",
        "description": "Standard SOAP-based allopathic history taking, symptom triaging, and clinical summary.",
        "features": [
            "Chief Complaint & History of Present Illness (HPI)",
            "Systemic Review & Past Medical History",
            "Medication & Allergy Reconciliation",
            "Red-flag Screening & Vital Signs Check",
            "SOAP Structured Clinical Output",
        ],
    },
    ConsultationMode.AYUSH.value: {
        "mode": ConsultationMode.AYUSH.value,
        "name": "AYUSH / Ayurveda History",
        "description": "Holistic Ayurvedic intake covering Prakriti, Vikriti, Nidana, Samprapti, and Pariksha.",
        "features": [
            "Prakriti Assessment (Vata, Pitta, Kapha constitutional analysis)",
            "Vikriti (Current dosha imbalance evaluation)",
            "Nidana Panchaka (Etiology and pathogenesis tracking)",
            "Ashtavidha & Dashavidha Pariksha inputs",
            "Ahara-Vihara (Diet & Lifestyle assessment)",
        ],
    },
}


# ── Session Step ───────────────────────────────────────────────────────────────
class SessionStep(str, Enum):
    WELCOME = "welcome"
    LANGUAGE_SELECTION = "language_selection"
    CONSENT = "consent"
    PATIENT_IDENTIFICATION = "patient_identification"
    BASIC_DETAILS = "basic_details"
    CONSULTATION_MODE = "consultation_mode"
    AI_HISTORY_TAKING = "ai_history_taking"
    RED_FLAG_SCREENING = "red_flag_screening"
    DOCUMENT_SCANNING = "document_scanning"
    DOCUMENT_PROCESSING = "document_processing"
    CLINICAL_HISTORY = "clinical_history"
    MEDICAL_TIMELINE = "medical_timeline"
    AI_SUMMARY = "ai_summary"
    DOCTOR_REVIEW = "doctor_review"
    DOCTOR_VERIFICATION = "doctor_verification"
    COMPLETED = "completed"


# Ordered sequence of steps
SESSION_STEPS_ORDER: List[SessionStep] = [
    SessionStep.WELCOME,
    SessionStep.LANGUAGE_SELECTION,
    SessionStep.CONSENT,
    SessionStep.PATIENT_IDENTIFICATION,
    SessionStep.BASIC_DETAILS,
    SessionStep.CONSULTATION_MODE,
    SessionStep.AI_HISTORY_TAKING,
    SessionStep.RED_FLAG_SCREENING,
    SessionStep.DOCUMENT_SCANNING,
    SessionStep.DOCUMENT_PROCESSING,
    SessionStep.CLINICAL_HISTORY,
    SessionStep.MEDICAL_TIMELINE,
    SessionStep.AI_SUMMARY,
    SessionStep.DOCTOR_REVIEW,
    SessionStep.DOCTOR_VERIFICATION,
    SessionStep.COMPLETED,
]

# Step index mapping for O(1) transition lookup
STEP_INDEX_MAP: Dict[SessionStep, int] = {step: idx for idx, step in enumerate(SESSION_STEPS_ORDER)}


# ── Session Status ─────────────────────────────────────────────────────────────
class SessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"
    EXPIRED = "expired"


# ── Consent Types ──────────────────────────────────────────────────────────────
class ConsentType(str, Enum):
    DATA_COLLECTION = "data_collection"
    AI_PROCESSING = "ai_processing"
    ABDM_SHARING = "abdm_sharing"


# Default consent version
CURRENT_CONSENT_VERSION = "v1.0"


# ── Gender ────────────────────────────────────────────────────────────────────
class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


# ── Session Timeouts ──────────────────────────────────────────────────────────
DEFAULT_SESSION_TIMEOUT_MINUTES: int = 30
