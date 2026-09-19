/**
 * VerificationPage.jsx – Post-approval verification & prescription handoff screen.
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Printer, ArrowRight, ShieldCheck, FileCheck } from "lucide-react";
import DoctorShell from "@/shared/components/DoctorShell.jsx";
import Button from "@/shared/components/Button.jsx";

import { MOCK_DOCTOR_QUEUE } from "@/shared/data/mockDoctorQueueData.js";

function VerificationPage() {
  const { summaryId } = useParams();
  const navigate = useNavigate();

  const currentCase = MOCK_DOCTOR_QUEUE.find((c) => c.id === summaryId) || MOCK_DOCTOR_QUEUE[0];

  return (
    <DoctorShell title="Case Approval Verification" subtitle="Case verification signed off & ready for prescription handoff">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Approved Success Hero Card */}
        <div className="bg-success-900 text-white rounded-3xl p-8 text-center shadow-lg border border-success-700">
          <div className="w-16 h-16 rounded-full bg-success-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-success-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Case Successfully Approved & Signed Off</h1>
          <p className="text-sm text-success-200 mt-2 max-w-md mx-auto">
            The AI draft summary for <strong>{currentCase.patientName}</strong> has been verified against source evidence and locked into the official EMR.
          </p>
        </div>

        {/* Prescription Handoff Actions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-primary-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Printable Prescription Draft</h3>
              <p className="text-xs text-slate-500">Includes both Allopathy & AYUSH approved regimens</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="secondary" size="md" icon={Printer} onClick={() => window.print()}>
              Print Prescription
            </Button>
            <Button variant="primary" size="md" icon={ArrowRight} onClick={() => navigate("/doctor/dashboard")}>
              Next Patient in Queue
            </Button>
          </div>
        </div>
      </div>
    </DoctorShell>
  );
}

export default VerificationPage;
