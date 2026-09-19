/**
 * AyushHistoryPanel.jsx – Integrative AYUSH assessment card.
 *
 * Uses the AYUSH gold accent (#C98A2C) to highlight Prakriti / Dosha balance,
 * Agni state, and herbal formulation regimens alongside standard clinical records.
 */

import React from "react";
import { Sparkles, Leaf, Flame, Shield, Compass } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";

function AyushHistoryPanel({ ayushData }) {
  if (!ayushData) return null;

  const { prakriti, agniState, koshthaState, dhatuImbalance, recommendations } = ayushData;

  return (
    <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-2 border-ayush-300 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header with Gold Accent Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ayush-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ayush-500 text-white flex items-center justify-center shadow-md shadow-ayush-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">AYUSH Health Assessment</h3>
              <span className="text-[11px] font-bold text-ayush-800 bg-ayush-100 border border-ayush-300 px-2 py-0.5 rounded-full">
                Integrative Medicine
              </span>
            </div>
            <p className="text-xs text-slate-600">Ayurvedic Prakriti & Dosha Constitution</p>
          </div>
        </div>

        <Badge variant="needs-check" size="md">
          AYUSH Tradition
        </Badge>
      </div>

      {/* Prakriti & Dosha Ratio Cards */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-ayush-600" />
          Dosha / Prakriti Balance ({prakriti.primary}-{prakriti.secondary})
        </h4>

        <div className="bg-white border border-ayush-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <p className="text-xs font-semibold text-slate-800">{prakriti.description}</p>

          {/* Dosha Progress Bars */}
          <div className="space-y-2 pt-1">
            {/* Pitta */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="font-bold text-amber-900">Pitta (Fire/Transformation)</span>
                <span>{prakriti.pittaPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${prakriti.pittaPercentage}%` }}
                />
              </div>
            </div>

            {/* Kapha */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="font-bold text-teal-900">Kapha (Earth/Water)</span>
                <span>{prakriti.kaphaPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all"
                  style={{ width: `${prakriti.kaphaPercentage}%` }}
                />
              </div>
            </div>

            {/* Vata */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="font-bold text-slate-700">Vata (Air/Ether)</span>
                <span>{prakriti.vataPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all"
                  style={{ width: `${prakriti.vataPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agni & Koshtha Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-ayush-200">
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
            <Flame className="w-4 h-4 text-amber-600" /> Agni (Digestive Fire)
          </span>
          <p className="text-xs text-slate-700 font-semibold">{agniState}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-ayush-200">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
            <Shield className="w-4 h-4 text-primary-600" /> Dhatu Status
          </span>
          <p className="text-xs text-slate-700 font-semibold">{dhatuImbalance}</p>
        </div>
      </div>

      {/* Holistic Lifestyle Advice */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-amber-100/50 border border-amber-200 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ayush-600" /> Ayurvedic Ahara & Vihara Guidance
          </h4>
          <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AyushHistoryPanel;
