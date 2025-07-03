const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /switch_project/:user_id/:project_id
router.post('/:user_id/:project_id', async (req, res) => {
  const { work_type_id, kiosk_id } = req.body;
  const { user_id, project_id } = req.params;

  try {
    await pool.query('BEGIN');

    // 1. Close any existing active entry
    const activeEntry = await pool.query(
      `SELECT id, clock_in_time FROM time_entries 
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY clock_in_time DESC 
       LIMIT 1`,
      [user_id]
    );

    let durationText = null;

    if (activeEntry.rows.length > 0) {
      const oldEntry = activeEntry.rows[0];
      const clockIn = new Date(oldEntry.clock_in_time);
      const clockOut = new Date();
      const durationMs = clockOut - clockIn;
      durationText = new Date(durationMs).toISOString().substr(11, 8); // HH:MM:SS

      await pool.query(
        `UPDATE time_entries 
         SET clock_out_time = NOW(), is_active = FALSE, duration_text = $1 
         WHERE id = $2`,
        [durationText, oldEntry.id]
      );
    }

    // 2. Insert new entry
    await pool.query(
      `INSERT INTO time_entries 
       (user_id, project_id, work_type_id, kiosk_id, clock_in_time, is_active)
       VALUES ($1, $2, $3, $4, NOW(), TRUE)`,
      [user_id, project_id, work_type_id, kiosk_id]
    );

    // 2b. Fetch project title
    const projectInfo = await pool.query(
      `SELECT title FROM projects WHERE id = $1`,
      [project_id]
    );

    const project_title = projectInfo.rows[0]?.title || '';

    // 3. Kiosk log
    await pool.query(
      `INSERT INTO kiosk_logs (user_id, timestamp, action_type)
       VALUES ($1, NOW(), 'switch_project')`,
      [user_id]
    );

    // 4. Temporarily disabled audit log
    /*
    await pool.query(
      `INSERT INTO audit_logs (user_id, change_type, change_time, details)
       VALUES ($1, 'switch_project', NOW(), $2)`,
      [user_id, 'Switched to project ID ' + project_id]
    );
    */

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Switched project successfully',
      previous_session_duration: durationText,
      project_id,
      project_title
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('❌ Switch project error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Switch project failed',
      error: {
        code: err.code,
        detail: err.detail,
        hint: err.hint
      }
    });
  }
});

module.exports = router;
