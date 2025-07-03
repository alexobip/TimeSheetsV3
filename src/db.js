const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL at:", process.env.DB_HOST);
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection failed:");
    console.error(err.message);
    process.exit(1); // Αυτόματο σταμάτημα για να δει το Azure το error
  });

module.exports = pool;
