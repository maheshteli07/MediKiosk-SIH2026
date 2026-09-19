/**
 * speechService.js – Client-side Speech Recognition & Audio Capture
 * =================================================================
 * Provides real-time speech-to-text using:
 * 1. Web Speech API (SpeechRecognition / webkitSpeechRecognition) for instant
 *    live words streaming directly in the UI.
 * 2. MediaRecorder audio capture with automatic fallback to NVIDIA Riva Whisper
 *    backend transcription (/api/speech/transcribe).
 */

import { conversationApi } from "./conversationApi.js";

const LANG_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  kn: "kn-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  ur: "ur-IN",
};

export class SpeechRecognitionSession {
  constructor({ lang = "en", onInterim, onFinal, onError, onStart, onEnd }) {
    this.lang = lang;
    this.onInterim = onInterim;
    this.onFinal = onFinal;
    this.onError = onError;
    this.onStart = onStart;
    this.onEnd = onEnd;

    this.recognition = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isListening = false;
    this.accumulatedText = "";
  }

  async start() {
    this.isListening = true;
    this.accumulatedText = "";
    this.audioChunks = [];

    const speechLang = LANG_MAP[this.lang] || this.lang || "en-IN";
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    // 1. Try starting Web Speech API for real-time live typing feedback
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = speechLang;

        rec.onstart = () => {
          if (this.onStart) this.onStart();
        };

        rec.onresult = (event) => {
          let interim = "";
          let final = "";

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            const transcript = res[0].transcript;
            if (res.isFinal) {
              final += transcript + " ";
            } else {
              interim += transcript;
            }
          }

          const currentFull = (final + interim).trim();
          this.accumulatedText = (final || currentFull).trim();

          if (this.onInterim) {
            this.onInterim(currentFull);
          }
        };

        rec.onerror = (err) => {
          console.warn("[Speech] Web Speech API event error:", err.error);
          if (err.error === "not-allowed") {
            if (this.onError) this.onError("Microphone permission denied. Please allow microphone access in your browser.");
          }
        };

        rec.onend = () => {
          if (this.isListening) {
            // Auto restart if still marked listening (e.g. Chrome 60s pause)
            try {
              rec.start();
            } catch {}
          } else {
            if (this.onEnd) this.onEnd();
          }
        };

        rec.start();
        this.recognition = rec;
      } catch (err) {
        console.warn("[Speech] Could not initialize Web Speech API, using audio fallback:", err);
      }
    }

    // 2. Also start MediaStream recorder to send actual audio to NVIDIA Riva if needed
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.stream = stream;

        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/ogg")
          ? "audio/ogg"
          : "audio/wav";

        const recorder = new MediaRecorder(stream, { mimeType });
        this.mediaRecorder = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };

        recorder.start(250);
        if (!this.recognition && this.onStart) {
          this.onStart();
        }
      }
    } catch (micErr) {
      console.warn("[Speech] MediaDevices getUserMedia error:", micErr);
      if (!this.recognition && this.onError) {
        this.onError("Could not access microphone. Please check permissions or type your symptoms.");
      }
    }
  }

  async stop() {
    this.isListening = false;

    // Stop Web Speech API
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }

    // Stop Media Recorder and tracks
    let audioBlob = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      await new Promise((resolve) => {
        this.mediaRecorder.onstop = () => {
          const type = this.mediaRecorder.mimeType || "audio/webm";
          audioBlob = new Blob(this.audioChunks, { type });
          resolve();
        };
        try {
          this.mediaRecorder.stop();
        } catch {
          resolve();
        }
      });
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.onEnd) this.onEnd();

    // If Web Speech already gave us text, return it immediately
    const recognizedText = (this.accumulatedText || "").trim();
    if (recognizedText) {
      if (this.onFinal) this.onFinal(recognizedText);
      return recognizedText;
    }

    // Fallback: If Web Speech was silent or unsupported, transcribe via NVIDIA Riva backend
    if (audioBlob && audioBlob.size > 1000) {
      if (this.onInterim) this.onInterim("Transcribing via NVIDIA Riva Whisper...");
      try {
        const serverTranscript = await conversationApi.transcribeAudio(audioBlob, this.lang);
        if (serverTranscript) {
          if (this.onFinal) this.onFinal(serverTranscript);
          return serverTranscript;
        }
      } catch (err) {
        console.warn("[Speech] Backend transcribe error:", err);
      }
    }

    return "";
  }
}
