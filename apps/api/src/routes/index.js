/**
 * Main routes aggregator
 * All API routes are registered here
 */

const express = require('express');
const router = express.Router();

// Import route modules (will be created in later stages)
// const authRoutes = require('./auth.routes');
// const conversationRoutes = require('./conversation.routes');
// const adminRoutes = require('./admin.routes');

// Register routes
// router.use('/auth', authRoutes);
// router.use('/conversations', conversationRoutes);
// router.use('/admin', adminRoutes);

// Placeholder route to indicate routes are being set up
router.get('/', (req, res) => {
  res.json({
    message: 'API routes are being set up',
    version: '1.0.0',
    availableRoutes: [
      '/api/health',
      '/api/info',
      // Routes will be added in subsequent stages
    ],
  });
});

module.exports = router;

