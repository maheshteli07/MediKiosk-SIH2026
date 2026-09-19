/**
 * conversationApi.js – Adaptive speech & AI response service.
 * Connects to the MediKiosk FastAPI conversation & RAG backend,
 * with resilient mock fallback for offline or standalone demo modes.
 */

import api from "@/services/api.js";
import {
  getAdaptiveConversationScript,
  getInitialEntitiesFromDocs,
} from "../data/mockConversationData.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const conversationApi = {
  /**
   * Start a conversation session on the backend (indexes docs into RAG store).
   */
  startSession: async (patientId = "demo_patient_001", mode = "general", lang = "en", uploadedDocs = []) => {
    try {
      const response = await api.post("/api/conversation/start", {
        patient_id: patientId,
        mode: mode,
        language: lang,
        documents: uploadedDocs,
      });
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn("Backend conversation start failed, using local session:", err);
    }

    // Fallback local session
    const script = getAdaptiveConversationScript(uploadedDocs);
    const item = script[0];
    const initialPrompt = lang === "hi" ? item.aiPromptHindi : item.aiPrompt;
    return {
      session_id: "local_session_" + Date.now(),
      patient_id: patientId,
      mode: mode,
      language: lang,
      initial_prompt: initialPrompt,
      status: "active",
    };
  },

  /**
   * Send a patient turn message to the backend RAG pipeline.
   */
  sendMessage: async (sessionId, message, lang = "en", turnIndex = 0, uploadedDocs = []) => {
    try {
      if (sessionId && !sessionId.startsWith("local_session_")) {
        const response = await api.post("/api/conversation/message", {
          session_id: sessionId,
          message: message,
          language: lang,
        });
        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          return {
            aiPrompt: data.ai_prompt,
            extractedEntities: data.extracted_entities || [],
            redFlags: data.red_flags || [],
            isComplete: data.is_complete || false,
            retrievedContext: data.retrieved_context || [],
          };
        }
      }
    } catch (err) {
      console.warn("Backend conversation message failed, using local script:", err);
    }

    // Fallback script progression
    const script = getAdaptiveConversationScript(uploadedDocs);
    const scriptItem = script[turnIndex] || script[script.length - 1];
    const isComplete = turnIndex >= script.length - 1;
    const nextPrompt =
      lang === "hi" && scriptItem.nextPromptHindi ? scriptItem.nextPromptHindi : scriptItem.nextPrompt;

    return {
      aiPrompt: nextPrompt,
      extractedEntities: scriptItem.extractedEntities || [],
      redFlags: [],
      isComplete: isComplete,
      retrievedContext: [],
    };
  },

  /**
   * Complete the session and request a comprehensive clinical summary from RAG.
   */
  completeSession: async (sessionId) => {
    try {
      if (sessionId && !sessionId.startsWith("local_session_")) {
        const response = await api.post("/api/conversation/complete", {
          session_id: sessionId,
        });
        if (response.data?.success && response.data?.data) {
          return response.data.data;
        }
      }
    } catch (err) {
      console.warn("Backend session complete failed:", err);
    }
    return {
      session_id: sessionId,
      status: "completed",
    };
  },

  /**
   * Returns the initial AI greeting tailored to uploaded documents.
   */
  getInitialPrompt: (uploadedDocs = [], lang = "en") => {
    const script = getAdaptiveConversationScript(uploadedDocs);
    const item = script[0];
    return lang === "hi" ? item.aiPromptHindi : item.aiPrompt;
  },

  /**
   * Returns initial pre-extracted entities from uploaded documents.
   */
  getInitialEntities: (uploadedDocs = []) => {
    return getInitialEntitiesFromDocs(uploadedDocs);
  },

  /**
   * Simulates real-time progressive speech transcription.
   */
  simulateSpeechInput: async (turnIndex, lang = "en", onPartial, uploadedDocs = []) => {
    const script = getAdaptiveConversationScript(uploadedDocs);
    const scriptItem = script[turnIndex] || script[0];
    const fullText =
      lang === "hi" ? scriptItem.samplePatientInputs[1] : scriptItem.samplePatientInputs[0];
    const words = (fullText || "I am feeling fever and cough").split(" ");

    let currentText = "";
    for (let i = 0; i < words.length; i++) {
      await delay(160 + Math.random() * 100);
      currentText += (i === 0 ? "" : " ") + words[i];
      if (onPartial) onPartial(currentText);
    }

    return currentText;
  },

  /**
   * Processes a conversation turn with dynamic follow-up and entities.
   */
  processTurn: async (turnIndex, patientMessage, uploadedDocs = [], lang = "en") => {
    await delay(600);
    const script = getAdaptiveConversationScript(uploadedDocs);
    const scriptItem = script[turnIndex] || script[script.length - 1];
    const isComplete = turnIndex >= script.length - 1;

    const nextPrompt =
      lang === "hi" && scriptItem.nextPromptHindi ? scriptItem.nextPromptHindi : scriptItem.nextPrompt;

    return {
      aiPrompt: nextPrompt,
      extractedEntities: scriptItem.extractedEntities,
      isComplete,
    };
  },
};
