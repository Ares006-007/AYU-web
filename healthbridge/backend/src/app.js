const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const logger = require('./utils/logger');

// Route imports
const webhookRoutes = require('./modules/webhooks/webhook.routes');
const authRoutes = require('./modules/auth/auth.routes');
const patientRoutes = require('./modules/patients/patient.routes');
const hospitalRoutes = require('./modules/hospitals/hospital.routes');
const doctorRoutes = require('./modules/doctors/doctor.routes');
const appointmentRoutes = require('./modules/appointments/appointment.routes');
const queueRoutes = require('./modules/queue/queue.routes');
const reportRoutes = require('./modules/reports/report.routes');
const paymentRoutes = require('./modules/payments/payment.routes');

const app = express();

// ── Security middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.DASHBOARD_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Raw body for webhook signature verification ──────────────
// Razorpay and Meta webhooks need raw body
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// ── General middleware ───────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) }
}));

// ── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api/', limiter);

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'healthbridge-api' });
});

// ── API Routes ───────────────────────────────────────────────
app.use('/api/webhooks', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);

// ── Error handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
