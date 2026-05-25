const express = require('express');
const { z } = require('zod');
const { query } = require('../../db/pool');
const { authenticate, requireRole, scopeToHospital } = require('../../middleware/auth');
const { auditMiddleware } = require('../../utils/audit');
const { AppError } = require('../../middleware/errorHandler');

const router = express.Router();
router.use(authenticate, scopeToHospital, auditMiddleware);

/**
 * GET /api/queue/today
 * Get all queue tokens for today for this hospital (optionally filter by doctor).
 */
router.get('/today', async (req, res, next) => {
  try {
    const { doctorId } = req.query;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const params = [hospitalId];
    let doctorFilter = '';
    if (doctorId) {
      params.push(doctorId);
      doctorFilter = `AND qt.doctor_id = $${params.length}`;
    }

    const result = await query(
      `SELECT qt.id, qt.token_number, qt.status, qt.alert_sent, qt.called_at, qt.completed_at,
              a.chief_complaint, a.booking_phone,
              p.health_id, p.full_name as patient_name,
              d.full_name as doctor_name, d.specialty
       FROM queue_tokens qt
       JOIN appointments a ON a.id = qt.appointment_id
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = qt.doctor_id
       WHERE qt.hospital_id = $1 AND qt.queue_date = CURRENT_DATE ${doctorFilter}
       ORDER BY qt.token_number ASC`,
      params
    );

    res.json({ success: true, queue: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/queue/:tokenId/advance
 * Call the next token (mark current as completed, set next to in_progress).
 */
router.patch('/:tokenId/advance', requireRole('receptionist', 'hospital_admin', 'doctor'), async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    // Mark current token as completed
    const tokenResult = await query(
      `UPDATE queue_tokens SET status = 'completed', completed_at = NOW()
       WHERE id = $1 AND hospital_id = $2 RETURNING doctor_id, queue_date, token_number`,
      [tokenId, hospitalId]
    );

    if (!tokenResult.rows.length) throw new AppError('Token not found', 404);

    const { doctor_id, queue_date } = tokenResult.rows[0];

    // Mark appointment as completed
    await query(
      `UPDATE appointments SET status = 'completed'
       WHERE id = (SELECT appointment_id FROM queue_tokens WHERE id = $1)`,
      [tokenId]
    );

    // Set next waiting token to in_progress
    const nextToken = await query(
      `UPDATE queue_tokens SET status = 'in_progress', called_at = NOW()
       WHERE id = (
         SELECT id FROM queue_tokens
         WHERE doctor_id = $1 AND queue_date = $2 AND status = 'waiting'
         ORDER BY token_number ASC LIMIT 1
       ) RETURNING token_number`,
      [doctor_id, queue_date]
    );

    // Update Redis current token
    const { setCurrentToken } = require('../../db/redis');
    if (nextToken.rows.length) {
      await setCurrentToken(doctor_id, queue_date.toISOString().split('T')[0], nextToken.rows[0].token_number);
    }

    await req.auditLog({
      action: 'update',
      entityType: 'queue_token',
      entityId: tokenId,
      description: 'Token advanced',
    });

    res.json({
      success: true,
      nextToken: nextToken.rows[0]?.token_number || null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/queue/:tokenId/skip
 * Skip a token (patient not present).
 */
router.patch('/:tokenId/skip', requireRole('receptionist', 'hospital_admin'), async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    await query(
      `UPDATE queue_tokens SET status = 'skipped' WHERE id = $1 AND hospital_id = $2`,
      [tokenId, hospitalId]
    );

    await query(
      `UPDATE appointments SET status = 'no_show'
       WHERE id = (SELECT appointment_id FROM queue_tokens WHERE id = $1)`,
      [tokenId]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/queue/stats
 * Quick stats for dashboard header: total waiting, avg wait time.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'waiting') as waiting,
         COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
         COUNT(*) FILTER (WHERE status = 'completed') as completed,
         COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
         ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - called_at))/60) FILTER (WHERE status = 'completed'), 1) as avg_consult_min
       FROM queue_tokens
       WHERE hospital_id = $1 AND queue_date = CURRENT_DATE`,
      [hospitalId]
    );

    res.json({ success: true, stats: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
