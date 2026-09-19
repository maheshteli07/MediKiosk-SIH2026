/**
 * SourceEvidenceViewer.jsx – Displays raw voice intake transcript & document scans
 * so the doctor can verify AI drafts directly against source evidence.
 */

import React, { useState } from "react";
import { MessageSquare, FileText, Bot, User, ZoomIn, Sparkles } from "lucide-react";
import Tabs from "@/shared/components/Tabs.jsx";

function SourceEvidenceViewer({ evidence }) {
  const [activeTab, setActiveTab] = useState("transcript");

  if (!evidence) return null;

  const { transcript = [], documents = [] } = evidence;

  const tabOptions = [
    { id: "transcript", label: `Voice Transcript (${transcript.length})` },
    { id: "documents", label: `Scanned Documents (${documents.length})` },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary-600" />
            Raw Source Evidence
          </h3>
          <p className="text-[11px] text-slate-500">Verify AI draft against original patient input</p>
        </div>

        <Tabs
          tabs={tabOptions}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pill"
        />
      </div>

      {/* Tab Content 1: Raw Voice Transcript */}
      {activeTab === "transcript" && (
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[480px] pr-1">
          {transcript.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No voice transcript available for this case.
            </div>
          ) : (
            transcript.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 max-w-[90%] text-xs ${
                  msg.sender === "patient" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] ${
                    msg.sender === "patient"
                      ? "bg-slate-700 text-white"
                      : "bg-primary-600 text-white"
                  }`}
                >
                  {msg.sender === "patient" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>

                <div
                  className={`p-3 rounded-2xl leading-relaxed ${
                    msg.sender === "patient"
                      ? "bg-primary-50 text-primary-950 border border-primary-200 rounded-tr-none"
                      : "bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none"
                  }`}
                >
                  <p className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                    {msg.sender === "patient" ? "Patient Voice Input" : "AI Prompt"}
                  </p>
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 2: Uploaded Document Scans */}
      {activeTab === "documents" && (
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[480px] pr-1">
          {documents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No uploaded document scans for this case.
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary-600" />
                    {doc.fileName}
                  </span>
                  <button className="text-[11px] text-primary-600 hover:text-primary-800 flex items-center gap-1 font-semibold">
                    <ZoomIn className="w-3 h-3" /> Inspect Scan
                  </button>
                </div>

                {/* Scan Image Preview */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-200">
                  <img
                    src={doc.thumbnailUrl}
                    alt={doc.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Extracted Text Snippet */}
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700">Raw OCR Snippet: </span>
                  {doc.extractedText}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SourceEvidenceViewer;
