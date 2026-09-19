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
  default: "bg-slate-100 text-slate-700 border border-slate-200",
  info: "bg-primary-50 text-primary-900 border border-primary-200",
  success: "bg-emerald-50 text-emerald-900 border border-emerald-300",
  warning: "bg-amber-50 text-amber-900 border border-amber-300",
  danger: "bg-rose-50 text-rose-900 border border-rose-300",
  ayush: "bg-amber-100/80 text-amber-950 border border-amber-400 font-bold",

  // MediKiosk case-status variants (Icon + High Contrast Text)
  draft: "bg-sky-100 text-sky-950 border border-sky-300 font-semibold",
  "needs-check": "bg-amber-100 text-amber-950 border border-amber-400 font-bold shadow-2xs",
  "doctor-approved": "bg-emerald-100 text-emerald-950 border border-emerald-400 font-bold shadow-2xs",
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
