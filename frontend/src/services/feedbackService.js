/**
 * feedbackService.js – Client-side storage and management of post-visit patient feedback.
 *
 * Uses localStorage with seeded mock feedback for rich demonstration.
 * In production, this can seamlessly delegate to a backend REST API.
 */

const STORAGE_KEY = "medikiosk_patient_feedback";

// Initial seed data so the doctor portal immediately displays realistic metrics
const SEED_FEEDBACK = [
  {
    id: "fb-001",
    caseId: "c1",
    patientId: "P-2026-8841",
    patientName: "Ramesh Chandra",
    rating: 5,
    comment: "The AI kiosk was very quick and understood my Hindi and English symptoms accurately. Dr. Mehta was excellent.",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
  },
  {
    id: "fb-002",
    caseId: "c2",
    patientId: "P-2026-7732",
    patientName: "Sunita Sharma",
    rating: 5,
    comment: "Very smooth intake process. Saved me nearly an hour in the waiting room.",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
  },
  {
    id: "fb-003",
    caseId: "c3",
    patientId: "P-2026-6621",
    patientName: "Vikram Malhotra",
    rating: 4,
    comment: "Easy touch screen. Would be even better if blood pressure cuff sync was automated.",
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(), // Yesterday
  },
  {
    id: "fb-004",
    caseId: "c4",
    patientId: "P-2026-5510",
    patientName: "Ananya Iyer",
    rating: 5,
    comment: "Doctor had all my history ready on screen before I sat down. Great consultation!",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
  },
  {
    id: "fb-005",
    caseId: "c5",
    patientId: "P-2026-4409",
    patientName: "Harpreet Singh",
    rating: 4,
    comment: "Clear instructions and prescription was printed instantly.",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
  },
];

function initStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_FEEDBACK));
    return SEED_FEEDBACK;
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
    console.error("Failed to parse stored feedback, reinitializing", e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_FEEDBACK));
    return SEED_FEEDBACK;
  }
}

export const feedbackService = {
  /**
   * Retrieves all patient feedback entries, ordered newest first.
   */
  getAllFeedback: () => {
    const list = initStorage();
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Submits a new post-visit feedback entry.
   */
  submitFeedback: ({ caseId, patientId, patientName, rating, comment }) => {
    const list = initStorage();
    const newEntry = {
      id: `fb-${Date.now()}`,
      caseId: caseId || "c-direct",
      patientId: patientId || "Walk-in Patient",
      patientName: patientName || "Anonymous Patient",
      rating: Number(rating) || 5,
      comment: (comment || "").trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  },

  /**
   * Returns aggregated statistics: average rating, total count, and distribution.
   */
  getFeedbackStats: () => {
    const list = initStorage();
    if (!list.length) {
      return {
        averageRating: 0,
        totalCount: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const totalCount = list.length;
    const sum = list.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const averageRating = (sum / totalCount).toFixed(1);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    list.forEach((item) => {
      const r = item.rating || 5;
      if (distribution[r] !== undefined) {
        distribution[r]++;
      }
    });

    return {
      averageRating: parseFloat(averageRating),
      totalCount,
      distribution,
    };
  },

  /**
   * Returns recent feedback items up to the limit.
   */
  getRecentFeedback: (limit = 10) => {
    return feedbackService.getAllFeedback().slice(0, limit);
  },
};

export default feedbackService;
