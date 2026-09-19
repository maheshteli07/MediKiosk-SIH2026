/**
 * mockConversationData.js – Scripted multi-turn dialogue & entity extractions.
 * Dynamically adapts questions and extractions when medical documents are uploaded.
 */

export const DEFAULT_CONVERSATION_SCRIPT = [
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
    nextPromptHindi: "मैं समझ गया कि आपको 3 दिनों से बुखार और सिरदर्द है। क्या आपको खांसी, गले में दर्द या शरीर में ऐंठन जैसी कोई अन्य समस्या भी है?",
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
    nextPromptHindi: "ठीक है। क्या आपने इसके लिए कोई दवा ली है? क्या आपको मधुमेह, बीपी या अस्थमा जैसी कोई पहले से बीमारी है?",
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
    nextPrompt: "Thank you. All your symptoms and medical history have been compiled into a structured summary for the doctor to review.",
    nextPromptHindi: "धन्यवाद। आपके सभी लक्षण और मेडिकल हिस्ट्री डॉक्टर के अवलोकन हेतु संकलित कर दी गई है।",
  },
];

export const MOCK_CONVERSATION_SCRIPT = DEFAULT_CONVERSATION_SCRIPT;

/**
 * Extracts pre-existing entities from uploaded documents (medicines, past diagnoses, lab findings)
 */
export function getInitialEntitiesFromDocs(uploadedDocs = []) {
  if (!uploadedDocs || uploadedDocs.length === 0) return [];

  const entities = [];
  uploadedDocs.forEach((doc, docIdx) => {
    const data = doc.extractedData;
    if (!data) return;

    // Diagnosis from doc
    if (data.diagnosis?.value) {
      entities.push({
        id: `doc-dx-${docIdx}`,
        category: "history",
        text: `${data.diagnosis.value} (Prior Diagnosis)`,
        duration: data.documentDate?.value ? `Dated ${data.documentDate.value}` : "Previous record",
        source: "document",
        status: "detected",
      });
    }

    // Medicines from doc
    if (Array.isArray(data.medicines)) {
      data.medicines.forEach((med, mIdx) => {
        entities.push({
          id: `doc-med-${docIdx}-${mIdx}`,
          category: "medicine",
          text: med.name,
          dosage: `${med.dosage || ""}${med.duration ? " (" + med.duration + ")" : ""}`.trim() || "Prescribed",
          source: "document",
          status: "detected",
        });
      });
    }

    // Lab results from doc
    if (Array.isArray(data.labResults)) {
      data.labResults.forEach((lab, lIdx) => {
        entities.push({
          id: `doc-lab-${docIdx}-${lIdx}`,
          category: "history",
          text: `${lab.testName}: ${lab.result}`,
          duration: `Ref: ${lab.referenceRange || "Standard"}`,
          source: "document",
          status: "detected",
        });
      });
    }
  });

  return entities;
}

/**
 * Generates an adaptive multi-turn script tailored directly to the uploaded documents.
 */
