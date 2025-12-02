/**
 * Main routes aggregator
 * All API routes are registered here
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
// const conversationRoutes = require('./conversations'); // Stage 3
// const adminRoutes = require('./admin'); // Stage 7

// Register routes
router.use('/auth', authRoutes);
// router.use('/conversations', conversationRoutes);
// router.use('/admin', adminRoutes);

// API root route
router.get('/', (req, res) => {
  res.json({
    message: 'HenryMo AI API',
    version: '1.0.0',
    availableRoutes: {
      auth: '/api/auth',
      health: '/api/health',
      info: '/api/info',
    },
    authEndpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      refresh: 'POST /api/auth/refresh',
    },
  });
});

module.exports = router;

