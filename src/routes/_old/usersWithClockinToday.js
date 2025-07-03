const express = require('express');
const router = express.Router();
const pool = require('../db');

// Debug route (optional)
router.get('/debug', (req, res) => {
    res.json({ status: 'ok', message: 'usersWithClockinToday.js is loaded!' });
});

// GET /users/active-with-clockin-status
router.get('/active-with-clockin-status', async (req, res) => {
    console.log('🔥 Hit /users/active-with-clockin-status route'); // ✅ για debug
    try {
        const query = `
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.pin,
                u.is_active,
                EXISTS (
                    SELECT 1
                    FROM time_entries te
                    WHERE te.user_id = u.id
                        AND te.is_active = TRUE
                        AND DATE(te.clock_in_time) = CURRENT_DATE
                ) AS is_clocked_in_today
            FROM users u
            WHERE u.is_active = TRUE
            ORDER BY u.full_name ASC;
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error in /users/active-with-clockin-status:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
