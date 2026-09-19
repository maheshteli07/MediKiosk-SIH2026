/**
 * ConsentPage.jsx – Step 2 of Patient Onboarding: Informed Privacy & AI Consent.
 *
 * On "I Agree & Proceed":
 *  1. Reads session_id from localStorage.
 *  2. POSTs the three consent decisions to /api/patients/sessions/{id}/consent.
 *  3. Navigates to /patient/identify.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Check, ArrowRight, Lock, FileText, Bot } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import { recordConsent } from "@/modules/patient/services/patientService.js";

function ConsentPage() {
  const navigate = useNavigate();
  const [consentAiVoice, setConsentAiVoice] = useState(false);
  const [consentOcr, setConsentOcr] = useState(false);
  const [consentDoctorApproval, setConsentDoctorApproval] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const allAccepted = consentAiVoice && consentOcr && consentDoctorApproval;

  const handleContinue = async () => {
    setError("");
    setIsLoading(true);

    const sessionId = localStorage.getItem("medikiosk_session_id");
    if (!sessionId) {
      setError("Session not found. Please go back and select your language first.");
      setIsLoading(false);
      return;
    }

    try {
      await recordConsent(sessionId, [
        { consent_type: "ai_processing", granted: consentAiVoice },
        { consent_type: "data_collection", granted: consentOcr },
        { consent_type: "abdm_sharing", granted: consentDoctorApproval },
      ]);
      navigate("/patient/identify");
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Could not record consent. Please retry.";
      setError(typeof message === "string" ? message : "Failed to save consent.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PatientShell showProgress step={2} totalSteps={7} centerContent={false}>
      <div className="max-w-xl mx-auto space-y-6 py-2">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center mx-auto mb-3 border border-success-200 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-slate tracking-tight mb-2">
            Your Medical Data Privacy & AI Consent
          </h1>
          <p className="text-sm text-slate-500">
            MediKiosk keeps your health data encrypted and protected under Indian Telemedicine & ABDM Guidelines.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        {/* Interactive Consent Cards */}
        <div className="space-y-3 text-left">
          {/* Item 1: AI Voice Intake */}
          <div
            onClick={() => setConsentAiVoice(!consentAiVoice)}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              consentAiVoice ? "bg-primary-50/70 border-primary-500" : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                consentAiVoice ? "bg-primary-600 text-white" : "bg-slate-100 border border-slate-300"
              }`}
            >
              {consentAiVoice && <Check className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-primary-600" />
                Multilingual AI Voice Transcription
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                I agree to speak with MediKiosk AI assistant to describe my symptoms in my preferred language.
              </p>
            </div>
          </div>

          {/* Item 2: Document OCR Scan */}
          <div
            onClick={() => setConsentOcr(!consentOcr)}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              consentOcr ? "bg-primary-50/70 border-primary-500" : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                consentOcr ? "bg-primary-600 text-white" : "bg-slate-100 border border-slate-300"
              }`}
            >
              {consentOcr && <Check className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary-600" />
                Prescription & Lab OCR Analysis
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                I authorize MediKiosk to read text from uploaded past prescriptions and lab reports.
              </p>
            </div>
          </div>

          {/* Item 3: Doctor Supervision */}
          <div
            onClick={() => setConsentDoctorApproval(!consentDoctorApproval)}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              consentDoctorApproval ? "bg-primary-50/70 border-primary-500" : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                consentDoctorApproval ? "bg-primary-600 text-white" : "bg-slate-100 border border-slate-300"
              }`}
            >
              {consentDoctorApproval && <Check className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-primary-600" />
                Attending Doctor Review & Approval
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                I understand AI only drafts my medical history. My attending physician will review and approve everything.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 max-w-sm mx-auto">
          <Button
            variant="primary"
            size="xl"
            icon={ArrowRight}
            onClick={handleContinue}
            disabled={!allAccepted}
            loading={isLoading}
            fullWidth
          >
            I Agree & Proceed
          </Button>
          {!allAccepted && (
            <p className="text-xs text-slate-400 text-center mt-2">
              Please accept all three items to continue.
            </p>
          )}
        </div>
      </div>
    </PatientShell>
  );
}

export default ConsentPage;
