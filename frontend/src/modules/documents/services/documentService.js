/**
 * documentService.js – Documents Module Services – Dev 3
 */

import api from "@/services/api.js";

/** POST /api/documents/upload */
export async function uploadDocument(file, patientId) {
  // TODO: Implement multipart form upload
  throw new Error("Not implemented");
}

/** POST /api/documents/:documentId/process */
export async function processDocument(documentId) {
  // TODO: Implement
  throw new Error("Not implemented");
}

/** GET /api/documents/:documentId */
export async function getDocument(documentId) {
  // TODO: Implement
  throw new Error("Not implemented");
}

/** GET /api/documents/patient/:patientId */
export async function getPatientDocuments(patientId) {
  // TODO: Implement
  throw new Error("Not implemented");
}
