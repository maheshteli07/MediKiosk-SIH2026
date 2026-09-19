/**
 * mockConversationData.js – Scripted multi-turn dialogue & entity extractions.
 */

export const MOCK_CONVERSATION_SCRIPT = [
  {
    turnId: 1,
    aiPrompt: "Namaste! I am your MediKiosk AI assistant. Please describe what health problem brought you here today.",
    aiPromptHindi: "नमस्ते! मैं आपका मेडीकियोस्क एआई सहायक हूँ। कृपया बताएं कि आज आपको क्या स्वास्थ्य समस्या है?",
    samplePatientInputs: [
      "I have had a severe fever and intense headache for 3 days.",
      "मुझे पिछले 3 दिनों से तेज़ बुखार और सिरदर्द है।",
    ],
    extractedEntities: [
      { id: "e1", category: "symptom", text: "Fever (High grade)", duration: "3 days", status: "detected" },
      { id: "e2", category: "symptom", text: "Headache (Severe)", duration: "3 days", status: "detected" },
    ],
    nextPrompt: "I understand you have fever and headache for 3 days. Are you experiencing any other symptoms like cough, sore throat, or body ache?",
  },
  {
    turnId: 2,
    aiPrompt: "I understand you have fever and headache for 3 days. Are you experiencing any other symptoms like cough, sore throat, or body ache?",
    aiPromptHindi: "मैं समझ गया कि आपको 3 दिनों से बुखार और सिरदर्द है। क्या आपको खांसी, गले में दर्द या शरीर में ऐंठन जैसी कोई अन्य समस्या भी है?",
    samplePatientInputs: [
      "Yes, I have a dry cough and painful sore throat since yesterday.",
      "हाँ, मुझे कल से सूखी खांसी और गले में तेज़ खराश है।",
    ],
    extractedEntities: [
      { id: "e1", category: "symptom", text: "Fever (High grade)", duration: "3 days", status: "detected" },
      { id: "e2", category: "symptom", text: "Headache (Severe)", duration: "3 days", status: "detected" },
      { id: "e3", category: "symptom", text: "Dry Cough", duration: "1 day", status: "detected" },
      { id: "e4", category: "symptom", text: "Sore Throat", duration: "1 day", status: "detected" },
    ],
    nextPrompt: "Got it. Have you taken any medications or remedies for this yet? Also, do you have any existing health conditions like diabetes, BP, or asthma?",
  },
  {
    turnId: 3,
    aiPrompt: "Got it. Have you taken any medications or remedies for this yet? Also, do you have any existing health conditions like diabetes, BP, or asthma?",
    aiPromptHindi: "ठीक है। क्या आपने इसके लिए कोई दवा ली है? क्या आपको मधुमेह, बीपी या अस्थमा जैसी कोई पहले से बीमारी है?",
    samplePatientInputs: [
      "I took Paracetamol 650mg twice today. I have Type 2 Diabetes for 4 years.",
      "मैंने आज पैरासिटामोल 650mg दो बार ली। मुझे 4 साल से टाइप 2 डायबिटीज है।",
    ],
    extractedEntities: [
      { id: "e1", category: "symptom", text: "Fever (High grade)", duration: "3 days", status: "detected" },
      { id: "e2", category: "symptom", text: "Headache (Severe)", duration: "3 days", status: "detected" },
      { id: "e3", category: "symptom", text: "Dry Cough", duration: "1 day", status: "detected" },
      { id: "e4", category: "symptom", text: "Sore Throat", duration: "1 day", status: "detected" },
      { id: "e5", category: "medicine", text: "Paracetamol 650mg", dosage: "Twice daily", status: "detected" },
      { id: "e6", category: "history", text: "Type 2 Diabetes Mellitus", duration: "4 years", status: "detected" },
    ],
    nextPrompt: "Thank you. All your symptoms and history have been recorded. I have compiled a structured draft for the doctor to review.",
  },
];
