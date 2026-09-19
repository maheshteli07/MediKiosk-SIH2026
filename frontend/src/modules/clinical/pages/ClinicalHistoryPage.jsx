/**
 * ClinicalHistoryPage.jsx – Structured medical history (Allopathy + AYUSH).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";

import SymptomList from "../components/SymptomList.jsx";
import MedicationList from "../components/MedicationList.jsx";
import HistoryList from "../components/HistoryList.jsx";
import AyushHistoryPanel from "@/modules/ayush/components/AyushHistoryPanel.jsx";

import { MOCK_PATIENT_RECORD } from "@/shared/data/mockPatientHistory.js";

function ClinicalHistoryPage() {
  const navigate = useNavigate();
  const { symptoms, medications, history, ayushAssessment } = MOCK_PATIENT_RECORD;

  return (
    <PatientShell showProgress step={6} totalSteps={6} centerContent={false}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            Integrative Health Record
          </div>
          <h1 className="text-2xl font-extrabold text-brand-slate tracking-tight">
            Clinical & AYUSH Medical History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            "One record, two traditions" — Modern Allopathy & AYUSH findings combined.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={Clock}
            onClick={() => navigate("/clinical/timeline")}
          >
            View Timeline
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => navigate("/clinical/summary")}
          >
            Case Summary Draft
          </Button>
        </div>
      </div>

      {/* Core Grid Layout */}
      <div className="space-y-6">
        {/* Symptoms Section */}
        <SymptomList symptoms={symptoms} />

        {/* AYUSH Assessment Panel */}
        <AyushHistoryPanel ayushData={ayushAssessment} />

        {/* Medications & History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MedicationList medications={medications} />
          <HistoryList history={history} />
        </div>
      </div>
    </PatientShell>
  );
}

export default ClinicalHistoryPage;
