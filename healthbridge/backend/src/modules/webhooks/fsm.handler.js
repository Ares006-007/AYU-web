const { getSession, setSession, clearSession } = require('../../db/redis');
const { sendText } = require('./whatsapp.client');
const registrationFlow = require('./flows/registration.flow');
const bookingFlow = require('./flows/booking.flow');
const logger = require('../../utils/logger');

// FSM States
const STATES = {
  IDLE: 'IDLE',
  NEW_OR_RETURNING: 'NEW_OR_RETURNING',
  // Registration states
  REG_NAME: 'REG_NAME',
  REG_DOB: 'REG_DOB',
  REG_CITY: 'REG_CITY',
  REG_AADHAAR: 'REG_AADHAAR',
  REG_CONSENT: 'REG_CONSENT',
  // Returning patient verification
  RET_HEALTH_ID: 'RET_HEALTH_ID',
  RET_NAME: 'RET_NAME',
  RET_AADHAAR: 'RET_AADHAAR',
  // Booking states
  BOOK_DEPT: 'BOOK_DEPT',
  BOOK_DOCTOR: 'BOOK_DOCTOR',
  BOOK_DATE: 'BOOK_DATE',
  BOOK_COMPLAINT: 'BOOK_COMPLAINT',
  BOOK_CONFIRM: 'BOOK_CONFIRM',
};

/**
 * Main FSM handler — called for every inbound WhatsApp message.
 *
 * @param {Object} ctx
 * @param {string} ctx.from - Sender phone (E.164)
 * @param {string} ctx.message - Text content of the message
 * @param {string} ctx.phoneNumberId - Receiving WA Phone Number ID
 * @param {string} ctx.accessToken - Meta access token for this hospital
 * @param {string} ctx.hospitalId - Hospital UUID from DB
 */
async function handleMessage(ctx) {
  const { from, message, phoneNumberId, accessToken, hospitalId } = ctx;
  const input = (message || '').trim();

  // Load session from Redis
  let session = await getSession(from) || {
    state: STATES.IDLE,
    hospitalId,
    data: {},
    attempts: 0,
  };

  // Global commands — work in any state
  const upper = input.toUpperCase();
  if (upper === 'MENU' || upper === 'START' || upper === 'HI' || upper === 'HELLO' ||
      upper === 'NAMASTE' || upper === 'BOOK' || upper === 'APPOINTMENT') {
    session = { state: STATES.IDLE, hospitalId, data: {}, attempts: 0 };
  }

  if (upper === 'HELP') {
    await sendHelpMessage(phoneNumberId, accessToken, from);
    return;
  }

  if (upper === 'STATUS') {
    await handleStatusCheck(ctx, session);
    return;
  }

  logger.debug(`[FSM] ${from} | state=${session.state} | input="${input}"`);

  let newSession;

  switch (session.state) {
    case STATES.IDLE:
      newSession = await handleIdle(ctx, session);
      break;

    case STATES.NEW_OR_RETURNING:
      newSession = await handleNewOrReturning(ctx, session, input);
      break;

    // ── Registration flow ──
    case STATES.REG_NAME:
    case STATES.REG_DOB:
    case STATES.REG_CITY:
    case STATES.REG_AADHAAR:
    case STATES.REG_CONSENT:
      newSession = await registrationFlow.handle(ctx, session, input, STATES);
      break;

    // ── Returning patient verification ──
    case STATES.RET_HEALTH_ID:
    case STATES.RET_NAME:
    case STATES.RET_AADHAAR:
      newSession = await registrationFlow.handleReturning(ctx, session, input, STATES);
      break;

    // ── Booking flow ──
    case STATES.BOOK_DEPT:
    case STATES.BOOK_DOCTOR:
    case STATES.BOOK_DATE:
    case STATES.BOOK_COMPLAINT:
    case STATES.BOOK_CONFIRM:
      newSession = await bookingFlow.handle(ctx, session, input, STATES);
      break;

    default:
      newSession = { ...session, state: STATES.IDLE, data: {} };
      await sendText(phoneNumberId, accessToken, from,
        "I didn't understand that. Type *MENU* to start over or *HELP* for assistance.");
  }

  // Persist updated session
  if (newSession) {
    await setSession(from, newSession);
  }
}

async function handleIdle(ctx, session) {
  const { from, phoneNumberId, accessToken } = ctx;

  // Fetch hospital name for greeting (can cache this)
  const { query } = require('../../db/pool');
  const hosp = await query('SELECT name FROM hospitals WHERE id = $1', [session.hospitalId]);
  const hospName = hosp.rows[0]?.name || 'our clinic';

  await sendText(phoneNumberId, accessToken, from,
    `👋 Welcome to *${hospName}*!\n\nI'm your appointment assistant. I can help you:\n• 📅 Book appointments\n• 🔔 Get queue updates\n• 📄 Receive reports\n\nAre you a *new* or *returning* patient?\n\nReply:\n1️⃣ New Patient\n2️⃣ Returning Patient`
  );

  return { ...session, state: 'NEW_OR_RETURNING' };
}

async function handleNewOrReturning(ctx, session, input) {
  const { from, phoneNumberId, accessToken } = ctx;

  if (input === '1' || input.toLowerCase().includes('new')) {
    await sendText(phoneNumberId, accessToken, from,
      "Great! Let's get you registered. It takes less than 2 minutes. 😊\n\nWhat is your *full name*?\n(Example: Ravi Kumar Sharma)"
    );
    return { ...session, state: 'REG_NAME', data: {} };
  }

  if (input === '2' || input.toLowerCase().includes('return') || input.toLowerCase().includes('existing')) {
    await sendText(phoneNumberId, accessToken, from,
      "Welcome back! 👋\n\nPlease share your *Health ID* to continue.\n(Example: MED-HYD-2026-A3K9P7)\n\nOr type *HELP* if you don't remember it."
    );
    return { ...session, state: 'RET_HEALTH_ID', data: {} };
  }

  await sendText(phoneNumberId, accessToken, from,
    "Please reply with *1* for New Patient or *2* for Returning Patient."
  );
  return session;
}

async function sendHelpMessage(phoneNumberId, accessToken, to) {
  await sendText(phoneNumberId, accessToken, to,
    "🆘 *Need Help?*\n\n• Type *MENU* to start over\n• Type *STATUS* to check your appointment\n• Type *CANCEL* to cancel your appointment\n\nFor urgent help, call reception directly. 📞"
  );
}

async function handleStatusCheck(ctx, session) {
  const { from, phoneNumberId, accessToken } = ctx;
  const { query } = require('../../db/pool');

  try {
    const result = await query(
      `SELECT a.token_number, a.appointment_date, a.status, d.full_name as doctor_name,
              qt.status as queue_status
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN queue_tokens qt ON qt.appointment_id = a.id
       WHERE a.booking_phone = $1
         AND a.appointment_date = CURRENT_DATE
         AND a.status NOT IN ('cancelled', 'completed')
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [from]
    );

    if (!result.rows.length) {
      await sendText(phoneNumberId, accessToken, from,
        "You don't have any active appointment today. Type *MENU* to book one."
      );
      return;
    }

    const appt = result.rows[0];
    await sendText(phoneNumberId, accessToken, from,
      `📋 *Your Appointment Status*\n\n👨‍⚕️ Dr. ${appt.doctor_name}\n🎫 Token: *#${appt.token_number}*\n📅 Today\n⏳ Status: ${appt.queue_status || appt.status}\n\nWe'll alert you when your turn is near!`
    );
  } catch (err) {
    logger.error('Status check failed:', err);
  }
}

module.exports = { handleMessage, STATES };
