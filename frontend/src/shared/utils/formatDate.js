/**
 * formatDate.js – Date formatting utilities.
 *
 * Centralised date/time formatting for consistent display across the app.
 * Uses the Intl.DateTimeFormat API — no external library required.
 */

/**
 * Format a date to a human-readable string.
 * @param {string|Date} date
 * @param {string} locale – e.g. 'en-IN'
 * @returns {string}
 */
export function formatDate(date, locale = "en-IN") {
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a date with time.
 * @param {string|Date} date
 * @param {string} locale
 * @returns {string}
 */
export function formatDateTime(date, locale = "en-IN") {
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Return a relative time string like "2 hours ago".
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];
  for (const unit of units) {
    const count = Math.floor(seconds / unit.seconds);
    if (count >= 1) {
      return `${count} ${unit.label}${count !== 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}
