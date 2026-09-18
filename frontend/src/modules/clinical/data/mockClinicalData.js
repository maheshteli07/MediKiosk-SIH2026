/**
 * mockClinicalData.js – Clinical Module – Dev 4
 */

export const MOCK_CLINICAL_SUMMARY = {
  patientId: "mock-patient-001",
  chiefComplaint: "Chest pain for 3 days",
  historyOfPresentIllness: "Patient presents with dull aching chest pain...",
  pastMedicalHistory: ["Hypertension", "Type 2 Diabetes"],
  familyHistory: ["Father: MI at age 58"],
  redFlags: [{ description: "Chest pain with exertion", severity: "high" }],
  aiConfidence: 0.87,
  status: "draft",
  generatedAt: new Date().toISOString(),
};

export const MOCK_TIMELINE_EVENTS = [
  {
    id: "te-001",
    date: "2024-01-15",
    title: "Hypertension Diagnosed",
    description: "BP 160/100 noted at primary care visit",
    source: "document",
  },
  {
    id: "te-002",
    date: "2026-09-18",
    title: "Current Visit",
    description: "Chest pain – MediKiosk intake",
    source: "conversation",
  },
];
