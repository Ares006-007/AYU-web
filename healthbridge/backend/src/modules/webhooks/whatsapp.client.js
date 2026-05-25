const axios = require('axios');
const logger = require('../../utils/logger');

const META_API_VERSION = process.env.META_API_VERSION || 'v19.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * Send a plain text WhatsApp message.
 */
async function sendText(phoneNumberId, accessToken, to, text) {
  return _send(phoneNumberId, accessToken, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: text },
  });
}

/**
 * Send an interactive list or button message.
 * @param {Object} interactive - Meta interactive object
 */
async function sendInteractive(phoneNumberId, accessToken, to, interactive) {
  return _send(phoneNumberId, accessToken, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive,
  });
}

/**
 * Send a pre-approved template message.
 */
async function sendTemplate(phoneNumberId, accessToken, to, templateName, languageCode, components = []) {
  return _send(phoneNumberId, accessToken, {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}

async function _send(phoneNumberId, accessToken, payload) {
  try {
    const res = await axios.post(
      `${BASE_URL}/${phoneNumberId}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );
    return res.data;
  } catch (err) {
    const errData = err.response?.data;
    logger.error('WhatsApp send failed:', errData || err.message);
    throw err;
  }
}

module.exports = { sendText, sendInteractive, sendTemplate };
