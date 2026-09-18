/**
 * languages.js – Supported languages for MediKiosk.
 *
 * Each entry contains the language code, display name in English,
 * native script name, and Bhashini language code for speech services.
 */

export const SUPPORTED_LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    bhashiniCode: "en",
    rtl: false,
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    bhashiniCode: "hi",
    rtl: false,
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    bhashiniCode: "mr",
    rtl: false,
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    bhashiniCode: "ta",
    rtl: false,
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    bhashiniCode: "te",
    rtl: false,
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    bhashiniCode: "kn",
    rtl: false,
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    bhashiniCode: "bn",
    rtl: false,
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    bhashiniCode: "gu",
    rtl: false,
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    bhashiniCode: "pa",
    rtl: false,
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    bhashiniCode: "ur",
    rtl: true,
  },
];

export const DEFAULT_LANGUAGE = "en";
