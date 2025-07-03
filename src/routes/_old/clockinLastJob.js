const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /clockin/last-job/:user_id
router.post('/last-job/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { work_type_id = 1, kiosk_id = 1 } = req.body;

  try {
    await pool.query('BEGIN');

    // Check if the user is already clocked in
    const activeCheck = await pool.query(
      `SELECT id FROM time_entries WHERE user_id = $1 AND is_active = TRUE`,
      [user_id]
    );

    if (activeCheck.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User is already clocked in.'
      });
    }

    // Get the last project_id the user worked on
    const lastProjectQuery = await pool.query(
      `SELECT project_id FROM time_entries
       WHERE user_id = $1 AND project_id IS NOT NULL
       ORDER BY clock_in_time DESC
       LIMIT 1`,
      [user_id]
    );

    if (lastProjectQuery.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'No previous project found for this user.'
      });
    }

    const project_id = lastProjectQuery.rows[0].project_id;

    if (!Number.isInteger(project_id)) {
      await pool.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Invalid project_id retrieved: ${project_id}`
      });
    }

    // Insert new time entry
    const insertResult = await pool.query(
      `INSERT INTO time_entries
        (user_id, project_id, work_type_id, kiosk_id, clock_in_time, is_active)
       VALUES ($1, $2, $3, $4, NOW(), TRUE)
       RETURNING id`,
      [user_id, project_id, work_type_id, kiosk_id]
    );

    await pool.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Clock-in to last project successful.',
      time_entry_id: insertResult.rows[0].id,
      project_id
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('❌ Clock-in Last Job Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clock in to last project.',
      error: {
        code: err.code,
        detail: err.detail
      }
    });
  }
});

module.exports = router;
