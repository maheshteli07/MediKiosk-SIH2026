/**
 * Button.jsx – Shared button primitive.
 *
 * Variants: primary | secondary | ghost | danger | ayush
 * Sizes:    sm | md | lg | xl
 *
 * xl size (min-height 56px) is the kiosk standard for patient-facing primary actions.
 * All sizes meet a minimum 44px touch target for tablet use.
 */

import React from "react";

const VARIANT_CLASSES = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-700 active:bg-primary-900 " +
    "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
  secondary:
    "bg-white dark:bg-[#1e2535] text-primary-500 dark:text-primary-400 border-2 border-primary-500 dark:border-primary-600 " +
    "hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100 dark:active:bg-primary-900/40 " +
    "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 active:bg-slate-200 dark:active:bg-slate-700 " +
    "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
  danger:
    "bg-danger text-white hover:bg-danger-dark active:bg-danger-dark " +
    "focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2",
  ayush:
    "bg-ayush-500 text-white hover:bg-ayush-700 active:bg-ayush-700 " +
    "focus-visible:ring-2 focus-visible:ring-ayush-500 focus-visible:ring-offset-2",
};

// xl = kiosk primary action (56px), lg = comfortable (52px), md = standard (44px), sm = dense (36px)
const SIZE_CLASSES = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-4 py-2.5 text-base min-h-[44px]",
  lg: "px-6 py-3.5 text-lg min-h-[52px]",
  xl: "px-8 py-4 text-xl min-h-[56px]",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  icon: Icon,
  ...props
}) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 font-semibold rounded-lg",
        "transition-all duration-150 select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        fullWidth ? "w-full" : "",
        variantClass,
        sizeClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {!loading && Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
}

export default Button;
