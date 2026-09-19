/**
 * conversationApi.js – Mock streaming speech & AI response service.
 */

import { MOCK_CONVERSATION_SCRIPT } from "../data/mockConversationData.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const conversationApi = {
  /**
   * Simulates real-time progressive speech transcription.
   * Calls `onPartial(text)` as words stream in, then resolves with full text.
   */
  simulateSpeechInput: async (turnIndex, lang = "en", onPartial) => {
    const scriptItem = MOCK_CONVERSATION_SCRIPT[turnIndex] || MOCK_CONVERSATION_SCRIPT[0];
    const fullText = lang === "hi" ? scriptItem.samplePatientInputs[1] : scriptItem.samplePatientInputs[0];
    const words = fullText.split(" ");
    
    let currentText = "";
    for (let i = 0; i < words.length; i++) {
      await delay(220 + Math.random() * 150);
      currentText += (i === 0 ? "" : " ") + words[i];
      if (onPartial) onPartial(currentText);
    }
    
    return currentText;
  },

  /**
   * Simulates sending a patient message and getting AI follow-up + entity extraction.
   */
  processTurn: async (turnIndex, patientMessage) => {
    await delay(700); // Simulate network & NLP processing latency
    const scriptItem = MOCK_CONVERSATION_SCRIPT[turnIndex] || MOCK_CONVERSATION_SCRIPT[MOCK_CONVERSATION_SCRIPT.length - 1];
    
    return {
      aiPrompt: scriptItem.nextPrompt,
      extractedEntities: scriptItem.extractedEntities,
      isComplete: turnIndex >= MOCK_CONVERSATION_SCRIPT.length - 1,
    };
  },
};
