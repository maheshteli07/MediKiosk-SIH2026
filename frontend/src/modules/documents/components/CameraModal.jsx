/**
 * CameraModal.jsx – Real kiosk camera document scanner using getUserMedia.
 *
 * Flow:
 *   1. On open → requests camera permission & streams live video into <video>
 *   2. On "Capture" → draws current frame to <canvas>, shows preview image
 *   3. On "Confirm" → converts canvas to a Blob/File, calls onCapture() for OCR
 *   4. On close / retake → stops all camera tracks cleanly
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCcw, Check, AlertCircle, Loader2 } from "lucide-react";
import Modal from "@/shared/components/Modal.jsx";
import Button from "@/shared/components/Button.jsx";

// ── Utility: stop all tracks on a MediaStream ─────────────────────────────
function stopStream(stream) {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
  }
}

function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState("idle"); // idle | starting | live | captured | error
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Start camera when modal opens ──────────────────────────────────────
  const startCamera = useCallback(async () => {
    setPhase("starting");
    setErrorMsg("");
    setCapturedDataUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // rear camera on mobile/kiosk
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setPhase("live");
    } catch (err) {
      console.error("Camera error:", err);
      let msg = "Camera access denied or unavailable.";
      if (err.name === "NotAllowedError") {
        msg = "Camera permission denied. Please allow camera access and try again.";
      } else if (err.name === "NotFoundError") {
        msg = "No camera found on this device.";
      } else if (err.name === "NotReadableError") {
        msg = "Camera is already in use by another application.";
      }
      setErrorMsg(msg);
      setPhase("error");
    }
  }, []);

  // ── Stop camera ────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // ── Lifecycle: start on open, stop on close ────────────────────────────
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setPhase("idle");
      setCapturedDataUrl(null);
      setErrorMsg("");
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  // ── Capture current frame ──────────────────────────────────────────────
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Match canvas to the actual video resolution
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedDataUrl(dataUrl);
    stopCamera(); // release camera while showing preview
    setPhase("captured");
  };

  // ── Retake: restart the camera ─────────────────────────────────────────
  const handleRetake = () => {
    setCapturedDataUrl(null);
    startCamera();
  };

  // ── Confirm: pass real File blob to parent ─────────────────────────────
  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const fileName = `Kiosk_Scan_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: "image/jpeg" });
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.92
    );
  };

  // ── Close handler (also stops camera) ─────────────────────────────────
  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Kiosk Document Scanner" size="lg">
      <div className="space-y-4">

        {/* ── Viewfinder ─────────────────────────────────────────────────── */}
        <div className="relative w-full h-72 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-primary-500 shadow-inner">

          {/* Live video stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              phase === "live" ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Captured image preview */}
          {phase === "captured" && capturedDataUrl && (
            <img
              src={capturedDataUrl}
              alt="Captured Document"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Alignment overlay (shown while live) */}
          {phase === "live" && (
            <div className="absolute inset-6 border-2 border-dashed border-primary-400/80 rounded-xl pointer-events-none flex flex-col items-center justify-end pb-3">
              {/* Corner brackets */}
              <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-300 rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary-300 rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary-300 rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary-300 rounded-br-lg" />
              <span className="text-[11px] uppercase tracking-widest text-primary-300 font-semibold bg-slate-900/70 px-3 py-1 rounded-full">
                Align Prescription / Report Inside Frame
              </span>
            </div>
          )}

          {/* Capture flash animation overlay */}
          {phase === "captured" && (
            <div className="absolute inset-0 bg-white animate-ping opacity-0 duration-100 pointer-events-none" />
          )}

          {/* Starting spinner */}
          {phase === "starting" && (
            <div className="flex flex-col items-center gap-3 text-white">
              <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
              <p className="text-sm font-medium">Starting camera…</p>
            </div>
          )}

          {/* Error state */}
          {phase === "error" && (
            <div className="flex flex-col items-center gap-3 text-center px-6 text-white">
              <AlertCircle className="w-10 h-10 text-danger-400" />
              <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
              <button
                onClick={startCamera}
                className="text-xs font-semibold text-primary-300 underline underline-offset-4 hover:text-primary-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Idle / initial */}
          {phase === "idle" && (
            <div className="flex flex-col items-center gap-2 text-white">
              <Camera className="w-12 h-12 text-primary-400 animate-pulse" />
              <p className="text-sm font-medium">Opening camera…</p>
            </div>
          )}
        </div>

        {/* ── Controls ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-1">
          {phase === "captured" ? (
            <>
              <Button variant="secondary" size="md" icon={RefreshCcw} onClick={handleRetake}>
                Retake
              </Button>
              <Button variant="primary" size="md" icon={Check} onClick={handleConfirm}>
                Confirm &amp; Extract OCR
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="md" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Camera}
                onClick={handleCapture}
                disabled={phase !== "live"}
              >
                Capture Document Photo
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CameraModal;
