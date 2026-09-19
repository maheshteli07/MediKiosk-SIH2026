/**
 * ApproveBar.jsx – Sticky doctor approval action bar.
 *
 * Provides clear before/after visual confirmation when approving a case:
 * flips badge state to Doctor Approved (green), disables inputs, & displays sign-off lock.
 */

import React from "react";
import { CheckCircle2, RotateCcw, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import Button from "@/shared/components/Button.jsx";
import Badge from "@/shared/components/Badge.jsx";

function ApproveBar({ status, onApprove, onRequestChanges, doctorName = "Dr. Ankit Mehta" }) {
  const isApproved = status === "doctor_approved";

  return (
    <div className="sticky bottom-0 z-20 bg-white/95 dark:bg-[#141822]/95 backdrop-blur border-t border-slate-200 dark:border-slate-700/60 p-4 shadow-lg rounded-b-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-6xl mx-auto">
        {/* Left Status Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isApproved
                ? "bg-success-500 text-white shadow-md shadow-success-500/30 scale-105"
                : status === "needs_check"
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-primary-600 text-white"
            }`}
          >
            {isApproved ? <CheckCircle2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Case Review Status:</span>
              {isApproved ? (
                <Badge variant="doctor-approved" size="md">
                  Doctor Approved &amp; Signed Off
                </Badge>
              ) : status === "needs_check" ? (
                <Badge variant="needs-check" size="md">
                  Review &amp; Verify AI Draft
                </Badge>
              ) : (
                <Badge variant="draft" size="md">
                  Awaiting Doctor Sign-off
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isApproved
                ? `Signed off by ${doctorName} on ${new Date().toLocaleDateString()}`
                : "Verify source evidence before approving"}
            </p>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">
          {isApproved ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-success-700 dark:text-emerald-400 font-bold bg-success-50 dark:bg-emerald-900/30 border border-success-200 dark:border-emerald-700/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-emerald-400" />
                Case Approved &amp; Locked
              </span>
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onRequestChanges}>
                Re-open for Edits
              </Button>
            </div>
          ) : (
            <>
              <Button variant="secondary" size="md" onClick={onRequestChanges}>
                Request Changes
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle2}
                onClick={onApprove}
                className="bg-success-600 hover:bg-success-700 text-white border-none shadow-md shadow-success-600/30"
              >
                Approve Case &amp; Sign Off
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApproveBar;
