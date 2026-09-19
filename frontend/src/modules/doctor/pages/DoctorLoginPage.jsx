/**
 * DoctorLoginPage.jsx – Interactive doctor authentication screen.
 */

import React, { useState } from "react";
import { Stethoscope, LockKeyhole, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/shared/components/Button.jsx";
import Input from "@/shared/components/Input.jsx";
import { ROUTES } from "@/shared/constants/routes.js";

function DoctorLoginPage() {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState("dr.ankit@medikiosk.in");
  const [password, setPassword] = useState("doctor123");

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("medikiosk_token", "mock-jwt-token-dr-ankit");
    navigate(ROUTES.DOCTOR_DASHBOARD);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ───────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-10"
        style={{ backgroundColor: "#0E6B67" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Stethoscope size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            MediKiosk
          </span>
        </div>

        {/* Tagline */}
        <div>
          <p className="text-white/50 text-sm font-medium uppercase tracking-widest mb-3">
            Doctor Control Portal
          </p>
          <h1 className="text-3xl font-bold text-white leading-snug">
            Patient data,<br />at your fingertips.
          </h1>
          <p className="mt-3 text-white/65 text-base leading-relaxed">
            Review AI-assisted case summaries, AYUSH histories, and lab
            results — before the patient walks in.
          </p>
        </div>

        <p className="text-white/30 text-xs">SIH 2026 · MediKiosk Team</p>
      </div>

      {/* ── Right login panel ──────────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ backgroundColor: "#F6F7F9" }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-xl bg-primary-500 flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="font-bold text-primary-900 text-base">MediKiosk</span>
          </div>

          <div className="mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-5">
              <LockKeyhole size={22} className="text-primary-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Sign in to Portal</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter physician credentials to review pending kiosk cases.
            </p>
          </div>

          {/* Interactive Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <Input
              label="Doctor ID or Email"
              id="doc-id"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
            />
            <Input
              label="Password"
              id="doc-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              icon={ArrowRight}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => navigate(ROUTES.WELCOME)}
              className="w-full text-xs text-slate-500 hover:text-primary-600 transition-colors text-center"
            >
              ← Back to Patient Kiosk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorLoginPage;
