/**
 * PostVisitFeedbackPage.jsx – Post-Visit Patient Feedback Screen.
 *
 * Rendered for the patient after consultation / case approval.
 * Features:
 *   - "How was your visit?" headline
 *   - Interactive 1–5 star rating with descriptive labels
 *   - Optional quick-touch feedback tags
 *   - Optional free-text comments
 *   - Submit and Thank You confirmation states
 *   - Automatic redirect countdown to Kiosk Welcome screen
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Star, Heart, CheckCircle2, MessageSquare, ArrowRight, Home, Sparkles } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import { ROUTES } from "@/shared/constants/routes.js";
import { feedbackService } from "@/services/feedbackService.js";

const QUICK_TAGS = [
  "Friendly Doctor",
  "Quick Intake",
  "Clear Prescription",
  "Helpful AI",
  "Clean & Safe",
];

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

function PostVisitFeedbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const caseId = searchParams.get("caseId") || "c1";
  const patientId = searchParams.get("patientId") || "P-2026-8841";
  const patientName = searchParams.get("patientName") || "Patient";

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const fullComment = [
      selectedTags.length > 0 ? `[${selectedTags.join(", ")}]` : "",
      comment.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    feedbackService.submitFeedback({
      caseId,
      patientId,
      patientName,
      rating: rating || 5,
      comment: fullComment,
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  // Countdown timer on Thank You screen
  useEffect(() => {
    if (!isSubmitted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(ROUTES.WELCOME);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, navigate]);

  // ── Thank You Screen ───────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <PatientShell centerContent>
        <div className="flex flex-col items-center text-center gap-6 py-6 max-w-lg mx-auto animate-fade-in">
          {/* Animated Success Badge */}
          <div className="h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg transition-transform scale-100">
            <CheckCircle2 size={56} strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Sparkles size={13} /> Feedback Recorded
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
              Thank You, {patientName}!
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Your feedback has been saved and shared with your clinical care team. It helps us continuously improve the MediKiosk experience for everyone.
            </p>
          </div>

          {/* Rating Receipt Card */}
          <div className="w-full bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700/70 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your Rating</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {RATING_LABELS[rating] || "Excellent"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200 dark:text-slate-700"
                  }
                />
              ))}
            </div>
          </div>

          {/* Auto redirect notice & manual button */}
          <div className="space-y-3 w-full pt-2">
            <Button
              size="lg"
              variant="primary"
              fullWidth
              icon={Home}
              onClick={() => navigate(ROUTES.WELCOME)}
            >
              Return to Home Screen
            </Button>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Redirecting to welcome screen in <span className="font-bold text-slate-600 dark:text-slate-300">{countdown}s</span>...
            </p>
          </div>
        </div>
      </PatientShell>
    );
  }

  // ── "How was your visit?" Rating & Feedback Screen ─────────────────────────
  const activeRating = hoverRating || rating;

  return (
    <PatientShell centerContent>
      <div className="w-full max-w-xl mx-auto py-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-1 shadow-sm">
            <Heart size={28} className="fill-primary-500 text-primary-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            How was your visit?
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Please take a moment to rate your consultation with your doctor today.
          </p>
          {patientName && (
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-400">
              Patient: {patientName} ({patientId})
            </p>
          )}
        </div>

        {/* Interactive Feedback Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1e2535] rounded-3xl border border-slate-200 dark:border-slate-700/70 shadow-sm p-6 sm:p-8 space-y-6"
        >
          {/* Star Rating Section */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Overall Experience
            </label>

            <div
              className="flex items-center justify-center gap-2 sm:gap-3 py-2"
              role="radiogroup"
              aria-label="Visit satisfaction star rating"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  id={`patient-star-${star}`}
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} star: ${RATING_LABELS[star]}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 sm:p-2 rounded-2xl transition-all duration-150 hover:scale-115 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
                >
                  <Star
                    size={38}
                    className={`transition-colors duration-150 ${
                      activeRating >= star
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : "fill-none text-slate-300 dark:text-slate-600 hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Dynamic Rating Label */}
            <div className="h-6">
              <span className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 transition-opacity duration-150">
                {RATING_LABELS[activeRating]}
              </span>
            </div>
          </div>

          {/* Quick Tags Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              What went well? (Optional)
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                        : "bg-slate-50 dark:bg-[#141822] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-400"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Field */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <label
              htmlFor="patient-comment"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <MessageSquare size={14} className="text-slate-400" />
              Additional Comments (Optional)
            </label>
            <textarea
              id="patient-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience or anything the clinic can improve..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#0f1117] transition-all resize-none"
              maxLength={500}
            />
            <div className="flex justify-end text-[11px] text-slate-400">
              {comment.length} / 500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              fullWidth
              loading={isSubmitting}
              icon={ArrowRight}
            >
              Submit Feedback
            </Button>
            <Button
              type="button"
              size="lg"
              variant="ghost"
              fullWidth
              onClick={() => handleSubmit()}
            >
              Skip & Finish
            </Button>
          </div>
        </form>
      </div>
    </PatientShell>
  );
}

export default PostVisitFeedbackPage;
