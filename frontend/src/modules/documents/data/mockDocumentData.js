/**
 * mockDocumentData.js – Sample prescription & lab report OCR extraction data.
 */

export const SAMPLE_DOCUMENTS = [
  {
    id: "doc-clean-01",
    fileName: "Prescription_Dr_Sharma.jpg",
    fileSize: "1.8 MB",
    fileType: "image/jpeg",
    uploadTime: "Just now",
    status: "extracted", // queued | reading | extracted | needs_check
    overallConfidence: 0.96,
    thumbnailUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80",
    extractedData: {
      doctorName: { value: "Dr. Rajesh Sharma (MD Cardiology)", lowConfidence: false },
      clinicName: { value: "City Heart & Care Clinic, New Delhi", lowConfidence: false },
      documentDate: { value: "12-Sep-2026", lowConfidence: false },
      diagnosis: { value: "Acute Viral Bronchitis", lowConfidence: false },
      medicines: [
        { name: "Amoxicillin 500mg", dosage: "1 capsule 3x daily", duration: "5 days", lowConfidence: false },
        { name: "Paracetamol 650mg", dosage: "1 tablet as needed", duration: "3 days", lowConfidence: false },
        { name: "Cetirizine 10mg", dosage: "1 tablet at bedtime", duration: "5 days", lowConfidence: false },
      ],
      notes: { value: "Drink warm water. Rest for 3 days. Review if fever persists.", lowConfidence: false },
    },
  },
  {
    id: "doc-flagged-02",
    fileName: "Blood_Test_Metropolis.pdf",
    fileSize: "2.4 MB",
    fileType: "application/pdf",
    uploadTime: "Just now",
    status: "needs_check", // calm expected status, not error
    overallConfidence: 0.78,
    thumbnailUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&auto=format&fit=crop&q=80",
    extractedData: {
      doctorName: { value: "Dr. Ananya Verma", lowConfidence: false },
      clinicName: { value: "Metropolis Clinical Diagnostic Lab", lowConfidence: false },
      documentDate: { value: "05-Sep-2026", lowConfidence: false },
      diagnosis: { value: "Routine Diabetic Follow-up", lowConfidence: false },
      medicines: [],
      labResults: [
        { testName: "Fasting Blood Sugar", result: "112 mg/dL", referenceRange: "70 - 99 mg/dL", lowConfidence: false },
        { testName: "HbA1c (Glycated Hemoglobin)", result: "7.4 %", referenceRange: "< 5.7 %", lowConfidence: true }, // FLAGGED LOW CONFIDENCE
        { testName: "Total Cholesterol", result: "185 mg/dL", referenceRange: "< 200 mg/dL", lowConfidence: false },
      ],
      notes: { value: "HbA1c value slightly smudge blurred on scan paper.", lowConfidence: true },
    },
  },
];
