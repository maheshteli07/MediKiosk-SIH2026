/**
 * patientService.js – Patient Module Services
 *
 * API calls for the patient module.
 * Imports the shared Axios instance from services/api.js.
 *
 * Developer 1 owns this file.
 */

import api from "@/services/api.js";

/**
 * Register a new patient.
 * POST /api/patients
 */
export async function createPatient(patientData) {
  const response = await api.post("/api/patients/", patientData);
  return response.data;
}

/**
 * Fetch a patient by ID.
 * GET /api/patients/:patientId
 */
export async function getPatientById(patientId) {
  const response = await api.get(`/api/patients/${patientId}`);
  return response.data;
}

/**
 * Update patient details.
 * PUT /api/patients/:patientId
 */
export async function updatePatient(patientId, data) {
  const response = await api.put(`/api/patients/${patientId}`, data);
  return response.data;
}
