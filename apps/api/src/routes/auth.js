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
const {
  authLimiter,
  registrationLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimiter');
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
      // Body is already validated by middleware, use it directly
      const result = await authService.register(req.body);

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
      // Body is already validated by middleware
      const { email, password } = req.body;

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

/**
 * POST /api/auth/forgot-password
 * Request password reset (foundation - email sending will be in Stage 7)
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(
    z.object({
      body: z.object({
        email: z.string().email('Invalid email format'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { email } = req.body;

      // Check if user exists (security: don't reveal if email exists)
      const db = require('../config/database');
      const userResult = await db.query(
        'SELECT id, email FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      );

      // Always return success to prevent email enumeration
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];

        // Generate reset token (foundation - will be enhanced in Stage 7)
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

        // Store token in user metadata (foundation - can be moved to dedicated table later)
        await db.query(
          `UPDATE users 
           SET metadata = jsonb_set(
             COALESCE(metadata, '{}'::jsonb),
             '{password_reset}',
             $1::jsonb
           )
           WHERE id = $2`,
          [
            JSON.stringify({
              token: resetToken,
              expiresAt: expiresAt.toISOString(),
            }),
            user.id,
          ]
        );

        logger.info('Password reset requested', {
          userId: user.id,
          email: user.email,
          ip: req.ip,
        });

        // TODO: Send email with reset link (Stage 7)
        // For now, just log the token in development
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Password reset token (DEV ONLY)', {
            token: resetToken,
            expiresAt,
          });
        }
      }

      // Always return success message
      res.json({
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Password reset request error', {
        error: error.message,
        ip: req.ip,
      });
      next(error);
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Reset password with token (foundation)
 */
router.post(
  '/reset-password',
  passwordResetLimiter,
  validate(
    z.object({
      body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        newPassword: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
          ),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;

      // Find user with matching reset token
      const db = require('../config/database');
      const bcrypt = require('bcryptjs');

      // Query all users and check metadata (foundation - will be optimized with dedicated table)
      const usersResult = await db.query(
        "SELECT id, email, metadata FROM users WHERE metadata->'password_reset'->>'token' = $1",
        [token]
      );

      if (usersResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
        });
      }

      const user = usersResult.rows[0];
      const resetData = user.metadata?.password_reset;

      // Check if token is expired
      if (!resetData || !resetData.expiresAt) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
        });
      }

      const expiresAt = new Date(resetData.expiresAt);
      if (expiresAt < new Date()) {
        // Clear expired token
        await db.query(
          `UPDATE users 
           SET metadata = metadata - 'password_reset'
           WHERE id = $1`,
          [user.id]
        );

        return res.status(400).json({
          success: false,
          error: 'Reset token has expired. Please request a new one.',
        });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await db.query(
        `UPDATE users 
         SET password_hash = $1, 
             metadata = metadata - 'password_reset',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [passwordHash, user.id]
      );

      logger.info('Password reset successful', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: 'Password reset successfully. Please login with your new password.',
      });
    } catch (error) {
      logger.error('Password reset error', {
        error: error.message,
        ip: req.ip,
      });
      next(error);
    }
  }
);

module.exports = router;

