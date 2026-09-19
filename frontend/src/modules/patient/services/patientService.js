/**
 * patientService.js – Patient Module Services
 *
 * All API calls for the patient onboarding flow.
 * Uses the shared Axios instance from services/api.js.
 *
 * Session lifecycle:
 *   1. startSession()          → creates a session, returns session_id
 *   2. setSessionLanguage()    → records chosen language on the session
 *   3. recordConsent()         → saves consent decisions
 *   4. identifyPatient()       → looks up existing patient by phone / ABHA ID
 *   5. createPatient()         → registers a new patient record
 *   6. setConsultationMode()   → locks in the consultation mode for the session
 */

import api from "@/services/api.js";

// ── Session ──────────────────────────────────────────────────────────────────

/**
 * Start a new kiosk intake session.
 * POST /api/patients/sessions/start
 * @param {string} language - ISO language code, e.g. "hi"
 * @returns {Promise<Object>} session object including `id` (session_id)
 */
export async function startSession(language = "en") {
  const response = await api.post("/api/patients/sessions/start", {
    language,
  });
  // backend returns { success, data: { session }, meta }
  return response.data;
}

/**
 * Update the session language after the language step.
 * POST /api/patients/sessions/:sessionId/language
 * @param {string} sessionId
 * @param {string} language - ISO language code
 */
export async function setSessionLanguage(sessionId, language) {
  const response = await api.post(`/api/patients/sessions/${sessionId}/language`, {
    language,
  });
  return response.data;
}

/**
 * Record patient consent decisions for a session.
 * POST /api/patients/sessions/:sessionId/consent
 * @param {string} sessionId
 * @param {Array<{consent_type: string, granted: boolean}>} consents
 */
export async function recordConsent(sessionId, consents) {
  const response = await api.post(`/api/patients/sessions/${sessionId}/consent`, {
    consents,
    consent_version: "v1.0",
    language: localStorage.getItem("medikiosk_patient_lang") || "en",
  });
  return response.data;
}

/**
 * Set the consultation mode on the active session.
 * POST /api/patients/sessions/:sessionId/mode
 * @param {string} sessionId
 * @param {string} mode - "general" or "ayush"
 */
export async function setConsultationMode(sessionId, mode) {
  const response = await api.post(`/api/patients/sessions/${sessionId}/mode`, {
    mode,
  });
  return response.data;
}

// ── Patient Record ────────────────────────────────────────────────────────────

/**
 * Look up an existing patient by phone number or ABHA ID.
 * POST /api/patients/identify
 * @param {string} identifier - phone number or ABHA ID string
 * @returns {Promise<Object>} backend response; data.data is the patient or null
 */
export async function identifyPatient(identifier) {
  // Determine whether the identifier is a phone number or ABHA ID
  const cleaned = identifier.trim().replace(/\D/g, "");

  // ABHA IDs are 14 digits; phone numbers are 10 digits
  const isAbha = cleaned.length === 14;

  const payload = isAbha
    ? { abha_id: identifier.trim() }
    : { phone: cleaned };

  const response = await api.post("/api/patients/identify", payload);
  return response.data;
}

/**
 * Register a new patient.
 * POST /api/patients/
 * @param {Object} patientData - { full_name, age, gender, phone, preferred_language, ... }
 * @returns {Promise<Object>} backend response; data.data contains { patient, access_token }
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
