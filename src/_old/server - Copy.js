require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const usersRouter = require('./routes/users'); // ✅ χρησιμοποιούμε μόνο αυτό
//const validatePinRoute = require('./routes/validatePin');
const clockinRoute = require('./routes/clockin');
const clockoutRoute = require('./routes/clockout');
const whoisworkingRoute = require('./routes/whoisworking');
const timeEntriesRoute = require('./routes/timeentries');
const projectsRoute = require('./routes/projects'); // or the correct path
//const usersWithClockinRoute = require('./routes/usersWithClockin');
//const usersWithClockinTodayRoute = require('./routes/usersWithClockinToday');
const usersWithClockinNowRoute = require('./routes/usersWithClockinNow');
const timeDurationRoute = require('./routes/timeDuration');
const checkLastTimeEntryRoute = require('./routes/checkLastTimeEntry');
//const clockinLastJobRoute = require('./routes/clockinLastJob');
const workTypesRoute = require('./routes/workTypes');
const hoursWorkedToday = require('./routes/hoursWorkedToday');
const switchProjectRoute = require('./routes/switch_project');
const getActiveProjectRoute = require('./routes/get_active_project');
const clockedDurationRoute = require('./routes/clockedduration');
//const lastProjectTestRoute = require('./routes/last-project-test');
const clockinLastProjectRoute = require('./routes/clockin-last-project');

// Webapp routes
const webUserRouter = require('./routes/webapp/users');



const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for Flutter Flow
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ Routes
app.use('/projects', projectsRoute); // Ensure this is the correct path for your projects route
app.use('/users', usersRouter);
//app.use('/validate-pin', validatePinRoute);
app.use('/clockin', clockinRoute);
app.use('/clockout', clockoutRoute);
app.use('/whoisworking', whoisworkingRoute);
app.use('/timeentries', timeEntriesRoute);
//app.use('/users', usersWithClockinRoute);
//app.use('/users', usersWithClockinTodayRoute);
app.use('/users', usersWithClockinNowRoute);
app.use('/timeentries', timeDurationRoute);
app.use('/timeentries', checkLastTimeEntryRoute);
//app.use('/clockin', clockinLastJobRoute);
app.use('/work-types', workTypesRoute);
app.use('/hours-worked-today', hoursWorkedToday);
app.use('/switch_project', switchProjectRoute);
app.use('/active_project', getActiveProjectRoute);
app.use('/clockedduration', clockedDurationRoute);
//app.use('/last-project-test', lastProjectTestRoute);
app.use('/clockin-last-project', clockinLastProjectRoute);


// Webapp routes
app.use('/web/users', webUserRouter);

// Debugging log
app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
