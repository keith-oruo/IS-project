// claims_api_backend/index.js

const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// === ROUTES === //

// Register user
app.post('/api/users', async (req, res) => {
  const { username, passwordHash, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Users (Username, PasswordHash, Role) VALUES ($1, $2, $3) RETURNING *',
      [username, passwordHash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit claim
app.post('/api/claims', async (req, res) => {
  const { patientId, submittedBy, treatmentDetails } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Claims (PatientID, SubmittedBy, TreatmentDetails, Status) VALUES ($1, $2, $3, $4) RETURNING *',
      [patientId, submittedBy, treatmentDetails, 'Pending']
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
      'SELECT ClaimID, Status, SubmissionDate, ApprovalDate FROM Claims WHERE PatientID = $1',
      [patientId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit feedback
app.post('/api/feedback', async (req, res) => {
  const { claimId, senderId, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Feedback (ClaimID, SenderID, Message) VALUES ($1, $2, $3) RETURNING *',
      [claimId, senderId, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate invoice
app.post('/api/invoices', async (req, res) => {
  const { claimId, generatedBy, amount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Invoices (ClaimID, GeneratedBy, Amount) VALUES ($1, $2, $3) RETURNING *',
      [claimId, generatedBy, amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
