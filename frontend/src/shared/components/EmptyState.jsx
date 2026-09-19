/**
 * EmptyState.jsx – Empty content placeholder.
 *
 * Used when a list, table, or section has no content to show.
 * Accepts an optional icon, heading, subtext, and a single action.
 *
 * Copy defaults come from shared/constants/copy.js — override as needed.
 *
 * Props:
 *   icon      — Lucide icon component (optional)
 *   heading   — string (required)
 *   subtext   — string (optional)
 *   action    — string label for the action button (optional)
 *   onAction  — callback for the action button (optional)
 *   size      — "sm" | "md" | "lg"  (controls vertical padding)
 *   className — extra classes on the root element
 */

import React from "react";

const SIZE_CLASSES = {
  sm: "py-10",
  md: "py-16",
  lg: "py-24",
};

function EmptyState({
  icon: Icon,
  heading,
  subtext,
  action,
  onAction,
  size = "md",
  className = "",
}) {
  const paddingClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <div
      className={[
        "flex flex-col items-center justify-center px-6 text-center",
        paddingClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Icon
            className="h-8 w-8 text-slate-400 dark:text-slate-500"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      )}

      {heading && (
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">{heading}</h3>
      )}

      {subtext && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-400 dark:text-slate-500">
          {subtext}
        </p>
      )}

      {action && onAction && (
        <button
          onClick={onAction}
          className={[
            "mt-5 text-sm font-semibold text-primary-500 dark:text-primary-400",
            "hover:text-primary-700 dark:hover:text-primary-300 underline underline-offset-2",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded",
            "transition-colors duration-150",
          ].join(" ")}
        >
          {action}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
