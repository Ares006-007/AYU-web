const { Pool } = require('pg');
const logger = require('../utils/logger');

let useMock = false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  if (!useMock) {
    logger.error('Unexpected PostgreSQL pool error:', err);
  }
});

// Interactive mock data for dashboard preview
const mockData = {
  hospitals: [
    { id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', name: 'Ayu General Hospital', wa_phone_number_id: '1234567890', is_active: true }
  ],
  doctors: [
    { id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', full_name: 'Amit Verma', specialty: 'Cardiology', department: 'Cardiology', qualification: 'MD, DM (Cardio)', is_active: true },
    { id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', full_name: 'Priya Sharma', specialty: 'Pediatrics', department: 'Pediatrics', qualification: 'MD (Pedia)', is_active: true },
    { id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', full_name: 'Rajesh Patel', specialty: 'General Medicine', department: 'General Medicine', qualification: 'MBBS, MD', is_active: true }
  ],
  patients: [
    { id: 'p1', health_id: 'MED-HYD-2026-X7Y8Z9', full_name: 'Ravi Kumar Sharma', dob: '1990-08-15', age_at_registration: 35, city: 'Hyderabad', is_active: true },
    { id: 'p2', health_id: 'MED-MUM-2026-A2B3C4', full_name: 'Sunita Rao', dob: '1985-05-12', age_at_registration: 41, city: 'Mumbai', is_active: true },
    { id: 'p3', health_id: 'MED-DEL-2026-M5N6P7', full_name: 'Vikram Malhotra', dob: '1995-12-01', age_at_registration: 30, city: 'Delhi', is_active: true }
  ],
  appointments: [
    { id: 'a1', patient_id: 'p1', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', doctor_id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', slot_id: 's1', booking_phone: '+919876543210', token_number: 1, appointment_date: new Date().toISOString().split('T')[0], chief_complaint: 'Chest pain and breathlessness', status: 'in_progress' },
    { id: 'a2', patient_id: 'p2', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', doctor_id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', slot_id: 's2', booking_phone: '+919999888777', token_number: 2, appointment_date: new Date().toISOString().split('T')[0], chief_complaint: 'Routine baby checkup', status: 'waiting' },
    { id: 'a3', patient_id: 'p3', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', doctor_id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', slot_id: 's3', booking_phone: '+918887776665', token_number: 3, appointment_date: new Date().toISOString().split('T')[0], chief_complaint: 'High fever since 3 days', status: 'waiting' }
  ],
  queue_tokens: [
    { id: 'qt1', appointment_id: 'a1', doctor_id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', queue_date: new Date().toISOString().split('T')[0], token_number: 1, status: 'in_progress', called_at: new Date(), completed_at: null, alert_sent: true },
    { id: 'qt2', appointment_id: 'a2', doctor_id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', queue_date: new Date().toISOString().split('T')[0], token_number: 2, status: 'waiting', called_at: null, completed_at: null, alert_sent: false },
    { id: 'qt3', appointment_id: 'a3', doctor_id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', queue_date: new Date().toISOString().split('T')[0], token_number: 3, status: 'waiting', called_at: null, completed_at: null, alert_sent: false }
  ],
  payments: [
    { id: 'pay1', appointment_id: 'a1', patient_id: 'p1', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', amount_paise: 50000, currency: 'INR', description: 'Consultation — Amit Verma', status: 'paid', paid_at: new Date() },
    { id: 'pay2', appointment_id: 'a2', patient_id: 'p2', hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', amount_paise: 30000, currency: 'INR', description: 'Consultation — Priya Sharma', status: 'link_sent', link_sent_at: new Date() }
  ],
  reports: []
};

async function connectDB() {
  try {
    const client = await pool.connect();
    logger.info('PostgreSQL connected successfully');
    client.release();
  } catch (err) {
    logger.warn('PostgreSQL connection failed. Starting database in MOCK/MEMORY mode...');
    useMock = true;
    process.env.MOCK_DB = 'true';
  }
}

/**
 * Execute a query with params.
 */
async function query(text, params) {
  if (useMock) {
    const queryLower = text.toLowerCase();

    // 1. Staff login check (Dynamically logs in any email)
    if (queryLower.includes('hospital_staff') && queryLower.includes('email = $1')) {
      const email = params[0];
      return {
        rows: [{
          id: '9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f',
          hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
          role: 'hospital_admin',
          full_name: 'Shaik Mohammad Ajhaj',
          email: email,
          password_hash: '$2a$12$N9qo8uLOtv0sqy.DMT7x0urlJ7tbQc21Ap3uFA4A.B.E./z0Q35j.', // 'admin123'
          hospital_name: 'Ayu General Hospital',
          hospital_active: true
        }]
      };
    }

    // 2. Staff auth password check fallback
    if (queryLower.includes('password_hash') && queryLower.includes('hospital_staff') && queryLower.includes('id = $1')) {
      return {
        rows: [{
          password_hash: '$2a$12$N9qo8uLOtv0sqy.DMT7x0urlJ7tbQc21Ap3uFA4A.B.E./z0Q35j.'
        }]
      };
    }

    // 2b. Staff active user verification check
    if (queryLower.includes('hospital_staff') && queryLower.includes('id = $1') && !queryLower.includes('password_hash')) {
      return {
        rows: [{
          id: '9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f',
          hospital_id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
          role: 'hospital_admin',
          full_name: 'Shaik Mohammad Ajhaj',
          email: 'shaikajhaj@gmail.com',
          is_active: true
        }]
      };
    }

    // 3. Hospital lookup
    if (queryLower.includes('hospitals') && queryLower.includes('id = $1')) {
      return {
        rows: [mockData.hospitals[0]]
      };
    }

    // 4. Doctors list
    if (queryLower.includes('doctors') && !queryLower.includes('doctor_slots')) {
      return {
        rows: mockData.doctors
      };
    }

    // 5. Live queue list today
    if (queryLower.includes('queue_tokens') && queryLower.includes('queue_date = current_date')) {
      let filtered = mockData.queue_tokens;
      if (params && params.length > 1) {
        const doctorId = params[1];
        filtered = filtered.filter(x => x.doctor_id === doctorId);
      }
      return {
        rows: filtered.map(qt => {
          const a = mockData.appointments.find(x => x.id === qt.appointment_id);
          const p = mockData.patients.find(x => x.id === a.patient_id);
          const d = mockData.doctors.find(x => x.id === qt.doctor_id);
          return {
            id: qt.id,
            token_number: qt.token_number,
            status: qt.status,
            called_at: qt.called_at,
            completed_at: qt.completed_at,
            alert_sent: qt.alert_sent,
            chief_complaint: a.chief_complaint,
            booking_phone: a.booking_phone,
            health_id: p.health_id,
            patient_name: p.full_name,
            doctor_name: d.full_name,
            specialty: d.specialty
          };
        })
      };
    }

    // 6. Queue stats today
    if (queryLower.includes('queue_tokens') && queryLower.includes('count(*) filter')) {
      return {
        rows: [{
          waiting: mockData.queue_tokens.filter(x => x.status === 'waiting').length,
          in_progress: mockData.queue_tokens.filter(x => x.status === 'in_progress').length,
          completed: mockData.queue_tokens.filter(x => x.status === 'completed').length,
          skipped: mockData.queue_tokens.filter(x => x.status === 'skipped').length,
          avg_consult_min: 12.5
        }]
      };
    }

    // 7. Appointments list
    if (queryLower.includes('appointments a') && queryLower.includes('patients p')) {
      return {
        rows: mockData.appointments.map(a => {
          const p = mockData.patients.find(x => x.id === a.patient_id);
          const d = mockData.doctors.find(x => x.id === a.doctor_id);
          const qt = mockData.queue_tokens.find(x => x.appointment_id === a.id);
          const pay = mockData.payments.find(x => x.appointment_id === a.id);
          return {
            id: a.id,
            token_number: a.token_number,
            status: a.status,
            chief_complaint: a.chief_complaint,
            appointment_date: a.appointment_date,
            booking_phone: a.booking_phone,
            created_at: new Date(),
            health_id: p.health_id,
            patient_name: p.full_name,
            city: p.city,
            doctor_name: d.full_name,
            specialty: d.specialty,
            queue_status: qt ? qt.status : null,
            alert_sent: qt ? qt.alert_sent : false,
            payment_status: pay ? pay.status : null
          };
        })
      };
    }

    // 8. Update queue advance
    if (queryLower.includes('update queue_tokens set status = \'completed\'')) {
      const tokenId = params[0];
      const token = mockData.queue_tokens.find(x => x.id === tokenId);
      if (token) {
        token.status = 'completed';
        token.completed_at = new Date();
        const a = mockData.appointments.find(x => x.id === token.appointment_id);
        if (a) a.status = 'completed';

        // Find next waiting and set in_progress
        const nextToken = mockData.queue_tokens
          .filter(x => x.doctor_id === token.doctor_id && x.status === 'waiting')
          .sort((a,b) => a.token_number - b.token_number)[0];
        if (nextToken) {
          nextToken.status = 'in_progress';
          nextToken.called_at = new Date();
          return { rows: [{ doctor_id: token.doctor_id, queue_date: new Date(), token_number: nextToken.token_number }] };
        }
        return { rows: [{ doctor_id: token.doctor_id, queue_date: new Date(), token_number: null }] };
      }
      return { rows: [] };
    }

    // 9. Update queue skip
    if (queryLower.includes('update queue_tokens set status = \'skipped\'')) {
      const tokenId = params[0];
      const token = mockData.queue_tokens.find(x => x.id === tokenId);
      if (token) {
        token.status = 'skipped';
        const a = mockData.appointments.find(x => x.id === token.appointment_id);
        if (a) a.status = 'no_show';
      }
      return { rows: [] };
    }

    // 10. Update appointment status / cancel
    if (queryLower.includes('update appointments set status = \'cancelled\'')) {
      const apptId = params[1];
      const appt = mockData.appointments.find(x => x.id === apptId);
      if (appt) {
        appt.status = 'cancelled';
        const token = mockData.queue_tokens.find(x => x.appointment_id === apptId);
        if (token) token.status = 'skipped';
      }
      return { rows: [] };
    }

    // 11. Payments list
    if (queryLower.includes('payments pay') && queryLower.includes('appointments a')) {
      return {
        rows: mockData.payments.map(pay => {
          const a = mockData.appointments.find(x => x.id === pay.appointment_id);
          const p = mockData.patients.find(x => x.id === pay.patient_id);
          const d = mockData.doctors.find(x => x.id === a.doctor_id);
          return {
            id: pay.id,
            amount_paise: pay.amount_paise,
            status: pay.status,
            link_sent_at: pay.link_sent_at,
            paid_at: pay.paid_at,
            payment_link_url: pay.payment_link_url || 'https://rzp.io/i/mock',
            razorpay_payment_id: pay.razorpay_payment_id || 'pay_mock123',
            patient_name: p.full_name,
            health_id: p.health_id,
            doctor_name: d.full_name,
            appointment_date: a.appointment_date,
            token_number: a.token_number
          };
        })
      };
    }

    // 12. Payments summary
    if (queryLower.includes('payments') && queryLower.includes('total_collected_paise')) {
      return {
        rows: [{
          paid_count: mockData.payments.filter(x => x.status === 'paid').length,
          total_collected_paise: mockData.payments.filter(x => x.status === 'paid').reduce((acc, x) => acc + x.amount_paise, 0),
          pending_count: mockData.payments.filter(x => x.status !== 'paid').length,
          pending_paise: mockData.payments.filter(x => x.status !== 'paid').reduce((acc, x) => acc + x.amount_paise, 0)
        }]
      };
    }

    // 13. Audit logs write
    if (queryLower.includes('insert into audit_logs')) {
      return { rows: [] };
    }

    // Default fallback
    return { rows: [] };
  }

  // Real PG logic
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow query detected (${duration}ms): ${text}`);
    }
    return res;
  } catch (err) {
    logger.error('DB query error:', { text, error: err.message });
    throw err;
  }
}

/**
 * Run queries in a transaction.
 */
async function withTransaction(fn) {
  if (useMock) {
    return await fn({ query });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction, connectDB };
