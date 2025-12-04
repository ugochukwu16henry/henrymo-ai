// src/server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { port } = require('./config');

const authRoutes = require('./routes/auth');
const convRoutes = require('./routes/conversation');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (auth middleware is applied inside the router)
app.use('/api/conversations', convRoutes);

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (fallback)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`🚀 API listening on http://0.0.0.0:${port}`);
});
