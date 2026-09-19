/**
 * PatientCasePage.jsx – Individual patient case view inside DoctorShell.
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";
import DoctorShell from "@/shared/components/DoctorShell.jsx";
import Button from "@/shared/components/Button.jsx";
import CaseReviewPane from "../components/CaseReviewPane.jsx";

import { MOCK_DOCTOR_QUEUE } from "@/shared/data/mockDoctorQueueData.js";

function PatientCasePage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const currentCase = MOCK_DOCTOR_QUEUE.find((c) => c.patientId === patientId || c.id === patientId) || MOCK_DOCTOR_QUEUE[0];

  return (
    <DoctorShell title={`Patient File — ${currentCase.patientName}`} subtitle={`ID: ${currentCase.patientId}`}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <CaseReviewPane caseData={currentCase} />
      </div>
    </DoctorShell>
  );
}

export default PatientCasePage;
