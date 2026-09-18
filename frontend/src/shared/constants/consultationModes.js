/**
 * consultationModes.js – Consultation mode definitions.
 *
 * Defines the two consultation modes available in MediKiosk.
 * Used on the ConsultationModePage to present options to the patient.
 */

export const CONSULTATION_MODES = {
  GENERAL: "general",
  AYUSH: "ayush",
};

export const CONSULTATION_MODE_OPTIONS = [
  {
    id: CONSULTATION_MODES.GENERAL,
    title: "General Clinical History",
    description:
      "Standard medical history covering chief complaint, history of present illness, past medical history, family history, social history, and review of systems.",
    icon: "Stethoscope",
    route: "/conversation",
  },
  {
    id: CONSULTATION_MODES.AYUSH,
    title: "AYUSH / Ayurveda History",
    description:
      "Ayurvedic assessment including Prakriti, Vikriti, Agni, Koshtha, Ahara, Vihara, Nidana, Samprapti, and Pariksha (Trividha, Ashtavidha, Dashavidha).",
    icon: "Leaf",
    route: "/ayush/history",
  },
];
