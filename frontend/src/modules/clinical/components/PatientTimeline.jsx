/**
 * PatientTimeline.jsx – Interleaved vertical timeline of visits/entries.
 *
 * Demonstrates "One record, two traditions": Allopathy and AYUSH entries
 * appear interleaved chronologically on the same timeline, with AYUSH entries
 * visually distinguished by the gold accent badge.
 */

import React from "react";
import { Clock, MessageSquare, FileText, Sparkles, Leaf } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";

function PatientTimeline({ events = [] }) {
  if (events.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            Patient Clinical Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Interleaved Allopathic & AYUSH Medical Visits
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
          {events.length} Historical Visits
        </span>
      </div>

      {/* Vertical Timeline Nodes */}
      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
        {events.map((event, index) => (
          <div key={event.id} className="relative group">
            {/* Numbered / Dated Node Icon */}
            <div
              className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:scale-110 ${
                event.system === "ayush"
                  ? "bg-ayush-100 border-ayush-500 text-ayush-800"
                  : "bg-primary-100 border-primary-500 text-primary-800"
              }`}
            >
              {index + 1}
            </div>

            {/* Content Box */}
            <div
              className={`p-4 rounded-2xl border transition-all shadow-sm ${
                event.system === "ayush"
                  ? "bg-amber-50/40 border-amber-200 hover:border-amber-300"
                  : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Header metadata row */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{event.date}</span>
                  <span className="text-[11px] text-slate-400">• {event.time}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* System Tradition Tag */}
                  {event.system === "ayush" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ayush-800 bg-ayush-100 border border-ayush-300 px-2 py-0.5 rounded-md">
                      <Leaf className="w-3 h-3 text-ayush-600" /> AYUSH Tradition
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                      Modern Medicine
                    </span>
                  )}

                  {/* Data Source Tag */}
                  {event.source === "conversation" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-md">
                      <MessageSquare className="w-3 h-3" /> Voice Intake
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                      <FileText className="w-3 h-3" /> Document OCR
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Summary */}
              <h4 className="text-sm font-bold text-slate-800 mb-1">{event.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{event.summary}</p>

              {/* Confidence status */}
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-end">
                {event.confidence === "confirmed" ? (
                  <Badge variant="doctor-approved" size="sm">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="needs-check" size="sm">
                    Needs Check
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatientTimeline;
