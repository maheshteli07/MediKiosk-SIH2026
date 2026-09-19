/**
 * HistoryList.jsx – Past medical history & chronic conditions list.
 */

import React from "react";
import { History, ShieldAlert } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";

function HistoryList({ history = [] }) {
  if (history.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-brand-slate" />
          Past Medical History & Conditions ({history.length})
        </h3>
        <span className="text-xs text-slate-500 font-medium">Chronic / Allergies</span>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{item.condition}</p>
                <p className="text-[11px] text-slate-500">
                  Category: {item.category} • Onset: <span className="font-semibold text-slate-700">{item.onset}</span>
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

export default HistoryList;
