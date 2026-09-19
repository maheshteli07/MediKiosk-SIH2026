/**
 * UploadZone.jsx – Kiosk drag-and-drop document uploader with camera capture CTA.
 */

import React, { useRef } from "react";
import { Upload, Camera, FileText, Sparkles, Image as ImageIcon } from "lucide-react";
import Button from "@/shared/components/Button.jsx";

function UploadZone({ onFilesSelected, onOpenCameraModal }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="bg-white border-2 border-dashed border-primary-300 hover:border-primary-500 rounded-3xl p-8 text-center transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4 border border-primary-100 shadow-sm">
        <Upload className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Upload or Scan Medical Documents
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
        Prescriptions, blood test reports, discharge summaries, or X-ray reports.
        Supports JPG, PNG, and PDF files.
      </p>

      {/* Dual CTA Bar for Kiosk */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <Button
          variant="primary"
          size="lg"
          icon={Camera}
          onClick={onOpenCameraModal}
          fullWidth
        >
          Scan with Kiosk Camera
        </Button>
        <Button
          variant="secondary"
          size="lg"
          icon={FileText}
          onClick={() => fileInputRef.current?.click()}
          fullWidth
        >
          Browse Files
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400 border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Images (JPG, PNG)
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-slate-400" /> PDF Documents
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="flex items-center gap-1 text-primary-700 font-medium">
          <Sparkles className="w-3.5 h-3.5" /> AI OCR Extraction
        </span>
      </div>
    </div>
  );
}

export default UploadZone;
