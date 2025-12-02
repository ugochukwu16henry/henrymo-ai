/**
 * Authentication Routes
 * User registration, login, and token management
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const authService = require('../services/authService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  validateRegister,
  validateLogin,
  validateRefreshToken,
} = require('../validators/authValidators');
const { authLimiter, registrationLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  registrationLimiter,
  validate(z.object({ body: registerSchema })),
  async (req, res, next) => {
    try {
      const userData = validateRegister(req.body);

      const result = await authService.register(userData);

      logger.info('User registered', {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      // Handle duplicate email error
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists',
        });
      }

      logger.error('Registration error', {
        error: error.message,
        email: req.body.email,
        ip: req.ip,
      });

      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Login user and get JWT token
 */
router.post(
  '/login',
  authLimiter,
  validate(z.object({ body: loginSchema })),
  async (req, res, next) => {
    try {
      const { email, password } = validateLogin(req.body);

      const result = await authService.login(email, password);

      logger.info('User logged in', {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      // Handle authentication errors
      if (
        error.message === 'Invalid email or password' ||
        error.message === 'Account is inactive. Please contact support.' ||
        error.message === 'Account is suspended. Please contact support.'
      ) {
        return res.status(401).json({
          success: false,
          error: error.message,
        });
      }

      logger.error('Login error', {
        error: error.message,
        email: req.body.email,
        ip: req.ip,
      });

      next(error);
    }
  }
);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error('Get user error', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip,
    });

    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 * Can accept token from Authorization header or request body
 */
router.post(
  '/refresh',
  async (req, res, next) => {
    try {
      // Get token from Authorization header or body
      let token;
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (req.body && req.body.token) {
        token = req.body.token;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Token is required. Provide it in Authorization header or request body.',
        });
      }

      // Validate token format (basic check)
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid token format',
        });
      }

      const result = await authService.refreshToken(token);

      logger.info('Token refreshed', {
        userId: result.user.id,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      if (
        error.message === 'Token has expired' ||
        error.message === 'Invalid token' ||
        error.message === 'Account is inactive' ||
        error.message === 'Account is suspended'
      ) {
        return res.status(401).json({
          success: false,
          error: error.message,
        });
      }

      logger.error('Token refresh error', {
        error: error.message,
        ip: req.ip,
      });

      next(error);
    }
  }
);

module.exports = router;

