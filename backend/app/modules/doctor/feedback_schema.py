"""
modules/doctor/feedback_schema.py – Schemas for Post-Visit Patient Feedback
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class CategoryRatings(BaseModel):
    listening: int = Field(default=5, ge=1, le=5, description="Empathy and listening rating (1-5)")
    clarity: int = Field(default=5, ge=1, le=5, description="Treatment and prescription clarity rating (1-5)")
    timing: int = Field(default=5, ge=1, le=5, description="Wait time and consultation pacing (1-5)")
    ayush_guidance: Optional[int] = Field(default=5, ge=1, le=5, description="AYUSH & holistic care guidance (1-5)")


class FeedbackCreateRequest(BaseModel):
    doctor_id: str = Field(default="dr_ankit_mehta", description="Target doctor ID")
    doctor_name: str = Field(default="Dr. Ankit Mehta", description="Doctor display name")
    patient_id: Optional[str] = Field(default="P-2026-8841", description="Patient ID")
    patient_name: Optional[str] = Field(default="Ramesh Chandra", description="Patient Name")
    rating: int = Field(..., ge=1, le=5, description="Overall doctor rating between 1 and 5")
    category_ratings: Optional[CategoryRatings] = None
    tags: List[str] = Field(default_factory=list, description="Selected feedback tags or chips")
    comment: str = Field(..., min_length=2, max_length=2000, description="Patient feedback text / comment")
    is_anonymous: bool = Field(default=False, description="Whether to hide patient identity from public doctor display")
    recommend: Optional[str] = Field(default="yes", description="Would patient recommend: yes | maybe | no")
    visit_complaint: Optional[str] = Field(default=None, description="Chief complaint / visit context")


class FeedbackItem(BaseModel):
    id: str
    doctor_id: str
    doctor_name: str
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    rating: int
    category_ratings: Optional[CategoryRatings] = None
    tags: List[str] = Field(default_factory=list)
    comment: str
    is_anonymous: bool = False
    recommend: Optional[str] = "yes"
    visit_complaint: Optional[str] = None
    is_acknowledged: bool = False
    created_at: datetime


class FeedbackStats(BaseModel):
    average_rating: float
    total_reviews: int
    recommend_percentage: int
    rating_breakdown: Dict[str, int]
    category_averages: Dict[str, float]


class FeedbackListResponse(BaseModel):
    stats: FeedbackStats
    reviews: List[FeedbackItem]
