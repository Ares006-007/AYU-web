const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient;

function connectRedis() {
  return new Promise((resolve, reject) => {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
      resolve(redisClient);
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
      reject(err);
    });
  });
}

function getRedis() {
  if (!redisClient) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redisClient;
}

// ── Session helpers (WhatsApp FSM state) ─────────────────────
const SESSION_TTL_SECONDS = 86400; // 24 hours

async function getSession(phone) {
  const raw = await getRedis().get(`session:${phone}`);
  return raw ? JSON.parse(raw) : null;
}

async function setSession(phone, data) {
  await getRedis().setex(`session:${phone}`, SESSION_TTL_SECONDS, JSON.stringify(data));
}

async function clearSession(phone) {
  await getRedis().del(`session:${phone}`);
}

// ── Queue helpers ─────────────────────────────────────────────

/**
 * Get next token number for a doctor on a date (atomic).
 */
async function incrementToken(doctorId, date) {
  const key = `token_counter:${doctorId}:${date}`;
  const token = await getRedis().incr(key);
  // Expire at end of day + buffer
  await getRedis().expireat(key, getEndOfDayEpoch(date) + 86400);
  return token;
}

/**
 * Set current serving token for a doctor.
 */
async function setCurrentToken(doctorId, date, tokenNumber) {
  const key = `current_token:${doctorId}:${date}`;
  await getRedis().set(key, tokenNumber, 'EX', 86400 * 2);
}

async function getCurrentToken(doctorId, date) {
  const val = await getRedis().get(`current_token:${doctorId}:${date}`);
  return val ? parseInt(val, 10) : 0;
}

function getEndOfDayEpoch(dateStr) {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return Math.floor(d.getTime() / 1000);
}

module.exports = {
  connectRedis,
  getRedis,
  getSession,
  setSession,
  clearSession,
  incrementToken,
  setCurrentToken,
  getCurrentToken,
};
