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
    password_hash TEXT,
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
    password_hash TEXT,
    role TEXT NOT NULL,
    insurer_id INTEGER REFERENCES insurers(insurer_id) ON DELETE SET NULL
);

-- ======================================
-- SYSTEM ADMINISTRATORS
-- ======================================
CREATE TABLE system_admins (
    admin_id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT
);

-- ======================================
-- PATIENTS
-- ======================================
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    password_hash TEXT,
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
-- CLAIM MESSAGES (REASONS BY INSURERS)
-- ======================================
CREATE TABLE claim_messages (
    message_id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(claim_id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role = 'InsurerStaff'),
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
--TEST CASES
-- Insert hospital
INSERT INTO hospitals (hospital_id, name, location) VALUES
(100, 'General Hospital', 'Nairobi');

-- Insert insurer
INSERT INTO insurers (insurer_id, name, contact_email) VALUES
(200, 'National Health Insurance', 'support@nhif.com');

-- Insert hospital staff (Doctor)
INSERT INTO hospital_staff (staff_id, full_name, email, password_hash, role, hospital_id)
VALUES (101, 'Alice Doctor', 'alice@hospital.com',
'$2b$10$pTMNvejJD2PKUd9Xci1R0eORFZ8syjOP5J//SkeNZIjFOkCstu6BS', 'Doctor', 100);

-- Insert insurer staff (Claims Officer)
INSERT INTO insurer_staff (staff_id, full_name, email, password_hash, role, insurer_id)
VALUES (201, 'Bob Claims', 'bob@insurer.com',
'$2a$10$KtAiZ8Euog1UBFzN44NJleZuQmuPejMfS/91FQ4FTbUQef5XZRt7e', 'ClaimsOfficer', 200);

-- Insert patient (Login enabled)
INSERT INTO patients (patient_id, full_name, email, password_hash, date_of_birth, insurance_number, insurer_id)
VALUES (301, 'Charlie Patient', 'charlie@patient.com',
'$2a$10$KtAiZ8Euog1UBFzN44NJleZuQmuPejMfS/91FQ4FTbUQef5XZRt7e', '1995-01-01', 'INS-1234', 200);

-- Insert system admin
INSERT INTO system_admins (admin_id, full_name, email, password_hash)
VALUES (401, 'Diana Admin', 'admin@sys.com',
'$2a$10$KtAiZ8Euog1UBFzN44NJleZuQmuPejMfS/91FQ4FTbUQef5XZRt7e');

-- Submit a test claim (from hospital staff on behalf of patient)
INSERT INTO claims (claim_id, patient_id, submitted_by_staff_id, treatment_details, status)
VALUES (501, 301, 101, 'Outpatient visit for fever and lab tests', 'Pending');

-- Approve the claim (simulating approval and reason)
UPDATE claims SET status = 'Approved', approval_date = NOW() WHERE claim_id = 501;

-- Add message by insurer (reason for approval)
INSERT INTO claim_messages (message_id, claim_id, sender_role, sender_id, message)
VALUES (601, 501, 'InsurerStaff', 201, 'Claim approved based on valid coverage.');

-- Generate invoice
INSERT INTO invoices (invoice_id, claim_id, generated_by_staff_id, amount)
VALUES (701, 501, 101, 5500.00);

-- Sample rejected claim
INSERT INTO claims (claim_id, patient_id, submitted_by_staff_id, treatment_details, status, rejection_reason)
VALUES (502, 301, 101, 'Claim for elective cosmetic surgery', 'Rejected', 'Procedure not covered under plan.');

-- Message for rejected claim
INSERT INTO claim_messages (message_id, claim_id, sender_role, sender_id, message)
VALUES (602, 502, 'InsurerStaff', 201, 'Claim rejected due to exclusion in policy.');
