/**
 * LoadingSpinner.jsx – Full-screen or inline loading indicator.
 *
 * Props:
 *   - fullScreen: boolean – if true, centers spinner on the whole page
 *   - size: 'sm' | 'md' | 'lg'
 *   - label: optional text below the spinner
 */

import React from "react";

const SIZE_CLASSES = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
};

function LoadingSpinner({ fullScreen = false, size = "md", label }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={[
          "rounded-full border-slate-200 border-t-primary-600 animate-spin",
          SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        ].join(" ")}
        role="status"
        aria-label="Loading"
      />
      {label && (
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
