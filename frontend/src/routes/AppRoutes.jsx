import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.js";

// ---- Patient Module Pages ----
import WelcomePage from "@/modules/patient/pages/WelcomePage.jsx";
import LanguagePage from "@/modules/patient/pages/LanguagePage.jsx";
import ConsentPage from "@/modules/patient/pages/ConsentPage.jsx";
import PatientIdentificationPage from "@/modules/patient/pages/PatientIdentificationPage.jsx";
import BasicDetailsPage from "@/modules/patient/pages/BasicDetailsPage.jsx";
import ConsultationModePage from "@/modules/patient/pages/ConsultationModePage.jsx";
import PostVisitFeedbackPage from "@/modules/patient/pages/PostVisitFeedbackPage.jsx";

// ---- Conversation Module Pages ----
import ConversationPage from "@/modules/conversation/pages/ConversationPage.jsx";

// ---- Documents Module Pages ----
import DocumentUploadPage from "@/modules/documents/pages/DocumentUploadPage.jsx";

// ---- AYUSH Module Pages ----
import AyushHistoryPage from "@/modules/ayush/pages/AyushHistoryPage.jsx";

// ---- Clinical Module Pages ----
import ClinicalHistoryPage from "@/modules/clinical/pages/ClinicalHistoryPage.jsx";
import ClinicalTimelinePage from "@/modules/clinical/pages/ClinicalTimelinePage.jsx";
import ClinicalSummaryPage from "@/modules/clinical/pages/ClinicalSummaryPage.jsx";

// ---- Auth Module Pages ----
import SignInPage from "@/modules/auth/pages/SignInPage.jsx";

// ---- Doctor Module Pages ----
import DoctorDashboardPage from "@/modules/doctor/pages/DoctorDashboardPage.jsx";
import PatientQueuePage from "@/modules/doctor/pages/PatientQueuePage.jsx";
import PatientCasePage from "@/modules/doctor/pages/PatientCasePage.jsx";
import SummaryReviewPage from "@/modules/doctor/pages/SummaryReviewPage.jsx";
import VerificationPage from "@/modules/doctor/pages/VerificationPage.jsx";
import PatientFeedbackPage from "@/modules/doctor/pages/PatientFeedbackPage.jsx";

/**
 * AppRoutes.jsx
 *
 * Central route registry for MediKiosk.
 * Add new routes here as modules are developed.
 * Do NOT put page components or business logic in this file.
 */
import RoleSwitcherPage from "@/shared/components/RoleSwitcherPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      {/* Role Selection Landing */}
      <Route path="/" element={<RoleSwitcherPage />} />

      {/* Auth */}
      <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
      <Route path={ROUTES.LOGIN} element={<SignInPage />} />

      {/* Patient Flow */}
      <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
      <Route path={ROUTES.LANGUAGE} element={<LanguagePage />} />
      <Route path={ROUTES.CONSENT} element={<ConsentPage />} />
      <Route path={ROUTES.PATIENT_IDENTIFICATION} element={<PatientIdentificationPage />} />
      <Route path={ROUTES.BASIC_DETAILS} element={<BasicDetailsPage />} />
      <Route path={ROUTES.CONSULTATION_MODE} element={<ConsultationModePage />} />
      <Route path={ROUTES.PATIENT_FEEDBACK} element={<PostVisitFeedbackPage />} />

      {/* Conversation */}
      <Route path={ROUTES.CONVERSATION} element={<ConversationPage />} />

      {/* Documents */}
      <Route path={ROUTES.DOCUMENTS} element={<DocumentUploadPage />} />

      {/* AYUSH */}
      <Route path={ROUTES.AYUSH_HISTORY} element={<AyushHistoryPage />} />

      {/* Clinical */}
      <Route path={ROUTES.CLINICAL_HISTORY} element={<ClinicalHistoryPage />} />
      <Route path={ROUTES.TIMELINE} element={<ClinicalTimelinePage />} />
      <Route path={ROUTES.CLINICAL_SUMMARY} element={<ClinicalSummaryPage />} />

      {/* Doctor */}
      <Route path={ROUTES.DOCTOR_LOGIN} element={<SignInPage />} />
      <Route path={ROUTES.DOCTOR_DASHBOARD} element={<DoctorDashboardPage />} />
      <Route path={ROUTES.PATIENT_QUEUE} element={<PatientQueuePage />} />
      <Route path={ROUTES.DOCTOR_CASES} element={<PatientCasePage />} />
      <Route path={ROUTES.DOCTOR_APPROVALS} element={<VerificationPage />} />
      <Route path={ROUTES.PATIENT_CASE} element={<PatientCasePage />} />
      <Route path={ROUTES.SUMMARY_REVIEW} element={<SummaryReviewPage />} />
      <Route path={ROUTES.VERIFICATION} element={<VerificationPage />} />
      <Route path={ROUTES.DOCTOR_FEEDBACK} element={<PatientFeedbackPage />} />
    </Routes>
  );
}

export default AppRoutes;
