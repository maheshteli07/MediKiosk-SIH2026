/**
 * tokens.js – Design token scales for MediKiosk.
 *
 * Use these as reference values when Tailwind utilities alone are insufficient
 * (e.g., inline styles, dynamic calculations, canvas-based drawing).
 *
 * For standard layouts, prefer the equivalent Tailwind class (p-4, rounded-lg, etc.)
 * rather than importing these constants.
 */

// ── Spacing scale (mirrors Tailwind's default rem scale) ──────────────────────
export const SPACING = {
  "0":   "0rem",
  px:    "0.0625rem",  //  1px
  "0.5": "0.125rem",   //  2px
  "1":   "0.25rem",    //  4px
  "2":   "0.5rem",     //  8px
  "3":   "0.75rem",    // 12px
  "4":   "1rem",       // 16px
  "5":   "1.25rem",    // 20px
  "6":   "1.5rem",     // 24px
  "8":   "2rem",       // 32px
  "10":  "2.5rem",     // 40px
  "12":  "3rem",       // 48px
  "16":  "4rem",       // 64px
  "20":  "5rem",       // 80px
  "24":  "6rem",       // 96px
};

// ── Border-radius scale ───────────────────────────────────────────────────────
export const RADIUS = {
  none: "0",
  sm:   "0.25rem",   //  4px — tight elements (badges, chips)
  md:   "0.5rem",    //  8px — buttons, inputs
  lg:   "0.75rem",   // 12px — cards
  xl:   "1rem",      // 16px — modals, sheets
  "2xl":"1.5rem",    // 24px — hero cards
  full: "9999px",    // pill shapes
};

// ── Shadow scale ──────────────────────────────────────────────────────────────
export const SHADOW = {
  // Subtle — use on elements that lift slightly (cards, inputs on focus)
  sm:  "0 1px 2px 0 rgba(27,36,48,0.05)",
  // Standard card elevation
  md:  "0 4px 6px -1px rgba(27,36,48,0.07), 0 2px 4px -2px rgba(27,36,48,0.05)",
  // Modal, dropdown, floating panel
  lg:  "0 10px 24px -4px rgba(27,36,48,0.12), 0 4px 8px -4px rgba(27,36,48,0.06)",
  // Overlay, drawer
  xl:  "0 20px 40px -8px rgba(27,36,48,0.16)",
  // Inset for active/pressed states
  inset: "inset 0 2px 4px 0 rgba(27,36,48,0.06)",
};

// ── Touch target minimums (kiosk/tablet) ──────────────────────────────────────
export const TOUCH = {
  MIN_HEIGHT_PX: 56,   // Primary kiosk action buttons
  COMFORTABLE_PX: 44,  // Secondary actions
  COMPACT_PX: 36,      // Doctor-shell dense UI
};

// ── Z-index layers ─────────────────────────────────────────────────────────────
export const Z = {
  base:     0,
  raised:   10,
  dropdown: 40,
  sticky:   50,
  overlay:  60,
  modal:    70,
  toast:    80,
};
