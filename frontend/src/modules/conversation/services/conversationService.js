/**
 * conversationService.js – Conversation Module Services
 *
 * API calls for conversation session management.
 * Developer 2 owns this file.
 */

import api from "@/services/api.js";

/** POST /api/conversation/start */
export async function startConversation(patientId, mode, language) {
  // TODO: Implement
  throw new Error("Not implemented");
}

/** POST /api/conversation/message */
export async function sendMessage(sessionId, message, audioBlob) {
  // TODO: Implement
  throw new Error("Not implemented");
}

/** GET /api/conversation/:sessionId */
export async function getConversation(sessionId) {
  // TODO: Implement
  throw new Error("Not implemented");
}

/** POST /api/conversation/complete */
export async function completeConversation(sessionId) {
  // TODO: Implement
  throw new Error("Not implemented");
}
