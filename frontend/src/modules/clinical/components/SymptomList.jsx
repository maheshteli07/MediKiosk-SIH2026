/**
 * SymptomList.jsx – List of symptoms with confidence status badges.
 */

import React from "react";
import { Activity, AlertCircle, CheckCircle2, Search } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";

function SymptomList({ symptoms = [] }) {
  if (symptoms.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          Reported & Detected Symptoms ({symptoms.length})
        </h3>
        <span className="text-xs text-slate-500 font-medium">AI Case Intake</span>
      </div>

      <div className="space-y-2.5">
        {symptoms.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  item.confidence === "confirmed"
                    ? "bg-success-500"
                    : item.confidence === "detected"
                    ? "bg-primary-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              <div>
                <p className="text-xs font-bold text-slate-800">{item.name}</p>
                <p className="text-[11px] text-slate-500">
                  Duration: <span className="font-semibold text-slate-700">{item.duration}</span> • Severity: {item.severity}
                </p>
              </div>
            </div>

            {/* Confidence Status Badge */}
            <div>
              {item.confidence === "confirmed" && (
                <Badge variant="doctor-approved" size="sm">
                  Confirmed
                </Badge>
              )}
              {item.confidence === "detected" && (
                <Badge variant="draft" size="sm">
                  Detected
                </Badge>
              )}
              {item.confidence === "needs_check" && (
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

export default SymptomList;
