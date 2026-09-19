/**
 * CaseReviewPane.jsx – Two-pane case detail container.
 *
 * Left Pane: Structured AI draft with per-field inline edit & AI draft badges.
 * Right Pane: Source evidence viewer (raw voice transcript + document scans).
 */

import React, { useState } from "react";
import { Edit2, Check, Sparkles, Activity, Pill, History, AlertTriangle, FileText, Leaf } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";
import SourceEvidenceViewer from "./SourceEvidenceViewer.jsx";

function CaseReviewPane({ caseData, onUpdateCase }) {
  const [draft, setDraft] = useState(caseData?.summaryDraft || {});
  const [editingSection, setEditingSection] = useState(null);
  const [tempText, setTempText] = useState("");

  if (!caseData) return null;

  const isApproved = caseData.status === "doctor_approved";

  const handleStartEdit = (sectionKey, currentValue) => {
    if (isApproved) return;
    setEditingSection(sectionKey);
    setTempText(currentValue);
  };

  const handleSaveEdit = (sectionKey) => {
    setDraft((prev) => ({
      ...prev,
      [sectionKey]: tempText,
    }));
    setEditingSection(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT PANE: Structured AI Summary Draft (7 cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Pane Title */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI-Generated Case Summary</h2>
              {isApproved ? (
                <Badge variant="doctor-approved" size="sm">
                  Doctor Approved
                </Badge>
              ) : (
                <Badge variant="needs-check" size="sm">
                  AI Draft — Doctor Review Required
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any field pencil to edit text directly before approving.
            </p>
          </div>
        </div>

        {/* 1. Chief Complaint */}
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isApproved
              ? "bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700/60"
              : "bg-primary-50/40 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chief Complaint
            </span>
            {!isApproved && (
              <button
                onClick={() => handleStartEdit("chiefComplaint", draft.chiefComplaint)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {editingSection === "chiefComplaint" ? (
            <div className="space-y-2">
              <textarea
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                className="w-full text-sm border border-primary-400 dark:border-primary-600 rounded-xl p-2 bg-white dark:bg-[#141822] text-slate-900 dark:text-slate-100"
                rows={2}
              />
              <button
                onClick={() => handleSaveEdit("chiefComplaint")}
                className="flex items-center gap-1 text-xs font-bold text-success-700 dark:text-emerald-400 bg-success-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg"
              >
                <Check className="w-3.5 h-3.5" /> Save Edit
              </button>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{draft.chiefComplaint}</p>
          )}
        </div>

        {/* 2. Symptoms List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Extracted Symptoms &amp; Severity
          </h3>
          <div className="space-y-2">
            {draft.symptoms?.map((sym, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700/60 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{sym.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">• Duration: {sym.duration}</span>
                </div>
                <Badge variant={sym.confidence === "confirmed" ? "doctor-approved" : "needs-check"} size="sm">
                  {sym.confidence}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Medications (Allopathy + AYUSH) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-ayush-600" /> Prescribed Medications (Allopathy &amp; AYUSH)
          </h3>
          <div className="space-y-2">
            {draft.medications?.map((med, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                  med.type === "ayush"
                    ? "bg-amber-50/60 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40"
                    : "bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-700/60"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{med.name}</span>
                    {med.type === "ayush" && (
                      <span className="text-[10px] font-bold text-ayush-800 dark:text-amber-300 bg-ayush-100 dark:bg-amber-900/30 border border-ayush-300 dark:border-amber-700/40 px-1.5 py-0.5 rounded">
                        AYUSH
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Dosage: {med.dosage}</p>
                </div>
                <Badge variant={med.confidence === "confirmed" ? "doctor-approved" : "needs-check"} size="sm">
                  {med.confidence}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* 4. AYUSH Assessment Notes */}
        {draft.ayushNotes && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 dark:from-amber-900/20 to-white dark:to-[#1e2535] border border-ayush-300 dark:border-amber-700/40 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 mb-1">
              <Leaf className="w-4 h-4 text-ayush-600" /> AYUSH Constitution Findings
            </div>
            <p className="text-slate-700 dark:text-slate-300"><strong>Prakriti:</strong> {draft.ayushNotes.prakriti}</p>
            <p className="text-slate-700 dark:text-slate-300"><strong>Agni State:</strong> {draft.ayushNotes.agniState}</p>
          </div>
        )}
      </div>

      {/* RIGHT PANE: Source Evidence Viewer (5 cols) */}
      <div className="lg:col-span-5 h-full">
        <SourceEvidenceViewer evidence={caseData.evidence} />
      </div>
    </div>
  );
}

export default CaseReviewPane;
