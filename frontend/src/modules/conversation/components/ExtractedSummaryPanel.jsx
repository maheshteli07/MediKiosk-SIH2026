/**
 * ExtractedSummaryPanel.jsx – Live clinical entity extraction side panel / bottom sheet.
 *
 * Features the singular deliberate motion moment when live AI-detected entities land.
 */

import React, { useState } from "react";
import { Activity, Pill, History, ChevronUp, ChevronDown, Sparkles, Check, FileText } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";

function ExtractedSummaryPanel({ extractedEntities = [] }) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const symptoms = extractedEntities.filter((e) => e.category === "symptom");
  const medicines = extractedEntities.filter((e) => e.category === "medicine");
  const history = extractedEntities.filter((e) => e.category === "history");

  const totalCount = extractedEntities.length;

  return (
    <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
      {/* Header bar (clickable on mobile to collapse/expand) */}
      <div
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 cursor-pointer lg:cursor-default"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              Extracted So Far
              {totalCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                  {totalCount}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">Live AI Clinical Entities</p>
          </div>
        </div>

        <button className="lg:hidden text-slate-400 hover:text-slate-600">
          {isMobileExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {/* Panel Body (Always visible on desktop, toggleable on mobile) */}
      <div
        className={`p-4 space-y-5 max-h-[600px] overflow-y-auto ${
          isMobileExpanded ? "block" : "hidden lg:block"
        }`}
      >
        {totalCount === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No clinical details extracted yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Start speaking to see live symptoms and history.
            </p>
          </div>
        ) : (
          <>
            {/* Symptoms Section */}
            {symptoms.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary-600" />
                  Symptoms
                </h4>
                <div className="space-y-2">
                  {symptoms.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all animate-in fade-in slide-in-from-right-3 duration-300"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{item.text}</p>
                        {item.duration && (
                          <p className="text-[11px] text-slate-500">Duration: {item.duration}</p>
                        )}
                      </div>
                      <Badge variant="needs-check" size="sm">
                        Detected
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medicines Section */}
            {medicines.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-ayush-600" />
                  Medicines Taken
                </h4>
                <div className="space-y-2">
                  {medicines.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition-all animate-in fade-in slide-in-from-right-3 duration-300"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{item.text}</p>
                        {item.dosage && (
                          <p className="text-[11px] text-slate-500">Dosage: {item.dosage}</p>
                        )}
                      </div>
                      <Badge variant="needs-check" size="sm">
                        Detected
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical History Section */}
            {history.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-brand-slate" />
                  Past Medical History
                </h4>
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all animate-in fade-in slide-in-from-right-3 duration-300"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{item.text}</p>
                        {item.duration && (
                          <p className="text-[11px] text-slate-500">Since: {item.duration}</p>
                        )}
                      </div>
                      <Badge variant="needs-check" size="sm">
                        Detected
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
          <Check className="w-3 h-3 text-success-500" />
          <span>Will be confirmed during summary review</span>
        </div>
      </div>
    </div>
  );
}

export default ExtractedSummaryPanel;
