/**
 * ProcessingState.jsx – Displays active and completed file OCR extraction progress.
 *
 * Status variants:
 *   - queued: slate badge
 *   - reading: primary teal badge with spinner
 *   - extracted: success green badge
 *   - needs_check: ayush gold badge (calm, expected review state, NOT error red)
 */

import React from "react";
import { FileText, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import Badge from "@/shared/components/Badge.jsx";

function ProcessingState({ files = [] }) {
  if (files.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
      <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
        <span>Document Processing Queue</span>
        <span className="text-xs font-normal text-slate-500">
          {files.filter((f) => f.status === "extracted" || f.status === "needs_check").length} / {files.length} Completed
        </span>
      </h4>

      <div className="space-y-2">
        {files.map((file, idx) => (
          <div
            key={file.id || idx}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                  {file.fileName || file.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {file.fileSize || "1.5 MB"} • {file.uploadTime || "Just now"}
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div>
              {file.status === "queued" && (
                <Badge variant="draft" size="sm">
                  Queued
                </Badge>
              )}
              {file.status === "reading" && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-600" />
                  <span>Reading OCR...</span>
                </div>
              )}
              {file.status === "extracted" && (
                <Badge variant="doctor-approved" size="sm" dot>
                  Extracted
                </Badge>
              )}
              {file.status === "needs_check" && (
                <Badge variant="needs-check" size="sm" dot>
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

export default ProcessingState;
