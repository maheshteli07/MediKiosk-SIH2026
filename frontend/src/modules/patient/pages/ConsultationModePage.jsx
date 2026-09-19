/**
 * ConsultationModePage.jsx – Step 5 of Patient Onboarding: Choose Consultation Mode.
 *
 * On "Start AI Voice Case-Taking":
 *  1. Reads session_id from localStorage.
 *  2. POSTs the chosen mode to /api/patients/sessions/{id}/mode.
 *  3. Saves the mode to localStorage for the conversation module.
 *  4. Navigates to /conversation.
 *
 * Backend modes: "general" (Allopathy) | "ayush" (AYUSH Integrative)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, ArrowRight, Stethoscope, Leaf, Check } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import { setConsultationMode } from "@/modules/patient/services/patientService.js";

function ConsultationModePage() {
  const navigate = useNavigate();
  // Backend enum values: "general" | "ayush"
  const [selectedMode, setSelectedMode] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setError("");
    setIsLoading(true);

    const sessionId = localStorage.getItem("medikiosk_session_id");
    if (!sessionId) {
      setError("Session not found. Please restart from the beginning.");
      setIsLoading(false);
      return;
    }

    try {
      await setConsultationMode(sessionId, selectedMode);
      localStorage.setItem("medikiosk_consult_mode", selectedMode);
      navigate("/conversation");
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Could not save consultation mode. Please retry.";
      setError(typeof message === "string" ? message : "Failed to set consultation mode.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PatientShell showProgress step={5} totalSteps={6} centerContent={false}>
      <div className="max-w-xl mx-auto space-y-6 py-2 text-center">
        {/* Header */}
        <div>
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-3 border border-primary-200 shadow-sm">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-slate tracking-tight mb-2">
            Select Consultation Category
          </h1>
          <p className="text-sm text-slate-500">
            Choose your preferred medical system for today's AI case-taking.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 text-left">
            {error}
          </div>
        )}

        {/* Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Card 1: Allopathy & General */}
          <div
            onClick={() => setSelectedMode("general")}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
              selectedMode === "general"
                ? "bg-primary-50 border-primary-600 shadow-md shadow-primary-500/10"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                {selectedMode === "general" && (
                  <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                Allopathy & General Health
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                General physician consultation, acute symptoms, prescription renewals, and lab report reviews.
              </p>
            </div>
            <span className="text-[11px] font-bold text-primary-700 bg-primary-100/80 px-2.5 py-1 rounded-full w-fit">
              Modern Medicine
            </span>
          </div>

          {/* Card 2: AYUSH Specialty */}
          <div
            onClick={() => setSelectedMode("ayush")}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
              selectedMode === "ayush"
                ? "bg-amber-50 border-ayush-500 shadow-md shadow-ayush-500/10"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-ayush-500 text-white flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
                {selectedMode === "ayush" && (
                  <div className="w-5 h-5 rounded-full bg-ayush-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                AYUSH Integrative Clinic
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Ayurveda, Siddha, Unani, Naturopathy, & Homeopathy Prakriti assessment and herbal care.
              </p>
            </div>
            <span className="text-[11px] font-bold text-ayush-800 bg-ayush-100 border border-ayush-300 px-2.5 py-1 rounded-full w-fit">
              AYUSH Tradition
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 max-w-sm mx-auto">
          <Button
            variant="primary"
            size="xl"
            icon={ArrowRight}
            onClick={handleContinue}
            loading={isLoading}
            fullWidth
          >
            Start AI Voice Case-Taking
          </Button>
        </div>
      </div>
    </PatientShell>
  );
}

export default ConsultationModePage;
