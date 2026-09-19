/**
 * Card.jsx – Content container primitive.
 *
 * Variants:
 *   default  — white, light border (most cards)
 *   flat     — white, no border, no shadow (inline use)
 *   tinted   — primary-50 background (highlights, summaries)
 *   dark     — brand-slate background (doctor sidebar cards)
 *   elevated — white + shadow (floating panels, popovers)
 *
 * Avoid using `elevated` as the default — borders create enough
 * depth without making the whole UI look padded and soft.
 */

import React from "react";

const VARIANT_CLASSES = {
  default:  "bg-white border border-slate-200",
  flat:     "bg-white",
  tinted:   "bg-primary-50 border border-primary-100",
  dark:     "bg-brand-slate text-white",
  elevated: "bg-white shadow-md",
  ayush:    "bg-ayush-100 border border-ayush-300",
};

function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  onClick,
  ...props
}) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default;

  const paddingClass =
    padding === "none" ? "" :
    padding === "sm"   ? "p-3" :
    padding === "md"   ? "p-5" :
    padding === "lg"   ? "p-7" : "p-5";

  const interactiveClass = onClick
    ? "cursor-pointer hover:shadow-sm transition-shadow duration-150"
    : "";

  return (
    <div
      className={[
        "rounded-lg",
        variantClass,
        paddingClass,
        interactiveClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Convenience sub-components
Card.Header = function CardHeader({ children, className = "" }) {
  return (
    <div className={`mb-4 pb-4 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = "" }) {
  return (
    <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
