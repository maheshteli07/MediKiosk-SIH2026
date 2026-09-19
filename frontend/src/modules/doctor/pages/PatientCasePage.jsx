/**
 * PatientCasePage.jsx – Doctor Cases Management Screen & Patient Case File.
 *
 * Provides a clinical overview of all patient cases with:
 *   - Summary metric cards (All Cases, Needs Check, Awaiting Review, Approved)
 *   - Real-time search across patient name, ID, and complaints
 *   - Status and recency filtering
 *   - Detailed case rows with badges, wait times, document indicators
 *   - Seamless handoff to existing case review flow (/doctor/summary/:summaryId)
 */

import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileSearch,
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  Search,
  X,
  FileText,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Activity,
} from "lucide-react";

import DoctorShell from "@/shared/components/DoctorShell.jsx";
import Button from "@/shared/components/Button.jsx";
import Badge from "@/shared/components/Badge.jsx";
import Tabs from "@/shared/components/Tabs.jsx";
import EmptyState from "@/shared/components/EmptyState.jsx";
import CaseReviewPane from "../components/CaseReviewPane.jsx";

import { ROUTES } from "@/shared/constants/routes.js";
import { MOCK_DOCTOR_QUEUE } from "@/shared/data/mockDoctorQueueData.js";

function PatientCasePage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  // If a specific patientId is in URL, render the individual case review flow
  const singleCase = useMemo(() => {
    if (!patientId) return null;
    return (
      MOCK_DOCTOR_QUEUE.find(
        (c) => c.patientId === patientId || c.id === patientId
      ) || MOCK_DOCTOR_QUEUE[0]
    );
  }, [patientId]);

  // State for Cases list view
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent"); // "recent" | "longest_wait"

  // Counts for summary cards
  const allCount = MOCK_DOCTOR_QUEUE.length;
  const needsCheckCount = MOCK_DOCTOR_QUEUE.filter(
    (c) => c.status === "needs_check"
  ).length;
  const draftCount = MOCK_DOCTOR_QUEUE.filter((c) => c.status === "draft").length;
  const approvedCount = MOCK_DOCTOR_QUEUE.filter(
    (c) => c.status === "doctor_approved"
  ).length;

  const filterTabs = [
    { id: "all", label: `All (${allCount})` },
    { id: "needs_check", label: `Needs Check (${needsCheckCount})` },
    { id: "draft", label: `Awaiting Review (${draftCount})` },
    { id: "doctor_approved", label: `Approved (${approvedCount})` },
  ];

  // Helper to extract wait minutes for sorting
  const getMinutes = (timeStr) => {
    const match = (timeStr || "").match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Filtered & Sorted Cases
  const filteredCases = useMemo(() => {
    return MOCK_DOCTOR_QUEUE.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = item.patientName?.toLowerCase().includes(query);
        const matchesId =
          item.patientId?.toLowerCase().includes(query) ||
          item.id?.toLowerCase().includes(query);
        const matchesComplaint = item.chiefComplaint
          ?.toLowerCase()
          .includes(query);
        if (!matchesName && !matchesId && !matchesComplaint) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const minA = getMinutes(a.waitTime);
      const minB = getMinutes(b.waitTime);
      if (sortOrder === "longest_wait") {
        return minB - minA;
      }
      return minA - minB;
    });
  }, [searchQuery, statusFilter, sortOrder]);

  const handleSelectCase = (selectedCase) => {
    // Reuse the existing patient review flow
    navigate(`/doctor/summary/${selectedCase.id}`);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortOrder("recent");
  };

  // ── Individual Case File View (Fallback if /doctor/patient/:patientId is accessed) ──
  if (singleCase) {
    return (
      <DoctorShell
        title={`Patient File — ${singleCase.patientName}`}
        subtitle={`ID: ${singleCase.patientId} • ${singleCase.age}y / ${singleCase.gender} • Blood Group: ${singleCase.bloodGroup}`}
        breadcrumb="Doctor Portal / Cases / Patient File"
      >
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
          <div className="flex items-center justify-between bg-white dark:bg-[#1e2535] p-4 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate(ROUTES.DOCTOR_CASES)}
            >
              Back to Cases
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate(`/doctor/summary/${singleCase.id}`)}
              >
                Open Verification Review
              </Button>
            </div>
          </div>

          <CaseReviewPane caseData={singleCase} />
        </div>
      </DoctorShell>
    );
  }

  // ── Main Cases Management Screen (/doctor/cases) ─────────────────────────
  return (
    <DoctorShell
      title="Cases"
      subtitle="Review and manage patient clinical cases, verify AI drafts, and track sign-off status."
      breadcrumb="Doctor Portal / Cases"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* ── 1. Summary Cards Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: All Cases */}
          <div
            onClick={() => setStatusFilter("all")}
            className={`bg-white dark:bg-[#1e2535] rounded-3xl p-5 shadow-sm border transition-all cursor-pointer flex items-center justify-between group hover:shadow-md ${statusFilter === "all"
                ? "border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/20 dark:bg-primary-900/10"
                : "border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                All Cases
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {allCount}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Total intake records
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileSearch className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Needs Check */}
          <div
            onClick={() => setStatusFilter("needs_check")}
            className={`bg-white dark:bg-[#1e2535] rounded-3xl p-5 shadow-sm border transition-all cursor-pointer flex items-center justify-between group hover:shadow-md ${statusFilter === "needs_check"
                ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-900/10"
                : "border-amber-200 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700/60"
              }`}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Needs Check
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {needsCheckCount}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Doctor check required
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Awaiting Review */}
          <div
            onClick={() => setStatusFilter("draft")}
            className={`bg-white dark:bg-[#1e2535] rounded-3xl p-5 shadow-sm border transition-all cursor-pointer flex items-center justify-between group hover:shadow-md ${statusFilter === "draft"
                ? "border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20 dark:bg-sky-900/10"
                : "border-sky-200 dark:border-sky-900/50 hover:border-sky-300 dark:hover:border-sky-700/60"
              }`}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Awaiting Review
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {draftCount}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Intake drafts ready
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Approved */}
          <div
            onClick={() => setStatusFilter("doctor_approved")}
            className={`bg-white dark:bg-[#1e2535] rounded-3xl p-5 shadow-sm border transition-all cursor-pointer flex items-center justify-between group hover:shadow-md ${statusFilter === "doctor_approved"
                ? "border-success-500 ring-2 ring-success-500/20 bg-success-50/20 dark:bg-emerald-900/10"
                : "border-success-200 dark:border-emerald-900/50 hover:border-success-300 dark:hover:border-emerald-700/60"
              }`}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-success-700 dark:text-emerald-400">
                Approved
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {approvedCount}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Signed off &amp; locked
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-success-100 dark:bg-emerald-900/30 text-success-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ── 2. Search and Filter Bar ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name, case ID, symptoms..."
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0f1117] text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & Action Controls */}
            <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="recent">Recent First</option>
                  <option value="longest_wait">Longest Wait First</option>
                </select>
              </div>

              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>

          {/* Status Tabs Filter */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between overflow-x-auto">
            <Tabs
              tabs={filterTabs}
              activeTab={statusFilter}
              onChange={setStatusFilter}
              variant="pill"
            />

            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:block">
              Showing {filteredCases.length} of {allCount} cases
            </span>
          </div>
        </div>

        {/* ── 3. Case List / Table ──────────────────────────────────────────── */}
        <div className="space-y-3">
          {filteredCases.length === 0 ? (
            <div className="bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-8 shadow-sm">
              <EmptyState
                icon={FileSearch}
                heading="No cases found"
                subtext="No clinical cases match your active search terms or status filters."
                action="Clear Filters"
                onAction={handleClearFilters}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredCases.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCase(item)}
                    className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Left Column: Patient Info & Chief Complaint */}
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Name, Demographic, ID Row */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {item.patientName.charAt(0)}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                            {item.patientName}
                          </h4>
                        </div>

                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                          {item.age}y / {item.gender}
                        </span>

                        <span className="text-xs font-mono font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/40 px-2 py-0.5 rounded-md">
                          {item.patientId}
                        </span>

                        {item.bloodGroup && (
                          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700/40 px-2 py-0.5 rounded-md">
                            {item.bloodGroup}
                          </span>
                        )}
                      </div>

                      {/* Chief Complaint / Symptoms */}
                      <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed max-w-3xl">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">Complaint: </span>
                        {item.chiefComplaint}
                      </p>

                      {/* Extracted Symptoms pills if available */}
                      {item.summaryDraft?.symptoms && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.summaryDraft.symptoms.slice(0, 3).map((sym, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              <Activity className="w-3 h-3 text-primary-500" />
                              {sym.name}
                            </span>
                          ))}
                          {item.summaryDraft.symptoms.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              +{item.summaryDraft.symptoms.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Badges, Time, and Open Arrow */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700/60">
                      {/* Status Badges & Docs Indicator */}
                      <div className="flex items-center gap-2">
                        {item.status === "doctor_approved" && (
                          <Badge variant="doctor-approved" size="sm">
                            Approved
                          </Badge>
                        )}
                        {item.status === "needs_check" && (
                          <Badge variant="needs-check" size="sm">
                            Needs Check
                          </Badge>
                        )}
                        {item.status === "draft" && (
                          <Badge variant="draft" size="sm">
                            Awaiting Review
                          </Badge>
                        )}

                        {item.hasUploadedDocs && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3 text-primary-600" />
                            Docs attached
                          </span>
                        )}
                      </div>

                      {/* Wait Time */}
                      <div className="text-right hidden sm:block min-w-[70px]">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {item.waitTime}
                        </span>
                      </div>

                      {/* Open Case Action */}
                      <div className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 group-hover:translate-x-0.5 transition-all">
                        <span className="hidden sm:inline">Open Case</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DoctorShell>
  );
}

export default PatientCasePage;
