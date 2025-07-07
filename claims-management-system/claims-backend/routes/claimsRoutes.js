const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/authMiddleware');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Submit claim (Hospital Staff only) -> POST /api/claims/
router.post('/', verifyToken, async (req, res) => {
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

// Track claim status (Patient, HospitalStaff, InsurerStaff)
router.get('/status/:patientId', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM claims WHERE patient_id = $1', [req.params.patientId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get claims for a specific hospital staff member
router.get('/staff/:staffId', verifyToken, async (req, res) => {
  if (req.user.role !== 'HospitalStaff' || req.user.userId != req.params.staffId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query('SELECT * FROM claims WHERE submitted_by_staff_id = $1', [req.params.staffId]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get claims for a specific insurer
router.get('/insurer/:insurerId', verifyToken, async (req, res) => {
  if (req.user.role !== 'InsurerStaff') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      `SELECT c.* FROM claims c
       JOIN patients p ON c.patient_id = p.patient_id
       WHERE p.insurer_id = (SELECT insurer_id FROM insurer_staff WHERE staff_id = $1)`,
      [req.params.insurerId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching insurer claims:', err);
    res.status(500).json({ error: err.message });
  }
});

// Submit message (Insurer Staff only) -> POST /api/claims/:claimId/messages
router.post('/:claimId/messages', verifyToken, async (req, res) => {
  const { claimId } = req.params;
  const { message } = req.body;

  if (req.user.role !== 'InsurerStaff') {
    return res.status(403).json({ error: 'Only insurer staff can submit a message.' });
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

// Get messages for a specific claim (All roles) -> GET /api/claims/:claimId/messages
router.get('/:claimId/messages', verifyToken, async (req, res) => {
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

module.exports = router;