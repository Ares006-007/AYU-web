const bcrypt = require('bcrypt');
const { query, withTransaction } = require('../../../db/pool');
const { sendText } = require('../whatsapp.client');
const { generateHealthId, normalizeIndianPhone } = require('../../../utils/helpers');
const { writeAuditLog } = require('../../../utils/audit');
const logger = require('../../../utils/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Handle registration FSM states for new patients.
 */
async function handle(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;

  switch (session.state) {
    case STATES.REG_NAME:
      return handleName(ctx, session, input, STATES);
    case STATES.REG_DOB:
      return handleDOB(ctx, session, input, STATES);
    case STATES.REG_CITY:
      return handleCity(ctx, session, input, STATES);
    case STATES.REG_AADHAAR:
      return handleAadhaar(ctx, session, input, STATES);
    case STATES.REG_CONSENT:
      return handleConsent(ctx, session, input, STATES);
    default:
      return session;
  }
}

async function handleName(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const name = input.trim();

  if (name.length < 2 || name.length > 200 || !/^[\w\s.'-]+$/i.test(name)) {
    await sendText(phoneNumberId, accessToken, from,
      "Please enter a valid full name (letters only, 2–200 characters).\n\nWhat is your *full name*?"
    );
    return session;
  }

  await sendText(phoneNumberId, accessToken, from,
    `Thank you, *${name}*! 😊\n\nWhat is your *date of birth*?\n(Format: DD/MM/YYYY, Example: 15/08/1990)\n\nOr reply *SKIP* to share your age instead.`
  );

  return { ...session, state: STATES.REG_DOB, data: { ...session.data, full_name: name } };
}

async function handleDOB(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const upper = input.toUpperCase().trim();

  let dob = null;
  let age = null;

  if (upper === 'SKIP') {
    await sendText(phoneNumberId, accessToken, from,
      "No problem! What is your approximate *age* in years?\n(Example: 32)"
    );
    return { ...session, state: STATES.REG_CITY, data: { ...session.data, ask_age: true } };
  }

  // Try DD/MM/YYYY
  const match = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const parsed = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`);
    if (!isNaN(parsed) && parsed < new Date()) {
      dob = parsed.toISOString().split('T')[0];
    }
  }

  // Fallback: plain age number
  if (!dob && /^\d{1,3}$/.test(input)) {
    age = parseInt(input, 10);
    if (age < 0 || age > 130) age = null;
  }

  if (!dob && !age) {
    await sendText(phoneNumberId, accessToken, from,
      "Hmm, that doesn't look right. 🤔\n\nPlease enter your *date of birth* in DD/MM/YYYY format, or reply *SKIP* to enter your age."
    );
    return session;
  }

  // If ask_age flow came back with a number
  await sendText(phoneNumberId, accessToken, from,
    "Got it! Which *city* are you from?\n(Example: Hyderabad, Mumbai, Chennai)"
  );

  return {
    ...session,
    state: STATES.REG_CITY,
    data: { ...session.data, dob, age, ask_age: false }
  };
}

async function handleCity(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;

  // If we're in ask_age mode (skipped DOB)
  if (session.data.ask_age) {
    const age = parseInt(input, 10);
    if (isNaN(age) || age < 0 || age > 130) {
      await sendText(phoneNumberId, accessToken, from,
        "Please enter a valid age (numbers only, e.g. 32)."
      );
      return session;
    }
    await sendText(phoneNumberId, accessToken, from,
      "Got it! Which *city* are you from?\n(Example: Hyderabad, Mumbai, Chennai)"
    );
    return {
      ...session,
      state: STATES.REG_CITY,
      data: { ...session.data, age, ask_age: false }
    };
  }

  const city = input.trim();
  if (city.length < 2 || city.length > 100) {
    await sendText(phoneNumberId, accessToken, from,
      "Please enter a valid city name."
    );
    return session;
  }

  await sendText(phoneNumberId, accessToken, from,
    `Almost done! 🔒\n\nFor secure identity verification, please share the *last 6 digits* of your Aadhaar card.\n(Example: if your Aadhaar ends in 432198, reply: *432198*)\n\n⚠️ We only use the last 6 digits. Full Aadhaar is never stored.`
  );

  return { ...session, state: STATES.REG_AADHAAR, data: { ...session.data, city } };
}

async function handleAadhaar(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const digits = input.trim().replace(/\s/g, '');

  if (!/^\d{6}$/.test(digits)) {
    await sendText(phoneNumberId, accessToken, from,
      "Please enter exactly *6 digits* (the last 6 digits of your Aadhaar)."
    );
    return session;
  }

  // Store hash immediately — don't keep plaintext in session longer than needed
  const aadhaarHash = await bcrypt.hash(digits, BCRYPT_ROUNDS);

  const CONSENT_TEXT = 'By registering, you agree that HealthBridge will store your name, DOB, city, and a secure hash of your Aadhaar last 6 digits. Your health records will be accessible only to doctors you visit. You can request data deletion at any time.';

  await sendText(phoneNumberId, accessToken, from,
    `📋 *Data Consent*\n\n${CONSENT_TEXT}\n\nDo you agree?\n\n✅ Reply *YES* to agree\n❌ Reply *NO* to decline`
  );

  return {
    ...session,
    state: STATES.REG_CONSENT,
    data: { ...session.data, aadhaar_hash: aadhaarHash, consent_text: CONSENT_TEXT }
  };
}

async function handleConsent(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const upper = input.toUpperCase().trim();

  if (upper === 'NO') {
    await sendText(phoneNumberId, accessToken, from,
      "No problem. Your data has not been saved. You can start over anytime by typing *MENU*.\n\nFor appointments without registration, please visit the reception desk."
    );
    return { ...session, state: STATES.IDLE, data: {} };
  }

  if (upper !== 'YES') {
    await sendText(phoneNumberId, accessToken, from,
      "Please reply *YES* to agree or *NO* to decline."
    );
    return session;
  }

  // Create patient record
  try {
    const { full_name, dob, age, city, aadhaar_hash, consent_text } = session.data;
    const healthId = generateHealthId(city);
    const phone = normalizeIndianPhone(from);

    const patient = await withTransaction(async (client) => {
      // Insert patient
      const p = await client.query(
        `INSERT INTO patients (health_id, full_name, dob, age_at_registration, city, aadhaar_last6_hash)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, health_id`,
        [healthId, full_name, dob || null, age || null, city, aadhaar_hash]
      );
      const patientRow = p.rows[0];

      // Link phone
      await client.query(
        `INSERT INTO patient_identities (patient_id, phone_number, is_primary, verified_at)
         VALUES ($1, $2, TRUE, NOW())`,
        [patientRow.id, phone]
      );

      // Consent log
      await client.query(
        `INSERT INTO consent_logs (patient_id, consent_type, consented, consent_text, channel, phone_number)
         VALUES ($1, 'registration', TRUE, $2, 'whatsapp', $3)`,
        [patientRow.id, consent_text, phone]
      );

      return patientRow;
    });

    await writeAuditLog({
      actorType: 'patient',
      actorPhone: from,
      action: 'create',
      entityType: 'patient',
      entityId: patient.id,
      description: `New patient registered via WhatsApp. Health ID: ${patient.health_id}`,
    });

    await sendText(phoneNumberId, accessToken, from,
      `🎉 *Registration Successful!*\n\n🪪 Your Health ID: *${patient.health_id}*\n\n📌 Save this ID — you can use it to book appointments at any hospital on our network, even from a different phone.`
    );

    const firstName = full_name.split(' ')[0];
    const { sendMainMenu } = require('./menu.flow');
    await sendMainMenu(phoneNumberId, accessToken, from, firstName);

    return {
      ...session,
      state: STATES.MAIN_MENU,
      data: { patientId: patient.id, healthId: patient.health_id, fullName: full_name, phone }
    };

  } catch (err) {
    logger.error('Patient registration failed:', err);
    await sendText(phoneNumberId, accessToken, from,
      "⚠️ Something went wrong during registration. Please try again or contact the reception desk."
    );
    return { ...session, state: STATES.IDLE, data: {} };
  }
}

// ── Returning patient verification ───────────────────────────

async function handleReturning(ctx, session, input, STATES) {
  switch (session.state) {
    case STATES.RET_HEALTH_ID:
      return handleRetHealthId(ctx, session, input, STATES);
    case STATES.RET_NAME:
      return handleRetName(ctx, session, input, STATES);
    case STATES.RET_AADHAAR:
      return handleRetAadhaar(ctx, session, input, STATES);
    default:
      return session;
  }
}

async function handleRetHealthId(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const upperInput = input.trim().toUpperCase();

  if (upperInput === 'FORGOT' || upperInput === 'HELP' || upperInput === 'RECOVER' || upperInput === 'FORGOT ID' || upperInput === 'FORGOTID') {
    await sendText(phoneNumberId, accessToken, from,
      "Let's recover your Health ID. 🔍\n\nWhat is your *full name* registered with us?\n(Example: Ravi Kumar Sharma)"
    );
    return { ...session, state: STATES.RECOVERY_NAME, data: {} };
  }

  const healthId = input.trim().toUpperCase();
  if (!/^MED-[A-Z]{3}-\d{4}-[A-Z0-9]{6}$/.test(healthId)) {
    await sendText(phoneNumberId, accessToken, from,
      "That doesn't look like a valid Health ID. Format should be like: *MED-HYD-2026-A3K9P7*\n\nPlease try again, or reply *FORGOT* if you don't remember it."
    );
    return session;
  }

  const result = await query('SELECT id FROM patients WHERE health_id = $1 AND is_active = TRUE', [healthId]);

  if (!result.rows.length) {
    await sendText(phoneNumberId, accessToken, from,
      "❌ Health ID not found. Please double-check and try again.\n\nReply *FORGOT* if you don't remember it, or *1* to register as a new patient."
    );
    return { ...session, attempts: (session.attempts || 0) + 1 };
  }

  await sendText(phoneNumberId, accessToken, from,
    "Found it! ✅\n\nFor security, please confirm your *full name* as registered."
  );

  return { ...session, state: STATES.RET_NAME, data: { healthId, patientDbId: result.rows[0].id } };
}

async function handleRetName(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;

  await sendText(phoneNumberId, accessToken, from,
    "One last step 🔒 — please share the *last 6 digits* of your Aadhaar for verification."
  );

  return { ...session, state: STATES.RET_AADHAAR, data: { ...session.data, submitted_name: input.trim() } };
}

async function handleRetAadhaar(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const digits = input.trim().replace(/\s/g, '');

  if (!/^\d{6}$/.test(digits)) {
    await sendText(phoneNumberId, accessToken, from,
      "Please enter exactly *6 digits* (the last 6 digits of your Aadhaar)."
    );
    return session;
  }

  const { query } = require('../../../db/pool');
  const result = await query(
    'SELECT id, health_id, full_name, aadhaar_last6_hash FROM patients WHERE id = $1',
    [session.data.patientDbId]
  );

  if (!result.rows.length) {
    await sendText(phoneNumberId, accessToken, from, "Verification failed. Please try again from the beginning.");
    return { ...session, state: STATES.IDLE, data: {} };
  }

  const patient = result.rows[0];

  // Verify name (case-insensitive)
  const nameMatch = patient.full_name.toLowerCase().trim() === session.data.submitted_name.toLowerCase().trim();
  // Verify Aadhaar hash
  const aadhaarMatch = await bcrypt.compare(digits, patient.aadhaar_last6_hash);

  if (!nameMatch || !aadhaarMatch) {
    const attempts = (session.data.verifyAttempts || 0) + 1;
    if (attempts >= 3) {
      await sendText(phoneNumberId, accessToken, from,
        "❌ Too many failed attempts. For security, please visit the reception desk for assistance."
      );
      return { ...session, state: STATES.IDLE, data: {} };
    }
    await sendText(phoneNumberId, accessToken, from,
      `❌ Verification failed. Please check your name and Aadhaar digits and try again. (Attempt ${attempts}/3)`
    );
    return { ...session, state: STATES.RET_HEALTH_ID, data: { verifyAttempts: attempts } };
  }

  const firstName = patient.full_name.split(' ')[0];
  await sendText(phoneNumberId, accessToken, from,
    `✅ *Welcome back, ${firstName}!*\n\n🪪 Health ID: ${patient.health_id}`
  );

  // Link this phone to the patient if not already linked
  const phone = normalizeIndianPhone(from);
  await query(
    `INSERT INTO patient_identities (patient_id, phone_number, verified_at)
     VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING`,
    [patient.id, phone]
  );

  const { sendMainMenu } = require('./menu.flow');
  await sendMainMenu(phoneNumberId, accessToken, from, firstName);

  return {
    ...session,
    state: STATES.MAIN_MENU,
    data: { patientId: patient.id, healthId: patient.health_id, fullName: patient.full_name, phone }
  };
}

// ── Forgot ID Recovery Flow ───────────────────────────────────

async function handleRecovery(ctx, session, input, STATES) {
  switch (session.state) {
    case STATES.RECOVERY_NAME:
      return handleRecoveryName(ctx, session, input, STATES);
    case STATES.RECOVERY_DOB:
      return handleRecoveryDOB(ctx, session, input, STATES);
    case STATES.RECOVERY_AADHAAR:
      return handleRecoveryAadhaar(ctx, session, input, STATES);
    default:
      return session;
  }
}

async function handleRecoveryName(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const name = input.trim();

  if (name.length < 2 || name.length > 200 || !/^[\w\s.'-]+$/i.test(name)) {
    await sendText(phoneNumberId, accessToken, from,
      "Please enter a valid full name (letters only, 2–200 characters).\n\nWhat is your *full name*?"
    );
    return session;
  }

  await sendText(phoneNumberId, accessToken, from,
    `Thank you! What is your registered *date of birth*?\n(Format: DD/MM/YYYY, Example: 15/08/1990)\n\nOr reply *SKIP* to verify with age.`
  );

  return { ...session, state: STATES.RECOVERY_DOB, data: { ...session.data, full_name: name } };
}

async function handleRecoveryDOB(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const upper = input.toUpperCase().trim();

  let dob = null;
  let age = null;

  if (upper === 'SKIP') {
    await sendText(phoneNumberId, accessToken, from,
      "No problem! What is your approximate registered *age* in years?\n(Example: 32)"
    );
    return { ...session, state: STATES.RECOVERY_DOB, data: { ...session.data, ask_age: true } };
  }

  if (session.data.ask_age) {
    age = parseInt(input, 10);
    if (isNaN(age) || age < 0 || age > 130) {
      await sendText(phoneNumberId, accessToken, from,
        "Please enter a valid age (numbers only, e.g. 32)."
      );
      return session;
    }
  } else {
    // Try DD/MM/YYYY
    const match = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      const parsed = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`);
      if (!isNaN(parsed) && parsed < new Date()) {
        dob = parsed.toISOString().split('T')[0];
      }
    }

    if (!dob) {
      // Fallback: plain age number
      if (/^\d{1,3}$/.test(input)) {
        age = parseInt(input, 10);
        if (age < 0 || age > 130) age = null;
      }
    }

    if (!dob && !age) {
      await sendText(phoneNumberId, accessToken, from,
        "Hmm, that doesn't look right. 🤔\n\nPlease enter your *date of birth* in DD/MM/YYYY format, or reply *SKIP* to enter your age."
      );
      return session;
    }
  }

  await sendText(phoneNumberId, accessToken, from,
    "Got it! Now, please share the *last 6 digits* of your Aadhaar card to verify your identity."
  );

  return {
    ...session,
    state: STATES.RECOVERY_AADHAAR,
    data: { ...session.data, dob, age, ask_age: false }
  };
}

