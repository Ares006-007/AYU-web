const { query } = require('../db/pool');
const logger = require('../utils/logger');

/**
 * Write an audit log entry (non-blocking).
 * Safe to call without await in most cases.
 *
 * @param {Object} params
 * @param {string} params.actorType - 'staff' | 'system' | 'patient'
 * @param {string} [params.actorId] - UUID of actor
 * @param {string} [params.actorPhone] - Phone if WhatsApp-triggered
 * @param {string} params.action - audit_action enum value
 * @param {string} params.entityType - 'patient' | 'appointment' | 'report' | etc.
 * @param {string} [params.entityId] - UUID of entity
 * @param {string} [params.hospitalId] - Hospital scope
 * @param {string} [params.description] - Human-readable description
 * @param {Object} [params.metadata] - Additional context
 * @param {string} [params.ipAddress] - Request IP
 */
async function writeAuditLog({
  actorType,
  actorId = null,
  actorPhone = null,
  action,
  entityType,
  entityId = null,
  hospitalId = null,
  description = null,
  metadata = {},
  ipAddress = null,
}) {
  try {
    await query(
      `INSERT INTO audit_logs
        (actor_type, actor_id, actor_phone, action, entity_type, entity_id, hospital_id, description, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [actorType, actorId, actorPhone, action, entityType, entityId, hospitalId, description, JSON.stringify(metadata), ipAddress]
    );
  } catch (err) {
    // Never let audit logging failure break the main flow
    logger.error('Audit log write failed:', err);
  }
}

/**
 * Express middleware: automatically log read/write actions from dashboard routes.
 * Attach req.auditLog function for use in route handlers.
 */
function auditMiddleware(req, res, next) {
  req.auditLog = (params) => writeAuditLog({
    actorType: 'staff',
    actorId: req.user?.id,
    hospitalId: req.user?.hospital_id,
    ipAddress: req.ip,
    ...params,
  });
  next();
}

module.exports = { writeAuditLog, auditMiddleware };
