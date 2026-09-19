/**
 * PatientIdentificationPage.jsx – Step 3 of Patient Onboarding: ABHA / Phone Identification.
 *
 * Allows the patient to enter their phone number or ABHA ID to look up an existing record.
 * If found: stores the patient_id and pre-fills basic details, then continues.
 * If not found: navigates directly to /patient/details for new registration.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserSearch, ArrowRight, Search, CheckCircle2, UserPlus } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import Input from "@/shared/components/Input.jsx";
import { identifyPatient } from "@/modules/patient/services/patientService.js";

function PatientIdentificationPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      setSearchError("Please enter your phone number or ABHA ID.");
      return;
    }

    setSearchError("");
    setNotFound(false);
    setFoundPatient(null);
    setIsSearching(true);

    try {
      const res = await identifyPatient(trimmed);
      const patient = res.data;

      if (patient?.id) {
        setFoundPatient(patient);
        // Persist the known patient ID so BasicDetailsPage can skip re-registration
        localStorage.setItem("medikiosk_patient_id", patient.id);
        localStorage.setItem("medikiosk_patient", JSON.stringify(patient));
      } else {
        setNotFound(true);
      }
    } catch (err) {
      // 404 means patient not found — treat as new patient
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        const message =
          err.response?.data?.error?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Lookup failed. Please retry.";
        setSearchError(typeof message === "string" ? message : "Search error.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleContinue = () => {
    navigate("/patient/details");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <PatientShell showProgress step={3} totalSteps={7} centerContent={false}>
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
            Enter your Mobile Number or ABHA ID (14 digits) to check for an existing profile.
          </p>
        </div>

        {/* Identification Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="space-y-3">
            <Input
              label="Mobile Number or ABHA ID"
              id="patient-id"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setSearchError("");
                setNotFound(false);
                setFoundPatient(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 9876543210 or 12345678901234"
            />
            {searchError && (
              <p className="text-xs text-danger-600 font-medium">{searchError}</p>
            )}
            <Button
              variant="primary"
              size="md"
              icon={Search}
              onClick={handleSearch}
              loading={isSearching}
              fullWidth
            >
              Search Patient Profile
            </Button>
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
                <span className="text-slate-400">Name:</span>{" "}
                <strong className="text-slate-900">{foundPatient.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Age/Sex:</span>{" "}
                <strong className="text-slate-900">
                  {foundPatient.age}y / {foundPatient.gender}
                </strong>
              </div>
              {foundPatient.abha_id && (
                <div>
                  <span className="text-slate-400">ABHA ID:</span>{" "}
                  <strong className="text-slate-900">{foundPatient.abha_id}</strong>
                </div>
              )}
              <div>
                <span className="text-slate-400">Phone:</span>{" "}
                <strong className="text-slate-900">{foundPatient.phone}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Not Found Banner */}
        {notFound && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">No Existing Record Found</h3>
            </div>
            <p className="text-xs text-amber-800">
              We couldn't find a profile with that number. You'll be registered as a new patient on the next step.
            </p>
          </div>
        )}

        {/* Action Button — only shown after a search result */}
        {(foundPatient || notFound) && (
          <div className="pt-2 max-w-sm mx-auto">
            <Button
              variant="primary"
              size="xl"
              icon={ArrowRight}
              onClick={handleContinue}
              fullWidth
            >
              {foundPatient ? "Confirm & Continue" : "Register as New Patient"}
            </Button>
          </div>
        )}

        {/* Skip option — new patient who doesn't want to search */}
        {!foundPatient && !notFound && (
          <div className="pt-1 max-w-sm mx-auto text-center">
            <button
              onClick={handleContinue}
              className="text-xs text-slate-400 hover:text-primary-600 underline underline-offset-2 transition-colors"
            >
              Skip — I'm a new patient
            </button>
          </div>
        )}
      </div>
    </PatientShell>
  );
}

export default PatientIdentificationPage;
