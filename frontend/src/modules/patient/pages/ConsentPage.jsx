/**
 * ConsentPage.jsx – Step 2 of Patient Onboarding: Informed Privacy & AI Consent.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Check, ArrowRight, Lock, FileText, Bot } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";

function ConsentPage() {
  const navigate = useNavigate();
  const [consentAiVoice, setConsentAiVoice] = useState(true);
  const [consentOcr, setConsentOcr] = useState(true);
  const [consentDoctorApproval, setConsentDoctorApproval] = useState(true);

  const allAccepted = consentAiVoice && consentOcr && consentDoctorApproval;

  const handleContinue = () => {
    navigate("/patient/identify");
  };

  return (
    <PatientShell showProgress step={2} totalSteps={6} centerContent={false}>
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
            fullWidth
          >
            I Agree & Proceed
          </Button>
        </div>
      </div>
    </PatientShell>
  );
}

export default ConsentPage;
