/**
 * mockPatientHistory.js – Unified patient record combining Allopathy & AYUSH.
 *
 * Principle: "One record, two traditions".
 * Contains interleaved clinical events, symptoms, medications, and AYUSH Prakriti notes.
 */

export const MOCK_PATIENT_RECORD = {
  patientInfo: {
    id: "P-2026-8841",
    name: "Ramesh Chandra",
    age: 44,
    gender: "Male",
    bloodGroup: "B+",
    chiefComplaint: "Severe fever, headache, and persistent dry cough for 3 days",
  },

  // Interleaved Visit Timeline Events
  timelineEvents: [
    {
      id: "ev-1",
      date: "18-Sep-2026",
      time: "10:30 AM",
      title: "Current Kiosk Voice Intake & Symptom Survey",
      source: "conversation", // conversation | document
      system: "allopathy", // allopathy | ayush
      summary: "Patient reported high fever (3 days), severe headache, dry cough, and sore throat. Self-medicated with Paracetamol.",
      confidence: "confirmed",
    },
    {
      id: "ev-2",
      date: "12-Sep-2026",
      time: "02:15 PM",
      title: "Uploaded Prescription — City Heart & Care Clinic",
      source: "document",
      system: "allopathy",
      summary: "Diagnosed with Acute Upper Respiratory Infection by Dr. R. Sharma. Prescribed Amoxicillin 500mg and Cetirizine.",
      confidence: "confirmed",
    },
    {
      id: "ev-3",
      date: "05-Aug-2026",
      time: "11:00 AM",
      title: "Ayurvedic Nadi Pariksha & Integrative Assessment",
      source: "document",
      system: "ayush",
      summary: "Identified Pitta-Vata Vridhi with Mandagni (sluggish digestive fire). Recommended Sudarshan Ghanvati and diet modification.",
      confidence: "confirmed",
    },
    {
      id: "ev-4",
      date: "14-Jan-2025",
      time: "09:45 AM",
      title: "Annual Health Checkup & Lab Panel",
      source: "document",
      system: "allopathy",
      summary: "Fasting Glucose 112 mg/dL, HbA1c 7.4% (Flagged Needs Check). Diagnosed with Type 2 Diabetes Mellitus.",
      confidence: "needs_check",
    },
  ],

  // Categorized Symptoms with Confidence Badges
  symptoms: [
    { id: "s1", name: "High Grade Fever", duration: "3 days", severity: "Severe", confidence: "confirmed" },
    { id: "s2", name: "Headache", duration: "3 days", severity: "Moderate-Severe", confidence: "confirmed" },
    { id: "s3", name: "Dry Cough", duration: "1 day", severity: "Moderate", confidence: "detected" },
    { id: "s4", name: "Sore Throat", duration: "1 day", severity: "Mild", confidence: "detected" },
    { id: "s5", name: "Body Ache & Malaise", duration: "2 days", severity: "Moderate", confidence: "needs_check" },
  ],

  // Active & Past Medications (Allopathy + AYUSH Interleaved)
  medications: [
    { id: "m1", name: "Paracetamol 650mg", dosage: "1 tab twice daily", type: "allopathy", status: "Active", confidence: "confirmed" },
    { id: "m2", name: "Amoxicillin 500mg", dosage: "1 cap thrice daily (5 days)", type: "allopathy", status: "Active", confidence: "confirmed" },
    { id: "m3", name: "Sudarshan Ghanvati", dosage: "2 tabs twice daily after meals", type: "ayush", status: "Active", confidence: "confirmed" },
    { id: "m4", name: "Ashwagandha Churna", dosage: "1 tsp with warm milk at bedtime", type: "ayush", status: "Active", confidence: "detected" },
    { id: "m5", name: "Metformin 500mg", dosage: "1 tab daily with breakfast", type: "allopathy", status: "Active", confidence: "needs_check" },
  ],

  // Past Medical History & Chronic Conditions
  history: [
    { id: "h1", condition: "Type 2 Diabetes Mellitus", onset: "Jan 2025 (4 years)", category: "Chronic Disease", confidence: "confirmed" },
    { id: "h2", condition: "Mild Hypertension", onset: "Nov 2024", category: "Cardiovascular", confidence: "detected" },
    { id: "h3", condition: "Penicillin Allergy", onset: "Known since childhood", category: "Allergy", confidence: "needs_check" },
  ],

  // AYUSH Specific Assessment Record
  ayushAssessment: {
    prakriti: {
      primary: "Pitta",
      secondary: "Kapha",
      description: "Pitta-Kapha Prakriti (Vigor with tendency toward heat & respiratory congestion)",
      pittaPercentage: 55,
      kaphaPercentage: 30,
      vataPercentage: 15,
    },
    agniState: "Mandagni (Sluggish Metabolic Fire)",
    koshthaState: "Madhyama Koshtha",
    dhatuImbalance: "Rasa & Rakta Dhatu Vitiation",
    recommendations: [
      "Avoid excessively spicy, oily, and sour foods.",
      "Sip warm ginger-water throughout the day.",
      "Practice Nadi Shodhana Pranayama daily for 10 minutes.",
    ],
  },
};
