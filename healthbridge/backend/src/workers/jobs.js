const Bull = require('bull');
const { query } = require('../../db/pool');
const { getCurrentToken, getRedis } = require('../../db/redis');
const { sendText } = require('../webhooks/whatsapp.client');
const { writeAuditLog } = require('../../utils/audit');
const logger = require('../../utils/logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const ALERT_AHEAD = parseInt(process.env.QUEUE_ALERT_AHEAD_TOKENS) || 3;

// Bull queue for alert jobs
const queueAlertQueue = new Bull('queue-alerts', REDIS_URL);
const paymentReminderQueue = new Bull('payment-reminders', REDIS_URL);
const appointmentReminderQueue = new Bull('appointment-reminders', REDIS_URL);

// ── Queue Alert Worker ────────────────────────────────────────

queueAlertQueue.process(async (job) => {
  logger.debug('[Worker] Processing queue alert scan');

  try {
    // Find all active queues today
    const activeDoctors = await query(
      `SELECT DISTINCT qt.doctor_id, qt.hospital_id, qt.queue_date::text
       FROM queue_tokens qt
       WHERE qt.queue_date = CURRENT_DATE
         AND qt.status = 'waiting'
         AND qt.alert_sent = FALSE`
    );

    for (const { doctor_id, hospital_id, queue_date } of activeDoctors.rows) {
      const currentToken = await getCurrentToken(doctor_id, queue_date);
      if (!currentToken) continue;

      // Find patients whose token is within ALERT_AHEAD of current
      const alertTargets = await query(
        `SELECT qt.id, qt.token_number, qt.appointment_id,
                a.booking_phone, h.wa_phone_number_id, h.name as hospital_name,
                d.full_name as doctor_name
         FROM queue_tokens qt
         JOIN appointments a ON a.id = qt.appointment_id
         JOIN hospitals h ON h.id = qt.hospital_id
         JOIN doctors d ON d.id = qt.doctor_id
         WHERE qt.doctor_id = $1
           AND qt.hospital_id = $2
           AND qt.queue_date = $3
           AND qt.status = 'waiting'
           AND qt.alert_sent = FALSE
           AND qt.token_number > $4
           AND qt.token_number <= $4 + $5`,
        [doctor_id, hospital_id, queue_date, currentToken, ALERT_AHEAD]
      );

      for (const target of alertTargets.rows) {
        try {
          await sendText(
            target.wa_phone_number_id,
            process.env.WHATSAPP_ACCESS_TOKEN,
            target.booking_phone,
            `🔔 *Queue Alert — ${target.hospital_name}*\n\n👨‍⚕️ Dr. ${target.doctor_name}\n🎫 Your Token: *#${target.token_number}*\n⏳ Currently serving: Token *#${currentToken}*\n\n*Your turn is approaching!* Please make your way to the clinic now.\n\nReply *STATUS* to check your position.`
          );

          await query(
            `UPDATE queue_tokens SET alert_sent = TRUE WHERE id = $1`,
            [target.id]
          );

          await writeAuditLog({
            actorType: 'system',
            action: 'send',
            entityType: 'queue_token',
            entityId: target.id,
            hospitalId: hospital_id,
            description: `Queue alert sent to ${target.booking_phone} for token #${target.token_number}`,
          });

          logger.info(`[Worker] Queue alert sent: token #${target.token_number} → ${target.booking_phone}`);
        } catch (err) {
          logger.error(`[Worker] Failed to send alert for token ${target.id}:`, err.message);
        }
      }
    }
  } catch (err) {
    logger.error('[Worker] Queue alert scan failed:', err);
    throw err;
  }
});

// ── Payment Reminder Worker ───────────────────────────────────

paymentReminderQueue.process(async (job) => {
  const { paymentId } = job.data;
  logger.debug(`[Worker] Payment reminder for paymentId: ${paymentId}`);

  try {
    const result = await query(
      `SELECT pay.payment_link_url, pay.amount_paise, a.booking_phone,
              h.wa_phone_number_id, h.name as hospital_name,
              p.full_name, d.full_name as doctor_name, a.appointment_date
       FROM payments pay
       JOIN appointments a ON a.id = pay.appointment_id
       JOIN hospitals h ON h.id = pay.hospital_id
       JOIN patients p ON p.id = pay.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       WHERE pay.id = $1 AND pay.status IN ('pending','link_sent')`,
      [paymentId]
    );

    if (!result.rows.length) return; // already paid

    const row = result.rows[0];
    const amount = `₹${(row.amount_paise / 100).toFixed(0)}`;
    const dateStr = new Date(row.appointment_date).toLocaleDateString('en-IN');

    await sendText(
      row.wa_phone_number_id,
      process.env.WHATSAPP_ACCESS_TOKEN,
      row.booking_phone,
      `💳 *Payment Reminder — ${row.hospital_name}*\n\n👤 ${row.full_name}\n🗓 Visit: ${dateStr}\n💰 Amount: *${amount}*\n\nYou have a pending payment. Click below to pay:\n${row.payment_link_url}\n\n🔒 Secure payment via Razorpay.`
    );

    await query(
      'UPDATE payments SET reminder_sent_at = NOW() WHERE id = $1',
      [paymentId]
    );
  } catch (err) {
    logger.error(`[Worker] Payment reminder failed for ${paymentId}:`, err);
    throw err;
  }
});

// ── Appointment Reminder Worker ───────────────────────────────

appointmentReminderQueue.process(async (job) => {
  logger.debug('[Worker] Sending appointment reminders for tomorrow');

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const appointments = await query(
      `SELECT a.booking_phone, a.token_number, a.appointment_date,
              p.full_name as patient_name,
              d.full_name as doctor_name, d.specialty,
              h.wa_phone_number_id, h.name as hospital_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       JOIN hospitals h ON h.id = a.hospital_id
       WHERE a.appointment_date = $1
         AND a.status = 'scheduled'`,
      [tomorrowStr]
    );

    for (const appt of appointments.rows) {
      try {
        const dateStr = new Date(appt.appointment_date).toLocaleDateString('en-IN', {
          weekday: 'short', day: '2-digit', month: 'short'
        });

        await sendText(
          appt.wa_phone_number_id,
          process.env.WHATSAPP_ACCESS_TOKEN,
          appt.booking_phone,
          `📅 *Appointment Reminder*\n\n🏥 ${appt.hospital_name}\n👨‍⚕️ Dr. ${appt.doctor_name} (${appt.specialty})\n🗓 *Tomorrow, ${dateStr}*\n🎫 Your Token: *#${appt.token_number}*\n\nWe'll send you a WhatsApp alert when your turn is approaching. No need to rush early!\n\nStay healthy! 💊`
        );

        logger.info(`[Worker] Appointment reminder sent to ${appt.booking_phone}`);
      } catch (err) {
        logger.error(`[Worker] Reminder failed for ${appt.booking_phone}:`, err.message);
      }
    }
  } catch (err) {
    logger.error('[Worker] Appointment reminder scan failed:', err);
    throw err;
  }
});

// ── Queue event handlers ──────────────────────────────────────

queueAlertQueue.on('failed', (job, err) => {
  logger.error(`[Bull] Queue alert job ${job.id} failed:`, err.message);
});

paymentReminderQueue.on('failed', (job, err) => {
  logger.error(`[Bull] Payment reminder job ${job.id} failed:`, err.message);
});

module.exports = { queueAlertQueue, paymentReminderQueue, appointmentReminderQueue };
