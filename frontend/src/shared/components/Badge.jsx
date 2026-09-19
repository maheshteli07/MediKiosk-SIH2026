/**
 * Badge.jsx – Status and label badge with icon pairing and high contrast ratios.
 *
 * Semantic case-status variants (MediKiosk-specific):
 *   draft           — blue background + edit icon
 *   needs-check     — ayush gold background (#C98A2C) + dark amber text (#78350F) + alert icon
 *   doctor-approved — success green background + checkmark icon
 */

import React from "react";
import { Edit3, AlertTriangle, CheckCircle2, Leaf, Clock, Sparkles } from "lucide-react";

const VARIANT_CLASSES = {
  // Generic
  default: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600",
  info: "bg-primary-50 dark:bg-primary-900/30 text-primary-900 dark:text-primary-200 border border-primary-200 dark:border-primary-700/40",
  success: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/40",
  warning: "bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/40",
  danger: "bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700/40",
  ayush: "bg-amber-100/80 dark:bg-amber-900/30 text-amber-950 dark:text-amber-200 border border-amber-400 dark:border-amber-600/50 font-bold",

  // MediKiosk case-status variants (Icon + High Contrast Text)
  draft: "bg-sky-100 dark:bg-sky-900/30 text-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-700/40 font-semibold",
  "needs-check": "bg-amber-100 dark:bg-amber-900/40 text-amber-950 dark:text-amber-200 border border-amber-400 dark:border-amber-600/60 font-bold shadow-2xs",
  "doctor-approved": "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-600/60 font-bold shadow-2xs",
};

const VARIANT_ICONS = {
  draft: Edit3,
  "needs-check": AlertTriangle,
  "doctor-approved": CheckCircle2,
  ayush: Leaf,
};

function Badge({
  children,
  variant = "default",
  dot = false,
  icon: CustomIcon,
  className = "",
}) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default;
  const DefaultIcon = VARIANT_ICONS[variant];
  const IconComponent = CustomIcon || DefaultIcon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full",
        "text-xs tracking-wide transition-colors",
        variantClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      {dot && !IconComponent && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
