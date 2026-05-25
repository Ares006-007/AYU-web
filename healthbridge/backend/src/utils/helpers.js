const { nanoid } = require('nanoid');

/**
 * Generate a unique HealthBridge patient Health ID.
 * Format: MED-{CITY3}-{YEAR}-{6CHAR_ALPHANUM}
 * Example: MED-HYD-2026-A3K9P7
 *
 * @param {string} city - Patient city name
 * @returns {string} Health ID
 */
function generateHealthId(city) {
  const cityCode = (city || 'GEN').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X');
  const year = new Date().getFullYear();
  // nanoid with uppercase alphanumeric charset
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MED-${cityCode}-${year}-${suffix}`;
}

/**
 * Normalize a phone number to E.164 format for India.
 * Accepts: 9876543210, 09876543210, +919876543210
 * Returns: +919876543210
 */
function normalizeIndianPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith('0')) return `+91${cleaned.slice(1)}`;
  return `+${cleaned}`; // fallback
}

/**
 * Format Indian date for display.
 * @param {Date|string} date
 * @returns {string} e.g. "Mon, 26 May 2026"
 */
function formatIndianDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

/**
 * Format amount in paise to INR display string.
 * @param {number} paise
 * @returns {string} e.g. "₹500"
 */
function formatINR(paise) {
  return `₹${(paise / 100).toFixed(0)}`;
}

module.exports = { generateHealthId, normalizeIndianPhone, formatIndianDate, formatINR };
