/**
 * PatientQueuePage.jsx – Full patient queue management.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorShell from "@/shared/components/DoctorShell.jsx";
import PatientQueueList from "../components/PatientQueueList.jsx";
import Tabs from "@/shared/components/Tabs.jsx";

import { MOCK_DOCTOR_QUEUE } from "@/shared/data/mockDoctorQueueData.js";

function PatientQueuePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const filterTabs = [
    { id: "all", label: "All Cases" },
    { id: "needs_check", label: "Needs Verification" },
    { id: "doctor_approved", label: "Approved" },
  ];

  const filteredQueue = MOCK_DOCTOR_QUEUE.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const handleSelectCase = (selectedCase) => {
    navigate(`/doctor/summary/${selectedCase.id}`);
  };

  return (
    <DoctorShell title="Patient Queue" subtitle="Manage and inspect pending patient case handovers">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Pending Handover Queue ({filteredQueue.length})
          </h2>

          <Tabs
            tabs={filterTabs}
            activeTab={filter}
            onChange={setFilter}
            variant="pill"
          />
        </div>

        <PatientQueueList
          queue={filteredQueue}
          selectedCaseId={null}
          onSelectCase={handleSelectCase}
        />
      </div>
    </DoctorShell>
  );
}

export default PatientQueuePage;
