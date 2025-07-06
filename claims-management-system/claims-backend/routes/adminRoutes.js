const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/authMiddleware');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Admin-only route: Get all claims -> GET /api/admin/claims
router.get('/claims', verifyToken, async (req, res) => {
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

module.exports = router;