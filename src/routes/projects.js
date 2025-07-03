const express = require('express');
const router = express.Router();
const pool = require('../db');

console.log('✅ projects route loaded');

router.get('/', async (req, res) => {
    console.log('📊 Projects route hit');
    try {
        const result = await pool.query('SELECT * FROM projects');
        console.log(`✅ Found ${result.rows.length} projects`);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error in projects route:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message,
            details: error
        });
    }
});

module.exports = router;
