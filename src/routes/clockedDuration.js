const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /clocked_duration/:user_id
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT clock_in_time 
       FROM time_entries 
       WHERE user_id = $1 AND is_active = TRUE 
       ORDER BY clock_in_time DESC 
       LIMIT 1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active clock-in found.'
      });
    }

    const clockIn = new Date(result.rows[0].clock_in_time);
    const now = new Date();
    const diffMs = now - clockIn;

    const hours = Math.floor(diffMs / (1000 * 60 * 60)).toString().padStart(2, '0');
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const duration = `${hours}:${minutes}`;

    res.json({
      success: true,
      duration
    });

  } catch (err) {
    console.error('❌ Error in clocked_duration:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: err.code,
        detail: err.detail
      }
    });
  }
});

module.exports = router;
