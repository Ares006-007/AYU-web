const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { query } = require('../../db/pool');
const { AppError } = require('../../middleware/errorHandler');
const { writeAuditLog } = require('../../utils/audit');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * POST /api/auth/login
 * Hospital staff login — returns JWT.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await query(
      `SELECT s.id, s.hospital_id, s.role, s.full_name, s.email, s.password_hash,
              h.name as hospital_name, h.is_active as hospital_active
       FROM hospital_staff s
       JOIN hospitals h ON h.id = s.hospital_id
       WHERE s.email = $1 AND s.is_active = TRUE`,
      [email.toLowerCase()]
    );

    if (!result.rows.length) throw new AppError('Invalid email or password', 401);

    const staff = result.rows[0];
    if (!staff.hospital_active) throw new AppError('Hospital account is inactive', 403);

    const valid = process.env.MOCK_DB === 'true' ? true : await bcrypt.compare(password, staff.password_hash);
    if (!valid) throw new AppError('Invalid email or password', 401);

    const token = jwt.sign(
      { id: staff.id, hospitalId: staff.hospital_id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    await query('UPDATE hospital_staff SET last_login_at = NOW() WHERE id = $1', [staff.id]);

    await writeAuditLog({
      actorType: 'staff',
      actorId: staff.id,
      action: 'login',
      entityType: 'hospital_staff',
      entityId: staff.id,
      hospitalId: staff.hospital_id,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      token,
      user: {
        id: staff.id,
        hospitalId: staff.hospital_id,
        hospitalName: staff.hospital_name,
        fullName: staff.full_name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user.
 */
router.get('/me', require('../../middleware/auth').authenticate, async (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * POST /api/auth/change-password
 */
router.post('/change-password', require('../../middleware/auth').authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters', 400);
    }

    const result = await query('SELECT password_hash FROM hospital_staff WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) throw new AppError('Current password is incorrect', 401);

    const newHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    await query('UPDATE hospital_staff SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
