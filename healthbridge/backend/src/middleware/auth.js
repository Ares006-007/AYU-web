const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { query } = require('../db/pool');

/**
 * Middleware: Verify JWT and attach staff user to req.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch staff from DB to ensure still active
    const result = await query(
      'SELECT id, hospital_id, role, full_name, email FROM hospital_staff WHERE id = $1 AND is_active = TRUE',
      [decoded.id]
    );

    if (!result.rows.length) {
      throw new AppError('User not found or deactivated', 401);
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(err);
  }
}

/**
 * Middleware: Require specific roles.
 * Usage: requireRole('hospital_admin', 'receptionist')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}

/**
 * Middleware: Ensure staff can only access their own hospital's data.
 * Attaches hospital_id filter to req.
 */
function scopeToHospital(req, res, next) {
  if (!req.user) return next(new AppError('Authentication required', 401));
  if (req.user.role !== 'super_admin') {
    req.hospitalId = req.user.hospital_id;
  }
  next();
}

module.exports = { authenticate, requireRole, scopeToHospital };
