/**
 * LiveTranscriptionBanner.jsx – Live speech transcription bar with inline edit affordance.
 *
 * Allows real-time display of incoming voice transcript + inline correction of misheard words.
 */

import React, { useState, useEffect } from "react";
import { Mic, Edit2, Check, X, Sparkles } from "lucide-react";
import Button from "@/shared/components/Button.jsx";

function LiveTranscriptionBanner({
  interimText,
  isListening,
  onConfirm,
  onCancel,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(interimText || "");

  useEffect(() => {
    if (!isEditing) {
      setEditedText(interimText || "");
    }
  }, [interimText, isEditing]);

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onConfirm) onConfirm(editedText);
  };

  return (
    <div className="bg-primary-900 text-white rounded-2xl p-4 shadow-lg border border-primary-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header status indicator */}
      <div className="flex items-center justify-between border-b border-primary-700/60 pb-2 mb-3">
        <div className="flex items-center gap-2">
          {isListening ? (
            <span className="flex items-center gap-2 text-xs font-semibold text-primary-300">
              <span className="w-2.5 h-2.5 rounded-full bg-danger-500 animate-ping" />
              Listening... Speak now
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-200">
              <Sparkles className="w-3.5 h-3.5 text-ayush-300" />
              Transcribed Text
            </span>
          )}
        </div>

        {!isListening && interimText && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs text-primary-300 hover:text-white bg-primary-800 hover:bg-primary-700 px-2.5 py-1 rounded-md transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit text</span>
          </button>
        )}
      </div>

      {/* Main transcription display / edit box */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full bg-primary-950 text-white border border-primary-600 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-primary-400"
            rows={3}
            placeholder="Edit any misheard words..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
            >
              <Check className="w-3.5 h-3.5" />
              Save Correction
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-base sm:text-lg font-medium text-white min-h-[48px] leading-relaxed">
            {interimText || (
              <span className="text-primary-300/60 italic">
                Listening for your voice...
              </span>
            )}
          </p>

          {!isListening && interimText && (
            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-primary-800">
              <button
                onClick={onCancel}
                className="text-xs text-primary-300 hover:text-white px-3 py-1.5 rounded-lg"
              >
                Clear
              </button>
              <Button
                variant="primary"
                size="sm"
                icon={Check}
                onClick={() => onConfirm(editedText)}
              >
                Confirm & Send
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LiveTranscriptionBanner;
