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
const conversationRoutes = require('./conversations');
const memoryRoutes = require('./memory');
const codeAnalysisRoutes = require('./codeAnalysis');
const debuggingRoutes = require('./debugging');
const uploadRoutes = require('./upload');
const imageGenerationRoutes = require('./imageGeneration');
const videoGenerationRoutes = require('./videoGeneration');
const streetsRoutes = require('./streets'); // Stage 6
const contributionsRoutes = require('./contributions'); // Stage 6
const verificationsRoutes = require('./verifications'); // Stage 6
// const adminRoutes = require('./admin'); // Stage 7

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/conversations', conversationRoutes);
router.use('/memory', memoryRoutes);
router.use('/ai-capabilities/analyze', codeAnalysisRoutes);
router.use('/ai-capabilities/debug', debuggingRoutes);
router.use('/upload', uploadRoutes);
router.use('/media/image', imageGenerationRoutes);
router.use('/media/video', videoGenerationRoutes);
router.use('/content/streets', streetsRoutes); // Stage 6
router.use('/content/contributions', contributionsRoutes); // Stage 6
router.use('/content', verificationsRoutes); // Stage 6 - verifications routes
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
      conversations: '/api/conversations',
      memory: '/api/memory',
      codeAnalysis: '/api/ai-capabilities/analyze',
      debugging: '/api/ai-capabilities/debug',
      upload: '/api/upload',
      imageGeneration: '/api/media/image',
      videoGeneration: '/api/media/video',
      streets: '/api/content/streets',
      contributions: '/api/content/contributions',
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

