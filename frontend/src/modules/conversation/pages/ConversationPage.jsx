/**
 * ConversationPage.jsx – Main patient AI case-taking page.
 *
 * Integrates ConversationStart, ConversationThread, LiveTranscriptionBanner,
 * ExtractedSummaryPanel, and the streaming conversationApi.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import { ROUTES } from "@/shared/constants/routes.js";

import ConversationStart from "../components/ConversationStart.jsx";
import ConversationThread from "../components/ConversationThread.jsx";
import ExtractedSummaryPanel from "../components/ExtractedSummaryPanel.jsx";
import { conversationApi } from "../services/conversationApi.js";
import { MOCK_CONVERSATION_SCRIPT } from "../data/mockConversationData.js";

function ConversationPage() {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState("en");
  const [mode, setMode] = useState("START"); // START | ACTIVE | COMPLETED
  const [turnIndex, setTurnIndex] = useState(0);

  // Thread Messages State
  const [messages, setMessages] = useState([]);
  const [extractedEntities, setExtractedEntities] = useState([]);

  // Live Speech State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscription, setInterimTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Start Voice Flow
  const handleStartMic = () => {
    setMode("ACTIVE");
    const firstPrompt = currentLang === "hi" 
      ? MOCK_CONVERSATION_SCRIPT[0].aiPromptHindi 
      : MOCK_CONVERSATION_SCRIPT[0].aiPrompt;

    setMessages([
      {
        sender: "ai",
        text: firstPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // Trigger initial speech streaming demo
    triggerSpeechDemo(0);
  };

  // Start Typing Flow
  const handleStartType = () => {
    setMode("ACTIVE");
    const firstPrompt = currentLang === "hi" 
      ? MOCK_CONVERSATION_SCRIPT[0].aiPromptHindi 
      : MOCK_CONVERSATION_SCRIPT[0].aiPrompt;

    setMessages([
      {
        sender: "ai",
        text: firstPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Trigger Simulated Speech Recording
  const triggerSpeechDemo = async (targetTurn) => {
    setIsListening(true);
    setInterimTranscription("");

    await conversationApi.simulateSpeechInput(
      targetTurn,
      currentLang,
      (partialText) => {
        setInterimTranscription(partialText);
      }
    );

    setIsListening(false);
  };

  // Handle Confirmed Patient Message (Voice or Text)
  const handleSendMessage = async (text) => {
    setInterimTranscription("");
    const newTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add Patient Message
    const updatedMessages = [
      ...messages,
      { sender: "patient", text, timestamp: newTimestamp },
    ];
    setMessages(updatedMessages);
    setIsProcessing(true);

    // Call Mock API
    const response = await conversationApi.processTurn(turnIndex, text);
    setIsProcessing(false);

    // Add AI Response Message
    setMessages([
      ...updatedMessages,
      {
        sender: "ai",
        text: response.aiPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // Update Entities
    setExtractedEntities(response.extractedEntities);

    // Advance Turn
    if (response.isComplete) {
      setMode("COMPLETED");
    } else {
      setTurnIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setMode("START");
    setTurnIndex(0);
    setMessages([]);
    setExtractedEntities([]);
    setInterimTranscription("");
  };

  return (
    <PatientShell showProgress step={5} totalSteps={6} centerContent={false}>
      {mode === "START" ? (
        <ConversationStart
          onStartMic={handleStartMic}
          onStartType={handleStartType}
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
        />
      ) : (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Voice Case-Taking & Symptom Interview
              </h1>
              <p className="text-xs text-slate-500">
                Step 5 of 6 — Describing medical complaints in {currentLang === "hi" ? "Hindi" : "English"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleRestart}>
                Restart
              </Button>
              {mode === "COMPLETED" && (
                <Button
                  variant="primary"
                  size="md"
                  icon={ArrowRight}
                  onClick={() => navigate(ROUTES.CLINICAL_SUMMARY)}
                >
                  View Summary Draft
                </Button>
              )}
            </div>
          </div>

          {/* Completion Callout */}
          {mode === "COMPLETED" && (
            <div className="bg-success-50 border border-success-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-success-600" />
                <div>
                  <h3 className="text-sm font-bold text-success-900">
                    Symptom Interview Completed
                  </h3>
                  <p className="text-xs text-success-700">
                    All symptoms, medicines, and medical history have been compiled into a structured draft for your doctor.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(ROUTES.CLINICAL_SUMMARY)}
              >
                Proceed to Doctor Review
              </Button>
            </div>
          )}

          {/* Core Layout: Thread + Extraction Panel */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 w-full">
              <ConversationThread
                messages={messages}
                onSendMessage={handleSendMessage}
                onStartMic={() => triggerSpeechDemo(turnIndex)}
                isListening={isListening}
                interimTranscription={interimTranscription}
                onConfirmTranscription={handleSendMessage}
                onCancelTranscription={() => setInterimTranscription("")}
                isProcessing={isProcessing}
              />
            </div>

            <ExtractedSummaryPanel extractedEntities={extractedEntities} />
          </div>
        </div>
      )}
    </PatientShell>
  );
}

export default ConversationPage;
