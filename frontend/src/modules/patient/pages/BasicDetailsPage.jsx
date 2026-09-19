/**
 * BasicDetailsPage.jsx – Step 4 of Patient Onboarding: Basic Demographic Form.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ArrowRight, User, Phone, Calendar, Heart } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";
import Input from "@/shared/components/Input.jsx";

function BasicDetailsPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "Ramesh Chandra",
    age: "44",
    gender: "Male",
    phone: "9876543210",
    emergencyContact: "9876500000",
    bloodGroup: "B+",
  });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleContinue = () => {
    navigate("/patient/mode");
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
            Tell us a little about yourself
          </h1>
          <p className="text-sm text-slate-500">
            Confirm your demographic details for your medical file.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
          <Input
            label="Full Name"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age (Years)"
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => handleChange("age", e.target.value)}
              required
            />

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Gender</label>
              <div className="flex gap-2">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleChange("gender", g)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      formData.gender === g
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
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
              required
            />

            <Input
              label="Blood Group"
              id="bloodGroup"
              value={formData.bloodGroup}
              onChange={(e) => handleChange("bloodGroup", e.target.value)}
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
            fullWidth
          >
            Save & Choose Consultation Mode
          </Button>
        </div>
      </div>
    </PatientShell>
  );
}

export default BasicDetailsPage;
