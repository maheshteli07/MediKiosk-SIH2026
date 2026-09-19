/**
 * ConversationThread.jsx – Chat transcript with AI vs Patient speech bubbles
 * and persistent trust microcopy banner.
 */

import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, ShieldCheck, Sparkles, User, Bot, RefreshCw } from "lucide-react";
import Button from "@/shared/components/Button.jsx";
import LiveTranscriptionBanner from "./LiveTranscriptionBanner.jsx";

function ConversationThread({
  messages = [],
  onSendMessage,
  onStartMic,
  isListening,
  interimTranscription,
  onConfirmTranscription,
  onCancelTranscription,
  isProcessing,
}) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interimTranscription, isListening, isProcessing]);

  const handleSendText = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Thread Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            AI
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">MediKiosk Assistant</h3>
            <p className="text-xs text-slate-500">Multilingual Case-Taking</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-primary-600" />
          Voice Active
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[380px] max-h-[500px]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === "patient" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                msg.sender === "patient"
                  ? "bg-slate-700 text-white"
                  : "bg-primary-600 text-white"
              }`}
            >
              {msg.sender === "patient" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Content Bubble */}
            <div>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === "patient"
                    ? "bg-primary-700 text-white rounded-tr-none"
                    : "bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
              <p
                className={`text-[11px] text-slate-400 mt-1 px-1 ${
                  msg.sender === "patient" ? "text-right" : "text-left"
                }`}
              >
                {msg.timestamp || "Just now"}
              </p>
            </div>
          </div>
        ))}

        {/* AI Typing / Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-slate-600 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-600" />
              <span>Analyzing response and extracting clinical details...</span>
            </div>
          </div>
        )}

        {/* Live speech transcription overlay in thread */}
        {(isListening || interimTranscription) && (
          <div className="my-2">
            <LiveTranscriptionBanner
              interimText={interimTranscription}
              isListening={isListening}
              onConfirm={onConfirmTranscription}
              onCancel={onCancelTranscription}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent TRUST MICROCOPY BANNER — crucial requirement */}
      <div className="bg-amber-50/80 border-t border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-900 font-medium">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>AI only drafts medical notes</strong> — your doctor will review and approve everything before diagnosis.
        </span>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendText} className="p-3 bg-slate-50 flex items-center gap-2">
        <button
          type="button"
          onClick={onStartMic}
          disabled={isListening || isProcessing}
          aria-label="Start mic"
          className="w-11 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your response here..."
          disabled={isListening || isProcessing}
          className="flex-1 bg-white border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:bg-slate-100"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Send}
          disabled={!inputText.trim() || isListening || isProcessing}
        >
          Send
        </Button>
      </form>
    </div>
  );
}

export default ConversationThread;
