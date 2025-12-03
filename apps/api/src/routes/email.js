/**
 * Email Routes
 * API endpoints for email operations
 */

const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const logger = require('../utils/logger');

/**
 * POST /api/email/send
 * Send a custom email (admin only)
 */
router.post('/send', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized. Admin access required.',
      });
    }

    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, html',
      });
    }

    const result = await emailService.sendEmail({
      to,
      subject,
      html,
      text,
    });

    res.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    logger.error('Error sending email', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
});

/**
 * GET /api/email/verify
 * Verify email service configuration
 */
router.get('/verify', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized. Admin access required.',
      });
    }

    const verification = await emailService.verifyConnection();

    res.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    logger.error('Error verifying email service', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
});

module.exports = router;

