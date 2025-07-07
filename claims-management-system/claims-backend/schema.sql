-- =============================
-- SEED DATA FOR TESTING
-- =============================
-- Hospitals
INSERT INTO hospitals (hospital_id, name, location) VALUES
  (100, 'General Hospital', 'Nairobi'),
  (101, 'City Medical Center', 'Mombasa');

-- Insurers
INSERT INTO insurers (insurer_id, name, contact_email) VALUES
  (200, 'National Health Insurance', 'support@nhif.com'),
  (201, 'Britam', 'contact@britam.com');

-- Hospital Staff
INSERT INTO hospital_staff (staff_id, full_name, email, password_hash, role, hospital_id) VALUES
  (101, 'Alice Doctor', 'alice@hospital.com', 'HASHED_PASSWORD', 'HospitalStaff', 100),
  (102, 'Eve Nurse', 'eve@hospital.com', 'HASHED_PASSWORD', 'HospitalStaff', 101);

-- Insurer Staff
INSERT INTO insurer_staff (staff_id, full_name, email, password_hash, role, insurer_id) VALUES
  (201, 'Bob Claims', 'bob@insurer.com', 'HASHED_PASSWORD', 'InsurerStaff', 200),
  (202, 'Frank Assessor', 'frank@insurer.com', 'HASHED_PASSWORD', 'InsurerStaff', 201);

-- Patients
INSERT INTO patients (patient_id, full_name, email, password_hash, date_of_birth, insurance_number, insurer_id) VALUES
  (301, 'Charlie Patient', 'charlie@patient.com', 'HASHED_PASSWORD', '1995-01-01', 'INS-1234', 200),
  (302, 'David Patient', 'david@patient.com', 'HASHED_PASSWORD', '1988-05-20', 'INS-5678', 201);

-- System Admin
INSERT INTO system_admins (admin_id, full_name, email, password_hash) VALUES
  (401, 'Diana Admin', 'admin@sys.com', 'HASHED_PASSWORD');

-- Claims
INSERT INTO claims (claim_id, patient_id, submitted_by_staff_id, treatment_details, status, rejection_reason) VALUES
  (501, 301, 101, 'Outpatient visit for fever and lab tests', 'Approved', NULL),
  (502, 301, 101, 'Claim for elective cosmetic surgery', 'Rejected', 'Procedure not covered under plan.'),
  (503, 302, 102, 'Emergency room visit for broken arm', 'Pending', NULL),
  (504, 302, 102, 'Follow-up appointment for broken arm', 'Approved', NULL),
  (505, 301, 101, 'Routine checkup and blood work', 'Pending', NULL),
  (506, 301, 101, 'Dental surgery', 'Approved', NULL),
  (507, 302, 102, 'MRI scan for back pain', 'Rejected', 'MRI not covered'),
  (508, 302, 102, 'Physical therapy sessions', 'Pending', NULL),
  (509, 301, 101, 'Vaccination', 'Approved', NULL),
  (510, 302, 102, 'Hospitalization for pneumonia', 'Pending', NULL);

-- Invoices
INSERT INTO invoices (invoice_id, claim_id, generated_by_staff_id, amount) VALUES
  (701, 501, 101, 5500.00),
  (702, 504, 102, 2500.00),
  (703, 506, 101, 12000.00),
  (704, 509, 101, 800.00);

-- Claim Messages
INSERT INTO claim_messages (message_id, claim_id, sender_role, sender_id, message) VALUES
  (601, 501, 'InsurerStaff', 201, 'Claim approved based on valid coverage.'),
  (602, 502, 'InsurerStaff', 201, 'Claim rejected due to exclusion in policy.'),
  (603, 504, 'InsurerStaff', 202, 'Claim approved.');

-- Audit Logs
INSERT INTO claim_edit_logs (edit_id, claim_id, editor_role, editor_id, edit_timestamp, edit_details) VALUES
  (801, 501, 'SystemAdmin', 401, NOW() - INTERVAL '2 days', 'Changed claim status from Pending to Approved'),
  (802, 502, 'SystemAdmin', 401, NOW() - INTERVAL '1 day', 'Edited rejection reason'),
  (803, 504, 'SystemAdmin', 401, NOW() - INTERVAL '3 hours', 'Updated treatment details'),
  (804, 506, 'SystemAdmin', 401, NOW() - INTERVAL '1 hour', 'Corrected patient ID');
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
