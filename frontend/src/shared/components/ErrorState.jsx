/**
 * ErrorState.jsx – Error display component.
 *
 * Shown when an API call or process fails.
 *
 * Props:
 *   - title: string
 *   - message: string
 *   - onRetry: optional function – shows a Retry button if provided
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button.jsx";

function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertTriangle className="text-red-500" size={28} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
