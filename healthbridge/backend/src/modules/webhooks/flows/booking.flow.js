const { query, withTransaction } = require('../../../db/pool');
const { sendText } = require('../whatsapp.client');
const { incrementToken } = require('../../../db/redis');
const { formatIndianDate } = require('../../../utils/helpers');
const { writeAuditLog } = require('../../../utils/audit');
const logger = require('../../../utils/logger');

/**
 * Handle all booking FSM states.
 */
async function handle(ctx, session, input, STATES) {
  switch (session.state) {
    case STATES.BOOK_DEPT:
      return handleDept(ctx, session, input, STATES);
    case STATES.BOOK_DOCTOR:
      return handleDoctor(ctx, session, input, STATES);
    case STATES.BOOK_DATE:
      return handleDate(ctx, session, input, STATES);
    case STATES.BOOK_COMPLAINT:
      return handleComplaint(ctx, session, input, STATES);
    default:
      return session;
  }
}

async function handleDept(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;

  // If patient just registered and replied 2 (book later)
  if (input === '2') {
    await sendText(phoneNumberId, accessToken, from,
      "No problem! Whenever you're ready, just send us a message to book your appointment. 😊\n\nStay healthy! 🙏"
    );
    return { ...session, state: STATES.IDLE, data: { patientId: session.data.patientId } };
  }

  // Load departments for this hospital
  const depts = await query(
    `SELECT DISTINCT specialty as dept FROM doctors
     WHERE hospital_id = $1 AND is_active = TRUE ORDER BY specialty`,
    [session.hospitalId]
  );

  if (!depts.rows.length) {
    await sendText(phoneNumberId, accessToken, from,
      "⚠️ No doctors are currently available. Please contact the reception for assistance."
    );
    return { ...session, state: STATES.IDLE };
  }

  const deptList = depts.rows
    .map((d, i) => `${i + 1}️⃣ ${d.dept}`)
    .join('\n');

  await sendText(phoneNumberId, accessToken, from,
    `Which *department* would you like to visit?\n\n${deptList}\n\nReply with a number.`
  );

  return { ...session, state: STATES.BOOK_DOCTOR, data: { ...session.data, departments: depts.rows } };
}

async function handleDoctor(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const choice = parseInt(input, 10);
  const depts = session.data.departments || [];

  if (isNaN(choice) || choice < 1 || choice > depts.length) {
    await sendText(phoneNumberId, accessToken, from,
      `Please reply with a number between 1 and ${depts.length}.`
    );
    return session;
  }

  const selectedDept = depts[choice - 1].dept;

  // Next 4 available dates for doctors in this dept
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const doctors = await query(
    `SELECT DISTINCT d.id, d.full_name, ds.slot_date, ds.start_time, ds.end_time,
            ds.max_tokens - COUNT(a.id) as slots_left, ds.id as slot_id
     FROM doctors d
     JOIN doctor_slots ds ON ds.doctor_id = d.id
     LEFT JOIN appointments a ON a.slot_id = ds.id AND a.status NOT IN ('cancelled', 'no_show')
     WHERE d.hospital_id = $1 AND d.specialty = $2 AND d.is_active = TRUE
       AND ds.is_available = TRUE AND ds.is_blocked = FALSE
       AND ds.slot_date >= CURRENT_DATE
     GROUP BY d.id, d.full_name, ds.slot_date, ds.start_time, ds.end_time, ds.max_tokens, ds.id
     HAVING ds.max_tokens - COUNT(a.id) > 0
     ORDER BY ds.slot_date, ds.start_time
     LIMIT 10`,
    [session.hospitalId, selectedDept]
  );

  if (!doctors.rows.length) {
    await sendText(phoneNumberId, accessToken, from,
      `⚠️ No available slots for *${selectedDept}* in the next few days.\n\nPlease contact the reception or try another department.`
    );
    return { ...session, state: STATES.BOOK_DEPT };
  }

  const doctorList = doctors.rows
    .map((d, i) => `${i + 1}️⃣ Dr. ${d.full_name} — ${formatIndianDate(d.slot_date)}, ${formatTime(d.start_time)} (${d.slots_left} slots left)`)
    .join('\n');

  await sendText(phoneNumberId, accessToken, from,
    `*${selectedDept}* — Available slots:\n\n${doctorList}\n\nReply with a number to select.`
  );

  return {
    ...session,
    state: STATES.BOOK_DATE,
    data: { ...session.data, selectedDept, doctorSlots: doctors.rows }
  };
}

