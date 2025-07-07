const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function printInvoicesAndClaims() {
  const client = await pool.connect();
  try {
    const invoices = await client.query('SELECT * FROM invoices');
    const claims = await client.query('SELECT * FROM claims');
    console.log('INVOICES:');
    console.table(invoices.rows);
    console.log('CLAIMS:');
    console.table(claims.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

printInvoicesAndClaims();
