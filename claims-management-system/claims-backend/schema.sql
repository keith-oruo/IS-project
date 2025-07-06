-- ======================================
-- HOSPITALS
-- ======================================
CREATE TABLE hospitals (
    hospital_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT
);

-- ======================================
-- HOSPITAL STAFF
-- ======================================
CREATE TABLE hospital_staff (
    staff_id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    hospital_id INTEGER REFERENCES hospitals(hospital_id) ON DELETE SET NULL
);

-- ======================================
-- INSURERS
-- ======================================
CREATE TABLE insurers (
    insurer_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_email TEXT
);

-- ======================================
-- INSURER STAFF
-- ======================================
CREATE TABLE insurer_staff (
    staff_id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    insurer_id INTEGER REFERENCES insurers(insurer_id) ON DELETE SET NULL
);

-- ======================================
-- SYSTEM ADMINISTRATORS
-- ======================================
CREATE TABLE system_admins (
    admin_id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL
);

-- ======================================
-- PATIENTS
-- ======================================
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    insurance_number TEXT,
    insurer_id INTEGER REFERENCES insurers(insurer_id) ON DELETE SET NULL
);

-- ======================================
-- CLAIMS
-- ======================================
CREATE TABLE claims (
    claim_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(patient_id) ON DELETE CASCADE,
    submitted_by_staff_id INTEGER REFERENCES hospital_staff(staff_id),
    treatment_details TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    last_edited_by_staff_id INTEGER REFERENCES hospital_staff(staff_id)
);

-- ======================================
-- INVOICES
-- ======================================
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    claim_id INTEGER UNIQUE REFERENCES claims(claim_id) ON DELETE CASCADE,
    generated_by_staff_id INTEGER REFERENCES hospital_staff(staff_id),
    amount NUMERIC(10, 2) NOT NULL,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- CLAIM MESSAGES
-- ======================================
CREATE TABLE claim_messages (
    message_id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(claim_id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('HospitalStaff', 'InsurerStaff', 'SystemAdmin')),
    sender_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- CLAIM EDIT LOGS
-- ======================================
CREATE TABLE claim_edit_logs (
    edit_id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(claim_id) ON DELETE CASCADE,
    editor_role TEXT NOT NULL CHECK (editor_role IN ('HospitalStaff', 'InsurerStaff', 'SystemAdmin')),
    editor_id INTEGER NOT NULL,
    edit_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edit_details TEXT
);
