
// ==================== app.js ====================
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./database/db');
const cors = require('cors');

const authRoute = require('./routes/auth.route');
const studentRoute = require('./routes/student.route');
const tgRoute = require('./routes/tg.route');
const gatepassRoute = require('./routes/gatepass.route');
const hodRoute = require('./routes/hod.route')

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: true, // Allow all origins dynamically (Mobile, Localhost, LAN)
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send("E-GatePass Server Running!")
});

app.use('/', authRoute);
app.use('/api/', studentRoute);
app.use('/api/', tgRoute);
app.use('/api/', hodRoute);
app.use('/api/gatepass', gatepassRoute);



module.exports = app;
