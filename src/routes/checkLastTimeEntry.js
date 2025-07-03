const express = require('express');
const router = express.Router();
const pool = require('../db');

// Debug route
router.get('/debug', (req, res) => {
  res.json({ status: 'ok', message: 'checkLastTimeEntry.js is loaded!' });
});

// GET /timeentries/has-history/:user_id
router.get('/has-history/:user_id', async (req, res) => {
  const userId = req.params.user_id;

  console.log(`🕒 Checking time entry history for user ${userId}`);

  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT 
        t.id AS time_entry_id,
        t.project_id,
        t.work_type_id,
        wt.title AS work_type_title,
        t.clock_in_time,
        t.clock_out_time,
        t.is_active
      FROM time_entries t
      LEFT JOIN work_types wt ON t.work_type_id = wt.id
      WHERE t.user_id = $1
      ORDER BY t.clock_in_time DESC
      LIMIT 1;
    `, [userId]);

    client.release();

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        has_history: false,
        user_id: userId,
        message: 'No time entries found.'
      });
    }

    // Flatten the entry into the top-level response
    return res.json({
      success: true,
      has_history: true,
      user_id: userId,
      ...result.rows[0]
    });

  } catch (err) {
    console.error('❌ Error in checkLastTimeEntry:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
