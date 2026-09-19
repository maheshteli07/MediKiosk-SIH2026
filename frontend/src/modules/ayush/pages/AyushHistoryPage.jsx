/**
 * AyushHistoryPage.jsx – AYUSH Integrative Medical History View.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, Clock, FileText } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";

import AyushHistoryPanel from "../components/AyushHistoryPanel.jsx";
import PatientTimeline from "@/modules/clinical/components/PatientTimeline.jsx";
import { MOCK_PATIENT_RECORD } from "@/shared/data/mockPatientHistory.js";

function AyushHistoryPage() {
  const navigate = useNavigate();
  const { ayushAssessment, timelineEvents } = MOCK_PATIENT_RECORD;

  const ayushEvents = timelineEvents.filter((ev) => ev.system === "ayush");

  return (
    <PatientShell showProgress step={6} totalSteps={6} centerContent={false}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ayush-100 text-ayush-800 text-xs font-semibold mb-2 border border-ayush-300">
            <Leaf className="w-3.5 h-3.5 text-ayush-600" />
            AYUSH & Traditional Medicine
          </div>
          <h1 className="text-2xl font-extrabold text-brand-slate tracking-tight">
            AYUSH Integrative Health Assessment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ayurveda, Siddha, & Unani clinical observations integrated with your medical file.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={FileText}
            onClick={() => navigate("/clinical/history")}
          >
            Full Clinical Record
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

      {/* Content */}
      <div className="space-y-6">
        <AyushHistoryPanel ayushData={ayushAssessment} />
        <PatientTimeline events={ayushEvents.length > 0 ? ayushEvents : timelineEvents} />
      </div>
    </PatientShell>
  );
}

export default AyushHistoryPage;
