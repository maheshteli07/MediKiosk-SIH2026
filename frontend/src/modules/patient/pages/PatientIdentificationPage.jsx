/**
 * PatientIdentificationPage.jsx – Step 3 of Patient Onboarding: ABHA / Phone Identification.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserSearch, ArrowRight, Search, Sparkles, CheckCircle2, UserPlus } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import Input from "@/shared/components/Input.jsx";

function PatientIdentificationPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);

  const handleSearch = () => {
    // Simulate lookup
    setFoundPatient({
      name: "Ramesh Chandra",
      age: 44,
      gender: "Male",
      abhaId: "91-8841-2026-01",
      phone: "+91 98765 43210",
    });
  };

  const handleQuickLoad = () => {
    setIdentifier("91-8841-2026-01");
    setFoundPatient({
      name: "Ramesh Chandra",
      age: 44,
      gender: "Male",
      abhaId: "91-8841-2026-01",
      phone: "+91 98765 43210",
    });
  };

  const handleContinue = () => {
    navigate("/patient/details");
  };

  return (
    <PatientShell showProgress step={3} totalSteps={6} centerContent={false}>
      <div className="max-w-xl mx-auto space-y-6 py-2">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-3 border border-primary-200 shadow-sm">
            <UserSearch className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-slate tracking-tight mb-2">
            Let's find your medical record
          </h1>
          <p className="text-sm text-slate-500">
            Enter your ABHA Number, Mobile Phone, or Aadhaar ID.
          </p>
        </div>

        {/* Identification Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="space-y-3">
            <Input
              label="ABHA ID / Mobile Number / Aadhaar"
              id="patient-id"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 9876543210 or 91-8841-2026"
            />
            <Button variant="primary" size="md" icon={Search} onClick={handleSearch} fullWidth>
              Lookup Patient Profile
            </Button>
          </div>

          {/* Quick Demo Preset Trigger */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-2 font-medium">Quick Demo Preset:</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={handleQuickLoad}
                className="bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-primary-200 transition-colors"
              >
                + Quick Load Ramesh Chandra (ABHA #8841)
              </button>
            </div>
          </div>
        </div>

        {/* Found Patient Result Card */}
        {foundPatient && (
          <div className="bg-success-50 border border-success-200 rounded-3xl p-5 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-600" />
                <h3 className="text-sm font-bold text-success-950">Existing Patient Profile Found</h3>
              </div>
              <span className="text-[10px] font-bold uppercase bg-success-200 text-success-900 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-white p-3 rounded-2xl border border-success-100">
              <div>
                <span className="text-slate-400">Name:</span> <strong className="text-slate-900">{foundPatient.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Age/Sex:</span> <strong className="text-slate-900">{foundPatient.age}y / {foundPatient.gender}</strong>
              </div>
              <div>
                <span className="text-slate-400">ABHA ID:</span> <strong className="text-slate-900">{foundPatient.abhaId}</strong>
              </div>
              <div>
                <span className="text-slate-400">Phone:</span> <strong className="text-slate-900">{foundPatient.phone}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 max-w-sm mx-auto flex gap-3">
          <Button
            variant="primary"
            size="xl"
            icon={ArrowRight}
            onClick={handleContinue}
            fullWidth
          >
            {foundPatient ? "Confirm & Continue" : "New Patient Registration"}
          </Button>
        </div>
      </div>
    </PatientShell>
  );
}

export default PatientIdentificationPage;
