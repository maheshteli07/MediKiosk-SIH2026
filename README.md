# MediKiosk – AI-Powered Patient Case-Taking Software

MediKiosk is an AI-powered patient case-taking platform for hospital OPDs (Out-Patient Departments).

## Project Overview

MediKiosk guides patients through a structured, multilingual intake workflow — from welcome and consent through AI-driven history taking, document scanning, clinical summary generation, and doctor review — producing a verified, FHIR-compatible clinical record.

## Patient Workflow

```
Welcome → Language Selection → Consent → Patient Identification
→ Basic Details → Consultation Mode → AI History Taking
→ Red-Flag Screening → Medical Document Scanning → OCR / Document Processing
→ Structured Clinical History → Medical Timeline → AI Clinical Summary
→ Doctor Dashboard → Doctor Review → Doctor Verification
→ Final Clinical Record → HIS / ABDM / FHIR Integration
```

## Consultation Modes

1. **General Clinical History** — Standard SOAP-based history taking
2. **AYUSH / Ayurveda History** — Prakriti, Vikriti, Nidana, Samprapti, Pariksha

## Technology Stack

| Layer        | Technology                                          |
|--------------|-----------------------------------------------------|
| Frontend     | React.js, Vite, Tailwind CSS, React Router, Axios  |
| Backend      | Python, FastAPI, Pydantic, Uvicorn                  |
| Database     | MongoDB                                             |
| AI / NLP     | LLM integration, structured information extraction  |
| Speech       | Bhashini / AI4Bharat, Whisper fallback              |
| OCR          | PaddleOCR, Tesseract fallback                       |
| Integration  | FHIR, ABDM, HIS                                     |
| Auth         | JWT, RBAC                                           |

## Repository Structure

```
MediKiosk-SIH2026/
├── frontend/        # React + Vite application
└── backend/         # FastAPI application
```

## Developer Assignment

| Developer | Ownership                                               |
|-----------|---------------------------------------------------------|
| Dev 1     | patient module (frontend + backend)                     |
| Dev 2     | conversation module (frontend + backend)                |
| Dev 3     | documents module (frontend + backend)                   |
| Dev 4     | ayush + clinical modules (frontend + backend)           |
| Dev 5     | doctor module, backend core, integrations               |

## Git Branches

| Branch                  | Purpose                        |
|-------------------------|--------------------------------|
| `main`                  | Production-ready code          |
| `develop`               | Integration branch             |
| `feature/patient`       | Developer 1 work               |
| `feature/conversation`  | Developer 2 work               |
| `feature/documents`     | Developer 3 work               |
| `feature/ayush-clinical`| Developer 4 work               |
| `feature/doctor`        | Developer 5 work               |

## Getting Started

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## License

Internal use – SIH 2026 Hackathon Project
