/**
 * LanguageSwitcher.jsx – Language selection dropdown.
 *
 * Displays languages using their native script labels (nativeName), not codes.
 * Uses the SUPPORTED_LANGUAGES list from shared/constants/languages.js.
 * Closes on outside click (via blur/focusout cascade).
 *
 * Props:
 *   currentLang — ISO language code string (e.g. "hi")
 *   onChange    — (code: string) => void
 *   light       — boolean; if true, renders white text (for dark backgrounds)
 */

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages.js";

function LanguageSwitcher({ currentLang = "en", onChange, light = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const current =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
    SUPPORTED_LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const triggerTextClass = light
    ? "text-white/80 hover:text-white hover:bg-white/10"
    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100";

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className={[
          "flex items-center gap-1.5 px-3 py-2 rounded-lg",
          "text-sm font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          triggerTextClass,
        ].join(" ")}
      >
        <Globe size={15} className="text-primary-500 shrink-0" aria-hidden="true" />
        <span className="font-indic">{current.nativeName}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          className={[
            "absolute right-0 mt-1.5 w-52 z-[40]",
            "bg-white border border-slate-200 rounded-xl shadow-lg",
            "py-1.5 overflow-hidden",
          ].join(" ")}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange?.(lang.code);
                  setOpen(false);
                }}
                className={[
                  "w-full flex items-center justify-between px-4 py-2.5",
                  "text-sm transition-colors duration-100",
                  isSelected
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="font-indic font-medium">{lang.nativeName}</span>
                <span className="text-xs text-slate-400 ml-2">{lang.name}</span>
                {isSelected && (
                  <Check
                    size={14}
                    className="text-primary-500 shrink-0 ml-2"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
