/**
 * Ownership Middleware
 * Checks if user owns the resource or has admin permissions
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const logger = require('../utils/logger');

/**
 * Admin roles that can access any resource
 */
const ADMIN_ROLES = ['admin', 'country_admin', 'super_admin'];

/**
 * Middleware to check if user owns the resource or is admin
 * Use this for routes where users can access their own data or admins can access any
 */
const requireOwnershipOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const requestedUserId = req.params[userIdParam];
    const currentUserId = req.user.id;
    const isAdmin = ADMIN_ROLES.includes(req.user.role);

    // Allow if user is accessing their own resource or is admin
    if (currentUserId === requestedUserId || isAdmin) {
      return next();
    }

    logger.warn('Ownership check failed', {
      currentUserId,
      requestedUserId,
      userRole: req.user.role,
      path: req.path,
    });

    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own resources.',
    });
  };
};

/**
 * Middleware to check if user can modify another user
 * Admins can modify any user except super_admin
 */
const canModifyUser = (userIdParam = 'id') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const targetUserId = req.params[userIdParam];
    const currentUserId = req.user.id;
    const isAdmin = ADMIN_ROLES.includes(req.user.role);

    try {
      // User can always modify themselves
      if (currentUserId === targetUserId) {
        return next();
      }

      // Admins can modify others
      if (isAdmin) {
        // Check if target user is super_admin (only super_admin can modify super_admin)
        const db = require('../config/database');
        const result = await db.query(
          'SELECT role FROM users WHERE id = $1',
          [targetUserId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
          });
        }

        const targetRole = result.rows[0].role;

        // Only super_admin can modify super_admin
        if (targetRole === 'super_admin' && req.user.role !== 'super_admin') {
          return res.status(403).json({
            success: false,
            error: 'Cannot modify super admin',
          });
        }

        return next();
      }

      // Regular users cannot modify others
      logger.warn('User modification denied', {
        currentUserId,
        targetUserId,
        userRole: req.user.role,
      });

      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only modify your own profile.',
      });
    } catch (error) {
      logger.error('Error in canModifyUser middleware', {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
};

module.exports = {
  requireOwnershipOrAdmin,
  canModifyUser,
};