async function handleDate(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const choice = parseInt(input, 10);
  const slots = session.data.doctorSlots || [];

  if (isNaN(choice) || choice < 1 || choice > slots.length) {
    await sendText(phoneNumberId, accessToken, from,
      `Please reply with a number between 1 and ${slots.length}.`
    );
    return session;
  }

  const selected = slots[choice - 1];

  await sendText(phoneNumberId, accessToken, from,
    `You selected *Dr. ${selected.full_name}* on *${formatIndianDate(selected.slot_date)}*.\n\nBriefly, what is your *reason for visit* or main complaint?\n(Example: chest pain, routine checkup, follow-up for fever)\n\nOr reply *SKIP* to skip.`
  );

  return {
    ...session,
    state: STATES.BOOK_COMPLAINT,
    data: { ...session.data, selectedSlot: selected }
  };
}

async function handleComplaint(ctx, session, input, STATES) {
  const { from, phoneNumberId, accessToken } = ctx;
  const complaint = input.toUpperCase() === 'SKIP' ? null : input.trim();
  const { patientId, selectedSlot } = session.data;

  try {
    const slot = selectedSlot;
    const appointmentDate = slot.slot_date instanceof Date
      ? slot.slot_date.toISOString().split('T')[0]
      : slot.slot_date;

    // Assign token atomically
    const tokenNumber = await incrementToken(slot.doctor_id || slot.id, appointmentDate);

    const phone = session.data.phone;

    const appointment = await withTransaction(async (client) => {
      // Double-check slot capacity
      const capacityCheck = await client.query(
        `SELECT ds.max_tokens, COUNT(a.id) as booked
         FROM doctor_slots ds
         LEFT JOIN appointments a ON a.slot_id = ds.id AND a.status NOT IN ('cancelled', 'no_show')
         WHERE ds.id = $1
         GROUP BY ds.max_tokens`,
        [slot.slot_id]
      );

      const cap = capacityCheck.rows[0];
      if (cap && parseInt(cap.booked) >= parseInt(cap.max_tokens)) {
        throw new Error('SLOT_FULL');
      }

      const appt = await client.query(
        `INSERT INTO appointments
           (patient_id, hospital_id, doctor_id, slot_id, booking_phone, token_number,
            appointment_date, chief_complaint, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'scheduled')
         RETURNING id`,
        [patientId, session.hospitalId, slot.doctor_id || slot.id, slot.slot_id,
         phone, tokenNumber, appointmentDate, complaint]
      );

      await client.query(
        `INSERT INTO queue_tokens
           (appointment_id, doctor_id, hospital_id, queue_date, token_number, status)
         VALUES ($1, $2, $3, $4, $5, 'waiting')`,
        [appt.rows[0].id, slot.doctor_id || slot.id, session.hospitalId, appointmentDate, tokenNumber]
      );

      return appt.rows[0];
    });

    await writeAuditLog({
      actorType: 'patient',
      actorPhone: from,
      action: 'create',
      entityType: 'appointment',
      entityId: appointment.id,
      hospitalId: session.hospitalId,
      description: `Appointment booked via WhatsApp. Token #${tokenNumber}`,
    });

    await sendText(phoneNumberId, accessToken, from,
      `✅ *Appointment Confirmed!*\n\n🏥 ${slot.hospital_name || 'Your clinic'}\n👨‍⚕️ Dr. ${slot.full_name} (${session.data.selectedDept})\n📅 ${formatIndianDate(appointmentDate)}\n🎫 Your Token: *#${tokenNumber}*\n\n📌 You don't need to arrive early. We'll send you a WhatsApp alert when your turn is approaching.\n\n*Please arrive 15 minutes before your token is called.*\n\nReply *STATUS* anytime to check your queue position.`
    );

    return { ...session, state: STATES.IDLE, data: { patientId } };

  } catch (err) {
    if (err.message === 'SLOT_FULL') {
      await sendText(phoneNumberId, accessToken, from,
        "⚠️ Sorry, this slot just got filled up! Please choose another slot.\n\nType *MENU* to start booking again."
      );
      return { ...session, state: STATES.IDLE };
    }
    logger.error('Booking failed:', err);
    await sendText(phoneNumberId, accessToken, from,
      "⚠️ Something went wrong. Please try again or contact the reception."
    );
    return { ...session, state: STATES.IDLE };
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

module.exports = { handle };
