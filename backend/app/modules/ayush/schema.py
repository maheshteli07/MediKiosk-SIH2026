"""schema.py - AYUSH Module Schemas - Developer 4"""
from pydantic import BaseModel
from typing import Optional, List, Dict

class PrakritiSchema(BaseModel):
    vata: Optional[int] = None
    pitta: Optional[int] = None
    kapha: Optional[int] = None

class AyushHistoryCreateSchema(BaseModel):
    patient_id: str
    prakriti: Optional[PrakritiSchema] = None
    vikriti: Optional[PrakritiSchema] = None
    agni: Optional[str] = None
    koshtha: Optional[str] = None
    ahara: Optional[str] = None
    vihara: Optional[str] = None
    nidana: Optional[List[str]] = None
    samprapti: Optional[str] = None
    trividha_pariksha: Optional[Dict] = None
    ashtavidha_pariksha: Optional[Dict] = None
    dashavidha_pariksha: Optional[Dict] = None
