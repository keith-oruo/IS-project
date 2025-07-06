const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const authRoutes = require('./auth');
const verifyToken = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Submit claim (Hospital Staff only)
app.post('/api/claims', verifyToken, async (req, res) => {
  if (req.user.role !== 'HospitalStaff') return res.status(403).json({ error: 'Unauthorized' });

  const { patientId, submittedByStaffId, treatmentDetails } = req.body;

  if (req.user.userId != submittedByStaffId) {
    return res.status(403).json({ error: 'Staff ID mismatch with token' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO claims (patient_id, submitted_by_staff_id, treatment_details, status)
       VALUES ($1, $2, $3, 'Pending') RETURNING *`,
      [patientId, submittedByStaffId, treatmentDetails]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track claim status (Patient only)
app.get('/api/claims/status/:patientId', verifyToken, async (req, res) => {
  if (req.user.role !== 'Patient' || req.user.userId != req.params.patientId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      `SELECT claim_id, status, submission_date, approval_date, rejection_reason
       FROM claims WHERE patient_id = $1`,
      [req.params.patientId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit message (Insurer Staff only)
app.post('/api/claims/:claimId/messages', verifyToken, async (req, res) => {
  const { claimId } = req.params;
  const { message } = req.body;

  if (req.user.role !== 'InsurerStaff') {
    return res.status(403).json({ error: 'Only insurer staff can submit a message as approval or rejection reason.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO claim_messages (claim_id, sender_role, sender_id, message)
       VALUES ($1, 'InsurerStaff', $2, $3) RETURNING *`,
      [claimId, req.user.userId, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a specific claim (All roles)
app.get('/api/claims/:claimId/messages', verifyToken, async (req, res) => {
  const { claimId } = req.params;
  const allowedRoles = ['Patient', 'HospitalStaff', 'InsurerStaff', 'SystemAdmin'];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      `SELECT message, sender_role, timestamp FROM claim_messages
       WHERE claim_id = $1
       ORDER BY timestamp DESC`,
      [claimId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate invoice (Hospital Staff only)
app.post('/api/invoices', verifyToken, async (req, res) => {
  if (req.user.role !== 'HospitalStaff') return res.status(403).json({ error: 'Unauthorized' });

  const { claimId, generatedByStaffId, amount } = req.body;

  if (req.user.userId != generatedByStaffId) {
    return res.status(403).json({ error: 'Staff ID mismatch with token' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO invoices (claim_id, generated_by_staff_id, amount)
       VALUES ($1, $2, $3) RETURNING *`,
      [claimId, generatedByStaffId, amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get invoices for a patient (All roles, only approved claims)
app.get('/api/invoices/patient/:patientId', verifyToken, async (req, res) => {
  const { patientId } = req.params;
  const allowedRoles = ['Patient', 'HospitalStaff', 'InsurerStaff', 'SystemAdmin'];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      `SELECT i.* FROM invoices i
       JOIN claims c ON i.claim_id = c.claim_id
       WHERE c.patient_id = $1 AND c.status = 'Approved'`,
      [patientId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only route: Get all claims
app.get('/api/admin/claims', verifyToken, async (req, res) => {
  if (req.user.role !== 'SystemAdmin') {
    return res.status(403).json({ error: 'Only SystemAdmin can access this' });
  }

  try {
    const result = await pool.query(
      `SELECT c.claim_id, c.status, c.submission_date, c.approval_date, c.rejection_reason,
              p.full_name AS patient_name, hs.full_name AS submitted_by
       FROM claims c
       LEFT JOIN patients p ON c.patient_id = p.patient_id
       LEFT JOIN hospital_staff hs ON c.submitted_by_staff_id = hs.staff_id
       ORDER BY c.submission_date DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
