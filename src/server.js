require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createPool } = require('./db');
const builderRoutes = require('./routes/builder');
const analyticsRoutes = require('./routes/analytics');

const app = express();

/* ─── Security ─── */
app.use(helmet());
app.use(cors({
  origin: [
    'https://aycicek.web.app',
    'https://melihaycicek.com',
    'https://www.melihaycicek.com',
  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

/* ─── Body Parsing ─── */
app.use(express.json({ limit: '50kb' }));

/* ─── Rate Limiting ─── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

/* ─── Database Pool ─── */
const pool = createPool();

/* ─── Routes ─── */
app.use('/api', builderRoutes(pool));
app.use('/api', analyticsRoutes(pool));

/* ─── Health Check ─── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ─── Start ─── */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Portfolio backend running on port ${PORT}`);
});
