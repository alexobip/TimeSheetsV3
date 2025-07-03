const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /last-project-test/:user_id
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT project_id
       FROM time_entries
       WHERE user_id = $1 AND project_id IS NOT NULL
       ORDER BY clock_in_time DESC
       LIMIT 1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No previous project found for this user.'
      });
    }

    res.json({
      success: true,
      project_id: result.rows[0].project_id
    });

  } catch (err) {
    console.error('❌ Error in last-project-test:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch last project.',
      error: {
        code: err.code,
        detail: err.detail
      }
    });
  }
});

module.exports = router;
