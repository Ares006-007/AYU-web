const express = require('express');
const { z } = require('zod');
const { query } = require('../../db/pool');
const { authenticate, scopeToHospital } = require('../../middleware/auth');
const { auditMiddleware } = require('../../utils/audit');
const { AppError } = require('../../middleware/errorHandler');

const router = express.Router();
router.use(authenticate, scopeToHospital, auditMiddleware);

/**
 * GET /api/patients
 * Search patients by name or health_id (scoped to hospital visits).
 */
router.get('/', async (req, res, next) => {
  try {
    const { search, limit = 20 } = req.query;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    let result;
    if (search) {
      result = await query(
        `SELECT DISTINCT p.id, p.health_id, p.full_name, p.city, p.dob, p.gender,
                COUNT(a.id) as visit_count
         FROM patients p
         JOIN appointments a ON a.patient_id = p.id AND a.hospital_id = $1
         WHERE p.is_active = TRUE
           AND (lower(p.full_name) LIKE $2 OR p.health_id ILIKE $2)
         GROUP BY p.id
         ORDER BY p.full_name
         LIMIT $3`,
        [hospitalId, `%${search.toLowerCase()}%`, parseInt(limit)]
      );
    } else {
      // Return patients who visited this hospital (most recent first)
      result = await query(
        `SELECT DISTINCT p.id, p.health_id, p.full_name, p.city, p.dob, p.gender,
                COUNT(a.id) as visit_count,
                MAX(a.appointment_date) as last_visit
         FROM patients p
         JOIN appointments a ON a.patient_id = p.id AND a.hospital_id = $1
         WHERE p.is_active = TRUE
         GROUP BY p.id
         ORDER BY last_visit DESC
         LIMIT $2`,
        [hospitalId, parseInt(limit)]
      );
    }

    await req.auditLog({ action: 'read', entityType: 'patient', description: `Patient list/search: "${search}"` });

    res.json({ success: true, patients: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/patients/:id
 * Get patient details + visit history for this hospital.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const patientResult = await query(
      `SELECT p.id, p.health_id, p.full_name, p.city, p.dob, p.age_at_registration, p.gender, p.created_at,
              pi.phone_number as primary_phone
       FROM patients p
       LEFT JOIN patient_identities pi ON pi.patient_id = p.id AND pi.is_primary = TRUE
       WHERE p.id = $1 AND p.is_active = TRUE`,
      [id]
    );

    if (!patientResult.rows.length) throw new AppError('Patient not found', 404);

    const visitsResult = await query(
      `SELECT a.id, a.appointment_date, a.token_number, a.status, a.chief_complaint,
              a.diagnosis_notes, a.follow_up_date,
              d.full_name as doctor_name, d.specialty,
              pay.status as payment_status, pay.amount_paise
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN payments pay ON pay.appointment_id = a.id
       WHERE a.patient_id = $1 AND a.hospital_id = $2
       ORDER BY a.appointment_date DESC
       LIMIT 50`,
      [id, hospitalId]
    );

    const reportsResult = await query(
      `SELECT id, report_name, report_type, status, created_at, sent_at
       FROM reports
       WHERE patient_id = $1 AND hospital_id = $2
       ORDER BY created_at DESC`,
      [id, hospitalId]
    );

    await req.auditLog({
      action: 'read',
      entityType: 'patient',
      entityId: id,
      description: `Viewed patient profile: ${patientResult.rows[0].health_id}`,
    });

    res.json({
      success: true,
      patient: patientResult.rows[0],
      visits: visitsResult.rows,
      reports: reportsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
