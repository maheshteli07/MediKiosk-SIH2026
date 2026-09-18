/**
 * mockApi.js – Mock API layer for development without a live backend.
 *
 * Toggle mock mode via VITE_USE_MOCK_API=true in .env
 *
 * Each mock function simulates network latency and returns realistic
 * sample data. Replace with real API calls when the backend is ready.
 *
 * Feature modules import their own mock data from modules/<name>/data/.
 * This file only provides the top-level routing/delegation.
 */

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- Patient ----
export const mockPatientApi = {
  create: async (data) => {
    await delay();
    return { id: "mock-patient-001", ...data };
  },
  getById: async (patientId) => {
    await delay();
    return { id: patientId, name: "Mock Patient", age: 35 };
  },
};

// ---- Conversation ----
export const mockConversationApi = {
  start: async (patientId) => {
    await delay();
    return { sessionId: "mock-session-001", patientId };
  },
  sendMessage: async (sessionId, message) => {
    await delay(800);
    return {
      sessionId,
      response: "Thank you. Can you describe when the pain started?",
      extracted: {},
    };
  },
};

// ---- Documents ----
export const mockDocumentApi = {
  upload: async (file) => {
    await delay(1200);
    return { documentId: "mock-doc-001", fileName: file.name, status: "uploaded" };
  },
  process: async (documentId) => {
    await delay(2000);
    return { documentId, status: "processed", extracted: {} };
  },
};

// ---- Clinical ----
export const mockClinicalApi = {
  getSummary: async (patientId) => {
    await delay();
    return { patientId, summary: "Mock clinical summary.", status: "draft" };
  },
};

// ---- Doctor ----
export const mockDoctorApi = {
  login: async (credentials) => {
    await delay();
    return {
      token: "mock-jwt-token",
      doctor: { id: "doc-001", name: "Dr. Mock", role: "doctor" },
    };
  },
  getQueue: async () => {
    await delay();
    return [];
  },
};
