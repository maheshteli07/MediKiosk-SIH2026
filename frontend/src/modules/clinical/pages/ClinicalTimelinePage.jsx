/**
 * ClinicalTimelinePage.jsx – Patient longitudinal timeline.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";

import PatientTimeline from "../components/PatientTimeline.jsx";
import { MOCK_PATIENT_RECORD } from "@/shared/data/mockPatientHistory.js";

function ClinicalTimelinePage() {
  const navigate = useNavigate();
  const { timelineEvents } = MOCK_PATIENT_RECORD;

  return (
    <PatientShell showProgress step={6} totalSteps={6} centerContent={false}>
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-slate tracking-tight">
            Longitudinal Health Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological sequence of all voice intakes, document OCRs, and AYUSH consultations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="md"
            icon={ArrowLeft}
            onClick={() => navigate("/clinical/history")}
          >
            Back to History
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => navigate("/clinical/summary")}
          >
            Review Summary
          </Button>
        </div>
      </div>

      {/* Main Timeline Component */}
      <PatientTimeline events={timelineEvents} />
    </PatientShell>
  );
}

export default ClinicalTimelinePage;
