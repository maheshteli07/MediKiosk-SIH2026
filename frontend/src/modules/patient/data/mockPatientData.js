/**
 * mockPatientData.js – Patient Module
 *
 * Sample/mock data for patient module development and testing.
 * Used with mockApi.js during development without a live backend.
 */

export const MOCK_PATIENT = {
  id: "mock-patient-001",
  abhaId: "12345678901234",
  aadhaar: "xxxx-xxxx-1234",
  name: "Ramesh Kumar",
  age: 42,
  gender: "Male",
  dateOfBirth: "1982-06-15",
  phone: "9876543210",
  address: "12 MG Road, Pune, Maharashtra",
  language: "hi",
  consultationMode: null,
  createdAt: new Date().toISOString(),
};
