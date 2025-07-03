const express = require('express');
const router = express.Router();
const pool = require('../db'); // σύνδεση με PostgreSQL

// ✅ GET /users/with-active-clockin
router.get('/with-active-clockin', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.full_name, 
        u.email,
        EXISTS (
          SELECT 1 
          FROM time_entries te 
          WHERE te.user_id = u.id AND te.is_active = TRUE
        ) AS is_clocked_in
      FROM users u
      WHERE u.is_active = TRUE
      ORDER BY u.full_name ASC
    `;

    const result = await pool.query(query);
    res.status(200).json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users with clockin status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users with clockin status'
    });
  }
});

module.exports = router;
