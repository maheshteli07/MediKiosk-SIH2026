/**
 * Modal.jsx – Accessible dialog overlay.
 *
 * Features:
 *   - Focus trap: keyboard focus stays inside the modal while open
 *   - Escape key closes the modal
 *   - Click on backdrop closes the modal
 *   - ARIA: role="dialog", aria-modal="true", aria-labelledby
 *   - Backdrop blur for visual context
 *
 * Sizes: sm | md | lg | xl
 */

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  hideCloseButton = false,
}) {
  const contentRef = useRef(null);

  // Focus trap + Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Move focus into the modal
    const focusable = contentRef.current?.querySelectorAll(FOCUSABLE_SELECTORS);
    const firstEl = focusable?.[0];
    const lastEl = focusable?.[focusable.length - 1];
    firstEl?.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        if (!focusable || focusable.length === 0) { e.preventDefault(); return; }
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl?.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl?.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-slate/60 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={contentRef}
        className={[
          "relative w-full bg-white dark:bg-[#1e2535] rounded-xl shadow-xl overflow-hidden",
          "animate-in fade-in zoom-in-95 duration-150",
          sizeClass,
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
          <h2
            id="modal-title"
            className="text-base font-semibold text-slate-800 dark:text-slate-100"
          >
            {title}
          </h2>
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className={[
                "p-1.5 rounded-lg text-slate-400 dark:text-slate-500",
                "hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
                "focus-visible:ring-2 focus-visible:ring-primary-500",
                "transition-colors duration-150",
              ].join(" ")}
              aria-label="Close dialog"
            >
              <X size={18} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 text-slate-700 dark:text-slate-300">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
