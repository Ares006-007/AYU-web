const express = require('express');
const Razorpay = require('razorpay');
const { z } = require('zod');
const { query } = require('../../db/pool');
const { authenticate, requireRole, scopeToHospital } = require('../../middleware/auth');
const { auditMiddleware, writeAuditLog } = require('../../utils/audit');
const { sendText } = require('../webhooks/whatsapp.client');
const { AppError } = require('../../middleware/errorHandler');
const { formatINR } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const router = express.Router();
router.use(authenticate, scopeToHospital, auditMiddleware);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaymentSchema = z.object({
  appointmentId: z.string().uuid(),
  amountPaise: z.number().int().positive(),
  description: z.string().optional(),
});

/**
 * POST /api/payments/create-link
 * Create a Razorpay payment link and send to patient via WhatsApp.
 */
router.post('/create-link', requireRole('receptionist', 'hospital_admin'), async (req, res, next) => {
  try {
    const { appointmentId, amountPaise, description } = createPaymentSchema.parse(req.body);
    const hospitalId = req.hospitalId || req.user.hospital_id;

    // Load appointment info
    const apptResult = await query(
      `SELECT a.patient_id, a.booking_phone, a.appointment_date,
              p.full_name as patient_name, p.health_id,
              d.full_name as doctor_name,
              h.name as hospital_name, h.wa_phone_number_id
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       JOIN hospitals h ON h.id = a.hospital_id
       WHERE a.id = $1 AND a.hospital_id = $2`,
      [appointmentId, hospitalId]
    );

    if (!apptResult.rows.length) throw new AppError('Appointment not found', 404);

    const appt = apptResult.rows[0];

    // Check if unpaid
    const existingPay = await query(
      `SELECT id, status FROM payments WHERE appointment_id = $1 AND status IN ('pending','link_sent')`,
      [appointmentId]
    );
    if (existingPay.rows.length) {
      throw new AppError('A payment link is already active for this appointment', 409);
    }

    // Create Razorpay payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount: amountPaise,
      currency: 'INR',
      description: description || `Consultation — ${appt.doctor_name}`,
      customer: {
        name: appt.patient_name,
        contact: appt.booking_phone.replace('+', ''),
      },
      notify: { sms: false, email: false }, // We handle WhatsApp notification ourselves
      reminder_enable: false,
      notes: {
        appointment_id: appointmentId,
        patient_health_id: appt.health_id,
        hospital_name: appt.hospital_name,
      },
      callback_url: `${process.env.API_BASE_URL}/api/webhooks/razorpay`,
      callback_method: 'get',
    });

    // Save to DB
    const payResult = await query(
      `INSERT INTO payments
         (appointment_id, patient_id, hospital_id, razorpay_payment_link_id,
          amount_paise, currency, description, payment_link_url, status, link_sent_at)
       VALUES ($1, $2, $3, $4, $5, 'INR', $6, $7, 'link_sent', NOW())
       RETURNING id`,
      [appointmentId, appt.patient_id, hospitalId, paymentLink.id,
       amountPaise, description || `Consultation — ${appt.doctor_name}`, paymentLink.short_url]
    );

    // Send WhatsApp message
    const dateStr = new Date(appt.appointment_date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    await sendText(
      appt.wa_phone_number_id,
      process.env.WHATSAPP_ACCESS_TOKEN,
      appt.booking_phone,
      `💳 *Payment Due — ${appt.hospital_name}*\n\n👤 ${appt.patient_name}\n🗓 Visit: ${dateStr}\n👨‍⚕️ Dr. ${appt.doctor_name}\n💰 Amount: *${formatINR(amountPaise)}*\n\n👇 Pay securely via UPI, Card, or Net Banking:\n${paymentLink.short_url}\n\n🔒 Powered by Razorpay. 100% secure.\nThis link expires in *7 days*.\n\nReply *PAID* if you've already paid at the clinic.`
    );

    await req.auditLog({
      action: 'create',
      entityType: 'payment',
      entityId: payResult.rows[0].id,
      description: `Payment link created: ${formatINR(amountPaise)} for appointment ${appointmentId}`,
    });

    res.json({
      success: true,
      paymentId: payResult.rows[0].id,
      paymentLinkUrl: paymentLink.short_url,
      amount: formatINR(amountPaise),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payments
 * List payments for hospital, optionally filter by status.
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const conditions = ['pay.hospital_id = $1'];
    const params = [hospitalId];

    if (status) { params.push(status); conditions.push(`pay.status = $${params.length}`); }
    if (date) { params.push(date); conditions.push(`a.appointment_date = $${params.length}`); }

    const result = await query(
      `SELECT pay.id, pay.amount_paise, pay.status, pay.link_sent_at, pay.paid_at,
              pay.payment_link_url, pay.razorpay_payment_id,
              p.full_name as patient_name, p.health_id,
              d.full_name as doctor_name,
              a.appointment_date, a.token_number
       FROM payments pay
       JOIN appointments a ON a.id = pay.appointment_id
       JOIN patients p ON p.id = pay.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY pay.created_at DESC
       LIMIT 100`,
      params
    );

    res.json({ success: true, payments: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payments/summary
 * Payment summary stats for dashboard.
 */
router.get('/summary', async (req, res, next) => {
  try {
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
         COALESCE(SUM(amount_paise) FILTER (WHERE status = 'paid'), 0) as total_collected_paise,
         COUNT(*) FILTER (WHERE status IN ('pending', 'link_sent')) as pending_count,
         COALESCE(SUM(amount_paise) FILTER (WHERE status IN ('pending', 'link_sent')), 0) as pending_paise
       FROM payments
       WHERE hospital_id = $1
         AND created_at >= CURRENT_DATE`,
      [hospitalId]
    );

    const row = result.rows[0];
    res.json({
      success: true,
      today: {
        paidCount: parseInt(row.paid_count),
        totalCollected: `₹${(parseInt(row.total_collected_paise) / 100).toFixed(0)}`,
        pendingCount: parseInt(row.pending_count),
        pendingAmount: `₹${(parseInt(row.pending_paise) / 100).toFixed(0)}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
