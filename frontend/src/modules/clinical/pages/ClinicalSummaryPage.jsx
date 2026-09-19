/**
 * ClinicalSummaryPage.jsx – AI Case Summary Draft ready for Doctor Review.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldCheck, UserCheck, FileText, Sparkles, ArrowRight, Activity, Pill, History } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import Badge from "@/shared/components/Badge.jsx";

import { MOCK_PATIENT_RECORD } from "@/shared/data/mockPatientHistory.js";

function ClinicalSummaryPage() {
  const navigate = useNavigate();
  const { patientInfo, symptoms, medications, history, ayushAssessment } = MOCK_PATIENT_RECORD;

  return (
    <PatientShell showProgress step={6} totalSteps={6} centerContent={false}>
      {/* Top Banner */}
      <div className="bg-primary-900 text-white p-6 rounded-3xl shadow-md border border-primary-700 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-800 text-primary-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-ayush-300" />
              AI-Generated Case Draft
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Patient Case Summary Handover
            </h1>
            <p className="text-xs text-primary-200 mt-1">
              Patient ID: {patientInfo.id} • {patientInfo.name}, {patientInfo.age}y / {patientInfo.gender} ({patientInfo.bloodGroup})
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={UserCheck}
            onClick={() => navigate("/doctor/queue")}
          >
            Send to Doctor Queue
          </Button>
        </div>
      </div>

      {/* Trust Microcopy Reassurance Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Trust Guarantee:</span> This summary is an AI-generated draft compiled from patient voice intake and document OCR. <strong>The attending doctor will review and approve every detail before formal diagnosis.</strong>
        </div>
      </div>

      {/* Summary Draft Content Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Chief Complaint */}
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Chief Complaint
          </h3>
          <p className="text-base font-bold text-slate-800">{patientInfo.chiefComplaint}</p>
        </div>

        {/* Structured Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Symptoms Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary-600" /> Symptoms (Detected)
            </h4>
            <div className="space-y-2">
              {symptoms.map((s) => (
                <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{s.name}</span>
                    <Badge variant={s.confidence === "confirmed" ? "doctor-approved" : "needs-check"} size="sm">
                      {s.confidence}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Duration: {s.duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Medications Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-ayush-600" /> Medications
            </h4>
            <div className="space-y-2">
              {medications.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{m.name}</span>
                    {m.type === "ayush" && (
                      <span className="text-[10px] font-bold text-ayush-700 bg-ayush-100 px-1.5 py-0.5 rounded">
                        AYUSH
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.dosage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AYUSH & History Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-brand-slate" /> AYUSH & History
            </h4>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
              <p className="font-bold text-amber-900">Prakriti: {ayushAssessment.prakriti.primary}-{ayushAssessment.prakriti.secondary}</p>
              <p className="text-[11px] text-slate-600">Agni: {ayushAssessment.agniState}</p>
            </div>
            {history.map((h) => (
              <div key={h.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <p className="font-bold text-slate-800">{h.condition}</p>
                <p className="text-[11px] text-slate-500">Onset: {h.onset}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Handover Action */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-success-600" />
            <span>Ready for doctor sign-off at consultation desk</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={() => navigate("/doctor/dashboard")}
          >
            Go to Doctor Portal Dashboard
          </Button>
        </div>
      </div>
    </PatientShell>
  );
}

export default ClinicalSummaryPage;
