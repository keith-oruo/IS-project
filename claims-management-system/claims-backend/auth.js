const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Login Route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  try {
    let user;
    let query;

    switch (role) {
      case 'Patient':
        query = 'SELECT * FROM patients WHERE email = $1';
        break;
      case 'HospitalStaff':
        query = 'SELECT * FROM hospital_staff WHERE email = $1';
        break;
      case 'InsurerStaff':
        query = 'SELECT * FROM insurer_staff WHERE email = $1';
        break;
      case 'SystemAdmin':
        query = 'SELECT * FROM system_admins WHERE email = $1';
        break;
      default:
        return res.status(400).json({ error: 'Invalid role specified' });
    }

    const result = await pool.query(query, [email]);
    user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userId = user.patient_id || user.staff_id || user.admin_id;
    const token = jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role, userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
