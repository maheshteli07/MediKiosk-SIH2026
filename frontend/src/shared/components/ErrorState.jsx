/**
 * ErrorState.jsx – Active voice error display component.
 *
 * Plain, specific language without apologetic filler text.
 */

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Button from "./Button.jsx";

function ErrorState({
  title = "Unable to process request",
  message = "Network connection interrupted or process timed out. Retry to continue.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-danger-50 text-danger-600 flex items-center justify-center mb-4 border border-danger-200">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="md" icon={RotateCcw} onClick={onRetry}>
          Retry Request
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