async function handleRecoveryAadhaar(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const digits = input.trim().replace(/\s/g, '');
  const bcrypt = require('bcrypt');

  if (!/^\d{6}$/.test(digits)) {
    await sendText(phoneNumberId, accessToken, from,
      "Please enter exactly *6 digits* (the last 6 digits of your Aadhaar)."
    );
    return session;
  }

  const { full_name, dob, age } = session.data;

  try {
    // Find candidate patients
    const candidates = await query(
      `SELECT p.id, p.health_id, p.full_name, p.aadhaar_last6_hash, p.city
       FROM patients p
       WHERE LOWER(TRIM(p.full_name)) = LOWER(TRIM($1))
         AND p.is_active = TRUE`,
      [full_name]
    );

    let matchedPatient = null;

    // Filter by DOB or age and verify Aadhaar hash
    for (const cand of candidates.rows) {
      const aadhaarMatch = await bcrypt.compare(digits, cand.aadhaar_last6_hash);
      if (!aadhaarMatch) continue;

      // Check DOB/age match
      const candResult = await query(
        `SELECT dob, age_at_registration FROM patients WHERE id = $1`,
        [cand.id]
      );
      const candInfo = candResult.rows[0];

      if (dob) {
        if (candInfo.dob) {
          const candDob = new Date(candInfo.dob).toISOString().split('T')[0];
          if (candDob === dob) {
            matchedPatient = cand;
            break;
          }
        }
      } else if (age) {
        if (candInfo.age_at_registration === age) {
          matchedPatient = cand;
          break;
        }
      } else {
        matchedPatient = cand;
        break;
      }
    }

    if (!matchedPatient) {
      const attempts = (session.data.verifyAttempts || 0) + 1;
      if (attempts >= 3) {
        await sendText(phoneNumberId, accessToken, from,
          "❌ Health ID recovery failed. For security, please visit the reception desk for assistance."
        );
        return { ...session, state: STATES.IDLE, data: {} };
      }
      await sendText(phoneNumberId, accessToken, from,
        `❌ No matching patient record found. Please verify your details and try again. (Attempt ${attempts}/3)\n\nWhat is your *full name* registered with us?`
      );
      return { ...session, state: STATES.RECOVERY_NAME, data: { verifyAttempts: attempts } };
    }

    const firstName = matchedPatient.full_name.split(' ')[0];
    await sendText(phoneNumberId, accessToken, from,
      `🎉 *Health ID Recovered!*\n\n🪪 Your Health ID: *${matchedPatient.health_id}*\n\nWelcome back, ${firstName}!`
    );

    const phone = normalizeIndianPhone(from);
    await query(
      `INSERT INTO patient_identities (patient_id, phone_number, verified_at)
       VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING`,
      [matchedPatient.id, phone]
    );

    const { sendMainMenu } = require('./menu.flow');
    await sendMainMenu(phoneNumberId, accessToken, from, firstName);

    return {
      ...session,
      state: STATES.MAIN_MENU,
      data: {
        patientId: matchedPatient.id,
        healthId: matchedPatient.health_id,
        fullName: matchedPatient.full_name,
        city: matchedPatient.city,
        phone
      }
    };

  } catch (err) {
    logger.error('Forgot ID recovery failed:', err);
    await sendText(phoneNumberId, accessToken, from,
      "⚠️ Something went wrong. Please try again or contact the reception."
    );
    return { ...session, state: STATES.IDLE, data: {} };
  }
}

module.exports = { handle, handleReturning, handleRecovery };
