const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const authRoutes = require('./auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Submit claim
app.post('/api/claims', async (req, res) => {
  const { patientId, submittedByStaffId, treatmentDetails } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO claims (patient_id, submitted_by_staff_id, treatment_details, status)
       VALUES ($1, $2, $3, 'Pending')
       RETURNING *`,
      [patientId, submittedByStaffId, treatmentDetails]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track claim status
app.get('/api/claims/status/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(
      `SELECT claim_id, status, submission_date, approval_date
       FROM claims
       WHERE patient_id = $1`,
      [patientId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit message (formerly feedback)
app.post('/api/claims/:claimId/messages', async (req, res) => {
  const { claimId } = req.params;
  const { senderRole, senderId, message } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO claim_messages (claim_id, sender_role, sender_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [claimId, senderRole, senderId, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate invoice
app.post('/api/invoices', async (req, res) => {
  const { claimId, generatedByStaffId, amount } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO invoices (claim_id, generated_by_staff_id, amount)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [claimId, generatedByStaffId, amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
