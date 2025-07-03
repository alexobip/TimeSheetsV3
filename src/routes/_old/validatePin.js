const express = require('express');
const router = express.Router();
const pool = require('../db'); // σύνδεση με τη βάση σου (postgres)

console.log("✅ Loaded validatePin route"); // <-- Δοκιμή

// POST /validate-pin
router.post('/', async (req, res) => {
  const { user_id, pin } = req.body;

  try {
    const result = await pool.query(
      'SELECT pin FROM users WHERE id = $1 AND is_active = TRUE',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found or inactive' });
    }

    const valid = result.rows[0].pin === pin;

    res.json({
      success: true,
      valid,
    });
  } catch (err) {
    console.error('Error validating PIN:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// GET /validate-pin/:id (debug only)
router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT id, full_name, pin, is_active FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (err) {
    console.error('GET /validate-pin/:id error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



module.exports = router;
