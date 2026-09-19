/**
 * ConversationStart.jsx – Kiosk-friendly landing for speech intake.
 *
 * Features:
 *   - Prominent LanguageSwitcher at top
 *   - Big 120px primary teal mic button with pulsing rings during listening
 *   - "Or type instead" fallback CTA
 *   - High-contrast touch targets for illiterate / non-English patients
 */

import React, { useState } from "react";
import { Mic, Keyboard, Volume2, Sparkles, Check, FileText } from "lucide-react";
import Button from "@/shared/components/Button.jsx";
import LanguageSwitcher from "@/shared/components/LanguageSwitcher.jsx";

function ConversationStart({ onStartMic, onStartType, currentLang, onLanguageChange, uploadedDocs = [] }) {
  const [isListening, setIsListening] = useState(false);

  const handleMicClick = () => {
    setIsListening(true);
    setTimeout(() => {
      onStartMic();
    }, 600);
  };

  const hasDocs = uploadedDocs && uploadedDocs.length > 0;
  const primaryDoc = hasDocs ? uploadedDocs[0] : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4 py-8 max-w-xl mx-auto">
      {/* Top language selector bar */}
      <div className="w-full flex items-center justify-between bg-primary-50 border border-primary-100 rounded-xl p-3 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-primary-900 font-medium text-sm">
          <Volume2 className="w-4 h-4 text-primary-600 animate-pulse" />
          <span>Select your voice language:</span>
        </div>
        <LanguageSwitcher
          currentLang={currentLang}
          onSelect={onLanguageChange}
        />
      </div>

      {/* Uploaded Documents Alert Card */}
      {hasDocs && (
        <div className="w-full bg-primary-50/90 border border-primary-200 rounded-2xl p-4 mb-6 text-left shadow-sm flex items-start gap-3 animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-primary-900 uppercase tracking-wider">
                {uploadedDocs.length} {uploadedDocs.length === 1 ? "Record" : "Records"} Connected
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-200/80 text-primary-800">
                OCR Analyzed
              </span>
            </div>
            <p className="text-xs text-primary-900 mt-1 font-semibold truncate">
              {primaryDoc.extractedData?.diagnosis?.value
                ? `Prior Record: ${primaryDoc.extractedData.diagnosis.value}`
                : primaryDoc.fileName}
            </p>
            <p className="text-[11px] text-primary-700 mt-0.5">
              MediKiosk AI will open your case-taking session by asking how your condition and medications have responded.
            </p>
          </div>
        </div>
      )}

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold mb-6">
        <Sparkles className="w-3.5 h-3.5 text-primary-600" />
        AI-Guided Voice Intake
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-slate tracking-tight mb-3 leading-tight">
        {hasDocs ? "Let's review your condition & symptoms" : "Tell us what health problem you are having"}
      </h1>
      <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-md">
        {hasDocs
          ? "Tap the microphone below. The AI will speak first with questions regarding your uploaded records."
          : "Tap the microphone below and speak naturally in your own language. No typing required."}
      </p>

      {/* Big Kiosk Centered Microphone Button */}
      <div className="relative mb-12 flex items-center justify-center">
        {/* Pulsing ring 1 */}
        <div
          className={`absolute inset-0 rounded-full bg-primary-500/20 ${
            isListening ? "animate-ping scale-150" : "animate-pulse"
          }`}
          style={{ width: "160px", height: "160px", margin: "-20px" }}
        />
        {/* Pulsing ring 2 */}
        <div
          className={`absolute inset-0 rounded-full bg-primary-500/10 ${
            isListening ? "scale-125" : ""
          }`}
          style={{ width: "180px", height: "180px", margin: "-30px" }}
        />

        {/* Core Mic Button */}
        <button
          onClick={handleMicClick}
          aria-label="Start voice recording"
          className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-300 ${
            isListening
              ? "bg-danger-500 shadow-danger-500/50 scale-105"
              : "bg-primary-500 hover:bg-primary-700 shadow-primary-500/40 hover:scale-105"
          }`}
        >
          <Mic className={`w-12 h-12 mb-1 ${isListening ? "animate-bounce" : ""}`} />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isListening ? "Listening..." : "Tap to Speak"}
          </span>
        </button>
      </div>

      {/* Fallback Option */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          icon={Keyboard}
          onClick={onStartType}
        >
          Type symptoms instead
        </Button>
      </div>

      {/* Trust reassurance banner */}
      <div className="mt-10 flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
        <Check className="w-4 h-4 text-success-500 shrink-0" />
        <span>Your voice recording is converted to structured medical notes for your doctor.</span>
      </div>
    </div>
  );
}

export default ConversationStart;
