const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('TRUNCATE TABLE claim_edit_logs, claim_messages, invoices, claims, patients, system_admins, insurer_staff, insurers, hospital_staff, hospitals RESTART IDENTITY CASCADE');

    // Hash passwords
    const passwordAlice = await bcrypt.hash('password123', 10);
    const passwordBob = await bcrypt.hash('password123', 10);
    const passwordCharlie = await bcrypt.hash('password123', 10);
    const passwordDiana = await bcrypt.hash('password123', 10);

    // Insert hospitals
    await client.query(`
      INSERT INTO hospitals (hospital_id, name, location) VALUES
      (100, 'General Hospital', 'Nairobi'),
      (101, 'City Medical Center', 'Mombasa');
    `);

    // Insert insurers
    await client.query(`
      INSERT INTO insurers (insurer_id, name, contact_email) VALUES
      (200, 'National Health Insurance', 'support@nhif.com'),
      (201, 'Britam', 'contact@britam.com');
    `);

    // Insert hospital staff
    await client.query(`
      INSERT INTO hospital_staff (staff_id, full_name, email, password_hash, role, hospital_id) VALUES
      (101, 'Alice Doctor', 'alice@hospital.com', $1, 'HospitalStaff', 100);
    `, [passwordAlice]);

    // Insert insurer staff
    await client.query(`
      INSERT INTO insurer_staff (staff_id, full_name, email, password_hash, role, insurer_id) VALUES
      (201, 'Bob Claims', 'bob@insurer.com', $1, 'InsurerStaff', 200);
    `, [passwordBob]);

    // Insert patients
    await client.query(`
      INSERT INTO patients (patient_id, full_name, email, password_hash, date_of_birth, insurance_number, insurer_id) VALUES
      (301, 'Charlie Patient', 'charlie@patient.com', $1, '1995-01-01', 'INS-1234', 200),
      (302, 'David Patient', 'david@patient.com', $1, '1988-05-20', 'INS-5678', 201);
    `, [passwordCharlie]);

    // Insert system admin
    await client.query(`
      INSERT INTO system_admins (admin_id, full_name, email, password_hash) VALUES
      (401, 'Diana Admin', 'admin@sys.com', $1);
    `, [passwordDiana]);

    // Insert claims
    await client.query(`
      INSERT INTO claims (claim_id, patient_id, submitted_by_staff_id, treatment_details, status, rejection_reason) VALUES
      (501, 301, 101, 'Outpatient visit for fever and lab tests', 'Approved', NULL),
      (502, 301, 101, 'Claim for elective cosmetic surgery', 'Rejected', 'Procedure not covered under plan.'),
      (503, 302, 101, 'Emergency room visit for broken arm', 'Pending', NULL);
    `);

    // Insert invoices
    await client.query(`
      INSERT INTO invoices (invoice_id, claim_id, generated_by_staff_id, amount) VALUES
      (701, 501, 101, 5500.00);
    `);

    // Insert claim messages
    await client.query(`
      INSERT INTO claim_messages (message_id, claim_id, sender_role, sender_id, message) VALUES
      (601, 501, 'InsurerStaff', 201, 'Claim approved based on valid coverage.'),
      (602, 502, 'InsurerStaff', 201, 'Claim rejected due to exclusion in policy.');
    `);

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seedDatabase();