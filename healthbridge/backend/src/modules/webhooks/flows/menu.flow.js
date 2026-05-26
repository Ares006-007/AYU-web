const { query } = require('../../../db/pool');
const { sendText } = require('../whatsapp.client');
const { formatIndianDate } = require('../../../utils/helpers');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../../../utils/logger');

// Initialize S3 client for generating report signed URLs
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.S3_BUCKET_NAME || 'healthbridge-reports';

/**
 * Send the main menu options to the patient.
 */
async function sendMainMenu(phoneNumberId, accessToken, to, firstName) {
  await sendText(phoneNumberId, accessToken, to,
    `👋 Hello ${firstName}!\n\nHow can we help you today? Please reply with a number:\n\n1️⃣ Book Appointment\n2️⃣ My Bookings\n3️⃣ My Reports\n4️⃣ My Health ID`
  );
}

/**
 * Main handler for menu states.
 */
async function handle(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const choice = input.trim();

  switch (session.state) {
    case STATES.MAIN_MENU:
      return handleMainMenuChoice(ctx, session, choice, STATES);

    case STATES.MY_BOOKINGS:
      if (choice === '1') {
        const bookingFlow = require('./booking.flow');
        return bookingFlow.handle(ctx, { ...session, state: STATES.BOOK_DEPT }, '1', STATES);
      }
      // fall through
    case STATES.MY_REPORTS:
    case STATES.MY_HEALTH_ID:
    default:
      // Any other message in these sub-states returns to the main menu
      const patientName = session.data.fullName || 'Patient';
      const firstName = patientName.split(' ')[0];
      await sendMainMenu(phoneNumberId, accessToken, from, firstName);
      return { ...session, state: STATES.MAIN_MENU };
  }
}

async function handleMainMenuChoice(ctx, session, choice, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const patientId = session.data.patientId;
  const patientName = session.data.fullName || 'Patient';
  const firstName = patientName.split(' ')[0];

  if (choice === '1') {
    const bookingFlow = require('./booking.flow');
    return bookingFlow.handle(ctx, { ...session, state: STATES.BOOK_DEPT }, '1', STATES);
  }

  if (choice === '2') {
    try {
      const result = await query(
        `SELECT a.token_number, a.appointment_date, a.status, d.full_name as doctor_name, d.specialty
         FROM appointments a
         JOIN doctors d ON d.id = a.doctor_id
         WHERE a.patient_id = $1
           AND a.appointment_date >= CURRENT_DATE
           AND a.status NOT IN ('cancelled', 'completed')
         ORDER BY a.appointment_date ASC, a.token_number ASC
         LIMIT 5`,
        [patientId]
      );

      if (!result.rows.length) {
        await sendText(phoneNumberId, accessToken, from,
          `📅 *My Bookings*\n\nYou have no active or upcoming appointments.\n\nReply with *1* to book an appointment, or type *MENU* to return to the main menu.`
        );
        return { ...session, state: STATES.MY_BOOKINGS };
      }

      let msg = `📅 *Your Upcoming Appointments:*\n\n`;
      result.rows.forEach((appt, index) => {
        const dateStr = formatIndianDate(appt.appointment_date);
        msg += `${index + 1}️⃣ Dr. ${appt.doctor_name} (${appt.specialty})\n📆 Date: ${dateStr}\n🎫 Token: *#${appt.token_number}*\n⚡ Status: ${appt.status}\n\n`;
      });
      msg += `Reply *MENU* to return to the main menu.`;

      await sendText(phoneNumberId, accessToken, from, msg);
      return { ...session, state: STATES.MY_BOOKINGS };
    } catch (err) {
      logger.error('Failed to fetch bookings for menu:', err);
      await sendText(phoneNumberId, accessToken, from, "⚠️ Error retrieving bookings. Please try again.");
      return session;
    }
  }

  if (choice === '3') {
    try {
      const result = await query(
        `SELECT r.report_name, r.file_key, r.created_at, h.name as hospital_name
         FROM reports r
         JOIN hospitals h ON h.id = r.hospital_id
         WHERE r.patient_id = $1
         ORDER BY r.created_at DESC
         LIMIT 5`,
        [patientId]
      );

      if (!result.rows.length) {
        await sendText(phoneNumberId, accessToken, from,
          `📄 *My Reports*\n\nYou don't have any medical reports uploaded yet.\n\nType *MENU* to return to the main menu.`
        );
        return { ...session, state: STATES.MY_REPORTS };
      }

      let msg = `📄 *Your Recent Reports:*\n\n`;
      for (let i = 0; i < result.rows.length; i++) {
        const r = result.rows[i];
        const signedUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: BUCKET, Key: r.file_key }),
          { expiresIn: 172800 } // 48 hours
        );
        const dateStr = new Date(r.created_at).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
        msg += `📝 *${r.report_name}*\n🏥 ${r.hospital_name}\n📅 Date: ${dateStr}\n👇 Tap to download:\n${signedUrl}\n\n`;
      }
      msg += `Reply *MENU* to return to the main menu.`;

      await sendText(phoneNumberId, accessToken, from, msg);
      return { ...session, state: STATES.MY_REPORTS };
    } catch (err) {
      logger.error('Failed to fetch reports for menu:', err);
      await sendText(phoneNumberId, accessToken, from, "⚠️ Error retrieving reports. Please try again.");
      return session;
    }
  }

  if (choice === '4') {
    try {
      const result = await query(
        `SELECT health_id, full_name, city, age_at_registration, dob
         FROM patients WHERE id = $1`,
        [patientId]
      );
      if (!result.rows.length) {
        await sendText(phoneNumberId, accessToken, from, "Patient record not found.");
        return { ...session, state: STATES.MAIN_MENU };
      }
      const patient = result.rows[0];
      const ageDobStr = patient.dob
        ? new Date(patient.dob).toLocaleDateString('en-IN')
        : `${patient.age_at_registration} years`;

      const msg = `🪪 *YOUR AYU HEALTH CARD*\n\n👤 Name: *${patient.full_name}*\n🪪 Health ID: *${patient.health_id}*\n📍 City: *${patient.city || 'Not specified'}*\n📅 DOB/Age: *${ageDobStr}*\n📞 Phone: *${session.data.phone || from}*\n\nReply *MENU* to return to the main menu.`;
      await sendText(phoneNumberId, accessToken, from, msg);
      return { ...session, state: STATES.MY_HEALTH_ID };
    } catch (err) {
      logger.error('Failed to fetch health card:', err);
      return session;
    }
  }

  await sendText(phoneNumberId, accessToken, from,
    `Please select a valid option (1, 2, 3, or 4).\n\n1️⃣ Book Appointment\n2️⃣ My Bookings\n3️⃣ My Reports\n4️⃣ My Health ID`
  );
  return session;
}

module.exports = { handle, sendMainMenu };
