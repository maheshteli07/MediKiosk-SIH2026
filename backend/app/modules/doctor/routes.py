"""
modules/doctor/routes.py – Doctor Module Routes
================================================
Developer 5 owns implementation.  Stub endpoints return HTTP 501.
Auth protected endpoints use require_doctor dependency.

Note: /api/auth/login and /api/auth/dev-token live in core/security.py
      and are mounted at /api/auth in main.py.

Endpoints (prefix: /api/doctor)
---------------------------------
  GET  /api/doctor/patients                        – Patient queue
  GET  /api/doctor/patients/{patient_id}           – Full patient case
  PUT  /api/doctor/summary/{summary_id}/verify     – Mark summary verified
  POST /api/doctor/summary/{summary_id}/finalize   – Finalize and sign off
  POST /api/doctor/integrations/fhir               – Push to FHIR
  POST /api/doctor/integrations/abdm               – Push to ABDM
  POST /api/doctor/integrations/his                – Push to HIS
  GET  /api/doctor/integrations/status/{patient_id}– Integration status
"""

from fastapi import APIRouter, Depends, Query
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from app.core.dependencies import get_db, require_doctor
from app.core.database import Collections
from app.utils.response import error_envelope, success_response, created_response
from app.modules.doctor.feedback_schema import FeedbackCreateRequest

router = APIRouter()

_NOT_IMPL = error_envelope("Not yet implemented", code="NOT_IMPLEMENTED", status_code=501)

# In-memory storage for feedback fallback & development
_FEEDBACK_STORE: List[Dict[str, Any]] = [
    {
        "id": "fb-1",
        "doctor_id": "dr_ankit_mehta",
        "doctor_name": "Dr. Ankit Mehta",
        "patient_id": "P-2026-8841",
        "patient_name": "Ramesh Chandra",
        "rating": 5,
        "category_ratings": {"listening": 5, "clarity": 5, "timing": 4, "ayush_guidance": 5},
        "tags": ["Listened Patiently", "Clear Prescription", "Helpful AYUSH Guidance", "Kind & Reassuring"],
        "comment": "Dr. Ankit was extremely thorough and kind. He took the time to review my high fever history, explained the antibiotic course in detail, and suggested herbal Sudarshan Ghanvati alongside paracetamol. Feeling much better already!",
        "is_anonymous": False,
        "recommend": "yes",
        "visit_complaint": "High fever, headache, sore throat",
        "is_acknowledged": True,
        "created_at": "2026-09-19T10:30:00Z",
    },
    {
        "id": "fb-2",
        "doctor_id": "dr_ankit_mehta",
        "doctor_name": "Dr. Ankit Mehta",
        "patient_id": "P-2026-9012",
        "patient_name": "Priya Sundaram",
        "rating": 5,
        "category_ratings": {"listening": 5, "clarity": 5, "timing": 5, "ayush_guidance": 5},
        "tags": ["Attentive", "Reassuring Demeanor", "Accurate Diagnosis"],
        "comment": "Outstanding consultation. The doctor took my migraine symptoms seriously and explained triggers and preventive sleep habits. Loved the integrated Brahmi Vati recommendation!",
        "is_anonymous": False,
        "recommend": "yes",
        "visit_complaint": "Throbbing migraine headache & nausea",
        "is_acknowledged": True,
        "created_at": "2026-09-18T16:15:00Z",
    },
    {
        "id": "fb-3",
        "doctor_id": "dr_ankit_mehta",
        "doctor_name": "Dr. Ankit Mehta",
        "patient_id": "P-2026-7734",
        "patient_name": "Suresh Kumar",
        "rating": 4,
        "category_ratings": {"listening": 5, "clarity": 4, "timing": 4, "ayush_guidance": 4},
        "tags": ["Knowledgeable", "Clear Prescription", "Good Advice"],
        "comment": "Very competent physician. Addressed my sudden blood pressure spike promptly, adjusted dosage, and provided clear lifestyle modifications.",
        "is_anonymous": False,
        "recommend": "yes",
        "visit_complaint": "Dizziness and elevated BP (155/95)",
        "is_acknowledged": False,
        "created_at": "2026-09-17T11:45:00Z",
    },
    {
        "id": "fb-4",
        "doctor_id": "dr_ankit_mehta",
        "doctor_name": "Dr. Ankit Mehta",
        "patient_id": "P-2026-6120",
        "patient_name": "Sunita Verma",
        "rating": 5,
        "category_ratings": {"listening": 5, "clarity": 5, "timing": 5, "ayush_guidance": 5},
        "tags": ["Quick Triage", "Accurate Diagnosis", "Compassionate"],
        "comment": "Prompt and effective diagnosis for my post-viral chest tightness. The inhaler guidance was clear and immediate relief followed.",
        "is_anonymous": True,
        "recommend": "yes",
        "visit_complaint": "Acute dry cough and chest tightness",
        "is_acknowledged": False,
        "created_at": "2026-09-16T14:20:00Z",
    },
    {
        "id": "fb-5",
        "doctor_id": "dr_ankit_mehta",
        "doctor_name": "Dr. Ankit Mehta",
        "patient_id": "P-2026-5542",
        "patient_name": "Vikram Singh",
        "rating": 4,
        "category_ratings": {"listening": 4, "clarity": 4, "timing": 3, "ayush_guidance": 5},
        "tags": ["Helpful AYUSH Advice", "Thorough Examination"],
        "comment": "Doctor spent good time assessing both my knees and explaining osteoarthritis management. Waiting time at reception was a bit long (20 mins), but the consultation itself was top notch.",
        "is_anonymous": False,
        "recommend": "yes",
        "visit_complaint": "Bilateral knee joint pain & morning stiffness",
        "is_acknowledged": False,
        "created_at": "2026-09-15T09:10:00Z",
    },
]


