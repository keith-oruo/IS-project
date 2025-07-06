const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/authMiddleware');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Generate invoice (Hospital Staff only) -> POST /api/invoices/
router.post('/', verifyToken, async (req, res) => {
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

// Get invoices for a patient (All roles, only approved claims) -> GET /api/invoices/patient/:patientId
router.get('/patient/:patientId', verifyToken, async (req, res) => {
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

module.exports = router;