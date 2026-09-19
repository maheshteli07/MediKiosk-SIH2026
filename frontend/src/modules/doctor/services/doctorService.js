/**
 * doctorService.js – Doctor Module Services
 * Handles API calls to backend /api/doctor and /api/auth endpoints.
 */

import api from "@/services/api.js";

export async function loginDoctor(credentials) {
  const response = await api.post("/api/auth/dev-token", {
    role: "doctor",
    sub: credentials?.username || "doc-001",
  });
  return response.data;
}

export async function getPatientQueue() {
  const response = await api.get("/api/doctor/patients");
  return response.data;
}

export async function getPatientCase(patientId) {
  const response = await api.get(`/api/doctor/patients/${patientId}`);
  return response.data;
}

export async function verifySummary(summaryId, notes) {
  const response = await api.put(`/api/doctor/summary/${summaryId}/verify`, {
    doctor_notes: notes,
  });
  return response.data;
}

export async function finalizeSummary(summaryId) {
  const response = await api.post(`/api/doctor/summary/${summaryId}/finalize`);
  return response.data;
}
