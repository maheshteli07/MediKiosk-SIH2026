/**
 * mockConversationData.js – Conversation Module
 *
 * Sample conversation messages and questions for development.
 */

export const MOCK_SESSION = {
  sessionId: "mock-session-001",
  patientId: "mock-patient-001",
  mode: "general",
  language: "en",
  status: "active",
  startedAt: new Date().toISOString(),
};

export const MOCK_MESSAGES = [
  {
    id: "msg-001",
    sender: "ai",
    text: "Hello! I am MediKiosk AI. I will ask you some questions about your health today. What brings you in today?",
    timestamp: new Date().toISOString(),
  },
];

export const MOCK_RED_FLAGS = [
  { id: "rf-001", category: "cardiac", description: "Chest pain with radiation", severity: "high" },
];
