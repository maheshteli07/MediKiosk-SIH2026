/**
 * mockDoctorData.js – Doctor Module – Dev 5
 */

export const MOCK_DOCTOR = {
  id: "doc-001",
  name: "Dr. Priya Sharma",
  role: "doctor",
  specialization: "General Medicine",
  registrationNumber: "MH-12345",
};

export const MOCK_PATIENT_QUEUE = [
  {
    patientId: "mock-patient-001",
    name: "Ramesh Kumar",
    age: 42,
    chiefComplaint: "Chest pain",
    status: "ready_for_review",
    redFlags: 1,
    waitingMinutes: 18,
  },
];
