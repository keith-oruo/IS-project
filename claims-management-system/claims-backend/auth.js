const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Unified login for Hospital, Insurer, Patient, Admin
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userTypes = [
    { table: 'hospital_staff', id: 'staff_id', roleField: 'role', type: 'HospitalStaff' },
    { table: 'insurer_staff', id: 'staff_id', roleField: 'role', type: 'InsurerStaff' },
    { table: 'patients', id: 'patient_id', roleField: null, type: 'Patient' },
    { table: 'system_admins', id: 'admin_id', roleField: null, type: 'SystemAdmin' },
  ];

  for (let userType of userTypes) {
    try {
      const result = await pool.query(`SELECT * FROM ${userType.table} WHERE email = $1`, [email]);
      const user = result.rows[0];
      if (user && await bcrypt.compare(password, user.password_hash)) {
        const payload = {
          userId: user[userType.id],
          role: userType.type,
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return res.json({
          token,
          role: userType.type,
          [userType.id]: user[userType.id]
        });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
