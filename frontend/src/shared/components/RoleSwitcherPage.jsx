/**
 * RoleSwitcherPage.jsx – Root landing page for role selection.
 *
 * Allows switching between Patient Kiosk Mode and Doctor Control Portal Mode.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, ArrowRight, Sparkles, ShieldCheck, Volume2, LogIn, Sun, Moon } from "lucide-react";
import Button from "@/shared/components/Button.jsx";
import { useTheme } from "@/App.jsx";

function RoleSwitcherPage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-[#0f1117] flex flex-col items-center justify-center p-4 relative transition-colors duration-200">
      {/* Top Bar: Sign In + Theme Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggle}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm transition-all"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Sign In */}
        <button
          onClick={() => navigate("/signin")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-sm transition-all text-xs font-semibold"
        >
          <LogIn className="w-4 h-4 text-emerald-600" />
          <span>Sign In</span>
        </button>
      </div>

      <div className="max-w-3xl w-full bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-2xl space-y-8 text-center">
        {/* Header */}
        <div>
          <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-slate dark:text-slate-100 tracking-tight mb-2">
            Welcome to MediKiosk
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            AI-Guided Patient Case-Taking &amp; Integrative Clinical Decision Support System.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Patient Kiosk Mode */}
          <div
            onClick={() => navigate("/welcome")}
            className="group relative bg-primary-50/60 dark:bg-primary-900/20 hover:bg-primary-50 dark:hover:bg-primary-900/30 border-2 border-primary-200 dark:border-primary-800/60 hover:border-primary-500 rounded-3xl p-6 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Volume2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-primary-950 dark:text-primary-200 mb-2">
                Patient Kiosk Mode
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Multilingual AI voice intake, prescription document scanner, and symptom questionnaire designed for patient touchscreen kiosks.
              </p>
            </div>

            <Button variant="primary" size="md" icon={ArrowRight} fullWidth>
              Launch Patient Kiosk
            </Button>
          </div>

          {/* Card 2: Doctor Control Portal */}
          <div
            onClick={() => navigate("/doctor/dashboard")}
            className="group relative bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-3xl p-6 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-slate dark:bg-slate-700 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                Doctor Control Portal
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Doctor dashboard, pending case queue, two-pane AI draft verification with raw source evidence, and digital approval sign-off.
              </p>
            </div>

            <Button variant="secondary" size="md" icon={ArrowRight} fullWidth>
              Open Doctor Portal
            </Button>
          </div>
        </div>

        {/* Footnote */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success-600" />
          <span>Standalone Prototype — Allopathy &amp; AYUSH Integrative Platform (SIH2026)</span>
        </div>
      </div>
    </div>
  );
}

export default RoleSwitcherPage;
