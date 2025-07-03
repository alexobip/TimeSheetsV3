const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /hours-worked-today/:user_id
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT 
        clock_in_time,
        clock_out_time
      FROM time_entries
      WHERE user_id = $1
        AND (
          clock_in_time >= CURRENT_DATE
          OR (clock_in_time < CURRENT_DATE AND (clock_out_time >= CURRENT_DATE OR clock_out_time IS NULL))
        )
    `;

    const result = await pool.query(query, [user_id]);
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);

    let totalMs = 0;

    result.rows.forEach(entry => {
      const clockIn = new Date(entry.clock_in_time);
      const clockOut = entry.clock_out_time ? new Date(entry.clock_out_time) : now;

      // Start time for today: max(clock_in_time, midnight)
      const effectiveStart = clockIn > midnight ? clockIn : midnight;
      // End time: either clock_out_time or now
      const effectiveEnd = clockOut;

      if (effectiveEnd > effectiveStart) {
        totalMs += effectiveEnd - effectiveStart;
      }
    });

    const totalMinutes = Math.floor(totalMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    res.json({
      user_id,
      total_minutes_today: totalMinutes,
      formatted: `${hours}h ${minutes}m`
    });

  } catch (err) {
    console.error('❌ Error in /hours-worked-today/:user_id', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;
