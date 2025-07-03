const express = require('express');
const router = express.Router();
const pool = require('../db');

console.log('✅ Whoisworking route loaded');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
  u.id AS user_id, 
  u.full_name, 
  d.name AS department_name,
  t.project_id, 
  p.title AS project_title,
  t.clock_in_time, 
  wt.title AS work_type_name
FROM time_entries t
JOIN users u ON t.user_id = u.id
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN work_types wt ON t.work_type_id = wt.id
LEFT JOIN projects p ON t.project_id = p.id
WHERE t.is_active = TRUE;`
    );

    res.json({
      success: true,
      currentlyWorking: result.rows
    });
  } catch (err) {
    console.error('Whoisworking error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ✅ You probably forgot this:
module.exports = router;
