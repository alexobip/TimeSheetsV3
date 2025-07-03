const express = require('express');
const router = express.Router();
const pool = require('../db');

// Debug route
router.get('/debug', (req, res) => {
  res.json({ status: 'ok', message: 'timeDuration.js is loaded!' });
});

// GET /timeentries/active-duration/:user_id
router.get('/active-duration/:user_id', async (req, res) => {
  const userId = req.params.user_id;
  console.log(`🔥 Hit /timeentries/active-duration/${userId}`);

  try {
    const query = `
      SELECT 
        clock_in_time,
        NOW() AS now,
        EXTRACT(EPOCH FROM (NOW() - clock_in_time)) / 60 AS duration_minutes,
        FLOOR(EXTRACT(EPOCH FROM (NOW() - clock_in_time)) / 3600) AS duration_hours
      FROM time_entries
      WHERE user_id = $1
        AND clock_out_time IS NULL
      ORDER BY clock_in_time DESC
      LIMIT 1;
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      console.log(`ℹ️ No active clock-in found for user ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'No active clock-in found for this user.'
      });
    }

    const data = result.rows[0];
    res.json({
      success: true,
      user_id: userId,
      clock_in_time: data.clock_in_time,
      now: data.now,
      duration_hours: parseInt(data.duration_hours, 10),
      duration_minutes: Math.floor(data.duration_minutes % 60)
    });

  } catch (err) {
    console.error('❌ Error in /timeentries/active-duration:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
