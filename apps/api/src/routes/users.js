/**
 * User Management Routes
 * User profile, CRUD operations, and admin functions
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const userService = require('../services/userService');
const { authenticate, authorize } = require('../middleware/auth');
const { canModifyUser } = require('../middleware/ownership');
const { validate } = require('../middleware/validate');
const {
  updateProfileSchema,
  changePasswordSchema,
  updateRoleSchema,
  updateSubscriptionSchema,
  listUsersQuerySchema,
  suspendUserSchema,
  uuidParamSchema,
} = require('../validators/userValidators');
const logger = require('../utils/logger');

/**
 * GET /api/users/me
 * Get current user's profile
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (own profile or admin)
 */
router.get(
  '/:id',
  authenticate,
  validate(z.object({ params: uuidParamSchema })),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const isAdmin = ['admin', 'country_admin', 'super_admin'].includes(
        req.user.role
      );

      // Users can only view their own profile unless they're admin
      if (id !== req.user.id && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only view your own profile.',
        });
      }

      const user = await userService.getUserById(id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      next(error);
    }
  }
);

/**
 * PUT /api/users/:id
 * Update user profile (own profile or admin)
 */
router.put(
  '/:id',
  authenticate,
  canModifyUser('id'),
  validate(z.object({ params: uuidParamSchema, body: updateProfileSchema })),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedUser = await userService.updateUserProfile(id, req.body);

      logger.info('User profile updated', {
        userId: id,
        updatedBy: req.user.id,
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      if (error.message === 'No fields to update') {
        return res.status(400).json({
          success: false,
          error: 'No fields to update',
        });
      }

      next(error);
    }
  }
);

/**
 * POST /api/users/:id/change-password
 * Change user password
 */
router.post(
  '/:id/change-password',
  authenticate,
  canModifyUser('id'),
  validate(
    z.object({
      params: uuidParamSchema,
      body: changePasswordSchema,
    })
  ),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      await userService.changePassword(id, currentPassword, newPassword);

      logger.info('User password changed', {
        userId: id,
        changedBy: req.user.id,
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
        });
      }

      next(error);
    }
  }
);

/**
 * DELETE /api/users/:id
 * Delete user account (soft delete)
 */
router.delete(
  '/:id',
  authenticate,
  canModifyUser('id'),
  validate(z.object({ params: uuidParamSchema })),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Prevent users from deleting their account if suspended by admin
      const user = await userService.getUserById(id);
      if (
        user.is_suspended &&
        req.user.role !== 'super_admin' &&
        id === req.user.id
      ) {
        return res.status(403).json({
          success: false,
          error: 'Cannot delete account. Account is suspended.',
        });
      }

      await userService.deleteUser(id);

      logger.info('User account deleted', {
        userId: id,
        deletedBy: req.user.id,
      });

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      next(error);
    }
  }
);

/**
 * GET /api/users
 * List all users (admin only)
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'country_admin', 'super_admin'),
  validate(z.object({ query: listUsersQuerySchema })),
  async (req, res, next) => {
    try {
      const options = {
        page: req.query.page || 1,
        limit: Math.min(req.query.limit || 20, 100), // Max 100 per page
        role: req.query.role,
        subscriptionTier: req.query.subscriptionTier,
        isActive: req.query.isActive,
        search: req.query.search,
      };

      const result = await userService.listUsers(options);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/users/:id/role
 * Update user role (admin only)
 */
router.put(
  '/:id/role',
  authenticate,
  authorize('admin', 'country_admin', 'super_admin'),
  validate(
    z.object({
      params: uuidParamSchema,
      body: updateRoleSchema,
    })
  ),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const updatedUser = await userService.updateUserRole(id, role, req.user);

      logger.info('User role updated', {
        userId: id,
        newRole: role,
        updatedBy: req.user.id,
      });

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      if (
        error.message.includes('Invalid role') ||
        error.message.includes('Cannot modify') ||
        error.message.includes('Only super admins')
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }
);

/**
 * PUT /api/users/:id/subscription
 * Update user subscription tier (admin only)
 */
router.put(
  '/:id/subscription',
  authenticate,
  authorize('admin', 'country_admin', 'super_admin'),
  validate(
    z.object({
      params: uuidParamSchema,
      body: updateSubscriptionSchema,
    })
  ),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { subscriptionTier } = req.body;

      const updatedUser = await userService.updateSubscriptionTier(
        id,
        subscriptionTier
      );

      logger.info('User subscription tier updated', {
        userId: id,
        newTier: subscriptionTier,
        updatedBy: req.user.id,
      });

      res.json({
        success: true,
        message: 'Subscription tier updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      if (error.message.includes('Invalid subscription tier')) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }
);

/**
 * PUT /api/users/:id/suspend
 * Suspend/unsuspend user (admin only)
 */
router.put(
  '/:id/suspend',
  authenticate,
  authorize('admin', 'country_admin', 'super_admin'),
  validate(
    z.object({
      params: uuidParamSchema,
      body: suspendUserSchema,
    })
  ),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const suspend = req.body.suspend !== false; // Default to true

      const updatedUser = await userService.suspendUser(id, suspend);

      logger.info('User suspension status updated', {
        userId: id,
        suspended: suspend,
        updatedBy: req.user.id,
      });

      res.json({
        success: true,
        message: `User ${suspend ? 'suspended' : 'unsuspended'} successfully`,
        data: updatedUser,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      if (error.message === 'Cannot suspend super admin') {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }
);

module.exports = router;

