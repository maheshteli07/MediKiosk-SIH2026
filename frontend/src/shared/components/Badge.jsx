/**
 * Badge.jsx – Shared status/label badge component.
 *
 * Variants: default | success | warning | danger | info
 */

import React from "react";

const VARIANT_CLASSES = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
};

function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default Badge;
