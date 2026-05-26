const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient;
let useMock = false;

// Mock session and token counters
const sessionStore = new Map();
const tokenCounters = new Map();
const currentTokens = new Map();

function connectRedis() {
  return new Promise((resolve) => {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
      resolve(redisClient);
    });

    redisClient.on('error', (err) => {
      logger.warn('Redis connection failed. Starting Redis in MOCK/MEMORY mode...');
      useMock = true;
      try {
        redisClient.disconnect();
      } catch (e) {}
      resolve(null);
    });
  });
}

function getRedis() {
  if (useMock) return null;
  if (!redisClient) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redisClient;
}

// ── Session helpers (WhatsApp FSM state) ─────────────────────
const SESSION_TTL_SECONDS = 86400; // 24 hours

async function getSession(phone) {
  if (useMock) {
    return sessionStore.get(phone) || null;
  }
  const raw = await getRedis().get(`session:${phone}`);
  return raw ? JSON.parse(raw) : null;
}

async function setSession(phone, data) {
  if (useMock) {
    sessionStore.set(phone, data);
    return;
  }
  await getRedis().setex(`session:${phone}`, SESSION_TTL_SECONDS, JSON.stringify(data));
}

async function clearSession(phone) {
  if (useMock) {
    sessionStore.delete(phone);
    return;
  }
  await getRedis().del(`session:${phone}`);
}

// ── Queue helpers ─────────────────────────────────────────────

/**
 * Get next token number for a doctor on a date (atomic).
 */
async function incrementToken(doctorId, date) {
  if (useMock) {
    const key = `${doctorId}:${date}`;
    const current = tokenCounters.get(key) || 0;
    const next = current + 1;
    tokenCounters.set(key, next);
    return next;
  }
  const key = `token_counter:${doctorId}:${date}`;
  const token = await getRedis().incr(key);
  await getRedis().expireat(key, getEndOfDayEpoch(date) + 86400);
  return token;
}

/**
 * Set current serving token for a doctor.
 */
async function setCurrentToken(doctorId, date, tokenNumber) {
  if (useMock) {
    const key = `${doctorId}:${date}`;
    currentTokens.set(key, tokenNumber);
    return;
  }
  const key = `current_token:${doctorId}:${date}`;
  await getRedis().set(key, tokenNumber, 'EX', 86400 * 2);
}

async function getCurrentToken(doctorId, date) {
  if (useMock) {
    const key = `${doctorId}:${date}`;
    return currentTokens.get(key) || 0;
  }
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
