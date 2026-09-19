/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ─── MediKiosk Brand Palette ───────────────────────────────────────────
      colors: {
        // Primary — teal, anchored at #0E6B67
        primary: {
          50:  "#EDF7F6",
          100: "#BAE8E6",
          300: "#5CB8B5",
          500: "#0E6B67",
          700: "#0A504D",
          900: "#063330",
        },
        // AYUSH accent — gold, anchored at #C98A2C
        ayush: {
          100: "#F6E9D0",
          300: "#DFB26A",
          500: "#C98A2C",
          700: "#8F6018",
        },
        // Brand neutrals
        brand: {
          slate: "#1B2430",   // doctor sidebar / dark chrome
          bg:    "#F6F7F9",   // page background
        },
        // Semantic status
        success: {
          DEFAULT: "#2E8B6F",
          light:   "#D1F0E6",
        },
        warning: {
          DEFAULT: "#B8791B",
          light:   "#FBF0DC",
        },
        danger: {
          DEFAULT: "#C4443A",
          light:   "#FBDDDB",
          dark:    "#9E3530",
        },
      },

      // ─── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        // Latin/default UI
        sans:  ["Inter", "system-ui", "sans-serif"],
        // Indic script labels (language switcher, AYUSH content)
        indic: ["Noto Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
