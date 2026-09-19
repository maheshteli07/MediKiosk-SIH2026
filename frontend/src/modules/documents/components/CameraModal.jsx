/**
 * CameraModal.jsx – Simulated kiosk camera document scanner.
 */

import React, { useState } from "react";
import { Camera, RefreshCcw, Check, X } from "lucide-react";
import Modal from "@/shared/components/Modal.jsx";
import Button from "@/shared/components/Button.jsx";

function CameraModal({ isOpen, onClose, onCapture }) {
  const [hasCaptured, setHasCaptured] = useState(false);

  const handleSnap = () => {
    setHasCaptured(true);
  };

  const handleRetake = () => {
    setHasCaptured(false);
  };

  const handleConfirm = () => {
    onCapture({
      name: `Kiosk_Scan_${Date.now()}.jpg`,
      size: 1540000,
      type: "image/jpeg",
    });
    setHasCaptured(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kiosk Document Scanner" size="lg">
      <div className="space-y-4">
        {/* Camera Viewfinder */}
        <div className="relative w-full h-72 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-primary-500 shadow-inner">
          {hasCaptured ? (
            <img
              src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80"
              alt="Captured Document"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-white px-4">
              {/* Document Alignment Frame Overlay */}
              <div className="absolute inset-6 border-2 border-dashed border-primary-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-xs uppercase tracking-widest text-primary-300 font-semibold bg-primary-950/80 px-3 py-1 rounded-full">
                  Align Prescription / Report Inside Frame
                </span>
              </div>
              <Camera className="w-12 h-12 mx-auto mb-2 text-primary-400 animate-pulse" />
              <p className="text-sm font-medium">Position document on the scanner glass</p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {hasCaptured ? (
            <>
              <Button variant="secondary" size="md" icon={RefreshCcw} onClick={handleRetake}>
                Retake Photo
              </Button>
              <Button variant="primary" size="md" icon={Check} onClick={handleConfirm}>
                Confirm & Extract OCR
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" icon={Camera} onClick={handleSnap}>
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
