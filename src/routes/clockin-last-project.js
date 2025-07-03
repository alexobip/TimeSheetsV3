const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /clockin-last-project/:user_id
router.post('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { kiosk_id = 1 } = req.body;

  try {
    await pool.query('BEGIN');

    // 1. Check if the user is already clocked in
    const active = await pool.query(
      `SELECT id FROM time_entries WHERE user_id = $1 AND is_active = TRUE`,
      [user_id]
    );

    if (active.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User is already clocked in.'
      });
    }

    // 2. Find last project_id and work_type_id the user worked on
    const lastData = await pool.query(
      `SELECT project_id, work_type_id FROM time_entries
       WHERE user_id = $1 AND project_id IS NOT NULL
       ORDER BY clock_in_time DESC
       LIMIT 1`,
      [user_id]
    );

    if (lastData.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'No previous project found for this user.'
      });
    }

    const { project_id, work_type_id } = lastData.rows[0];

    // 3. Insert new time entry
    const insert = await pool.query(
      `INSERT INTO time_entries
        (user_id, project_id, work_type_id, kiosk_id, clock_in_time, is_active)
       VALUES ($1, $2, $3, $4, NOW(), TRUE)
       RETURNING id`,
      [user_id, project_id, work_type_id, kiosk_id]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Clock-in to last project successful.',
      time_entry_id: insert.rows[0].id,
      project_id,
      work_type_id
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('❌ Clock-in error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Clock-in failed.',
      error: {
        code: err.code,
        detail: err.detail
      }
    });
  }
});

module.exports = router;
