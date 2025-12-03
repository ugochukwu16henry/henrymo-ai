/**
 * HenryMo AI - Backend API Server
 * Main entry point for the Express.js API server
 * 
 * @author Henry Maobughichi Ugochukwu
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logging');
const { apiLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');
const logger = require('./utils/logger');

// Initialize email scheduler
if (process.env.NODE_ENV !== 'test') {
  try {
    const emailScheduler = require('./jobs/emailScheduler');
    emailScheduler.start();
  } catch (error) {
    console.warn('Email scheduler not started:', error.message);
  }
}

// Initialize auto-monitoring
if (process.env.NODE_ENV !== 'test') {
  try {
    const autoMonitoringService = require('./services/autoMonitoringService');
    autoMonitoringService.startMonitoring(60000); // Monitor every minute
  } catch (error) {
    logger.warn('Auto-monitoring not started', { error: error.message });
  }
}

const app = express();
const PORT = config.port;

// Security middleware (order matters!)
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}
app.use(requestLogger);

// Rate limiting (apply to all routes)
app.use('/api', apiLimiter);

// Health check endpoint (before routes)
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: '1.0.0',
    requestId: req.id,
  };

  // Check database health if available
  try {
    const db = require('./config/database');
    const dbHealth = await db.healthCheck();
    health.database = dbHealth;
  } catch (error) {
    health.database = {
      status: 'unavailable',
      error: error.message,
    };
  }

  const statusCode = health.database?.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'HenryMo AI API',
    version: '1.0.0',
    description: 'Enterprise AI Development Platform API',
    author: 'Henry Maobughichi Ugochukwu',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      conversations: '/api/conversations',
      memory: '/api/memory',
      admin: '/api/admin',
    },
  });
});

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HenryMo AI API',
    version: '1.0.0',
    documentation: '/api/info',
    health: '/api/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🚀 HenryMo AI API Server                          ║
║                                                      ║
║   Server running on: http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                 ║
║   Health Check: http://localhost:${PORT}/api/health  ║
║                                                      ║
║   Created by: Henry Maobughichi Ugochukwu           ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;

