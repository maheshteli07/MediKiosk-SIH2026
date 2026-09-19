/**
 * ExtractedDocumentCard.jsx – Shows thumbnail side-by-side with extracted fields.
 *
 * Features:
 *   - Side-by-side layout: document thumbnail (left) + extracted fields (right)
 *   - Per-field low-confidence flag visual indicator (amber highlight + Needs Check field badge)
 *   - Inline editing affordance per field
 */

import React, { useState } from "react";
import { Edit2, Check, AlertTriangle, FileText, Calendar, User, Pill, Activity } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";

function ExtractedDocumentCard({ document }) {
  const [data, setData] = useState(document.extractedData || {});
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleStartEdit = (fieldKey, currentValue) => {
    setEditingField(fieldKey);
    setTempValue(currentValue);
  };

  const handleSaveEdit = (fieldKey) => {
    setData((prev) => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], value: tempValue, lowConfidence: false },
    }));
    setEditingField(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-bold text-slate-800">{document.fileName}</h3>
        </div>

        {document.status === "needs_check" ? (
          <Badge variant="needs-check" size="md">
            Review Flagged Fields
          </Badge>
        ) : (
          <Badge variant="doctor-approved" size="md">
            OCR Verified
          </Badge>
        )}
      </div>

      {/* Side-by-side Body */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Thumbnail */}
        <div className="w-full md:w-56 shrink-0">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-inner">
            <img
              src={document.thumbnailUrl}
              alt="Scan Thumbnail"
              className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
              Preview Full Scan
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Uploaded {document.uploadTime} • {document.fileSize}
          </p>
        </div>

        {/* Right Structured Fields */}
        <div className="flex-1 space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Doctor Name */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                data.doctorName?.lowConfidence
                  ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <User className="w-3.5 h-3.5 text-primary-600" /> Doctor Name
                </span>
                {data.doctorName?.lowConfidence && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3 text-amber-700" /> Needs Check
                  </span>
                )}
              </div>

              {editingField === "doctorName" ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 text-xs border border-primary-400 rounded px-2 py-1 bg-white"
                  />
                  <button onClick={() => handleSaveEdit("doctorName")} className="text-success-600 p-1">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">{data.doctorName?.value || "N/A"}</p>
                  <button
                    onClick={() => handleStartEdit("doctorName", data.doctorName?.value || "")}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Document Date */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1">
                <Calendar className="w-3.5 h-3.5 text-primary-600" /> Date
              </span>
              <p className="text-xs font-bold text-slate-800">{data.documentDate?.value || "N/A"}</p>
            </div>
          </div>

          {/* Medicines List if Present */}
          {data.medicines && data.medicines.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-ayush-600" /> Prescribed Medicines
              </h4>
              <div className="space-y-1.5">
                {data.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      med.lowConfidence
                        ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800">{med.name}</span>
                      <span className="text-slate-500 ml-2">({med.dosage})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{med.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Test Results if Present */}
          {data.labResults && data.labResults.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary-600" /> Lab Test Values
              </h4>
              <div className="space-y-2">
                {data.labResults.map((lab, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all ${
                      lab.lowConfidence
                        ? "bg-amber-50/90 border-amber-400 shadow-sm"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{lab.testName}</span>
                      {lab.lowConfidence && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-700" /> Low Confidence — Needs Check
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-primary-900 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                        Result: {lab.result}
                      </span>
                      <span className="text-[11px] text-slate-500">Ref: {lab.referenceRange}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExtractedDocumentCard;
