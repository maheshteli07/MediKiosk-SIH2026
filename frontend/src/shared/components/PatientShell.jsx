/**
 * PatientShell.jsx – Layout shell for all patient-facing kiosk screens.
 *
 * Design intent:
 *   - Full-bleed background (#F6F7F9), no sidebar, no distracting chrome.
 *   - Centered content column (max-w-2xl) for comfortable tablet reading.
 *   - Large fonts — body text is readable from kiosk distance.
 *   - Slim top bar: logo + LanguageSwitcher only.
 *   - Optional step-progress indicator at the bottom.
 *
 * Props:
 *   children      — page content
 *   step          — current step index (0-based)
 *   totalSteps    — total number of steps
 *   showProgress  — show the step indicator (default false)
 *   centerContent — vertically center the content (default true)
 */

import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.js";
import LanguageSwitcher from "@/shared/components/LanguageSwitcher.jsx";

function PatientShell({
  children,
  step = 0,
  totalSteps,
  showProgress = false,
  centerContent = true,
}) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 bg-white border-b border-slate-100 px-6 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            to={ROUTES.WELCOME}
            className="flex items-center gap-3 group"
            aria-label="MediKiosk home"
          >
            <div className="h-9 w-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm group-hover:bg-primary-700 transition-colors">
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 2C8.5 2 7 3 7 5v3H4a1 1 0 000 2h3v3c0 2 1.5 3 3 3s3-1 3-3v-3h3a1 1 0 000-2h-3V5c0-2-1.5-3-3-3z"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <span className="block text-base font-bold text-primary-900 leading-tight tracking-tight">
                MediKiosk
              </span>
              <span className="block text-xs text-slate-400 leading-none">
                Patient Registration
              </span>
            </div>
          </Link>

          {/* Language switcher */}
          <LanguageSwitcher />
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main
        className={[
          "flex-1 flex flex-col px-4",
          centerContent
            ? "items-center justify-center py-10"
            : "items-center py-10",
        ].join(" ")}
      >
        <div className="w-full max-w-2xl">{children}</div>
      </main>

      {/* ── Step progress ─────────────────────────────────────────────────── */}
      {showProgress && totalSteps && (
        <footer
          className="shrink-0 pb-8 pt-2 flex justify-center items-center gap-2"
          aria-label="Registration progress"
        >
          {Array.from({ length: totalSteps }).map((_, i) => {
            const past    = i < step;
            const current = i === step;
            return (
              <div
                key={i}
                className={[
                  "h-2 rounded-full transition-all duration-300",
                  past    ? "w-6 bg-primary-500"   : "",
                  current ? "w-6 bg-primary-300"   : "",
                  !past && !current ? "w-2 bg-slate-200" : "",
                ].join(" ")}
                aria-hidden="true"
              />
            );
          })}
          {totalSteps > 0 && (
            <span className="sr-only">
              Step {step + 1} of {totalSteps}
            </span>
          )}
        </footer>
      )}
    </div>
  );
}

export default PatientShell;
