require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const usersRouter = require('./routes/users');
const clockinRoute = require('./routes/clockin');
const clockoutRoute = require('./routes/clockout');
const whoisworkingRoute = require('./routes/whoisworking');
const timeEntriesRoute = require('./routes/timeentries');
const projectsRoute = require('./routes/projects');
const usersWithClockinNowRoute = require('./routes/usersWithClockinNow');
const timeDurationRoute = require('./routes/timeDuration');
const checkLastTimeEntryRoute = require('./routes/checkLastTimeEntry');
const workTypesRoute = require('./routes/workTypes');
const hoursWorkedToday = require('./routes/hoursWorkedToday');
const switchProjectRoute = require('./routes/switch_project');
const getActiveProjectRoute = require('./routes/get_active_project');
const clockedDurationRoute = require('./routes/clockedduration');
const clockinLastProjectRoute = require('./routes/clockin-last-project');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for FlutterFlow
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Log each request
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/projects', projectsRoute);
app.use('/users', usersRouter);
app.use('/clockin', clockinRoute);
app.use('/clockout', clockoutRoute);
app.use('/whoisworking', whoisworkingRoute);
app.use('/timeentries', timeEntriesRoute);
app.use('/users', usersWithClockinNowRoute);
app.use('/timeentries', timeDurationRoute);
app.use('/timeentries', checkLastTimeEntryRoute);
app.use('/work-types', workTypesRoute);
app.use('/hours-worked-today', hoursWorkedToday);
app.use('/switch_project', switchProjectRoute);
app.use('/active_project', getActiveProjectRoute);
app.use('/clockedduration', clockedDurationRoute);
app.use('/clockin-last-project', clockinLastProjectRoute);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('❌ Express error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
