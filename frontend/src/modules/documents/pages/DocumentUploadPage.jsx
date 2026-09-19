/**
 * DocumentUploadPage.jsx – Prescriptions, lab reports, & scan document uploader with AI OCR.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight, FileCheck, Sparkles, Plus, FileSpreadsheet } from "lucide-react";
import PatientShell from "@/shared/components/PatientShell.jsx";
import Button from "@/shared/components/Button.jsx";

import UploadZone from "../components/UploadZone.jsx";
import CameraModal from "../components/CameraModal.jsx";
import ProcessingState from "../components/ProcessingState.jsx";
import ExtractedDocumentCard from "../components/ExtractedDocumentCard.jsx";

import { documentApi } from "../services/documentApi.js";
import { SAMPLE_DOCUMENTS } from "../data/mockDocumentData.js";

function DocumentUploadPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFilesSelected = async (files) => {
    const newQueueItems = files.map((f, i) => ({
      id: `queue-${Date.now()}-${i}`,
      fileName: f.name,
      fileSize: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      status: "queued",
    }));

    setProcessingQueue((prev) => [...prev, ...newQueueItems]);

    // Process each file through mock API
    for (let i = 0; i < files.length; i++) {
      const queueId = newQueueItems[i].id;

      const processedDoc = await documentApi.processDocument(files[i], (newStatus) => {
        setProcessingQueue((prev) =>
          prev.map((item) => (item.id === queueId ? { ...item, status: newStatus } : item))
        );
      });

      setDocuments((prev) => [processedDoc, ...prev]);
    }
  };

  // Quick Preset Handlers for Demo Testing
  const handleLoadPresetClean = async () => {
    handleFilesSelected([{ name: "Prescription_Dr_Sharma.jpg", size: 1850000 }]);
  };

  const handleLoadPresetFlagged = async () => {
    handleFilesSelected([{ name: "Blood_Test_Metropolis.pdf", size: 2450000 }]);
  };

  return (
    <PatientShell showProgress step={6} totalSteps={6} centerContent={false}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            AI Document Reader (OCR)
          </div>
          <h1 className="text-2xl font-extrabold text-brand-slate tracking-tight">
            Upload Old Prescriptions & Lab Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Step 6 of 6 — Upload past medical records for your doctor to review.
          </p>
        </div>

        {documents.length > 0 && (
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={() => navigate("/clinical/summary")}
          >
            Finish & Review Summary
          </Button>
        )}
      </div>

      {/* Main Upload Zone */}
      <div className="mb-6">
        <UploadZone
          onFilesSelected={handleFilesSelected}
          onOpenCameraModal={() => setIsCameraOpen(true)}
        />
      </div>

      {/* Demo Preset Bar */}
      <div className="flex items-center justify-center gap-3 bg-slate-100 p-3 rounded-2xl mb-6 text-xs">
        <span className="font-semibold text-slate-600">Quick Test Presets:</span>
        <button
          onClick={handleLoadPresetClean}
          className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-primary-700 shadow-sm transition-colors"
        >
          + Load Clean Prescription
        </button>
        <button
          onClick={handleLoadPresetFlagged}
          className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-amber-700 shadow-sm transition-colors"
        >
          + Load Lab Report (Needs Check)
        </button>
      </div>

      {/* Processing Queue Status */}
      {processingQueue.length > 0 && (
        <div className="mb-6">
          <ProcessingState files={processingQueue} />
        </div>
      )}

      {/* Extracted Document Cards */}
      {documents.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-success-600" />
            Extracted Records ({documents.length})
          </h2>
          {documents.map((doc) => (
            <ExtractedDocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        /* Friendly Inviting Empty State */
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1">
            No medical documents added yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Uploading previous prescriptions helps your doctor make faster and more accurate clinical decisions.
          </p>
          <Button
            variant="ghost"
            size="sm"
            icon={Plus}
            onClick={() => handleLoadPresetClean()}
          >
            Try sample prescription
          </Button>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(fileMeta) => handleFilesSelected([fileMeta])}
      />
    </PatientShell>
  );
}

export default DocumentUploadPage;