export function getAdaptiveConversationScript(uploadedDocs = []) {
  if (!uploadedDocs || uploadedDocs.length === 0) {
    return DEFAULT_CONVERSATION_SCRIPT;
  }

  const primaryDoc = uploadedDocs[0];
  const extData = primaryDoc.extractedData || {};
  const isLab = primaryDoc.fileName?.toLowerCase().includes("blood") ||
                primaryDoc.fileName?.toLowerCase().includes("lab") ||
                (extData.labResults && extData.labResults.length > 0);

  const initialDocEntities = getInitialEntitiesFromDocs(uploadedDocs);

  if (isLab) {
    // Tailored to Lab Report (e.g. Metropolis Diabetic Panel)
    const hbA1c = extData.labResults?.find(r => r.testName.includes("HbA1c"))?.result || "7.4%";
    const fbs = extData.labResults?.find(r => r.testName.includes("Fasting"))?.result || "112 mg/dL";

    return [
      {
        turnId: 1,
        aiPrompt: `Namaste! I have analyzed your uploaded lab report from ${extData.clinicName?.value || "the laboratory"} showing an HbA1c of ${hbA1c} and fasting blood sugar of ${fbs}. Are you currently experiencing symptoms like extreme fatigue, increased thirst, or frequent urination?`,
        aiPromptHindi: `नमस्ते! मैंने ${extData.clinicName?.value || "लैब"} से आपकी अपलोड की गई रिपोर्ट देख ली है, जिसमें HbA1c ${hbA1c} और फास्टिंग शुगर ${fbs} है। क्या आपको असामान्य थकान, बार-बार प्यास लगना या रात में ज्यादा पेशाब आने की समस्या हो रही है?`,
        samplePatientInputs: [
          "Yes, I have been feeling unusually fatigued for 2 weeks and waking up twice at night to urinate.",
          "हाँ, मुझे 2 हफ्तों से बहुत थकान लग रही है और रात में दो बार पेशाब के लिए उठना पड़ता है।",
        ],
        extractedEntities: [
          ...initialDocEntities,
          { id: "e1", category: "symptom", text: "Persistent Fatigue", duration: "2 weeks", status: "detected" },
          { id: "e2", category: "symptom", text: "Nocturia (Night urination)", duration: "2 weeks", status: "detected" },
        ],
        nextPrompt: "I see. Are you currently taking any prescribed diabetes medication like Metformin or Glimepiride, or following a diabetic diet?",
        nextPromptHindi: "समझ गया। क्या आप वर्तमान में मेटफॉर्मिन जैसी कोई मधुमेह की दवा ले रहे हैं, या परहेज का पालन कर रहे हैं?",
      },
      {
        turnId: 2,
        aiPrompt: "I see. Are you currently taking any prescribed diabetes medication like Metformin or Glimepiride, or following a diabetic diet?",
        aiPromptHindi: "समझ गया। क्या आप वर्तमान में मेटफॉर्मिन जैसी कोई मधुमेह की दवा ले रहे हैं, या परहेज का पालन कर रहे हैं?",
        samplePatientInputs: [
          "I was taking Metformin 500mg once daily, but I missed doses over the last month.",
          "मैं दिन में एक बार मेटफॉर्मिन 500mg ले रहा था, लेकिन पिछले महीने कुछ खुराक छूट गई थीं।",
        ],
        extractedEntities: [
          ...initialDocEntities,
          { id: "e1", category: "symptom", text: "Persistent Fatigue", duration: "2 weeks", status: "detected" },
          { id: "e2", category: "symptom", text: "Nocturia (Night urination)", duration: "2 weeks", status: "detected" },
          { id: "e3", category: "medicine", text: "Metformin 500mg", dosage: "Irregular compliance", status: "detected" },
          { id: "e4", category: "history", text: "Type 2 Diabetes Mellitus", duration: "Suboptimal control", status: "detected" },
        ],
        nextPrompt: "Understood. Have you experienced any dizziness, tingling in feet, or blurred vision recently?",
        nextPromptHindi: "ठीक है। क्या आपको हाल ही में चक्कर आना, पैरों में झनझनाहट या धुंधला दिखाई देने की कोई शिकायत हुई है?",
      },
      {
        turnId: 3,
        aiPrompt: "Understood. Have you experienced any dizziness, tingling in feet, or blurred vision recently?",
        aiPromptHindi: "ठीक है। क्या आपको हाल ही में चक्कर आना, पैरों में झनझनाहट या धुंधला दिखाई देने की कोई शिकायत हुई है?",
        samplePatientInputs: [
          "Slight blurred vision when reading, but no foot tingling. My appetite is normal.",
          "पढ़ते समय हल्का धुंधला दिखता है, पर पैरों में झनझनाहट नहीं है। भूख सामान्य है।",
        ],
        extractedEntities: [
          ...initialDocEntities,
          { id: "e1", category: "symptom", text: "Persistent Fatigue", duration: "2 weeks", status: "detected" },
          { id: "e2", category: "symptom", text: "Nocturia (Night urination)", duration: "2 weeks", status: "detected" },
          { id: "e3", category: "medicine", text: "Metformin 500mg", dosage: "Irregular compliance", status: "detected" },
          { id: "e4", category: "history", text: "Type 2 Diabetes Mellitus", duration: "Suboptimal control", status: "detected" },
          { id: "e5", category: "symptom", text: "Mild Visual Blurriness", duration: "Intermittent", status: "detected" },
        ],
        nextPrompt: "Thank you. Your uploaded lab values, medication history, and recent symptoms have been compiled for the doctor to review now.",
        nextPromptHindi: "धन्यवाद। आपकी लैब रिपोर्ट, दवा का इतिहास और वर्तमान लक्षण डॉक्टर के परामर्श हेतु तैयार कर दिए गए हैं।",
      },
    ];
  }

  // Tailored to Prescription (e.g. Dr. Rajesh Sharma - Acute Viral Bronchitis, Amoxicillin, Paracetamol)
  const doctorName = extData.doctorName?.value || "your previous doctor";
  const diagnosis = extData.diagnosis?.value || "Acute Bronchitis";
  const medicinesList = extData.medicines?.map(m => m.name).slice(0, 2).join(" and ") || "prescribed medicines";

  return [
    {
      turnId: 1,
      aiPrompt: `Namaste! I have reviewed your uploaded prescription from ${doctorName} for ${diagnosis}. I see you were prescribed ${medicinesList}. How have your symptoms progressed since starting this treatment?`,
      aiPromptHindi: `नमस्ते! मैंने ${diagnosis} के लिए ${doctorName} द्वारा दिया गया आपका प्रिस्क्रिप्शन देख लिया है, जिसमें ${medicinesList} लिखी थीं। यह दवाएं शुरू करने के बाद अब आपकी तबीयत कैसी है?`,
      samplePatientInputs: [
        "The high fever has come down with Paracetamol, but my cough has become more persistent and throat is still sore.",
        "पैरासिटामोल से बुखार तो कुछ कम हुआ है, लेकिन खांसी और बढ़ गई है और गले में अभी भी दर्द है।",
      ],
      extractedEntities: [
        ...initialDocEntities,
        { id: "e1", category: "symptom", text: "Persistent Cough (Worsening)", duration: "4 days", status: "detected" },
        { id: "e2", category: "symptom", text: "Sore Throat (Continuing)", duration: "4 days", status: "detected" },
      ],
      nextPrompt: `I note that the fever has improved, but the cough is persisting despite ${medicinesList}. Are you coughing up any phlegm or mucus, or feeling any chest tightness or wheezing?`,
      nextPromptHindi: `मैं समझ गया कि बुखार कम हुआ है लेकिन खांसी अभी भी बनी हुई है। क्या आपको बलगम आ रहा है, या सीने में जकड़न या सांस लेने में परेशानी हो रही है?`,
    },
    {
      turnId: 2,
      aiPrompt: `I note that the fever has improved, but the cough is persisting despite ${medicinesList}. Are you coughing up any phlegm or mucus, or feeling any chest tightness or wheezing?`,
      aiPromptHindi: `मैं समझ गया कि बुखार कम हुआ है लेकिन खांसी अभी भी बनी हुई है। क्या आपको बलगम आ रहा है, या सीने में जकड़न या सांस लेने में परेशानी हो रही है?`,
      samplePatientInputs: [
        "No phlegm, it is a dry hacking cough especially at night, and I feel slight chest tightness when climbing stairs.",
        "कोई बलगम नहीं है, सूखी खांसी है खासकर रात में, और सीढ़ियां चढ़ते समय हल्की सीने में जकड़न होती है।",
      ],
      extractedEntities: [
        ...initialDocEntities,
        { id: "e1", category: "symptom", text: "Persistent Cough (Worsening)", duration: "4 days", status: "detected" },
        { id: "e2", category: "symptom", text: "Sore Throat (Continuing)", duration: "4 days", status: "detected" },
        { id: "e3", category: "symptom", text: "Dry Nocturnal Cough", duration: "Severe when flat", status: "detected" },
        { id: "e4", category: "symptom", text: "Chest Tightness (Exertional)", duration: "2 days", status: "detected" },
      ],
      nextPrompt: "Understood. Have you experienced any difficulty breathing or wheezing when resting? Also, did the antibiotic cause any stomach upset or allergies?",
      nextPromptHindi: "समझ गया। क्या आराम करते समय भी सांस लेने में कोई तकलीफ होती है? और क्या एंटीबायोटिक से पेट में कोई परेशानी या एलर्जी हुई?",
    },
    {
      turnId: 3,
      aiPrompt: "Understood. Have you experienced any difficulty breathing or wheezing when resting? Also, did the antibiotic cause any stomach upset or allergies?",
      aiPromptHindi: "समझ गया। क्या आराम करते समय भी सांस लेने में कोई तकलीफ होती है? और क्या एंटीबायोटिक से पेट में कोई परेशानी या एलर्जी हुई?",
      samplePatientInputs: [
        "No resting breathlessness and no stomach trouble, but sleeping is broken because of the dry cough spells.",
        "आराम करते समय सांस ठीक है, पर रात को खांसते-खांसते नींद टूट जाती है। पेट ठीक है।",
      ],
      extractedEntities: [
        ...initialDocEntities,
        { id: "e1", category: "symptom", text: "Persistent Cough (Worsening)", duration: "4 days", status: "detected" },
        { id: "e2", category: "symptom", text: "Sore Throat (Continuing)", duration: "4 days", status: "detected" },
        { id: "e3", category: "symptom", text: "Dry Nocturnal Cough", duration: "Severe when flat", status: "detected" },
        { id: "e4", category: "symptom", text: "Chest Tightness (Exertional)", duration: "2 days", status: "detected" },
        { id: "e5", category: "symptom", text: "Sleep Disturbance (Cough-induced)", duration: "3 nights", status: "detected" },
      ],
      nextPrompt: "Thank you for the thorough details. I have combined your response to the uploaded prescription with your ongoing cough and chest tightness for the doctor's immediate review.",
      nextPromptHindi: "धन्यवाद। आपके पुराने पर्चे की दवाओं के असर, वर्तमान सूखी खांसी और सीने की जकड़न का विस्तृत विवरण डॉक्टर के लिए तैयार कर दिया गया है।",
    },
  ];
}

