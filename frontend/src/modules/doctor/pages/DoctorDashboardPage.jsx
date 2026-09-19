/**
 * DoctorDashboardPage.jsx – Doctor Portal Home Screen.
 *
 * Displays stat cards (Pending cases, Needs check, Approved today) and recent cases queue.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import DoctorShell from "@/shared/components/DoctorShell.jsx";
import Button from "@/shared/components/Button.jsx";
import PatientQueueList from "../components/PatientQueueList.jsx";

import { MOCK_DOCTOR_QUEUE } from "@/shared/data/mockDoctorQueueData.js";

function DoctorDashboardPage() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState(MOCK_DOCTOR_QUEUE);

  const pendingCount = queue.filter((c) => c.status === "draft").length;
  const needsCheckCount = queue.filter((c) => c.status === "needs_check").length;
  const approvedCount = queue.filter((c) => c.status === "doctor_approved").length;

  const handleSelectCase = (selectedCase) => {
    navigate(`/doctor/summary/${selectedCase.id}`);
  };

  return (
    <DoctorShell title="Clinical Portal Dashboard" subtitle="Overview of pending patient cases and AI case-taking reviews">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Needs Check */}
          <div className="bg-white dark:bg-[#1e2535] border border-amber-200 dark:border-amber-900/50 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Needs Verification</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{needsCheckCount}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready for doctor review</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Awaiting Review */}
          <div className="bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Awaiting Review</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{pendingCount}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">In kiosk intake queue</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Approved Today */}
          <div className="bg-white dark:bg-[#1e2535] border border-success-200 dark:border-emerald-900/50 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-success-700 dark:text-emerald-400">Approved Today</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{approvedCount}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cases signed off</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-success-100 dark:bg-emerald-900/30 text-success-700 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Doctor Trust Banner */}
        <div className="bg-primary-950 dark:bg-primary-900/40 text-white rounded-3xl p-6 shadow-md border border-primary-800 dark:border-primary-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-800 text-ayush-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Doctor Control Center</h2>
              <p className="text-xs text-primary-200 mt-0.5">
                Every AI-generated note requires your explicit review and sign-off before becoming a permanent record.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => navigate("/doctor/queue")}
          >
            Open Full Queue
          </Button>
        </div>

        {/* Main Section: Patient Queue List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Active Patient Queue</h2>
          <PatientQueueList
            queue={queue}
            selectedCaseId={null}
            onSelectCase={handleSelectCase}
          />
        </div>
      </div>
    </DoctorShell>
  );
}

export default DoctorDashboardPage;
