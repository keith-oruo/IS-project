const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Login (for hospital staff only in this example)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM hospital_staff WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.staff_id, role: user.role, type: 'HospitalStaff' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, staffId: user.staff_id, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register (hospital staff only)
router.post('/register', async (req, res) => {
  const { fullName, email, password, role, hospitalId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO hospital_staff (full_name, email, password_hash, role, hospital_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING staff_id, full_name, role`,
      [fullName, email, hashedPassword, role, hospitalId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
