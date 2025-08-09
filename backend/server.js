// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport'); // Ensure passport is required
const db = require('./db');

const app = express();

// --- START OF FIX: SIMPLIFIED AND CORRECTED CORS CONFIGURATION ---
app.use(cors({
  origin: [
    'https://event-projrct-frontend.onrender.com', // Your deployed frontend
    'http://127.0.0.1:5500',                      // Your VS Code Live Server
    'http://localhost:5500'                          // Your VS Code Live Server
  ],
  credentials: true
}));
// CORS configuration
//const allowedOrigins = [
  //'https://event-projrct-frontend.onrender.com',
  //'http://127.0.0.1:5500',
  //'http://localhost:5500'
//];
//app.use(cors({
  //origin: function (origin, callback) {
    //if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      //callback(null, true);
    //} else {
      //callback(new Error('Not allowed by CORS'));
    //}
  //},
  //credentials: true
//}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- IMPORTANT: INITIALIZE PASSPORT MIDDLEWARE HERE ---
app.use(passport.initialize());

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const certificateRoutes = require('./routes/certificates');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');

// Use API routes
app.use('/api/auth', authRoutes); // This will now include the /google route
app.use('/api/events', eventRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});