/**
 * documentApi.js – Mock OCR extraction & document processing service.
 *
 * Handles both real File objects (from camera capture or file input) and
 * plain metadata stubs used in quick-preset demos.
 */

import { SAMPLE_DOCUMENTS } from "../data/mockDocumentData.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates a local object URL thumbnail from a real File, or falls back
 * to the sample thumbnail URL for stub metadata.
 */
function getThumbnailUrl(fileMeta, fallbackDoc) {
  // Real File or Blob – generate a browser-local preview URL
  if (fileMeta instanceof File || fileMeta instanceof Blob) {
    return URL.createObjectURL(fileMeta);
  }
  // Stub metadata – use the sample image
  return fallbackDoc.thumbnailUrl;
}

export const documentApi = {
  /**
   * Simulates staged document processing:
   * queued → reading (OCR scanning) → extracted / needs_check
   *
   * @param {File|{name:string, size:number}} fileMeta  Real File or stub object
   * @param {(status:string)=>void}           onStatusChange  Progress callback
   */
  processDocument: async (fileMeta, onStatusChange) => {
    // Stage 1: Queued
    onStatusChange("queued");
    await delay(600);

    // Stage 2: Reading (OCR in progress)
    onStatusChange("reading");
    await delay(1600);

    // Stage 3: OCR Complete – pick sample data based on file name heuristic
    const name = fileMeta?.name?.toLowerCase() ?? "";
    const isClean =
      name.includes("prescription") ||
      name.includes("kiosk_scan") ||   // camera captures always try "clean"
      (!name.includes("blood") && !name.includes("lab") && Math.random() > 0.4);

    const sampleDoc = isClean ? SAMPLE_DOCUMENTS[0] : SAMPLE_DOCUMENTS[1];

    // Deep-clone to avoid mutating the shared mock data
    const resultDoc = JSON.parse(JSON.stringify(sampleDoc));

    resultDoc.id = `doc-${Date.now()}`;
    resultDoc.fileName = fileMeta?.name || sampleDoc.fileName;
    resultDoc.fileSize =
      fileMeta?.size != null
        ? `${(fileMeta.size / 1024 / 1024).toFixed(1)} MB`
        : sampleDoc.fileSize;
    resultDoc.uploadTime = "Just now";

    // Use real object-URL preview for camera captures / file uploads
    resultDoc.thumbnailUrl = getThumbnailUrl(fileMeta, sampleDoc);

    onStatusChange(resultDoc.status);
    return resultDoc;
  },
};
