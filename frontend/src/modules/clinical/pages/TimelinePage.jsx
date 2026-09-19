/**
 * TimelinePage.jsx – Patient health event timeline.
 */

import React from "react";
import { Clock } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import EmptyState from "@/shared/components/EmptyState.jsx";
import { EMPTY_STATES } from "@/shared/constants/copy.js";

function TimelinePage() {
  return (
    <PatientShell>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 leading-tight">
          Your health timeline
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          A chronological view of visits, diagnoses, and treatments.
        </p>
      </div>

      <EmptyState
        icon={Clock}
        heading={EMPTY_STATES.NO_TIMELINE.heading}
        subtext={EMPTY_STATES.NO_TIMELINE.subtext}
      />
    </PatientShell>
  );
}

export default TimelinePage;
