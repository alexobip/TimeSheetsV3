const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /clockout/:user_id
router.post('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    await pool.query('BEGIN');

    // 1. Find the active time entry
    const result = await pool.query(
      `SELECT id, clock_in_time FROM time_entries
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY clock_in_time DESC
       LIMIT 1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'No active clock-in found for this user.'
      });
    }

    const { id: time_entry_id, clock_in_time } = result.rows[0];
    const clock_out_time = new Date();

    const duration_seconds = Math.floor((clock_out_time - new Date(clock_in_time)) / 1000);
    const duration_text = new Date(duration_seconds * 1000).toISOString().substr(11, 8); // HH:MM:SS

    // 2. Update entry without 'duration'
    await pool.query(
      `UPDATE time_entries
       SET clock_out_time = $1,
           duration_text = $2,
           is_active = FALSE
       WHERE id = $3`,
      [clock_out_time, duration_text, time_entry_id]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Clock-out successful',
      time_entry_id,
      duration: duration_text
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('❌ Clock-out error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Clock-out failed',
      error: {
        code: err.code,
        detail: err.detail
      }
    });
  }
});

module.exports = router;