def _compute_stats(reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(reviews)
    if total == 0:
        return {
            "average_rating": 0.0,
            "total_reviews": 0,
            "recommend_percentage": 100,
            "rating_breakdown": {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0},
            "category_averages": {"listening": 5.0, "clarity": 5.0, "timing": 5.0, "ayush_guidance": 5.0},
        }

    sum_rating = sum(r.get("rating", 5) for r in reviews)
    avg_rating = round(sum_rating / total, 1)

    breakdown = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    recommends = 0
    cat_sums = {"listening": 0.0, "clarity": 0.0, "timing": 0.0, "ayush_guidance": 0.0}
    cat_counts = {"listening": 0, "clarity": 0, "timing": 0, "ayush_guidance": 0}

    for r in reviews:
        star_str = str(min(max(r.get("rating", 5), 1), 5))
        breakdown[star_str] = breakdown.get(star_str, 0) + 1
        if r.get("recommend") in ("yes", "highly", True):
            recommends += 1

        cats = r.get("category_ratings") or {}
        for k in ("listening", "clarity", "timing", "ayush_guidance"):
            if k in cats and cats[k] is not None:
                cat_sums[k] += float(cats[k])
                cat_counts[k] += 1

    rec_pct = round((recommends / total) * 100) if total > 0 else 100
    cat_avgs = {
        k: round(cat_sums[k] / cat_counts[k], 1) if cat_counts[k] > 0 else 5.0
        for k in cat_sums
    }

    return {
        "average_rating": avg_rating,
        "total_reviews": total,
        "recommend_percentage": rec_pct,
        "rating_breakdown": breakdown,
        "category_averages": cat_avgs,
    }


# ── Feedback Routes ──────────────────────────────────────────────────────────

@router.post("/feedback", summary="Submit post-visit patient feedback for a doctor")
async def submit_patient_feedback(payload: FeedbackCreateRequest, db=Depends(get_db)):
    """
    Submits patient rating, category evaluations, tags, and comment.
    Accessible from patient kiosk post-visit handover.
    """
    feedback_id = f"fb-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    feedback_doc = {
        "id": feedback_id,
        "doctor_id": payload.doctor_id,
        "doctor_name": payload.doctor_name,
        "patient_id": payload.patient_id if not payload.is_anonymous else "ANON",
        "patient_name": payload.patient_name if not payload.is_anonymous else "Anonymous Patient",
        "rating": payload.rating,
        "category_ratings": payload.category_ratings.model_dump() if payload.category_ratings else {
            "listening": payload.rating,
            "clarity": payload.rating,
            "timing": payload.rating,
            "ayush_guidance": payload.rating,
        },
        "tags": payload.tags,
        "comment": payload.comment.strip(),
        "is_anonymous": payload.is_anonymous,
        "recommend": payload.recommend or "yes",
        "visit_complaint": payload.visit_complaint,
        "is_acknowledged": False,
        "created_at": now_iso,
    }

    # Save to MongoDB if connection is ready
    try:
        await db[Collections.DOCTOR_FEEDBACK].insert_one(dict(feedback_doc))
    except Exception:
        pass  # Motor client might be in mock mode

    # Add to memory store
    _FEEDBACK_STORE.insert(0, feedback_doc)

    return created_response(
        data=feedback_doc,
        message="Patient feedback submitted successfully. Thank you for helping improve doctor care!"
    )


