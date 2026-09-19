/**
 * LanguagePage.jsx – Step 1 of Patient Onboarding: Language Selection.
 *
 * On "Continue":
 *  1. Calls POST /api/patients/sessions/start to create a real session.
 *  2. Saves session_id and selected language to localStorage.
 *  3. Navigates to /consent.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, ArrowRight, Check } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import { startSession } from "@/modules/patient/services/patientService.js";

const LANGUAGES = [
  { id: "en", name: "English", native: "English", region: "Pan-India" },
  { id: "hi", name: "Hindi", native: "हिन्दी", region: "North & Central India" },
  { id: "ta", name: "Tamil", native: "தமிழ்", region: "Tamil Nadu & Puducherry" },
  { id: "te", name: "Telugu", native: "తెలుగు", region: "Andhra Pradesh & Telangana" },
  { id: "kn", name: "Kannada", native: "ಕನ್ನಡ", region: "Karnataka" },
  { id: "bn", name: "Bengali", native: "বাংলা", region: "West Bengal & Tripura" },
  { id: "mr", name: "Marathi", native: "मराठी", region: "Maharashtra" },
  { id: "gu", name: "Gujarati", native: "ગુજરાતી", region: "Gujarat" },
];

function LanguagePage() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState("hi");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setError("");
    setIsLoading(true);
    try {
      // Create a new intake session on the backend
      const res = await startSession(selectedLang);
      const session = res.data;

      if (!session?.id) {
        throw new Error("Session could not be created. Please try again.");
      }

      // Persist session context for downstream pages
      localStorage.setItem("medikiosk_session_id", session.id);
      localStorage.setItem("medikiosk_patient_lang", selectedLang);

      navigate("/consent");
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Could not start session. Please retry.";
      setError(typeof message === "string" ? message : "Failed to start session.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PatientShell showProgress step={1} totalSteps={6} centerContent={false}>
      <div className="max-w-xl mx-auto space-y-8 py-4 text-center">
        {/* Title Header */}
        <div>
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-4 border border-primary-200 shadow-sm">
            <Globe className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-slate tracking-tight mb-2">
            Choose your preferred language
          </h1>
          <p className="text-base text-slate-500">
            भाषा चुनें · மொழியை தேர்ந்தெடுக்கவும் · भाषा निवडा
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 text-left">
            {error}
          </div>
        )}

        {/* Language Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.id;

            return (
              <div
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[100px] ${
                  isSelected
                    ? "bg-primary-50 border-primary-600 shadow-md shadow-primary-500/10 scale-102"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-lg font-extrabold text-slate-900">{lang.native}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700">{lang.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{lang.region}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 max-w-sm mx-auto">
          <Button
            variant="primary"
            size="xl"
            icon={ArrowRight}
            onClick={handleContinue}
            loading={isLoading}
            fullWidth
          >
            Continue in {LANGUAGES.find((l) => l.id === selectedLang)?.native}
          </Button>
        </div>
      </div>
    </PatientShell>
  );
}

export default LanguagePage;
