/**
 * copy.js – Shared UI copy strings for MediKiosk.
 *
 * Rules:
 *   - Active voice. "Reload the page", not "An error has occurred".
 *   - No apologies. No "sorry", "unfortunately", "we're having trouble".
 *   - No filler. Every word earns its place.
 *   - Sentence case for headings, Title Case for button labels.
 */

// ── Button labels ─────────────────────────────────────────────────────────────
export const BUTTONS = {
  CONTINUE:     "Continue",
  BACK:         "Back",
  NEXT:         "Next",
  DONE:         "Done",
  CONFIRM:      "Confirm",
  CANCEL:       "Cancel",
  CLOSE:        "Close",
  SAVE:         "Save",
  SUBMIT:       "Submit",
  RETRY:        "Try Again",
  RELOAD:       "Reload Page",
  UPLOAD:       "Upload File",
  ADD:          "Add",
  EDIT:         "Edit",
  DELETE:       "Delete",
  START_OVER:   "Start Over",
  APPROVE:      "Approve Case",
  REJECT:       "Send Back",
  SIGN_IN:      "Sign In",
  SIGN_OUT:     "Sign Out",
  VIEW_CASE:    "View Case",
  VIEW_QUEUE:   "View Queue",
};

// ── Empty state strings ───────────────────────────────────────────────────────
export const EMPTY_STATES = {
  DEFAULT: {
    heading: "Nothing here yet",
    subtext:  "Content will appear here once it's added.",
  },
  PATIENT_QUEUE: {
    heading: "No patients in the queue",
    subtext:  "New patients appear here as they complete registration.",
  },
  NO_DOCUMENTS: {
    heading: "No documents uploaded",
    subtext:  "Upload a prescription, lab report, or scan to attach it to this case.",
  },
  NO_HISTORY: {
    heading: "No medical history on record",
    subtext:  "Complete the history form to create a record.",
  },
  NO_CASES: {
    heading: "No cases assigned",
    subtext:  "Cases will appear here when patients are routed to you.",
  },
  SEARCH_NO_RESULTS: {
    heading: "No matches found",
    subtext:  "Try a different name, ID, or phone number.",
  },
  NO_TIMELINE: {
    heading: "No events recorded",
    subtext:  "Health events and visits will build the timeline over time.",
  },
  NO_SUMMARY: {
    heading: "Summary not generated yet",
    subtext:  "Complete the conversation and documents steps first.",
  },
};

// ── Error state strings ───────────────────────────────────────────────────────
export const ERROR_STATES = {
  GENERIC: {
    heading: "Something went wrong",
    subtext:  "Reload the page or try again in a moment.",
    action:   "Reload Page",
  },
  NETWORK: {
    heading: "Can't reach the server",
    subtext:  "Check the network connection and try again.",
    action:   "Try Again",
  },
  NOT_FOUND: {
    heading: "Page not found",
    subtext:  "The link may be wrong or this page may have moved.",
    action:   "Go to Home",
  },
  UNAUTHORIZED: {
    heading: "Access denied",
    subtext:  "Sign in with a valid doctor account to continue.",
    action:   "Sign In",
  },
  UPLOAD_FAILED: {
    heading: "Upload failed",
    subtext:  "The file couldn't be uploaded. Check the format and size, then try again.",
    action:   "Try Again",
  },
  SESSION_EXPIRED: {
    heading: "Session expired",
    subtext:  "Sign in again to continue.",
    action:   "Sign In",
  },
};

// ── Aria labels ────────────────────────────────────────────────────────────────
export const ARIA = {
  CLOSE_MODAL:      "Close dialog",
  OPEN_LANGUAGE:    "Select language",
  SIDEBAR_NAV:      "Main navigation",
  PATIENT_PROGRESS: "Registration progress",
  LOADING:          "Loading, please wait",
  SPINNER:          "Loading",
};

// ── Placeholder / under-construction ──────────────────────────────────────────
export const PLACEHOLDER = {
  heading: "This screen is coming soon",
  subtext:  "The visual shell is ready. Feature content will be built in the next sprint.",
};
