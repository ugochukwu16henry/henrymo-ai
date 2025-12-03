/**
 * Admin Routes
 * API endpoints for admin functionality
 */

const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  updateUserRoleSchema,
  createInvitationSchema,
  acceptInvitationSchema,
  listInvitationsSchema,
  listUsersSchema,
  getAuditLogsSchema,
} = require('../validators/adminValidators');
const logger = require('../utils/logger');

/**
 * Helper to get client IP and user agent
 */
const getRequestInfo = (req) => ({
  ipAddress: req.ip || req.connection.remoteAddress,
  userAgent: req.get('user-agent'),
});

/**
 * GET /api/admin/users
 * List users (admin only)
 */
router.get(
  '/users',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ query: listUsersSchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.listUsers(req.query);

      // Log activity
      await adminService.logActivity({
        userId: req.user.id,
        action: 'list_users',
        resourceType: 'users',
        details: { filters: req.query },
        ...getRequestInfo(req),
      });

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error listing users', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * POST /api/admin/users/:id/role
 * Update user role (admin only)
 */
router.post(
  '/users/:id/role',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ body: updateUserRoleSchema }),
  async (req, res, next) => {
    try {
      const updated = await adminService.updateUserRole(
        req.params.id,
        req.body.role,
        req.user.id
      );

      // Log activity
      await adminService.logActivity({
        userId: req.user.id,
        action: 'update_user_role',
        resourceType: 'user',
        resourceId: req.params.id,
        details: { newRole: req.body.role },
        ...getRequestInfo(req),
      });

      res.json({
        success: true,
        data: updated,
        message: 'User role updated successfully',
      });
    } catch (error) {
      logger.error('Error updating user role', {
        error: error.message,
        userId: req.params.id,
        adminId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * POST /api/admin/invitations
 * Create admin invitation (admin only)
 */
router.post(
  '/invitations',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ body: createInvitationSchema }),
  async (req, res, next) => {
    try {
      const invitation = await adminService.createInvitation({
        ...req.body,
        invitedBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        data: invitation,
        message: 'Invitation created successfully',
      });
    } catch (error) {
      logger.error('Error creating invitation', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/admin/invitations
 * List invitations (admin only)
 */
router.get(
  '/invitations',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ query: listInvitationsSchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.listInvitations(req.query);

      res.json({
        success: true,
        data: result.invitations,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.invitations.length < result.total,
        },
      });
    } catch (error) {
      logger.error('Error listing invitations', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/admin/invitations/:token
 * Get invitation by token (public, for accepting)
 */
router.get('/invitations/:token', async (req, res, next) => {
  try {
    const invitation = await adminService.getInvitationByToken(req.params.token);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found',
      });
    }

    res.json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    logger.error('Error fetching invitation', {
      error: error.message,
      token: req.params.token,
    });
    next(error);
  }
});

/**
 * POST /api/admin/invitations/:token/accept
 * Accept invitation (public, creates user account)
 */
router.post(
  '/invitations/:token/accept',
  validate({ body: acceptInvitationSchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.acceptInvitation(req.params.token, req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Invitation accepted. Account created successfully.',
      });
    } catch (error) {
      logger.error('Error accepting invitation', {
        error: error.message,
        token: req.params.token,
      });
      next(error);
    }
  }
);

/**
 * GET /api/admin/analytics
 * Get platform analytics (admin only)
 */
router.get(
  '/analytics',
  authenticate,
  authorize('admin', 'super_admin'),
  async (req, res, next) => {
    try {
      const analytics = await adminService.getPlatformAnalytics();

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      logger.error('Error fetching analytics', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/admin/audit-logs
 * Get audit logs (admin only)
 */
router.get(
  '/audit-logs',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ query: getAuditLogsSchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.getAuditLogs(req.query);

      res.json({
        success: true,
        data: result.logs,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.logs.length < result.total,
        },
      });
    } catch (error) {
      logger.error('Error fetching audit logs', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

module.exports = router;

