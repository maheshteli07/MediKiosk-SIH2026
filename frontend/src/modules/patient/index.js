/**
 * modules/patient/index.js
 *
 * Public API of the Patient module.
 * Other modules should import patient-related items from here,
 * NOT from deep internal paths like pages/ or components/.
 */

// Pages
export { default as WelcomePage } from "./pages/WelcomePage.jsx";
export { default as LanguagePage } from "./pages/LanguagePage.jsx";
export { default as ConsentPage } from "./pages/ConsentPage.jsx";
export { default as PatientIdentificationPage } from "./pages/PatientIdentificationPage.jsx";
export { default as BasicDetailsPage } from "./pages/BasicDetailsPage.jsx";
export { default as ConsultationModePage } from "./pages/ConsultationModePage.jsx";

// Public components (only those intentionally shared)
export { default as PatientHeader } from "./components/PatientHeader.jsx";
