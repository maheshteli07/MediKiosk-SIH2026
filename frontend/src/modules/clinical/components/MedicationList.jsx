/**
 * MedicationList.jsx – Active and past medications combining Allopathy and AYUSH.
 */

import React from "react";
import { Pill, Sparkles, Leaf } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";

function MedicationList({ medications = [] }) {
  if (medications.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Pill className="w-5 h-5 text-ayush-600" />
          Active Medications & Formulations ({medications.length})
        </h3>
        <span className="text-xs text-slate-500 font-medium">Allopathy + AYUSH</span>
      </div>

      <div className="space-y-2.5">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
              med.type === "ayush"
                ? "bg-amber-50/50 border-amber-200/80 hover:border-amber-300"
                : "bg-slate-50 border-slate-100 hover:border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  med.type === "ayush"
                    ? "bg-ayush-100 text-ayush-700"
                    : "bg-primary-100 text-primary-700"
                }`}
              >
                {med.type === "ayush" ? <Leaf className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-800">{med.name}</p>
                  {med.type === "ayush" && (
                    <span className="text-[10px] font-bold text-ayush-700 bg-ayush-100 border border-ayush-200 px-1.5 py-0.5 rounded">
                      AYUSH
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Dosage: <span className="font-semibold text-slate-700">{med.dosage}</span>
                </p>
              </div>
            </div>

            {/* Confidence Status Badge */}
            <div>
              {med.confidence === "confirmed" && (
                <Badge variant="doctor-approved" size="sm">
                  Confirmed
                </Badge>
              )}
              {med.confidence === "detected" && (
                <Badge variant="draft" size="sm">
                  Detected
                </Badge>
              )}
              {med.confidence === "needs_check" && (
                <Badge variant="needs-check" size="sm">
                  Needs Check
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicationList;
