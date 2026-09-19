/**
 * VerificationPage.jsx – Clinical Case Approval & Verification Screen.
 *
 * Implements the complete doctor verification workflow:
 *   1. Initial Verification: Inspect AI case summary & source evidence
 *   2. Doctor Verification Checklist: 4 mandatory checks before sign-off
 *   3. Clinical Notes & Corrections textarea
 *   4. Doctor Actions: "Request Changes" or "Approve & Sign Off"
 *   5. Confirmation Dialog: Prevents accidental sign-offs
 *   6. Post-Approval Success: Official EMR lock, printable prescription, next patient
 */

import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Printer,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  FileText,
  Sparkles,
  Activity,
  Pill,
  RotateCcw,
  Check,
  Leaf,
  Calendar,
  User,
  Clock,
  ChevronDown,
  ArrowLeft,
  Lock,
} from "lucide-react";

import DoctorShell from "@/shared/components/DoctorShell.jsx";
import Button from "@/shared/components/Button.jsx";
import Badge from "@/shared/components/Badge.jsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.jsx";
import SourceEvidenceViewer from "../components/SourceEvidenceViewer.jsx";

import { ROUTES } from "@/shared/constants/routes.js";
import { MOCK_DOCTOR_QUEUE } from "@/shared/data/mockDoctorQueueData.js";

