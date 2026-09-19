/**
 * BasicDetailsPage.jsx – Step 4 of Patient Onboarding: Basic Demographic Form.
 *
 * If an existing patient was found in the previous step, their stored data
 * pre-fills the form (from localStorage). Otherwise the form starts blank.
 *
 * On "Save & Choose Consultation Mode":
 *  - If existing patient: skip registration, just navigate forward.
 *  - If new patient: calls POST /api/patients/ to create the record,
 *    saves the returned patient_id + access_token, then navigates to /patient/mode.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ArrowRight } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import Input from "@/shared/components/Input.jsx";
import { createPatient } from "@/modules/patient/services/patientService.js";

function BasicDetailsPage() {
  const navigate = useNavigate();

  // Pre-fill from existing patient stored during identification step
  const existingPatient = (() => {
    try {
      const raw = localStorage.getItem("medikiosk_patient");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const isExisting = Boolean(existingPatient?.id);

  const [formData, setFormData] = useState({
    fullName: existingPatient?.full_name || "",
    age: existingPatient?.age != null ? String(existingPatient.age) : "",
    gender: existingPatient?.gender
      ? existingPatient.gender.charAt(0).toUpperCase() + existingPatient.gender.slice(1)
      : "Male",
    phone: existingPatient?.phone?.replace("+91", "") || "",
    bloodGroup: "",
  });

  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleContinue = async () => {
    // Basic client-side validation
    if (!formData.fullName.trim()) {
      setSaveError("Full name is required.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setSaveError("A valid 10-digit mobile number is required.");
      return;
    }
    if (!formData.age || isNaN(Number(formData.age))) {
      setSaveError("A valid age is required.");
      return;
    }

    // If patient already exists from the identification step, skip re-registration
    if (isExisting) {
      navigate("/patient/mode");
      return;
    }

    setSaveError("");
    setIsSaving(true);

    try {
      const lang = localStorage.getItem("medikiosk_patient_lang") || "en";

      // POST /api/patients/ — backend returns { success, data: { patient, access_token }, ... }
      const res = await createPatient({
        full_name: formData.fullName.trim(),
        age: Number(formData.age),
        gender: formData.gender.toLowerCase(),
        phone: formData.phone.trim(),
        preferred_language: lang,
      });

      // Axios unwraps the HTTP response body into response.data,
      // so `res` here is already the backend JSON body: { success, data, error, meta }
      const patient = res.data?.patient;

      if (!res.success || !patient?.id) {
        throw new Error(res.error?.message || "The patient record could not be saved.");
      }

      localStorage.setItem("medikiosk_patient_id", patient.id);
      localStorage.setItem("medikiosk_patient", JSON.stringify(patient));

      if (res.data.access_token) {
        localStorage.setItem("medikiosk_token", res.data.access_token);
      }

      navigate("/patient/mode");
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Unable to save the patient record. Please retry.";
      setSaveError(typeof message === "string" ? message : "Please check the entered details and retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PatientShell showProgress step={4} totalSteps={6} centerContent={false}>
      <div className="max-w-xl mx-auto space-y-6 py-2">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-3 border border-primary-200 shadow-sm">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-slate tracking-tight mb-2">
            {isExisting ? "Confirm Your Details" : "Tell us a little about yourself"}
          </h1>
          <p className="text-sm text-slate-500">
            {isExisting
              ? "Your existing profile details are shown below. Continue when ready."
              : "Enter your demographic details to create your medical file."}
          </p>
        </div>

        {/* Existing patient notice */}
        {isExisting && (
          <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800 font-medium">
            ✓ Existing patient profile loaded — no re-registration needed.
          </div>
        )}

        {/* Error Banner */}
        {saveError && (
          <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {saveError}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
          <Input
            label="Full Name"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="e.g. Priya Sharma"
            required
            disabled={isExisting}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age (Years)"
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => handleChange("age", e.target.value)}
              placeholder="e.g. 32"
              required
              disabled={isExisting}
            />

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Gender</label>
              <div className="flex gap-2">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    disabled={isExisting}
                    onClick={() => handleChange("gender", g)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      formData.gender === g
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                    } ${isExisting ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mobile Phone"
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="e.g. 9876543210"
              required
              disabled={isExisting}
            />

            <Input
              label="Blood Group (optional)"
              id="bloodGroup"
              value={formData.bloodGroup}
              onChange={(e) => handleChange("bloodGroup", e.target.value)}
              placeholder="e.g. B+"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 max-w-sm mx-auto">
          <Button
            variant="primary"
            size="xl"
            icon={ArrowRight}
            onClick={handleContinue}
            loading={isSaving}
            fullWidth
          >
            {isExisting ? "Continue" : "Save & Choose Consultation Mode"}
          </Button>
        </div>
      </div>
    </PatientShell>
  );
}

export default BasicDetailsPage;
