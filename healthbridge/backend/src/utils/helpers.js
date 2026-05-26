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
  const normalizedCity = (city || '').toLowerCase().trim();
  let cityCode = 'GEN';
  if (normalizedCity.includes('hyderabad') || normalizedCity.includes('secunderabad')) {
    cityCode = 'HYD';
  } else if (normalizedCity.includes('mumbai') || normalizedCity.includes('bombay')) {
    cityCode = 'MUM';
  } else if (normalizedCity.includes('delhi')) {
    cityCode = 'DEL';
  } else if (normalizedCity.includes('bengaluru') || normalizedCity.includes('bangalore')) {
    cityCode = 'BLR';
  } else if (normalizedCity.includes('chennai') || normalizedCity.includes('madras')) {
    cityCode = 'CHN';
  } else if (normalizedCity.includes('kolkata') || normalizedCity.includes('calcutta')) {
    cityCode = 'KOL';
  } else if (normalizedCity.includes('pune')) {
    cityCode = 'PUN';
  } else if (normalizedCity.includes('visakhapatnam') || normalizedCity.includes('vizag')) {
    cityCode = 'VZG';
  } else {
    cityCode = normalizedCity.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X');
    if (!cityCode) cityCode = 'GEN';
  }

  const year = new Date().getFullYear();
  // Exclude confusing characters: 0, O, 1, I
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
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
