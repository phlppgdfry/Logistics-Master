require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const requestRoutes = require('./routes/requests');
const dealRoutes = require('./routes/deals');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Rate limits: every API route hits the database, and auth routes check passwords.
const limiterOptions = { windowMs: 15 * 60 * 1000, standardHeaders: 'draft-7', legacyHeaders: false };
app.use('/api', rateLimit({ ...limiterOptions, limit: 300 }));
app.use('/api/auth', rateLimit({ ...limiterOptions, limit: 20 }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'YardEx API — Zeebrugge' }));

app.listen(PORT, () => {
  console.log(`YardEx API draait op http://localhost:${PORT}`);
});
