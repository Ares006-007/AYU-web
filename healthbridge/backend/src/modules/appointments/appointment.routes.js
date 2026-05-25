const express = require('express');
const { z } = require('zod');
const { query } = require('../../db/pool');
const { authenticate, requireRole, scopeToHospital } = require('../../middleware/auth');
const { auditMiddleware } = require('../../utils/audit');
const { AppError } = require('../../middleware/errorHandler');

const router = express.Router();
router.use(authenticate, scopeToHospital, auditMiddleware);

/**
 * GET /api/appointments
 * List today's appointments for hospital/doctor.
 */
router.get('/', async (req, res, next) => {
  try {
    const { date, doctorId, status } = req.query;
    const hospitalId = req.hospitalId || req.user.hospital_id;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const conditions = ['a.hospital_id = $1', 'a.appointment_date = $2'];
    const params = [hospitalId, targetDate];

    if (doctorId) { params.push(doctorId); conditions.push(`a.doctor_id = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`a.status = $${params.length}`); }

    const result = await query(
      `SELECT a.id, a.token_number, a.status, a.chief_complaint, a.appointment_date,
              a.booking_phone, a.created_at,
              p.health_id, p.full_name as patient_name, p.city,
              d.full_name as doctor_name, d.specialty,
              qt.status as queue_status, qt.alert_sent,
              pay.status as payment_status
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN queue_tokens qt ON qt.appointment_id = a.id
       LEFT JOIN payments pay ON pay.appointment_id = a.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.token_number ASC`,
      params
    );

    res.json({ success: true, appointments: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/appointments/:id
 * Update appointment status, diagnosis, or follow-up.
 */
router.patch('/:id', requireRole('doctor', 'hospital_admin', 'receptionist'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, diagnosisNotes, followUpDate } = req.body;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const updates = [];
    const params = [];

    if (status) { params.push(status); updates.push(`status = $${params.length}`); }
    if (diagnosisNotes !== undefined) { params.push(diagnosisNotes); updates.push(`diagnosis_notes = $${params.length}`); }
    if (followUpDate) { params.push(followUpDate); updates.push(`follow_up_date = $${params.length}`); }

    if (!updates.length) throw new AppError('Nothing to update', 400);

    params.push(id, hospitalId);
    await query(
      `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${params.length - 1} AND hospital_id = $${params.length}`,
      params
    );

    await req.auditLog({
      action: 'update',
      entityType: 'appointment',
      entityId: id,
      description: `Appointment updated: ${JSON.stringify({ status, diagnosisNotes: !!diagnosisNotes, followUpDate })}`,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/appointments/:id/cancel
 * Cancel an appointment.
 */
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    await query(
      `UPDATE appointments SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $1
       WHERE id = $2 AND hospital_id = $3 AND status NOT IN ('completed', 'cancelled')`,
      [reason || null, id, hospitalId]
    );

    await query(
      `UPDATE queue_tokens SET status = 'skipped'
       WHERE appointment_id = $1 AND status = 'waiting'`,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
