require('dotenv').config();
const { connectDB } = require('../db/pool');
const { connectRedis } = require('../db/redis');
const { queueAlertQueue, paymentReminderQueue, appointmentReminderQueue } = require('./jobs');
const logger = require('../utils/logger');

const QUEUE_CHECK_INTERVAL = parseInt(process.env.QUEUE_CHECK_INTERVAL_MS) || 120_000; // 2 min

async function startWorkers() {
  await connectDB();
  await connectRedis();

  logger.info('[Workers] Starting background job workers...');

  // ── Queue alert: run every 2 minutes ─────────────────────
  const scheduleQueueAlertScan = () => {
    queueAlertQueue.add({}, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
    setTimeout(scheduleQueueAlertScan, QUEUE_CHECK_INTERVAL);
  };
  scheduleQueueAlertScan();
  logger.info(`[Workers] Queue alert scanner running every ${QUEUE_CHECK_INTERVAL / 1000}s`);

  // ── Appointment reminder: daily at 8:00 AM IST ─────────────
  scheduleDaily(8, 0, () => {
    appointmentReminderQueue.add({}, { attempts: 3 });
    logger.info('[Workers] Appointment reminders triggered');
  });

  logger.info('[Workers] All workers registered. Running...');
}

/**
 * Schedule a daily job at a specific IST hour and minute.
 * Simple implementation: calculates ms until next occurrence.
 */
function scheduleDaily(hour, minute, fn) {
  function getNextRunMs() {
    const now = new Date();
    // IST = UTC+5:30
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const next = new Date(istNow);
    next.setHours(hour, minute, 0, 0);
    if (next <= istNow) next.setDate(next.getDate() + 1);
    return next.getTime() - istNow.getTime();
  }

  const runAndReschedule = () => {
    fn();
    setTimeout(runAndReschedule, getNextRunMs());
  };

  setTimeout(runAndReschedule, getNextRunMs());
  logger.info(`[Workers] Daily job scheduled for ${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')} IST`);
}

startWorkers().catch((err) => {
  logger.error('[Workers] Fatal startup error:', err);
  process.exit(1);
});
