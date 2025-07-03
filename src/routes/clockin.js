const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /clockin/:user_id/:project_id
router.post('/:user_id/:project_id', async (req, res) => {
  const { work_type_id, kiosk_id } = req.body;
  const { user_id, project_id } = req.params;

  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Lock existing active clock-ins for this user to avoid race conditions
    const activeCheck = await pool.query(
      `SELECT * FROM time_entries 
       WHERE user_id = $1 AND is_active = TRUE 
       FOR UPDATE`,
      [user_id]
    );

    if (activeCheck.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User already clocked in.'
      });
    }

    // Insert new clock-in entry
    await pool.query(
      `INSERT INTO time_entries 
        (user_id, project_id, work_type_id, kiosk_id, clock_in_time, is_active) 
       VALUES ($1, $2, $3, $4, NOW(), TRUE)`,
      [user_id, project_id, work_type_id, kiosk_id]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Clock-in successful'
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('❌ Clock-in error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message,
      error: {
        code: err.code,
        detail: err.detail,
        hint: err.hint
      }
    });
  }
});

module.exports = router;
