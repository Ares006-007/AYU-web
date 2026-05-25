const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../../db/pool');
const { authenticate, requireRole, scopeToHospital } = require('../../middleware/auth');
const { auditMiddleware, writeAuditLog } = require('../../utils/audit');
const { sendText } = require('../webhooks/whatsapp.client');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const router = express.Router();
router.use(authenticate, scopeToHospital, auditMiddleware);

// S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME || 'healthbridge-reports';
const SIGNED_URL_EXPIRY = parseInt(process.env.S3_SIGNED_URL_EXPIRY_SECONDS) || 172800; // 48hr

// Multer: memory storage, max 20MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF and image files are allowed', 400));
    }
  },
});

/**
 * POST /api/reports/upload
 * Upload a report and optionally send to patient via WhatsApp.
 */
router.post('/upload', requireRole('receptionist', 'hospital_admin'), upload.single('report'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);

    const { appointmentId, patientId, reportName, reportType, sendToPatient } = req.body;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    if (!patientId || !reportName) {
      throw new AppError('patientId and reportName are required', 400);
    }

    // Build S3 key
    const date = new Date().toISOString().split('T')[0];
    const fileExt = req.file.originalname.split('.').pop();
    const fileKey = `reports/${hospitalId}/${date}/${uuidv4()}.${fileExt}`;

    // Upload to S3
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        hospitalId,
        patientId,
        uploadedBy: req.user.id,
      },
    }));

    // Save to DB
    const result = await query(
      `INSERT INTO reports
         (patient_id, appointment_id, hospital_id, report_name, report_type, file_key,
          file_size_bytes, mime_type, status, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'uploaded', $9)
       RETURNING id`,
      [patientId, appointmentId || null, hospitalId, reportName, reportType || 'general',
       fileKey, req.file.size, req.file.mimetype, req.user.id]
    );

    const reportId = result.rows[0].id;

    await req.auditLog({
      action: 'create',
      entityType: 'report',
      entityId: reportId,
      description: `Report uploaded: ${reportName}`,
    });

    let deliveryPhone = null;
    if (sendToPatient === 'true' || sendToPatient === true) {
      deliveryPhone = await sendReportToPatient(reportId, fileKey, patientId, appointmentId, hospitalId, reportName);
    }

    res.json({
      success: true,
      reportId,
      fileKey,
      sentToPatient: !!deliveryPhone,
      deliveryPhone,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/reports/:reportId/send
 * (Re-)send a report to patient on WhatsApp.
 */
router.post('/:reportId/send', requireRole('receptionist', 'hospital_admin'), async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const rpt = await query(
      'SELECT * FROM reports WHERE id = $1 AND hospital_id = $2',
      [reportId, hospitalId]
    );
    if (!rpt.rows.length) throw new AppError('Report not found', 404);

    const report = rpt.rows[0];
    const phone = await sendReportToPatient(
      reportId, report.file_key, report.patient_id,
      report.appointment_id, hospitalId, report.report_name
    );

    res.json({ success: true, sentTo: phone });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports
 * List reports for a patient or appointment.
 */
router.get('/', async (req, res, next) => {
  try {
    const { patientId, appointmentId } = req.query;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const conditions = ['r.hospital_id = $1'];
    const params = [hospitalId];

    if (patientId) { params.push(patientId); conditions.push(`r.patient_id = $${params.length}`); }
    if (appointmentId) { params.push(appointmentId); conditions.push(`r.appointment_id = $${params.length}`); }

    const result = await query(
      `SELECT r.id, r.report_name, r.report_type, r.status, r.sent_at, r.created_at,
              r.file_size_bytes, r.mime_type, p.full_name as patient_name, p.health_id
       FROM reports r
       JOIN patients p ON p.id = r.patient_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY r.created_at DESC`,
      params
    );

    res.json({ success: true, reports: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/:reportId/url
 * Generate a fresh signed URL for downloading a report.
 */
router.get('/:reportId/url', async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const hospitalId = req.hospitalId || req.user.hospital_id;

    const rpt = await query(
      'SELECT file_key FROM reports WHERE id = $1 AND hospital_id = $2',
      [reportId, hospitalId]
    );
    if (!rpt.rows.length) throw new AppError('Report not found', 404);

    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: rpt.rows[0].file_key }),
      { expiresIn: 3600 } // 1 hour for dashboard preview
    );

    await req.auditLog({
      action: 'read',
      entityType: 'report',
      entityId: reportId,
      description: 'Report URL generated for dashboard',
    });

    res.json({ success: true, url: signedUrl, expiresIn: 3600 });
  } catch (err) {
    next(err);
  }
});

// ── Helper ───────────────────────────────────────────────────

async function sendReportToPatient(reportId, fileKey, patientId, appointmentId, hospitalId, reportName) {
  try {
    // Get patient phone and hospital WA details
    const patInfo = await query(
      `SELECT pi.phone_number, h.wa_phone_number_id, h.name as hospital_name, p.full_name, p.health_id
       FROM patients p
       JOIN patient_identities pi ON pi.patient_id = p.id AND pi.is_primary = TRUE
       JOIN hospitals h ON h.id = $3
       WHERE p.id = $1 AND h.id = $3
       LIMIT 1`,
      [patientId, patientId, hospitalId]
    );

    if (!patInfo.rows.length) return null;

    const { phone_number, wa_phone_number_id, hospital_name, full_name, health_id } = patInfo.rows[0];

    // Generate 48-hour signed URL
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: fileKey }),
      { expiresIn: SIGNED_URL_EXPIRY }
    );

    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    await sendText(
      wa_phone_number_id,
      process.env.WHATSAPP_ACCESS_TOKEN,
      phone_number,
      `📄 *Your Medical Report is Ready*\n\n🏥 ${hospital_name}\n👤 ${full_name} (${health_id})\n🗓 ${today}\n📋 *${reportName}*\n\n👇 Tap to download your report:\n${signedUrl}\n\n⚠️ This link expires in *48 hours*. Please save the report to your phone.\n\nFor queries, contact the clinic directly.`
    );

    // Update report status
    await query(
      `UPDATE reports SET status = 'sent', sent_at = NOW(), delivery_phone = $1 WHERE id = $2`,
      [phone_number, reportId]
    );

    await writeAuditLog({
      actorType: 'system',
      action: 'send',
      entityType: 'report',
      entityId: reportId,
      hospitalId,
      description: `Report sent to patient via WhatsApp: ${phone_number}`,
    });

    return phone_number;
  } catch (err) {
    logger.error('Failed to send report to patient:', err);
    return null;
  }
}

module.exports = router;
