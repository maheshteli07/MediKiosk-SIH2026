/**
 * SummaryReviewPage.jsx – Full two-pane case review & verification screen.
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, User, ShieldCheck } from "lucide-react";
import DoctorShell from "@/shared/components/DoctorShell.jsx";
import Button from "@/shared/components/Button.jsx";

import CaseReviewPane from "../components/CaseReviewPane.jsx";
import ApproveBar from "../components/ApproveBar.jsx";

import { MOCK_DOCTOR_QUEUE } from "@/shared/data/mockDoctorQueueData.js";

function SummaryReviewPage() {
  const { summaryId } = useParams();
  const navigate = useNavigate();

  // Find target case or fallback to case 1
  const initialCase = MOCK_DOCTOR_QUEUE.find((c) => c.id === summaryId) || MOCK_DOCTOR_QUEUE[0];
  const [currentCase, setCurrentCase] = useState(initialCase);

  const handleApprove = () => {
    setCurrentCase((prev) => ({
      ...prev,
      status: "doctor_approved",
      completionPercentage: 100,
    }));
  };

  const handleRequestChanges = () => {
    setCurrentCase((prev) => ({
      ...prev,
      status: "needs_check",
    }));
  };

  return (
    <DoctorShell
      title={`Case Verification — ${currentCase.patientName}`}
      subtitle={`Patient ID: ${currentCase.patientId} • ${currentCase.age}y / ${currentCase.gender}`}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-24">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/doctor/queue")}
          >
            Back to Queue
          </Button>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Wait Time: <strong className="text-slate-800">{currentCase.waitTime}</strong></span>
            <span>•</span>
            <span>Assigned: <strong className="text-slate-800">{currentCase.doctorAssigned}</strong></span>
          </div>
        </div>

        {/* Two-pane Detail View */}
        <CaseReviewPane
          caseData={currentCase}
          onUpdateCase={setCurrentCase}
        />
      </div>

      {/* Sticky Bottom Approve Bar */}
      <ApproveBar
        status={currentCase.status}
        onApprove={handleApprove}
        onRequestChanges={handleRequestChanges}
        doctorName={currentCase.doctorAssigned}
      />
    </DoctorShell>
  );
}

export default SummaryReviewPage;
