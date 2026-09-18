/**
 * validation.js – Shared form validation utilities.
 *
 * Pure functions that return true if valid, or an error string if invalid.
 * Used across patient, doctor, and form components.
 */

/**
 * Validate a 10-digit Indian mobile number.
 * @param {string} phone
 * @returns {true|string}
 */
export function validatePhone(phone) {
  if (!phone) return "Phone number is required.";
  if (!/^[6-9]\d{9}$/.test(phone.replace(/\s+/g, "")))
    return "Enter a valid 10-digit Indian mobile number.";
  return true;
}

/**
 * Validate Aadhaar number (12 digits).
 * @param {string} aadhaar
 * @returns {true|string}
 */
export function validateAadhaar(aadhaar) {
  if (!aadhaar) return "Aadhaar number is required.";
  if (!/^\d{12}$/.test(aadhaar.replace(/\s+/g, "")))
    return "Aadhaar must be exactly 12 digits.";
  return true;
}

/**
 * Validate ABHA (Ayushman Bharat Health Account) ID.
 * Format: 14-digit number or xx-xxxx-xxxx-xxxx
 * @param {string} abha
 * @returns {true|string}
 */
export function validateABHA(abha) {
  if (!abha) return "ABHA ID is required.";
  const cleaned = abha.replace(/-/g, "");
  if (!/^\d{14}$/.test(cleaned)) return "Enter a valid 14-digit ABHA ID.";
  return true;
}

/**
 * Validate that a required text field is non-empty.
 * @param {string} value
 * @param {string} fieldName
 * @returns {true|string}
 */
export function validateRequired(value, fieldName = "This field") {
  if (!value || !String(value).trim()) return `${fieldName} is required.`;
  return true;
}

/**
 * Validate age (1–120).
 * @param {number|string} age
 * @returns {true|string}
 */
export function validateAge(age) {
  const n = Number(age);
  if (!age && age !== 0) return "Age is required.";
  if (!Number.isInteger(n) || n < 1 || n > 120)
    return "Age must be between 1 and 120.";
  return true;
}
