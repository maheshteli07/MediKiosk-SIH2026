/**
 * routes.js – Centralized route path constants.
 *
 * All route strings live here. Import from this file instead of
 * hard-coding paths inside components or navigation calls.
 * Changing a URL only requires updating this file.
 */

export const ROUTES = {
  // Patient flow
  WELCOME: "/welcome",
  LANGUAGE: "/language",
  CONSENT: "/consent",
  PATIENT_IDENTIFICATION: "/patient/identify",
  BASIC_DETAILS: "/patient/details",
  CONSULTATION_MODE: "/patient/mode",

  // Conversation
  CONVERSATION: "/conversation",

  // Documents
  DOCUMENTS: "/documents",

  // AYUSH
  AYUSH_HISTORY: "/ayush/history",

  // Clinical
  CLINICAL_HISTORY: "/clinical/history",
  TIMELINE: "/clinical/timeline",
  CLINICAL_SUMMARY: "/clinical/summary",

  // Auth
  SIGN_IN: "/signin",
  LOGIN: "/login",

  // Doctor
  DOCTOR_LOGIN: "/doctor/login",
  DOCTOR_DASHBOARD: "/doctor/dashboard",
  PATIENT_QUEUE: "/doctor/queue",
  PATIENT_CASE: "/doctor/patient/:patientId",
  SUMMARY_REVIEW: "/doctor/summary/:summaryId",
  VERIFICATION: "/doctor/verify/:summaryId",
};
