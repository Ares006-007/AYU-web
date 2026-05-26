-- ============================================================
-- Ayu Platform / HealthBridge — PostgreSQL Schema
-- ============================================================

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. HOSPITALS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  wa_phone_number_id VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. HOSPITAL STAFF ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hospital_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'doctor', 'hospital_admin', 'receptionist'
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. PATIENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  dob DATE,
  age_at_registration INTEGER,
  city VARCHAR(100),
  aadhaar_last6_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 4. PATIENT IDENTITIES (Multi-phone support) ────────────────
CREATE TABLE IF NOT EXISTS patient_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  phone_number VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_patient_phone UNIQUE (patient_id, phone_number)
);

-- ── 5. CONSENT LOGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL, -- e.g., 'registration'
  consented BOOLEAN NOT NULL,
  consent_text TEXT NOT NULL,
  channel VARCHAR(50) NOT NULL DEFAULT 'whatsapp',
  phone_number VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. DOCTORS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  qualification VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 7. DOCTOR SLOTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_tokens INTEGER DEFAULT 30,
  is_available BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 8. APPOINTMENTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES doctor_slots(id) ON DELETE SET NULL,
  booking_phone VARCHAR(50) NOT NULL,
  token_number INTEGER NOT NULL,
  appointment_date DATE NOT NULL,
  chief_complaint TEXT,
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  diagnosis_notes TEXT,
  follow_up_date DATE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 9. QUEUE TOKENS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  queue_date DATE NOT NULL,
  token_number INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed', 'skipped'
  called_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 10. REPORTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  report_name VARCHAR(200) NOT NULL,
  report_type VARCHAR(100) DEFAULT 'general',
  file_key VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded', 'sent'
  uploaded_by UUID REFERENCES hospital_staff(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 11. PAYMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  razorpay_payment_link_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  amount_paise INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  description TEXT,
  payment_link_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'link_sent', 'paid', 'expired'
  link_sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 12. AUDIT LOGS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type VARCHAR(50) NOT NULL, -- 'staff', 'system', 'patient'
  actor_id UUID,
  actor_phone VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── INDEXES FOR PERFORMANCE ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patients_health_id ON patients(health_id);
CREATE INDEX IF NOT EXISTS idx_patient_identities_phone ON patient_identities(phone_number);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_queue_tokens_date_status ON queue_tokens(queue_date, status);
CREATE INDEX IF NOT EXISTS idx_payments_appt_id ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- SEED INITIAL DATA
-- ============================================================

-- 1. Default Hospital
INSERT INTO hospitals (id, name, wa_phone_number_id, is_active)
VALUES (
  '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 
  'Ayu General Hospital', 
  '1234567890', 
  TRUE
)
ON CONFLICT (wa_phone_number_id) DO NOTHING;

-- 2. Default Hospital Staff Admin
-- Log in using Email: admin@ayulife.in | Password: admin123
INSERT INTO hospital_staff (id, hospital_id, role, full_name, email, password_hash, is_active)
VALUES (
  '9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f',
  '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  'hospital_admin',
  'Dr. Amit Verma',
  'admin@ayulife.in',
  '$2a$12$N9qo8uLOtv0sqy.DMT7x0urlJ7tbQc21Ap3uFA4A.B.E./z0Q35j.', -- bcrypt hash for 'admin123'
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 3. Doctors
INSERT INTO doctors (id, hospital_id, full_name, specialty, department, qualification, is_active)
VALUES
  ('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'Amit Verma', 'Cardiology', 'Cardiology', 'MD, DM (Cardio)', TRUE),
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'Priya Sharma', 'Pediatrics', 'Pediatrics', 'MD (Pedia)', TRUE),
  ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'Rajesh Patel', 'General Medicine', 'General Medicine', 'MBBS, MD', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Doctor Slots for today and the next 7 days
INSERT INTO doctor_slots (id, doctor_id, hospital_id, slot_date, start_time, end_time, max_tokens, is_available)
SELECT 
  gen_random_uuid(),
  d.id,
  '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  (CURRENT_DATE + i),
  '09:00:00',
  '13:00:00',
  30,
  TRUE
FROM doctors d
CROSS JOIN generate_series(0, 7) AS i
ON CONFLICT DO NOTHING;
