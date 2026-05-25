const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole, scopeToHospital } = require('../../middleware/auth');
const { auditMiddleware } = require('../../utils/audit');

const router = express.Router();
router.use(authenticate, scopeToHospital, auditMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const hospitalId = req.hospitalId || req.user.hospital_id;
    const result = await query(
      `SELECT id, full_name, specialty, department, qualification, is_active
       FROM doctors WHERE hospital_id = $1 ORDER BY full_name`,
      [hospitalId]
    );
    res.json({ success: true, doctors: result.rows });
  } catch (err) { next(err); }
});

router.get('/:id/slots', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const hospitalId = req.hospitalId || req.user.hospital_id;
    const fromDate = from || new Date().toISOString().split('T')[0];
    const toDate = to || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const result = await query(
      `SELECT ds.id, ds.slot_date, ds.start_time, ds.end_time, ds.max_tokens, ds.is_available,
              ds.is_blocked, ds.block_reason,
              COUNT(a.id) as booked_count,
              ds.max_tokens - COUNT(a.id) as available_slots
       FROM doctor_slots ds
       LEFT JOIN appointments a ON a.slot_id = ds.id AND a.status NOT IN ('cancelled', 'no_show')
       WHERE ds.doctor_id = $1 AND ds.hospital_id = $2
         AND ds.slot_date BETWEEN $3 AND $4
       GROUP BY ds.id
       ORDER BY ds.slot_date, ds.start_time`,
      [id, hospitalId, fromDate, toDate]
    );

    res.json({ success: true, slots: result.rows });
  } catch (err) { next(err); }
});

router.post('/:id/slots', requireRole('hospital_admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { slotDate, startTime, endTime, maxTokens } = req.body;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const result = await query(
      `INSERT INTO doctor_slots (doctor_id, hospital_id, slot_date, start_time, end_time, max_tokens)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [id, hospitalId, slotDate, startTime, endTime, maxTokens || 30]
    );

    res.status(201).json({ success: true, slotId: result.rows[0].id });
  } catch (err) { next(err); }
});

module.exports = router;
