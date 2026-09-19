/**
 * documentApi.js – Mock OCR extraction & document processing service.
 */

import { SAMPLE_DOCUMENTS } from "../data/mockDocumentData.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const documentApi = {
  /**
   * Simulates staged document processing:
   * queued -> reading (OCR scanning) -> extracted / needs_check
   */
  processDocument: async (fileMeta, onStatusChange) => {
    // Stage 1: Queued
    onStatusChange("queued");
    await delay(600);

    // Stage 2: Reading (OCR in progress)
    onStatusChange("reading");
    await delay(1600);

    // Stage 3: OCR Complete
    const isClean = fileMeta.name?.toLowerCase().includes("prescription") || Math.random() > 0.5;
    const resultDoc = isClean ? { ...SAMPLE_DOCUMENTS[0] } : { ...SAMPLE_DOCUMENTS[1] };
    
    resultDoc.id = `doc-${Date.now()}`;
    resultDoc.fileName = fileMeta.name || resultDoc.fileName;
    resultDoc.fileSize = fileMeta.size ? `${(fileMeta.size / 1024 / 1024).toFixed(1)} MB` : resultDoc.fileSize;

    onStatusChange(resultDoc.status);
    return resultDoc;
  },
};
