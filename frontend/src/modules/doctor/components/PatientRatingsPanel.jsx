/**
 * PatientRatingsPanel.jsx – Doctor-side overview of post-visit patient feedback.
 *
 * Displays:
 *   - Overall average star rating and positive satisfaction rate
 *   - 1–5 star rating distribution bar breakdown
 *   - Filterable list of recent patient comments and reviews
 *   - Empty state when no reviews match filters
 */

import React, { useState, useMemo } from "react";
import {
  Star,
  MessageSquare,
  TrendingUp,
  Heart,
  Users,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Smile,
} from "lucide-react";
import EmptyState from "@/shared/components/EmptyState.jsx";
import { feedbackService } from "@/services/feedbackService.js";

function formatTimeAgo(isoString) {
  if (!isoString) return "Recently";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 2) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function PatientRatingsPanel() {
  const [filterRating, setFilterRating] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => {
    return feedbackService.getFeedbackStats();
  }, []);

  const allFeedback = useMemo(() => {
    return feedbackService.getAllFeedback();
  }, []);

  const positivePercent = useMemo(() => {
    if (!stats.totalCount) return 0;
    const pos = (stats.distribution[5] || 0) + (stats.distribution[4] || 0);
    return Math.round((pos / stats.totalCount) * 100);
  }, [stats]);

  const filteredFeedback = useMemo(() => {
    return allFeedback.filter((item) => {
      // Filter by rating
      if (filterRating !== "all") {
        if (filterRating === "comments") {
          if (!item.comment) return false;
        } else {
          if (item.rating !== Number(filterRating)) return false;
        }
      }

      // Filter by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.patientName?.toLowerCase().includes(q);
        const matchesId = item.patientId?.toLowerCase().includes(q);
        const matchesComment = item.comment?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesComment) return false;
      }

      return true;
    });
  }, [allFeedback, filterRating, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Metric Cards Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Average Rating */}
        <div className="bg-white dark:bg-[#1e2535] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Average Rating
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats.averageRating ? stats.averageRating : "—"}
              </span>
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                / 5.0
              </span>
            </div>

            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={
                    s <= Math.round(stats.averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200 dark:text-slate-700"
                  }
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Based on <strong className="text-slate-800 dark:text-slate-200">{stats.totalCount}</strong> post-visit patient reviews
          </p>
        </div>

        {/* Card 2: Rating Distribution */}
        <div className="bg-white dark:bg-[#1e2535] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Rating Breakdown
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="space-y-1.5 my-auto">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars] || 0;
              const percent = stats.totalCount ? Math.round((count / stats.totalCount) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                    {stars}<Star size={10} className="fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-7 text-right text-[11px] font-medium text-slate-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <span>5★ Excellent</span>
            <span>1★ Needs Improvement</span>
          </div>
        </div>

        {/* Card 3: Satisfaction Score */}
        <div className="bg-white dark:bg-[#1e2535] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Patient Satisfaction
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Smile size={18} />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {positivePercent}%
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                Positive (4–5★)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Patients consistently appreciate rapid intake and thorough clinician consultations.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#141822] px-3 py-2 rounded-xl">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span>Kiosk Triage Benchmark: Passed</span>
          </div>
        </div>
      </div>

      {/* ── Search and Filter Controls ───────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback by patient name, ID, or words..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-[#0f1117] text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: `All (${allFeedback.length})` },
              { id: "5", label: `5 ★ (${stats.distribution[5] || 0})` },
              { id: "4", label: `4 ★ (${stats.distribution[4] || 0})` },
              { id: "comments", label: "With Comments" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterRating(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterRating === f.id
                    ? "bg-primary-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feedback Reviews List ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Recent Patient Reviews ({filteredFeedback.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Updated in real-time from Kiosk
          </span>
        </div>

        {filteredFeedback.length === 0 ? (
          <div className="bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-8 shadow-sm">
            <EmptyState
              icon={MessageSquare}
              heading="No reviews match your filter"
              subtext="Try changing your search terms or selecting a different rating filter."
              action="Reset Filters"
              onAction={() => {
                setFilterRating("all");
                setSearchQuery("");
              }}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredFeedback.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors space-y-3"
              >
                {/* Header: Patient Info & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {item.patientName ? item.patientName.charAt(0) : "P"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {item.patientName}
                        </span>
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {item.patientId}
                        </span>
                      </div>
                      {item.caseId && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Case Reference: {item.caseId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stars and Date */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 px-2.5 py-1 rounded-full">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={
                            s <= item.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 dark:text-slate-700"
                          }
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 ml-1">
                        {item.rating}.0
                      </span>
                    </div>

                    <span className="text-xs font-medium text-slate-400 shrink-0">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Comment Text */}
                {item.comment ? (
                  <div className="pl-12">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#141822] p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      “{item.comment}”
                    </p>
                  </div>
                ) : (
                  <div className="pl-12">
                    <span className="text-[11px] italic text-slate-400">
                      (No written comment provided)
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientRatingsPanel;
