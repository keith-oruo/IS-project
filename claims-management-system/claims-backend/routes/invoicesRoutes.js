
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/authMiddleware');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Get all approved invoices (HospitalStaff: only view, InsurerStaff: can view and edit)
router.get('/', verifyToken, async (req, res) => {
  // Debug: Log the incoming Authorization header and user
  console.log('INVOICES ROUTE: Authorization Header:', req.headers.authorization);
  console.log('INVOICES ROUTE: req.user:', req.user);
  const allowedRoles = ['HospitalStaff', 'InsurerStaff', 'SystemAdmin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      `SELECT i.*, c.status as claim_status FROM invoices i
       JOIN claims c ON i.claim_id = c.claim_id
       WHERE c.status = 'Approved'`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// InsurerStaff: Edit invoice amount (PATCH /api/invoices/:invoiceId)
router.patch('/:invoiceId', verifyToken, async (req, res) => {
  // Allow both InsurerStaff and SystemAdmin to edit invoices
  if (req.user.role !== 'InsurerStaff' && req.user.role !== 'SystemAdmin') {
    return res.status(403).json({ error: 'Only insurer staff or system admin can edit invoices.' });
  }
  const { invoiceId } = req.params;
  const { amount } = req.body;
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Valid amount is required.' });
  }
  try {
    const result = await pool.query(
      `UPDATE invoices SET amount = $1 WHERE invoice_id = $2 RETURNING *`,
      [amount, invoiceId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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