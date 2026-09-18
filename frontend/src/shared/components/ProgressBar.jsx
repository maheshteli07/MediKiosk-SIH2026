/**
 * ProgressBar.jsx – Linear progress indicator.
 *
 * Props:
 *   - value: number (0–100)
 *   - label: optional string shown above the bar
 *   - showPercent: boolean
 *   - color: 'primary' | 'accent' | 'danger'
 */

import React from "react";

const COLOR_CLASSES = {
  primary: "bg-primary-600",
  accent: "bg-accent-500",
  danger: "bg-danger-500",
};

function ProgressBar({
  value = 0,
  label,
  showPercent = false,
  color = "primary",
  className = "",
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs font-medium text-slate-600">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-medium text-slate-500">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={[
            "h-full rounded-full transition-all duration-300 ease-out",
            COLOR_CLASSES[color] ?? COLOR_CLASSES.primary,
          ].join(" ")}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
