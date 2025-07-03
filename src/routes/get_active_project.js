const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /active_project/:user_id
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         p.id AS project_id,
         p.title AS project_title,
         t.clock_in_time
       FROM time_entries t
       JOIN projects p ON t.project_id = p.id
       WHERE t.user_id = $1 AND t.is_active = TRUE
       ORDER BY t.clock_in_time DESC
       LIMIT 1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active project found for this user.'
      });
    }

    const { project_id, project_title, clock_in_time } = result.rows[0];

    // Compute duration
    const clockIn = new Date(clock_in_time);
    const now = new Date();
    const durationMs = now - clockIn;
    const hours = Math.floor(durationMs / (1000 * 60 * 60)).toString().padStart(2, '0');
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const duration = `${hours}:${minutes}`;


    res.json({
      success: true,
      project_id,
      project_title,
      clock_in_time,
      duration
    });

  } catch (err) {
    console.error('❌ Error in get_active_project:', err);
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
