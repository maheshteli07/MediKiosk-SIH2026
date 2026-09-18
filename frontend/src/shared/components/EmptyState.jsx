/**
 * EmptyState.jsx – Empty content placeholder component.
 *
 * Shown when a list, queue, or dataset has no items.
 *
 * Props:
 *   - title: string
 *   - message: string
 *   - icon: Lucide icon component (optional)
 *   - action: { label, onClick } (optional)
 */

import React from "react";
import { Inbox } from "lucide-react";
import Button from "./Button.jsx";

function EmptyState({ title = "Nothing here yet", message, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="text-slate-400" size={28} />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-slate-400 max-w-sm mb-4">{message}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
