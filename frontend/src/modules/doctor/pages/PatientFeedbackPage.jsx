/**
 * PatientFeedbackPage.jsx – Doctor-submitted Patient Feedback Form.
 *
 * Allows doctors to submit structured feedback on:
 *   - Overall visit experience
 *   - AI case-taking quality
 *   - Kiosk usability
 *   - Free-form clinical notes and observations
 *   - Flag urgent follow-up needs
 *
 * Design:
 *   - Follows the established DoctorShell + Tailwind pattern
 *   - Star rating component built inline
 *   - Multi-step form with animated progress indicator
 *   - Toast-style success confirmation
 *   - Fully accessible (ARIA labels, focus management)
 */

import React, { useState, useCallback, useRef } from "react";
import {
  Star,
  MessageSquare,
  User,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  Cpu,
  Monitor,
  Heart,
  Clock,
  Flag,
  FileText,
  Info,
} from "lucide-react";
import DoctorShell from "@/shared/components/DoctorShell.jsx";
import Button from "@/shared/components/Button.jsx";
import Tabs from "@/shared/components/Tabs.jsx";
import PatientRatingsPanel from "../components/PatientRatingsPanel.jsx";

// ─── Helper: Star Rating ────────────────────────────────────────────────────

function StarRating({ value, onChange, label, id }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          id={`${id}-star-${star}`}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          aria-checked={value === star}
          role="radio"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-transform duration-100 hover:scale-110 active:scale-95"
        >
          <Star
            size={24}
            className={
              (hovered || value) >= star
                ? "fill-amber-400 text-amber-400 transition-colors duration-100"
                : "fill-none text-slate-300 dark:text-slate-600 transition-colors duration-100"
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}

// ─── Helper: Toggle Chip ────────────────────────────────────────────────────

function Chip({ label, selected, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        selected
          ? "bg-primary-500 text-white border-primary-500 shadow-sm"
          : "bg-white dark:bg-[#1e2535] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-400",
      ].join(" ")}
      aria-pressed={selected}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {label}
    </button>
  );
}

