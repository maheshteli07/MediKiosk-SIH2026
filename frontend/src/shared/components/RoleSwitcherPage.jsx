/**
 * RoleSwitcherPage.jsx – Root landing page for role selection.
 *
 * Allows switching between Patient Kiosk Mode and Doctor Control Portal Mode.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, ArrowRight, Sparkles, ShieldCheck, Volume2 } from "lucide-react";
import Button from "@/shared/components/Button.jsx";

function RoleSwitcherPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 text-center">
        {/* Header */}
        <div>
          <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-slate tracking-tight mb-2">
            Welcome to MediKiosk
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto">
            AI-Guided Patient Case-Taking & Integrative Clinical Decision Support System.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Patient Kiosk Mode */}
          <div
            onClick={() => navigate("/welcome")}
            className="group relative bg-primary-50/60 hover:bg-primary-50 border-2 border-primary-200 hover:border-primary-500 rounded-3xl p-6 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Volume2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-primary-950 mb-2">
                Patient Kiosk Mode
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
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
            className="group relative bg-slate-50 hover:bg-slate-100/80 border-2 border-slate-200 hover:border-slate-400 rounded-3xl p-6 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-slate text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">
                Doctor Control Portal
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Doctor dashboard, pending case queue, two-pane AI draft verification with raw source evidence, and digital approval sign-off.
              </p>
            </div>

            <Button variant="secondary" size="md" icon={ArrowRight} fullWidth>
              Open Doctor Portal
            </Button>
          </div>
        </div>

        {/* Footnote */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success-600" />
          <span>Standalone Prototype — Allopathy & AYUSH Integrative Platform (SIH2026)</span>
        </div>
      </div>
    </div>
  );
}

export default RoleSwitcherPage;
