const express = require('express');
const router = express.Router();
const pool = require('../db');

// Debug route
router.get('/debug', (req, res) => {
  res.json({ status: 'ok', message: 'workTypes.js is loaded!' });
});

// GET /work-types
router.get('/', async (req, res) => {
  console.log('🔥 Hit /work-types');

  try {
    const query = `
      SELECT id::TEXT, title
      FROM work_types
      ORDER BY id ASC;
    `;

    const result = await pool.query(query);

    // Return pure array
    res.json(result.rows);

  } catch (err) {
    console.error('❌ Error in /work-types:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