// ─── Helper: Section Card ──────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, description, children, accent = "primary" }) {
  const accentMap = {
    primary: "border-primary-200 dark:border-primary-800/50",
    amber:   "border-amber-200 dark:border-amber-900/50",
    rose:    "border-rose-200 dark:border-rose-900/50",
    emerald: "border-emerald-200 dark:border-emerald-900/50",
    violet:  "border-violet-200 dark:border-violet-900/50",
  };
  const iconAccent = {
    primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
    amber:   "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    rose:    "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    violet:  "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  };

  return (
    <div
      className={[
        "bg-white dark:bg-[#1e2535] rounded-2xl border shadow-sm p-6",
        accentMap[accent] || accentMap.primary,
      ].join(" ")}
    >
      <div className="flex items-start gap-4 mb-5">
        <div className={["w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconAccent[accent] || iconAccent.primary].join(" ")}>
          <Icon size={18} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Helper: Labeled Field ─────────────────────────────────────────────────

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
    >
      {children}
      {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
    </label>
  );
}

// ─── Step Indicator ────────────────────────────────────────────────────────

const STEPS = [
  { label: "Patient Info",  icon: User },
  { label: "Visit Ratings", icon: Star },
  { label: "AI & Kiosk",   icon: Cpu },
  { label: "Notes & Flags", icon: FileText },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8" role="list" aria-label="Form steps">
      {STEPS.map((step, idx) => {
        const done   = idx < current;
        const active = idx === current;
        const Icon   = step.icon;
        return (
          <React.Fragment key={step.label}>
            <div
              role="listitem"
              aria-current={active ? "step" : undefined}
              className="flex flex-col items-center"
            >
              <div
                className={[
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border-2",
                  done   ? "bg-primary-500 border-primary-500 text-white"
                         : active ? "bg-white dark:bg-[#1e2535] border-primary-500 text-primary-500 shadow-md"
                         : "bg-white dark:bg-[#1e2535] border-slate-200 dark:border-slate-600 text-slate-400",
                ].join(" ")}
              >
                {done ? <CheckCircle2 size={16} aria-hidden="true" /> : <Icon size={14} aria-hidden="true" />}
              </div>
              <span
                className={[
                  "text-[10px] font-semibold mt-1.5 text-center",
                  active ? "text-primary-600 dark:text-primary-400" : done ? "text-slate-600 dark:text-slate-300" : "text-slate-400",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={[
                  "h-0.5 w-12 sm:w-20 mx-1 mb-5 rounded-full transition-colors duration-300",
                  done ? "bg-primary-400" : "bg-slate-200 dark:bg-slate-700",
                ].join(" ")}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Submission Success Banner ─────────────────────────────────────────────

function SuccessBanner({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
        <CheckCircle2 size={40} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Feedback Submitted!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-sm">
        Thank you for your valuable feedback. It helps us continuously improve the AI case-taking
        accuracy and kiosk experience for patients and doctors alike.
      </p>
      <Button variant="primary" size="md" icon={RotateCcw} onClick={onReset}>
        Submit Another
      </Button>
    </div>
  );
}

// ─── INITIAL FORM STATE ────────────────────────────────────────────────────

const INITIAL_STATE = {
  // Step 0 – Patient Info
  patientId:     "",
  patientName:   "",
  visitDate:     new Date().toISOString().slice(0, 10),
  consultType:   "outpatient",
  department:    "General Medicine",

  // Step 1 – Visit Ratings
  overallRating:       0,
  communicationRating: 0,
  waitTimeRating:      0,
  satisfactionTags:    [],

  // Step 2 – AI & Kiosk
  aiAccuracyRating:     0,
  kioskUsabilityRating: 0,
  aiMissedItems:        [],
  kioskIssues:          [],

  // Step 3 – Notes & Flags
  clinicalNotes:      "",
  aiSuggestionNotes:  "",
  followUpRequired:   false,
  urgencyLevel:       "routine",
  additionalComments: "",
};

const SATISFACTION_TAGS = [
  { label: "Thorough history", icon: ClipboardList },
  { label: "Good rapport",     icon: Heart },
  { label: "Clear diagnosis",  icon: CheckCircle2 },
  { label: "Timely",           icon: Clock },
  { label: "Empathetic",       icon: ThumbsUp },
];

const AI_MISSED_ITEMS = [
  "Chief complaint",
  "Drug allergies",
  "Chronic conditions",
  "Medication history",
  "Family history",
  "Social history",
  "Vitals",
  "Symptom duration",
];

const KIOSK_ISSUES = [
  "Audio unclear",
  "Language barrier",
  "Slow response",
  "Input error",
  "Network issue",
  "UI confusion",
];

const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Pulmonology",
  "Orthopaedics",
  "Gynaecology",
  "Paediatrics",
  "Dermatology",
  "Neurology",
  "Ophthalmology",
  "ENT",
  "Psychiatry",
  "Emergency",
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────

function PatientFeedbackPage() {
  const [activeTab, setActiveTab] = useState("ratings"); // "ratings" | "form"
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState(INITIAL_STATE);
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const topRef = useRef(null);

  const feedbackTabs = [
    { id: "ratings", label: "Patient Ratings & Reviews" },
    { id: "form", label: "Doctor Evaluation Form" },
  ];

  // ── Generic field updater ──────────────────────────────────────────────
  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }, []);

  // ── Toggle array field (chips) ─────────────────────────────────────────
  const toggleArrayItem = useCallback((field, item) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  }, []);

  // ── Validation per step ────────────────────────────────────────────────
  const validate = useCallback(() => {
    const e = {};
    if (step === 0) {
      if (!form.patientId.trim())   e.patientId   = "Patient ID is required.";
      if (!form.patientName.trim()) e.patientName = "Patient name is required.";
      if (!form.visitDate)          e.visitDate   = "Visit date is required.";
    }
    if (step === 1) {
      if (form.overallRating === 0)       e.overallRating       = "Please rate the overall experience.";
      if (form.communicationRating === 0) e.communicationRating = "Please rate communication.";
    }
    if (step === 2) {
      if (form.aiAccuracyRating === 0)     e.aiAccuracyRating     = "Please rate AI accuracy.";
      if (form.kioskUsabilityRating === 0) e.kioskUsabilityRating = "Please rate kiosk usability.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [step, form]);

  // ── Navigation ─────────────────────────────────────────────────────────
  const goNext = () => {
    if (!validate()) return;
    setStep((s) => s + 1);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const goPrev = () => {
    setStep((s) => s - 1);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1400));
    setLoading(false);
    setSubmitted(true);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReset = () => {
    setForm(INITIAL_STATE);
    setErrors({});
    setStep(0);
    setSubmitted(false);
  };

  // ── Input classes helper ───────────────────────────────────────────────
  const inputCls = (field) =>
    [
      "w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-[#0f1117]",
      "text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600",
      "focus:outline-none focus:ring-2 transition-shadow duration-150",
      errors[field]
        ? "border-rose-400 focus:ring-rose-400/40"
        : "border-slate-200 dark:border-slate-600 focus:ring-primary-400/40 focus:border-primary-400",
    ].join(" ");

  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
        <Info size={11} aria-hidden="true" /> {errors[field]}
      </p>
    ) : null;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <DoctorShell
      title="Patient Feedback"
      subtitle={
        activeTab === "ratings"
          ? "View patient ratings, satisfaction metrics, and comments from kiosk visits"
          : "Submit structured feedback on patient visits and AI case-taking quality"
      }
      breadcrumb="Doctor Portal / Patient Feedback"
    >
      <div className="max-w-4xl mx-auto space-y-6" ref={topRef}>
        {/* Top-level Tabs: Patient Ratings vs Doctor Clinical Feedback */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
          <Tabs
            tabs={feedbackTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pill"
          />
        </div>

        {activeTab === "ratings" ? (
          <PatientRatingsPanel />
        ) : submitted ? (
          <SuccessBanner onReset={handleReset} />
        ) : (
          <>
            {/* ── Hero banner ── */}
            <div className="mb-6 bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <MessageSquare size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">Clinical Case Evaluation</h2>
                <p className="text-primary-200 text-xs mt-0.5">
                  Submit doctor-side feedback on AI intake quality and kiosk diagnostic accuracy.
                </p>
              </div>
            </div>

            {/* ── Step indicator ── */}
            <StepIndicator current={step} />

            <form onSubmit={handleSubmit} noValidate>

              {/* STEP 0 – Patient Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <SectionCard
                    icon={User}
                    title="Patient & Visit Details"
                    description="Identify the patient and the nature of the visit."
                    accent="primary"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel htmlFor="patientId" required>Patient ID</FieldLabel>
                        <input
                          id="patientId"
                          type="text"
                          placeholder="e.g. MK-2026-0042"
                          value={form.patientId}
                          onChange={(e) => set("patientId", e.target.value)}
                          className={inputCls("patientId")}
                          aria-required="true"
                        />
                        <ErrorMsg field="patientId" />
                      </div>

                      <div>
                        <FieldLabel htmlFor="patientName" required>Patient Name</FieldLabel>
                        <input
                          id="patientName"
                          type="text"
                          placeholder="Full name"
                          value={form.patientName}
                          onChange={(e) => set("patientName", e.target.value)}
                          className={inputCls("patientName")}
                          aria-required="true"
                        />
                        <ErrorMsg field="patientName" />
                      </div>

                      <div>
                        <FieldLabel htmlFor="visitDate" required>Visit Date</FieldLabel>
                        <input
                          id="visitDate"
                          type="date"
                          value={form.visitDate}
                          max={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => set("visitDate", e.target.value)}
                          className={inputCls("visitDate")}
                          aria-required="true"
                        />
                        <ErrorMsg field="visitDate" />
                      </div>

                      <div>
                        <FieldLabel htmlFor="department">Department</FieldLabel>
                        <select
                          id="department"
                          value={form.department}
                          onChange={(e) => set("department", e.target.value)}
                          className={inputCls("department")}
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel>Consultation Type</FieldLabel>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {[
                            { value: "outpatient",  label: "Outpatient" },
                            { value: "inpatient",   label: "Inpatient" },
                            { value: "emergency",   label: "Emergency" },
                            { value: "follow_up",   label: "Follow-up" },
                            { value: "teleconsult", label: "Teleconsult" },
                          ].map(({ value, label }) => (
                            <Chip
                              key={value}
                              label={label}
                              selected={form.consultType === value}
                              onClick={() => set("consultType", value)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* STEP 1 – Visit Ratings */}
              {step === 1 && (
                <div className="space-y-4">
                  <SectionCard
                    icon={Star}
                    title="Visit Experience Ratings"
                    description="Rate the patient's experience during this consultation."
                    accent="amber"
                  >
                    <div className="space-y-5">
                      {[
                        { field: "overallRating",       label: "Overall Visit Experience",      required: true },
                        { field: "communicationRating",  label: "Doctor–Patient Communication",  required: true },
                        { field: "waitTimeRating",       label: "Wait Time Satisfaction",        required: false },
                      ].map(({ field, label, required }) => (
                        <div key={field}>
                          <FieldLabel required={required}>{label}</FieldLabel>
                          <StarRating
                            id={field}
                            label={label}
                            value={form[field]}
                            onChange={(v) => set(field, v)}
                          />
                          <ErrorMsg field={field} />
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={ThumbsUp}
                    title="Positive Observations"
                    description="Select all aspects that went well during the visit."
                    accent="emerald"
                  >
                    <div className="flex flex-wrap gap-2">
                      {SATISFACTION_TAGS.map(({ label, icon }) => (
                        <Chip
                          key={label}
                          label={label}
                          icon={icon}
                          selected={form.satisfactionTags.includes(label)}
                          onClick={() => toggleArrayItem("satisfactionTags", label)}
                        />
                      ))}
                    </div>
                    {form.satisfactionTags.length > 0 && (
                      <p className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {form.satisfactionTags.length} observation{form.satisfactionTags.length !== 1 ? "s" : ""} selected
                      </p>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* STEP 2 – AI & Kiosk */}
              {step === 2 && (
                <div className="space-y-4">
                  <SectionCard
                    icon={Cpu}
                    title="AI Case-Taking Quality"
                    description="Evaluate the accuracy and completeness of the AI-generated clinical notes."
                    accent="violet"
                  >
                    <div className="space-y-5">
                      <div>
                        <FieldLabel required>AI Summary Accuracy</FieldLabel>
                        <StarRating
                          id="aiAccuracyRating"
                          label="AI Summary Accuracy"
                          value={form.aiAccuracyRating}
                          onChange={(v) => set("aiAccuracyRating", v)}
                        />
                        <ErrorMsg field="aiAccuracyRating" />
                      </div>

                      <div>
                        <FieldLabel>Items Missed by AI</FieldLabel>
                        <p className="text-[11px] text-slate-400 mb-2">
                          Select any clinical elements that were not captured accurately.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {AI_MISSED_ITEMS.map((item) => (
                            <Chip
                              key={item}
                              label={item}
                              selected={form.aiMissedItems.includes(item)}
                              onClick={() => toggleArrayItem("aiMissedItems", item)}
                            />
                          ))}
                        </div>
                        {form.aiMissedItems.length > 0 && (
                          <p className="mt-2 text-[11px] text-rose-500 font-medium">
                            ⚠ {form.aiMissedItems.length} item{form.aiMissedItems.length !== 1 ? "s" : ""} flagged as missed
                          </p>
                        )}
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={Monitor}
                    title="Kiosk Usability"
                    description="Rate the physical kiosk and patient interaction experience."
                    accent="primary"
                  >
                    <div className="space-y-5">
                      <div>
                        <FieldLabel required>Kiosk Usability Rating</FieldLabel>
                        <StarRating
                          id="kioskUsabilityRating"
                          label="Kiosk Usability"
                          value={form.kioskUsabilityRating}
                          onChange={(v) => set("kioskUsabilityRating", v)}
                        />
                        <ErrorMsg field="kioskUsabilityRating" />
                      </div>

                      <div>
                        <FieldLabel>Kiosk Issues Observed</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                          {KIOSK_ISSUES.map((issue) => (
                            <Chip
                              key={issue}
                              label={issue}
                              selected={form.kioskIssues.includes(issue)}
                              onClick={() => toggleArrayItem("kioskIssues", issue)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* STEP 3 – Notes & Flags */}
              {step === 3 && (
                <div className="space-y-4">
                  <SectionCard
                    icon={FileText}
                    title="Clinical Notes & Observations"
                    description="Add any clinical context or observations from the consultation."
                    accent="primary"
                  >
                    <div className="space-y-4">
                      <div>
                        <FieldLabel htmlFor="clinicalNotes">Clinical Notes</FieldLabel>
                        <textarea
                          id="clinicalNotes"
                          rows={4}
                          placeholder="Enter any clinical observations, discrepancies, or context…"
                          value={form.clinicalNotes}
                          onChange={(e) => set("clinicalNotes", e.target.value)}
                          className={`${inputCls("clinicalNotes")} resize-none`}
                        />
                      </div>

                      <div>
                        <FieldLabel htmlFor="aiSuggestionNotes">Suggestions for AI Improvement</FieldLabel>
                        <textarea
                          id="aiSuggestionNotes"
                          rows={3}
                          placeholder="What could the AI have asked or captured differently?"
                          value={form.aiSuggestionNotes}
                          onChange={(e) => set("aiSuggestionNotes", e.target.value)}
                          className={`${inputCls("aiSuggestionNotes")} resize-none`}
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={Flag}
                    title="Follow-up & Urgency"
                    description="Flag if this patient requires a follow-up and set priority level."
                    accent="rose"
                  >
                    <div className="space-y-4">
                      {/* Follow-up toggle */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Follow-up Required</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Flag this patient for a scheduled follow-up
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={form.followUpRequired}
                          onClick={() => set("followUpRequired", !form.followUpRequired)}
                          className={[
                            "relative w-11 h-6 rounded-full transition-colors duration-200",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                            form.followUpRequired ? "bg-primary-500" : "bg-slate-300 dark:bg-slate-600",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                              form.followUpRequired ? "translate-x-5" : "translate-x-0",
                            ].join(" ")}
                          />
                        </button>
                      </div>

                      {/* Urgency level */}
                      {form.followUpRequired && (
                        <div>
                          <FieldLabel>Urgency Level</FieldLabel>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {[
                              { value: "routine",  label: "Routine" },
                              { value: "soon",     label: "Within 1 week" },
                              { value: "urgent",   label: "Urgent (48h)" },
                              { value: "critical", label: "Critical" },
                            ].map(({ value, label }) => (
                              <Chip
                                key={value}
                                label={label}
                                selected={form.urgencyLevel === value}
                                onClick={() => set("urgencyLevel", value)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <FieldLabel htmlFor="additionalComments">Additional Comments</FieldLabel>
                        <textarea
                          id="additionalComments"
                          rows={3}
                          placeholder="Any other comments or concerns about this visit…"
                          value={form.additionalComments}
                          onChange={(e) => set("additionalComments", e.target.value)}
                          className={`${inputCls("additionalComments")} resize-none`}
                        />
                      </div>
                    </div>
                  </SectionCard>

                  {/* Disclaimer note */}
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                    <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      This feedback is stored for quality improvement and is not part of the patient&apos;s official medical record.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Navigation buttons ── */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/60">
                <div>
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      icon={ChevronLeft}
                      onClick={goPrev}
                    >
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Step {step + 1} of {STEPS.length}
                  </span>
                  {step < STEPS.length - 1 ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      icon={ChevronRight}
                      onClick={goNext}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      icon={Send}
                      loading={loading}
                    >
                      Submit Feedback
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </DoctorShell>
  );
}

export default PatientFeedbackPage;