@router.get("/feedback", summary="Get doctor patient reviews and analytics")
async def get_doctor_feedback(
    doctor_id: Optional[str] = Query(None, description="Filter by doctor ID"),
    rating: Optional[int] = Query(None, description="Filter by star rating (1-5)"),
    tag: Optional[str] = Query(None, description="Filter by tag keyword"),
    search: Optional[str] = Query(None, description="Search keyword in comment or patient name"),
    db=Depends(get_db)
):
    """
    Retrieves all feedback for the doctor, including average rating,
    rating breakdown (5★-1★), category scores, and review cards.
    """
    # Fetch from Mongo or fallback to _FEEDBACK_STORE
    all_reviews = list(_FEEDBACK_STORE)
    try:
        cursor = db[Collections.DOCTOR_FEEDBACK].find({}, {"_id": 0}).sort("created_at", -1)
        mongo_reviews = await cursor.to_list(length=100)
        if mongo_reviews:
            # Merge with unique IDs
            existing_ids = {r["id"] for r in all_reviews}
            for mr in mongo_reviews:
                if mr.get("id") not in existing_ids:
                    all_reviews.append(mr)
    except Exception:
        pass

    # Overall stats before filtering
    stats = _compute_stats(all_reviews)

    # Apply filters to review list
    filtered = all_reviews
    if doctor_id:
        filtered = [r for r in filtered if r.get("doctor_id") == doctor_id]
    if rating:
        filtered = [r for r in filtered if r.get("rating") == rating]
    if tag:
        tag_lower = tag.lower()
        filtered = [r for r in filtered if any(tag_lower in t.lower() for t in r.get("tags", []))]
    if search:
        search_lower = search.lower()
        filtered = [
            r for r in filtered
            if search_lower in (r.get("comment") or "").lower()
            or search_lower in (r.get("patient_name") or "").lower()
            or search_lower in (r.get("visit_complaint") or "").lower()
        ]

    return success_response(
        data={
            "stats": stats,
            "reviews": filtered,
            "filtered_count": len(filtered),
        },
        message="Doctor feedback retrieved successfully"
    )


@router.post("/feedback/{feedback_id}/acknowledge", summary="Doctor acknowledges patient review")
async def acknowledge_feedback(feedback_id: str, db=Depends(get_db)):
    """Mark a patient review as reviewed/acknowledged by the doctor."""
    found = False
    for r in _FEEDBACK_STORE:
        if r.get("id") == feedback_id:
            r["is_acknowledged"] = True
            found = True
            break

    try:
        await db[Collections.DOCTOR_FEEDBACK].update_one(
            {"id": feedback_id},
            {"$set": {"is_acknowledged": True}}
        )
        found = True
    except Exception:
        pass

    if not found:
        return error_envelope("Feedback record not found", code="NOT_FOUND", status_code=404)

    return success_response(data={"id": feedback_id, "is_acknowledged": True}, message="Feedback acknowledged")


# ── Existing Doctor Routes ───────────────────────────────────────────────────

@router.get("/patients", summary="Get patient queue for the doctor")
async def get_patient_queue(doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/patients/{patient_id}", summary="Get full patient case")
async def get_patient_case(patient_id: str, doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.put("/summary/{summary_id}/verify", summary="Mark a clinical summary as verified")
async def verify_summary(summary_id: str, doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/summary/{summary_id}/finalize", summary="Finalize and sign off on a summary")
async def finalize_summary(summary_id: str, doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/integrations/fhir", summary="Push patient data to FHIR server")
async def push_fhir(doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/integrations/abdm", summary="Push patient data to ABDM")
async def push_abdm(doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.post("/integrations/his", summary="Push patient data to HIS")
async def push_his(doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL


@router.get("/integrations/status/{patient_id}", summary="Get integration push status")
async def get_integration_status(patient_id: str, doctor=Depends(require_doctor), db=Depends(get_db)):
    return _NOT_IMPL

