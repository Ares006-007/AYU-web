const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole } = require('../../middleware/auth');

const router = express.Router();
router.use(authenticate, requireRole('super_admin', 'hospital_admin'));

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, slug, city, state, subscription_plan, subscription_status,
              is_active, created_at
       FROM hospitals ORDER BY created_at DESC`
    );
    res.json({ success: true, hospitals: result.rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, slug, city, state, address, phone, email,
              whatsapp_number, subscription_plan, subscription_status,
              subscription_expires_at, settings, created_at
       FROM hospitals WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, hospital: result.rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
