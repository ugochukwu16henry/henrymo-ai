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
const userRoutes = require('./users');
const aiRoutes = require('./ai');
// const conversationRoutes = require('./conversations'); // Stage 3
// const adminRoutes = require('./admin'); // Stage 7

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
// router.use('/conversations', conversationRoutes);
// router.use('/admin', adminRoutes);

// API root route
router.get('/', (req, res) => {
  res.json({
    message: 'HenryMo AI API',
    version: '1.0.0',
    availableRoutes: {
      auth: '/api/auth',
      users: '/api/users',
      ai: '/api/ai',
      health: '/api/health',
      info: '/api/info',
    },
    authEndpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      refresh: 'POST /api/auth/refresh',
    },
    userEndpoints: {
      getMe: 'GET /api/users/me',
      getUser: 'GET /api/users/:id',
      updateUser: 'PUT /api/users/:id',
      changePassword: 'POST /api/users/:id/change-password',
      deleteUser: 'DELETE /api/users/:id',
      listUsers: 'GET /api/users (admin)',
      updateRole: 'PUT /api/users/:id/role (admin)',
      updateSubscription: 'PUT /api/users/:id/subscription (admin)',
      suspendUser: 'PUT /api/users/:id/suspend (admin)',
    },
  });
});

module.exports = router;

