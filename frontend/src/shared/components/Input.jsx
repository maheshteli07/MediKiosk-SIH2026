/**
 * Input.jsx – Shared form input component.
 *
 * Props:
 *   - label, id, type, value, onChange, error, placeholder, required, disabled
 */

import React from "react";

function Input({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder = "",
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={[
          "w-full px-3 py-2 rounded-lg border text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          "transition-colors duration-150",
          "dark:text-slate-100 dark:placeholder-slate-500",
          error
            ? "border-danger-500 bg-danger-50 dark:bg-danger-900/20 dark:border-danger-500"
            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2535] hover:border-slate-400 dark:hover:border-slate-500",
          disabled ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800" : "",
        ].join(" ")}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}

export default Input;
