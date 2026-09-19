/**
 * WelcomePage.jsx – Kiosk landing screen.
 *
 * First thing a patient sees. Designed for large-screen kiosk / tablet:
 *   - Full-bleed hero with teal gradient header band
 *   - Large, accessible headline
 *   - Single primary CTA to start the flow
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import { ROUTES } from "@/shared/constants/routes.js";

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <PatientShell centerContent>
      <div className="flex flex-col items-center text-center gap-8 py-4">
        {/* Icon mark */}
        <div className="h-24 w-24 rounded-3xl bg-primary-500 flex items-center justify-center shadow-lg">
          <Heart size={44} className="text-white" strokeWidth={1.5} fill="white" />
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-primary-900 leading-tight tracking-tight">
            Welcome to<br />MediKiosk
          </h1>
          <p className="text-xl text-slate-500 max-w-md leading-relaxed">
            Register your visit in minutes — no paperwork, no queues.
          </p>
        </div>

        {/* CTA */}
        <Button
          size="xl"
          onClick={() => navigate(ROUTES.LANGUAGE)}
          className="mt-2 gap-3 pr-6"
        >
          Get Started
          <ArrowRight size={22} />
        </Button>

        {/* Doctor link */}
        <p className="text-sm text-slate-400 mt-2">
          Are you a doctor?{" "}
          <button
            onClick={() => navigate(ROUTES.DOCTOR_LOGIN)}
            className="text-primary-500 font-medium hover:underline"
          >
            Sign in to the doctor portal
          </button>
        </p>
      </div>
    </PatientShell>
  );
}

export default WelcomePage;
