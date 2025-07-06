const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const authRoutes = require('./auth');
const claimsRoutes = require('./routes/claimsRoutes');
const invoicesRoutes = require('./routes/invoicesRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Correct CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Allow the frontend origin
  credentials: true // Allow cookies and authorization headers
}));

app.use(bodyParser.json());

// Mount the routers
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/admin', adminRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
