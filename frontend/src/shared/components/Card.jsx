/**
 * Card.jsx – Shared surface/card container component.
 *
 * Props:
 *   - className: additional Tailwind classes
 *   - padding: 'none' | 'sm' | 'md' | 'lg'
 *   - children: card content
 */

import React from "react";

const PADDING_CLASSES = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

function Card({ children, className = "", padding = "md", ...props }) {
  return (
    <div
      className={[
        "bg-white rounded-xl shadow-sm border border-slate-200",
        PADDING_CLASSES[padding] ?? PADDING_CLASSES.md,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
