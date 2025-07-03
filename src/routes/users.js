const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/debug', (req, res) => {
    res.json({ status: 'ok', message: 'users.js is loaded!' });
  });
  


// GET /users/active
router.get('/active', async (req, res) => {
    console.log('🔥 Hit /users/active route'); // ✅ για debug
    try {
        const result = await pool.query('SELECT * FROM users WHERE is_active = true');
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error in /users/active:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;