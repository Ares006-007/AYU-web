const express = require('express');
const crypto = require('crypto');
const { handleMessage } = require('./fsm.handler');
const { query } = require('../../db/pool');
const { normalizeIndianPhone } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const router = express.Router();

// ── GET: WhatsApp webhook verification (Meta challenge) ──────
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified successfully');
    return res.status(200).send(challenge);
  }

  logger.warn('WhatsApp webhook verification failed', { mode, token });
  res.status(403).json({ error: 'Forbidden' });
});

// ── POST: Incoming WhatsApp messages ─────────────────────────
router.post('/whatsapp', async (req, res) => {
  // Verify Meta signature
  const signature = req.headers['x-hub-signature-256'];
  if (!verifyMetaSignature(req.body, signature)) {
    logger.warn('Invalid Meta webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Immediately respond 200 — Meta requires fast ACK
  res.status(200).json({ status: 'ok' });

  // Process asynchronously
  try {
    const body = JSON.parse(req.body.toString());
    if (body.object !== 'whatsapp_business_account') return;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        // Lookup hospital by WhatsApp phone_number_id
        const hospResult = await query(
          'SELECT id FROM hospitals WHERE wa_phone_number_id = $1 AND is_active = TRUE',
          [phoneNumberId]
        );
        if (!hospResult.rows.length) {
          logger.warn(`No hospital found for phone_number_id: ${phoneNumberId}`);
          continue;
        }
        const hospitalId = hospResult.rows[0].id;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        for (const msg of value.messages || []) {
          if (msg.type !== 'text' && msg.type !== 'interactive') continue;

          const from = normalizeIndianPhone(msg.from);
          const text = msg.type === 'text'
            ? msg.text?.body || ''
            : extractInteractiveText(msg.interactive);

          await handleMessage({ from, message: text, phoneNumberId, accessToken, hospitalId });
        }
      }
    }
  } catch (err) {
    logger.error('Webhook processing error:', err);
  }
});

// ── POST: Razorpay payment webhook ───────────────────────────
router.post('/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = req.body.toString();

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSig) {
    logger.warn('Invalid Razorpay webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  res.status(200).json({ status: 'ok' });

  try {
    const event = JSON.parse(body);
    if (event.event === 'payment_link.paid') {
      const paymentLinkId = event.payload.payment_link?.entity?.id;
      const razorpayPaymentId = event.payload.payment?.entity?.id;

      await query(
        `UPDATE payments SET status = 'paid', paid_at = NOW(), razorpay_payment_id = $1
         WHERE razorpay_payment_link_id = $2`,
        [razorpayPaymentId, paymentLinkId]
      );

      // Notify patient via WhatsApp
      const payment = await query(
        `SELECT p.booking_phone, p.appointment_date, d.full_name as doctor_name,
                pay.amount_paise, h.wa_phone_number_id, h.name as hospital_name
         FROM payments pay
         JOIN appointments p ON p.id = pay.appointment_id
         JOIN doctors d ON d.id = p.doctor_id
         JOIN hospitals h ON h.id = pay.hospital_id
         WHERE pay.razorpay_payment_link_id = $1`,
        [paymentLinkId]
      );

      if (payment.rows.length) {
        const row = payment.rows[0];
        const { sendText } = require('./whatsapp.client');
        const amount = `₹${(row.amount_paise / 100).toFixed(0)}`;
        await sendText(row.wa_phone_number_id, process.env.WHATSAPP_ACCESS_TOKEN, row.booking_phone,
          `✅ *Payment Received! Thank you.*\n\n💰 ${amount} paid successfully\n🏥 ${row.hospital_name}\n👨‍⚕️ Dr. ${row.doctor_name}\n\nYour receipt has been recorded. 🙏`
        );
      }
    }
  } catch (err) {
    logger.error('Razorpay webhook processing error:', err);
  }
});

// ── Helpers ──────────────────────────────────────────────────

function verifyMetaSignature(rawBody, signatureHeader) {
  if (!signatureHeader || !process.env.META_APP_SECRET) return true; // skip in dev
  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.META_APP_SECRET)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}

function extractInteractiveText(interactive) {
  if (!interactive) return '';
  if (interactive.type === 'button_reply') return interactive.button_reply?.title || '';
  if (interactive.type === 'list_reply') return interactive.list_reply?.title || '';
  return '';
}

module.exports = router;
