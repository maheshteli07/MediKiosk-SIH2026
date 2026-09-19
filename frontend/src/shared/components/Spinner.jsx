/**
 * Spinner.jsx – Loading indicator.
 *
 * Sizes: sm | md | lg
 *   sm — 16px — inline next to text
 *   md — 32px — card-level loading state
 *   lg — 48px — full-page / overlay loading
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size="lg" className="text-ayush-500" />
 */

import React from "react";

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

function Spinner({ size = "md", className = "" }) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        "rounded-full border-primary-100 border-t-primary-500 animate-spin",
        sizeClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

// Full-page centered loading wrapper
Spinner.Page = function SpinnerPage({ label = "Loading…" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-brand-bg">
      <Spinner size="lg" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
};

export default Spinner;
