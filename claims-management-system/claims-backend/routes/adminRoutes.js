// Update staff role (hospital or insurer staff)
router.put('/staff/:type/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'SystemAdmin') {
    return res.status(403).json({ error: 'Only SystemAdmin can edit roles' });
  }
  const { type, id } = req.params;
  const { role } = req.body;
  let table;
  if (type === 'hospital') table = 'hospital_staff';
  else if (type === 'insurer') table = 'insurer_staff';
  else return res.status(400).json({ error: 'Invalid staff type' });
  try {
    const result = await pool.query(`UPDATE ${table} SET role = $1 WHERE staff_id = $2 RETURNING *`, [role, id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Staff not found' });
    // Add audit log
    await pool.query(`INSERT INTO claim_edit_logs (claim_id, editor_role, editor_id, edit_details) VALUES (NULL, 'SystemAdmin', $1, $2)`, [req.user.id, `Changed role of ${type} staff #${id} to ${role}`]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete staff (hospital or insurer staff)
router.delete('/staff/:type/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'SystemAdmin') {
    return res.status(403).json({ error: 'Only SystemAdmin can delete staff' });
  }
  const { type, id } = req.params;
  let table;
  if (type === 'hospital') table = 'hospital_staff';
  else if (type === 'insurer') table = 'insurer_staff';
  else return res.status(400).json({ error: 'Invalid staff type' });
  try {
    const result = await pool.query(`DELETE FROM ${table} WHERE staff_id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Staff not found' });
    // Add audit log
    await pool.query(`INSERT INTO claim_edit_logs (claim_id, editor_role, editor_id, edit_details) VALUES (NULL, 'SystemAdmin', $1, $2)`, [req.user.id, `Deleted ${type} staff #${id}`]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/authMiddleware');
require('dotenv').config();


// Get all staff (for User Roles management)
router.get('/staff', verifyToken, async (req, res) => {
  if (req.user.role !== 'SystemAdmin') {
    return res.status(403).json({ error: 'Only SystemAdmin can access this' });
  }
  try {
    const hospitalStaff = await pool.query('SELECT staff_id, full_name, email, role, hospital_id FROM hospital_staff');
    const insurerStaff = await pool.query('SELECT staff_id, full_name, email, role, insurer_id FROM insurer_staff');
    // Fix: always return arrays, even if empty
    res.status(200).json({ hospitalStaff: hospitalStaff.rows || [], insurerStaff: insurerStaff.rows || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audit logs (claim edit logs)
router.get('/audit-logs', verifyToken, async (req, res) => {
  if (req.user.role !== 'SystemAdmin') {
    return res.status(403).json({ error: 'Only SystemAdmin can access this' });
  }
  try {
    const logs = await pool.query(
      `SELECT l.edit_id, l.claim_id, l.editor_role, l.editor_id, l.edit_timestamp, l.edit_details,
              c.patient_id, c.treatment_details
       FROM claim_edit_logs l
       LEFT JOIN claims c ON l.claim_id = c.claim_id
       ORDER BY l.edit_timestamp DESC`
    );
    // Fix: always return array, even if empty
    res.status(200).json(logs.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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