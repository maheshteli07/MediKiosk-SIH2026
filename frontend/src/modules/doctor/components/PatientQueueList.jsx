/**
 * PatientQueueList.jsx – Pending patient cases queue sidebar list.
 *
 * Displays active patient cases with wait times and status badges.
 */

import React from "react";
import { Clock, User, ChevronRight, AlertCircle, Sparkles } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";

function PatientQueueList({ queue = [], selectedCaseId, onSelectCase }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-bold text-slate-800">Pending Patient Queue</h3>
        </div>
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary-100 text-primary-800">
          {queue.length} Cases
        </span>
      </div>

      {/* Case List Rows */}
      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {queue.map((item) => {
          const isSelected = item.id === selectedCaseId;

          return (
            <div
              key={item.id}
              onClick={() => onSelectCase(item)}
              className={`p-4 cursor-pointer transition-colors duration-150 flex items-start justify-between gap-3 ${
                isSelected
                  ? "bg-primary-50/80 border-l-4 border-l-primary-600"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="space-y-1 flex-1 min-w-0">
                {/* Name & Wait time */}
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.patientName} ({item.age}{item.gender.charAt(0)})
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">
                    {item.waitTime}
                  </span>
                </div>

                {/* Complaint Preview */}
                <p className="text-xs text-slate-600 line-clamp-1 leading-snug">
                  {item.chiefComplaint}
                </p>

                {/* Badges & Meta row */}
                <div className="pt-1.5 flex items-center gap-2">
                  {item.status === "doctor_approved" && (
                    <Badge variant="doctor-approved" size="sm">
                      Approved
                    </Badge>
                  )}
                  {item.status === "needs_check" && (
                    <Badge variant="needs-check" size="sm">
                      Needs Check
                    </Badge>
                  )}
                  {item.status === "draft" && (
                    <Badge variant="draft" size="sm">
                      Awaiting Review
                    </Badge>
                  )}

                  {item.hasUploadedDocs && (
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                      Docs attached
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 mt-1 ${
                  isSelected ? "text-primary-600" : "text-slate-300"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PatientQueueList;