function VerificationPage() {
  const { summaryId } = useParams();
  const navigate = useNavigate();

  // Find target case from param or default to first case needing verification
  const initialCaseId = useMemo(() => {
    if (summaryId) return summaryId;
    const pendingCase = MOCK_DOCTOR_QUEUE.find((c) => c.status === "needs_check");
    return pendingCase ? pendingCase.id : MOCK_DOCTOR_QUEUE[0].id;
  }, [summaryId]);

  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);
  const currentCase =
    MOCK_DOCTOR_QUEUE.find(
      (c) => c.id === selectedCaseId || c.patientId === selectedCaseId
    ) || MOCK_DOCTOR_QUEUE[0];

  // Workflow states: "verify" | "approved"
  const [workflowStep, setWorkflowStep] = useState("verify");

  // Clinical status state: "needs_check" | "changes_requested" | "doctor_approved"
  const [caseStatus, setCaseStatus] = useState("needs_check");

  // Doctor Verification Checklist states
  const [checklist, setChecklist] = useState({
    patientInfo: false,
    symptomsHistory: false,
    documents: false,
    aiSummary: false,
  });

  // Doctor Clinical Notes / Correction Remarks
  const [doctorNotes, setDoctorNotes] = useState("");

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Approval timestamp
  const [approvalDate, setApprovalDate] = useState(null);

  // Validation: all 4 checklist items must be verified
  const allVerified =
    checklist.patientInfo &&
    checklist.symptomsHistory &&
    checklist.documents &&
    checklist.aiSummary;

  const handleToggleCheck = (key) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllChecks = () => {
    setChecklist({
      patientInfo: true,
      symptomsHistory: true,
      documents: true,
      aiSummary: true,
    });
  };

  // Switch to another patient case
  const handleSwitchCase = (newCaseId) => {
    setSelectedCaseId(newCaseId);
    setWorkflowStep("verify");
    setCaseStatus("needs_check");
    setChecklist({
      patientInfo: false,
      symptomsHistory: false,
      documents: false,
      aiSummary: false,
    });
    setDoctorNotes("");
  };

  // Secondary Action: Request Changes
  const handleRequestChanges = () => {
    setCaseStatus("changes_requested");
  };

  // Primary Action: Open Confirmation Modal
  const handleInitiateApproval = () => {
    if (!allVerified) return;
    setShowConfirmModal(true);
  };

  // Modal Confirmed: Transition to Approved Success State
  const handleConfirmApproval = () => {
    setApprovalDate(new Date());
    setCaseStatus("doctor_approved");
    setWorkflowStep("approved");
    setShowConfirmModal(false);
  };

  const doctorName = currentCase.doctorAssigned || "Dr. Ankit Mehta";

  // ───────────────────────────────────────────────────────────────────────────
  // STATE B: Post-Approval Success Screen
  // ───────────────────────────────────────────────────────────────────────────
  if (workflowStep === "approved") {
    return (
      <DoctorShell
        title="Case Approval & Verification"
        subtitle={`Case ID: ${currentCase.patientId} • Official Record Locked`}
        breadcrumb="Doctor Portal / Approvals / Signed-Off Record"
      >
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {/* Approval Success Hero Card */}
          <div className="bg-success-900 text-white rounded-3xl p-8 shadow-lg border border-success-700 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-success-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-success-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">
                Case Successfully Approved & Signed Off
              </h1>
              <p className="text-sm text-success-200 mt-2 max-w-lg mx-auto leading-relaxed">
                The clinical record for <strong>{currentCase.patientName}</strong> has been
                verified against source evidence and locked into the official hospital EMR.
              </p>

              {/* Audit Trail Row */}
              <div className="mt-6 pt-6 border-t border-success-700/60 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-success-100">
                <div>
                  <span className="text-success-300 block text-[10px] uppercase tracking-wider font-semibold">
                    Approved By
                  </span>
                  <strong className="text-white text-sm">{doctorName}</strong>
                </div>
                <div className="h-6 w-px bg-success-700 hidden sm:block" />
                <div>
                  <span className="text-success-300 block text-[10px] uppercase tracking-wider font-semibold">
                    Sign-Off Timestamp
                  </span>
                  <strong className="text-white">
                    {approvalDate
                      ? approvalDate.toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Just now"}
                  </strong>
                </div>
                <div className="h-6 w-px bg-success-700 hidden sm:block" />
                <div>
                  <span className="text-success-300 block text-[10px] uppercase tracking-wider font-semibold">
                    Status
                  </span>
                  <Badge variant="doctor-approved" size="sm">
                    Approved & Locked
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Official Prescription Generated
                </h3>
                <p className="text-xs text-slate-500">
                  Ready for patient pharmacy handoff or PDF print
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Prescription
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                onClick={() => navigate(ROUTES.PATIENT_QUEUE)}
              >
                Next Patient in Queue
              </Button>
            </div>
          </div>

          {/* Printable Official Prescription Draft Sheet */}
          <div
            id="printable-prescription"
            className="bg-white border border-slate-300 rounded-3xl p-8 shadow-sm space-y-6 print:shadow-none print:border-none print:p-0"
          >
            {/* Clinic Header */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary-700 flex items-center justify-center text-white font-bold text-sm">
                    M
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    MediKiosk Clinical Healthcare
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Tele-Triage & Clinical Handoff Center • General Medicine & Integrated AYUSH
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-sm font-bold text-slate-900">{doctorName}</p>
                <p className="text-xs text-slate-500">MBBS, MD · Reg. MH-12345</p>
                <p className="text-[11px] text-primary-700 font-semibold mt-0.5">
                  General Medicine Physician
                </p>
              </div>
            </div>

            {/* Patient Demographics Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Patient Name
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {currentCase.patientName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Age / Gender
                </span>
                <span className="font-semibold text-slate-800">
                  {currentCase.age} Years / {currentCase.gender}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Patient ID
                </span>
                <span className="font-mono font-bold text-primary-800">
                  {currentCase.patientId}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Blood Group
                </span>
                <span className="font-bold text-rose-700">
                  {currentCase.bloodGroup || "O+"}
                </span>
              </div>
            </div>

            {/* Clinical Diagnosis / Complaint */}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Primary Clinical Assessment
              </h4>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed">
                <strong>Chief Complaint: </strong>
                {currentCase.chiefComplaint}
              </p>
            </div>

            {/* Prescribed Medications (Rx Table) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-serif font-black text-primary-900">Rx</span>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Prescribed Medication Regimen
                </h4>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                      <th className="p-3">Medication Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Dosage & Frequency</th>
                      <th className="p-3">Duration / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentCase.summaryDraft?.medications?.map((med, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{med.name}</td>
                        <td className="p-3">
                          {med.type === "ayush" ? (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                              AYUSH
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-primary-900 bg-primary-100 border border-primary-300 px-2 py-0.5 rounded-full">
                              Allopathy
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-700 font-medium">{med.dosage}</td>
                        <td className="p-3 text-slate-500">
                          {med.confidence === "confirmed" ? "Prescribed" : "Verified by doctor"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AYUSH Constitutional Guidance (if available) */}
            {currentCase.summaryDraft?.ayushNotes && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-ayush-600" />
                  AYUSH Constitutional & Lifestyle Regimen
                </p>
                <p className="text-slate-700">
                  <strong>Prakriti:</strong> {currentCase.summaryDraft.ayushNotes.prakriti} •{" "}
                  <strong>Agni State:</strong> {currentCase.summaryDraft.ayushNotes.agniState}
                </p>
              </div>
            )}

            {/* Doctor Clinical Remarks (if provided during verification) */}
            {doctorNotes && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">Doctor Clinical Notes:</p>
                <p className="text-slate-700 italic">"{doctorNotes}"</p>
              </div>
            )}

            {/* Digital Sign-off Seal */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-success-600" />
                <span>
                  Official EMR Prescription • Verified & Digitally Locked under Medical Act
                </span>
              </div>

              <div className="text-right">
                <div className="inline-block border border-success-300 bg-success-50 text-success-800 px-3 py-1 rounded-lg text-[11px] font-bold">
                  ✓ Digitally Signed by {doctorName}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Registration No: MH-12345
                </p>
              </div>
            </div>
          </div>

          {/* Return button */}
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={() => setWorkflowStep("verify")}
            >
              Back to Verification View
            </Button>
          </div>
        </div>
      </DoctorShell>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATE A: Initial Doctor Verification Screen (Default)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <DoctorShell
      title="Case Approval & Verification"
      subtitle="Review AI-generated case findings against source evidence, complete mandatory verification, and sign off."
      breadcrumb="Doctor Portal / Approvals"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-24">
        {/* ── Patient Info Card & Case Selector ────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Patient Demographics */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-extrabold text-base shrink-0">
                {currentCase.patientName.charAt(0)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-bold text-slate-900">
                    {currentCase.patientName}
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {currentCase.age}y / {currentCase.gender}
                  </span>
                  <span className="text-xs font-mono font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-md">
                    {currentCase.patientId}
                  </span>
                  {currentCase.bloodGroup && (
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      {currentCase.bloodGroup}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>Intake: {currentCase.waitTime}</span>
                  <span>•</span>
                  <span>Assigned: <strong>{doctorName}</strong></span>
                </p>
              </div>
            </div>

            {/* Status & Case Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Badge */}
              {caseStatus === "changes_requested" ? (
                <Badge variant="needs-check" size="md">
                  Changes Requested
                </Badge>
              ) : (
                <Badge variant="needs-check" size="md">
                  Pending Verification
                </Badge>
              )}

              {/* Case Switcher Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-[11px] font-medium text-slate-500">Case:</span>
                <select
                  value={selectedCaseId}
                  onChange={(e) => handleSwitchCase(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {MOCK_DOCTOR_QUEUE.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.patientName} ({c.status === "needs_check" ? "Needs Check" : c.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Feedback banner if changes requested */}
          {caseStatus === "changes_requested" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">
                  Changes Requested for this Case
                </p>
                <p className="text-amber-800 mt-0.5">
                  Case marked for intake revision. Clinical notes have been logged for the kiosk intake nurse.
                  {doctorNotes && <span className="block mt-1 font-semibold italic">Remarks: "{doctorNotes}"</span>}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Two-Column Review Layout: AI Summary (Left) + Source Evidence (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: AI-Generated Case Summary (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            {/* Header & Medical Disclaimer */}
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  AI-Generated Case Summary
                </h3>
                <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                  AI Draft
                </span>
              </div>

              {/* Disclaimer Notice */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Clinical Notice: </strong>
                  AI-generated information requires doctor verification. Not a confirmed medical diagnosis.
                </p>
              </div>
            </div>

            {/* 1. Chief Complaint */}
            <div className="p-4 rounded-2xl bg-primary-50/40 border border-primary-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Chief Complaint
              </span>
              <p className="text-sm font-bold text-slate-900">
                {currentCase.summaryDraft?.chiefComplaint || currentCase.chiefComplaint}
              </p>
            </div>

            {/* 2. Extracted Symptoms & Severity */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary-600" />
                Extracted Symptoms & Confidence
              </h4>
              <div className="space-y-2">
                {currentCase.summaryDraft?.symptoms?.map((sym, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{sym.name}</span>
                      <span className="text-slate-500 ml-2">• Duration: {sym.duration}</span>
                    </div>
                    <Badge
                      variant={sym.confidence === "confirmed" ? "doctor-approved" : "needs-check"}
                      size="sm"
                    >
                      {sym.confidence}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Medical History */}
            {currentCase.summaryDraft?.history && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary-600" />
                  Past Medical History
                </h4>
                <div className="space-y-2">
                  {currentCase.summaryDraft.history.map((hist, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{hist.condition}</span>
                        <span className="text-slate-500 ml-2">• Onset: {hist.onset}</span>
                      </div>
                      <Badge
                        variant={hist.confidence === "confirmed" ? "doctor-approved" : "needs-check"}
                        size="sm"
                      >
                        {hist.confidence}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Medications (Allopathy + AYUSH) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-ayush-600" />
                Current & Suggested Medications
              </h4>
              <div className="space-y-2">
                {currentCase.summaryDraft?.medications?.map((med, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                      med.type === "ayush"
                        ? "bg-amber-50/60 border-amber-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{med.name}</span>
                        {med.type === "ayush" && (
                          <span className="text-[10px] font-bold text-ayush-800 bg-ayush-100 border border-ayush-300 px-1.5 py-0.5 rounded">
                            AYUSH
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Dosage: {med.dosage}</p>
                    </div>
                    <Badge
                      variant={med.confidence === "confirmed" ? "doctor-approved" : "needs-check"}
                      size="sm"
                    >
                      {med.confidence}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. AYUSH Constitution Notes (if available) */}
            {currentCase.summaryDraft?.ayushNotes && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-white border border-ayush-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <Leaf className="w-4 h-4 text-ayush-600" />
                  AYUSH Constitution Findings
                </div>
                <p className="text-slate-700">
                  <strong>Prakriti:</strong> {currentCase.summaryDraft.ayushNotes.prakriti}
                </p>
                <p className="text-slate-700">
                  <strong>Agni State:</strong> {currentCase.summaryDraft.ayushNotes.agniState}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Source Evidence Viewer (5 cols) */}
          <div className="lg:col-span-5 h-full">
            <SourceEvidenceViewer evidence={currentCase.evidence} />
          </div>
        </div>

        {/* ── Doctor Verification Checklist & Notes Section ──────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-600" />
                Doctor Verification Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All 4 verification checks must be confirmed by the doctor before approving sign-off.
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllChecks}
              className="text-xs text-primary-600 hover:text-primary-800 self-start sm:self-auto"
            >
              Select All
            </Button>
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Check 1 */}
            <label
              className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                checklist.patientInfo
                  ? "bg-primary-50/50 border-primary-300 shadow-2xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/60"
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.patientInfo}
                onChange={() => handleToggleCheck("patientInfo")}
                className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer h-4 w-4"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">
                  Patient information verified
                </p>
                <p className="text-slate-500 mt-0.5">
                  Name, demographic details, ID, and visit context confirmed.
                </p>
              </div>
            </label>

            {/* Check 2 */}
            <label
              className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                checklist.symptomsHistory
                  ? "bg-primary-50/50 border-primary-300 shadow-2xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/60"
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.symptomsHistory}
                onChange={() => handleToggleCheck("symptomsHistory")}
                className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer h-4 w-4"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">
                  Symptoms and history reviewed
                </p>
                <p className="text-slate-500 mt-0.5">
                  Severity, duration, past conditions, and drug allergies checked.
                </p>
              </div>
            </label>

            {/* Check 3 */}
            <label
              className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                checklist.documents
                  ? "bg-primary-50/50 border-primary-300 shadow-2xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/60"
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.documents}
                onChange={() => handleToggleCheck("documents")}
                className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer h-4 w-4"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">
                  Supporting documents reviewed
                </p>
                <p className="text-slate-500 mt-0.5">
                  Attached prescription scans, lab reports, and OCR evidence inspected.
                </p>
              </div>
            </label>

            {/* Check 4 */}
            <label
              className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                checklist.aiSummary
                  ? "bg-primary-50/50 border-primary-300 shadow-2xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/60"
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.aiSummary}
                onChange={() => handleToggleCheck("aiSummary")}
                className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer h-4 w-4"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">
                  AI-generated summary verified
                </p>
                <p className="text-slate-500 mt-0.5">
                  AI clinical draft validated against raw voice intake transcript.
                </p>
              </div>
            </label>
          </div>

          {/* Doctor Notes Field */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label
              htmlFor="doctor-notes"
              className="text-xs font-bold text-slate-700 block"
            >
              Doctor Clinical Notes & Remarks (Optional)
            </label>
            <textarea
              id="doctor-notes"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Add notes or corrections before approving..."
              rows={3}
              className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-800 placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>
        </div>

        {/* ── Sticky Bottom Action Bar ────────────────────────────────────────── */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border border-slate-200 p-4 shadow-lg rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-6xl mx-auto">
            {/* Left Status */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  allVerified
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                    : "bg-amber-500 text-white"
                }`}
              >
                {allVerified ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Verification State:
                  </span>
                  {allVerified ? (
                    <span className="text-xs font-bold text-success-700 bg-success-50 border border-success-200 px-2 py-0.5 rounded-full">
                      Ready for Sign-Off
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Checks Pending (
                      {4 - Object.values(checklist).filter(Boolean).length} left)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {allVerified
                    ? "All clinical items checked. Click Approve & Sign Off to proceed."
                    : "Check all 4 verification items above to enable sign-off."}
                </p>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <Button
                variant="secondary"
                size="md"
                onClick={handleRequestChanges}
              >
                Request Changes
              </Button>

              <Button
                variant="primary"
                size="md"
                icon={CheckCircle2}
                disabled={!allVerified}
                onClick={handleInitiateApproval}
                className={
                  allVerified
                    ? "bg-success-600 hover:bg-success-700 text-white border-none shadow-md shadow-success-600/30"
                    : ""
                }
              >
                Approve & Sign Off
              </Button>
            </div>
          </div>
        </div>

        {/* ── Confirmation Dialog ───────────────────────────────────────────── */}
        <ConfirmDialog
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmApproval}
          title="Confirm Approval"
          message="Are you sure you want to approve and sign off this case? Once approved, the case will be locked as an official record."
          confirmLabel="Confirm & Sign Off"
          cancelLabel="Cancel"
          variant="primary"
        />
      </div>
    </DoctorShell>
  );
}

export default VerificationPage;
