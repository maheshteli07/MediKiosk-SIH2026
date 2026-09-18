/**
 * mockDocumentData.js – Documents Module – Dev 3
 */

export const MOCK_DOCUMENTS = [
  {
    id: "doc-001",
    patientId: "mock-patient-001",
    fileName: "prescription_jan2024.jpg",
    fileType: "image/jpeg",
    status: "processed",
    uploadedAt: new Date().toISOString(),
    extracted: {
      medications: ["Metformin 500mg", "Amlodipine 5mg"],
      date: "2024-01-15",
      doctor: "Dr. Sharma",
    },
  },
];
