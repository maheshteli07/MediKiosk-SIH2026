/**
 * mockDoctorQueueData.js – Mock doctor queue with 5 realistic patient cases.
 *
 * Case statuses:
 *   - "draft" (blue badge - awaiting review)
 *   - "needs_check" (ayush gold badge - ready for doctor verification with flagged fields)
 *   - "doctor_approved" (success green badge - signed off)
 */

export const MOCK_DOCTOR_QUEUE = [
  {
    id: "c1",
    patientId: "P-2026-8841",
    patientName: "Ramesh Chandra",
    age: 44,
    gender: "Male",
    bloodGroup: "B+",
    chiefComplaint: "High fever (3 days), severe headache, dry cough & sore throat",
    waitTime: "8 mins ago",
    status: "needs_check", // draft | needs_check | doctor_approved
    completionPercentage: 90,
    hasFlaggedFields: true,
    hasUploadedDocs: true,
    doctorAssigned: "Dr. Ankit Mehta",

    // Structured AI Draft
    summaryDraft: {
      chiefComplaint: "High grade fever for 3 days accompanied by intense frontal headache, dry cough, and sore throat.",
      history: [
        { condition: "Type 2 Diabetes Mellitus", onset: "Jan 2025", confidence: "confirmed" },
        { condition: "Mild Hypertension", onset: "Nov 2024", confidence: "detected" },
        { condition: "Penicillin Allergy", onset: "Childhood", confidence: "needs_check" },
      ],
      symptoms: [
        { name: "Fever (High grade)", duration: "3 days", severity: "Severe", confidence: "confirmed" },
        { name: "Headache", duration: "3 days", severity: "Severe", confidence: "confirmed" },
        { name: "Dry Cough", duration: "1 day", severity: "Moderate", confidence: "detected" },
        { name: "Sore Throat", duration: "1 day", severity: "Mild", confidence: "detected" },
      ],
      medications: [
        { name: "Paracetamol 650mg", dosage: "1 tab twice daily", type: "allopathy", confidence: "confirmed" },
        { name: "Amoxicillin 500mg", dosage: "1 cap thrice daily", type: "allopathy", confidence: "confirmed" },
        { name: "Sudarshan Ghanvati", dosage: "2 tabs twice daily", type: "ayush", confidence: "confirmed" },
        { name: "Ashwagandha Churna", dosage: "1 tsp at bedtime", type: "ayush", confidence: "detected" },
      ],
      ayushNotes: {
        prakriti: "Pitta-Kapha (55% Pitta / 30% Kapha / 15% Vata)",
        agniState: "Mandagni (Sluggish Metabolic Fire)",
      },
    },

    // Source Evidence (Transcript & Scans)
    evidence: {
      transcript: [
        { sender: "ai", text: "Namaste! Please describe what health problem brought you here today." },
        { sender: "patient", text: "I have had a severe fever and intense headache for 3 days." },
        { sender: "ai", text: "Are you experiencing any other symptoms like cough or sore throat?" },
        { sender: "patient", text: "Yes, I have a dry cough and painful sore throat since yesterday." },
        { sender: "ai", text: "Have you taken any medications or remedies for this yet?" },
        { sender: "patient", text: "I took Paracetamol 650mg twice today. I have Type 2 Diabetes for 4 years." },
      ],
      documents: [
        {
          id: "doc-1",
          fileName: "Prescription_Dr_Sharma.jpg",
          thumbnailUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80",
          extractedText: "Dr. R. Sharma - City Heart Clinic. Rx: Amoxicillin 500mg tid x 5d, Paracetamol 650mg. Diagnosis: URTI.",
        },
        {
          id: "doc-2",
          fileName: "Blood_Test_Metropolis.pdf",
          thumbnailUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&auto=format&fit=crop&q=80",
          extractedText: "Metropolis Lab. Fasting Glucose: 112 mg/dL. HbA1c: 7.4% [Flagged Needs Check - smudge blurred].",
        },
      ],
    },
  },

  {
    id: "c2",
    patientId: "P-2026-9012",
    patientName: "Priya Sundaram",
    age: 32,
    gender: "Female",
    bloodGroup: "O+",
    chiefComplaint: "Throbbing migraine headache & nausea for 2 days",
    waitTime: "15 mins ago",
    status: "draft",
    completionPercentage: 75,
    hasFlaggedFields: false,
    hasUploadedDocs: true,
    doctorAssigned: "Dr. Ankit Mehta",
    summaryDraft: {
      chiefComplaint: "Unilateral throbbing headache with light sensitivity & nausea.",
      history: [{ condition: "Episodic Migraine", onset: "2 years", confidence: "confirmed" }],
      symptoms: [
        { name: "Throbbing Headache", duration: "2 days", severity: "Severe", confidence: "confirmed" },
        { name: "Nausea", duration: "1 day", severity: "Moderate", confidence: "detected" },
      ],
      medications: [
        { name: "Naproxen 500mg", dosage: "As needed", type: "allopathy", confidence: "confirmed" },
        { name: "Brahmi Vati", dosage: "1 tab morning", type: "ayush", confidence: "detected" },
      ],
      ayushNotes: { prakriti: "Pitta-Vata", agniState: "Tikshnagni" },
    },
    evidence: {
      transcript: [
        { sender: "ai", text: "Please describe your current headache." },
        { sender: "patient", text: "It is a severe throbbing pain on the left side of my head with nausea." },
      ],
      documents: [],
    },
  },

  {
    id: "c3",
    patientId: "P-2026-7734",
    patientName: "Suresh Kumar",
    age: 58,
    gender: "Male",
    bloodGroup: "A+",
    chiefComplaint: "Dizziness and elevated blood pressure reading (155/95 mmHg)",
    waitTime: "22 mins ago",
    status: "needs_check",
    completionPercentage: 85,
    hasFlaggedFields: true,
    hasUploadedDocs: true,
    doctorAssigned: "Dr. Ankit Mehta",
    summaryDraft: {
      chiefComplaint: "Complains of dizziness and occipital pressure. Self-recorded BP 155/95 mmHg.",
      history: [{ condition: "Essential Hypertension", onset: "5 years", confidence: "confirmed" }],
      symptoms: [
        { name: "Dizziness", duration: "2 days", severity: "Moderate", confidence: "confirmed" },
        { name: "Elevated BP", duration: "1 day", severity: "High", confidence: "needs_check" },
      ],
      medications: [{ name: "Amlodipine 5mg", dosage: "1 tab daily", type: "allopathy", confidence: "confirmed" }],
      ayushNotes: { prakriti: "Vata-Pitta", agniState: "Samagni" },
    },
    evidence: {
      transcript: [
        { sender: "ai", text: "When did you first notice dizziness?" },
        { sender: "patient", text: "Yesterday morning. I checked my BP and it was 155 over 95." },
      ],
      documents: [],
    },
  },

  {
    id: "c4",
    patientId: "P-2026-6120",
    patientName: "Sunita Verma",
    age: 28,
    gender: "Female",
    bloodGroup: "AB+",
    chiefComplaint: "Acute dry cough and chest tightness following cold",
    waitTime: "45 mins ago",
    status: "doctor_approved",
    completionPercentage: 100,
    hasFlaggedFields: false,
    hasUploadedDocs: true,
    doctorAssigned: "Dr. Ankit Mehta",
    summaryDraft: {
      chiefComplaint: "Post-viral dry cough for 4 days with chest tightness.",
      history: [{ condition: "Mild Childhood Asthma", onset: "Childhood", confidence: "confirmed" }],
      symptoms: [{ name: "Dry Cough", duration: "4 days", severity: "Moderate", confidence: "confirmed" }],
      medications: [{ name: "Levosalbutamol Inhaler", dosage: "2 puffs prn", type: "allopathy", confidence: "confirmed" }],
      ayushNotes: { prakriti: "Kapha-Vata", agniState: "Mandagni" },
    },
    evidence: { transcript: [], documents: [] },
  },

  {
    id: "c5",
    patientId: "P-2026-5542",
    patientName: "Vikram Singh",
    age: 51,
    gender: "Male",
    bloodGroup: "O-",
    chiefComplaint: "Bilateral knee joint pain & morning stiffness",
    waitTime: "30 mins ago",
    status: "draft",
    completionPercentage: 70,
    hasFlaggedFields: false,
    hasUploadedDocs: false,
    doctorAssigned: "Dr. Ankit Mehta",
    summaryDraft: {
      chiefComplaint: "Bilateral knee pain aggravated by climbing stairs and morning stiffness.",
      history: [{ condition: "Osteoarthritis Knees", onset: "3 years", confidence: "confirmed" }],
      symptoms: [{ name: "Knee Joint Pain", duration: "3 weeks", severity: "Moderate", confidence: "confirmed" }],
      medications: [{ name: "Shallaki 500mg", dosage: "1 tab bid", type: "ayush", confidence: "confirmed" }],
      ayushNotes: { prakriti: "Vata-Kapha", agniState: "Vishamagni" },
    },
    evidence: { transcript: [], documents: [] },
  },
];
