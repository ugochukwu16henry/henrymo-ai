/**
 * Admin Service
 * Manages admin users, roles, invitations, and permissions
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../config/database');
const logger = require('../utils/logger');
const userService = require('./userService');

class AdminService {
  /**
   * Role hierarchy (higher number = more permissions)
   */
  static ROLE_HIERARCHY = {
    user: 0,
    contributor: 1,
    verifier: 2,
    developer: 3,
    moderator: 4,
    country_admin: 5,
    admin: 6,
    super_admin: 7,
  };

  /**
   * Check if user has permission to perform action
   */
  static hasPermission(userRole, requiredRole) {
    const userLevel = this.ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = this.ROLE_HIERARCHY[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }

  /**
   * Check if user can modify another user's role
   */
  static canModifyRole(modifierRole, targetRole) {
    const modifierLevel = this.ROLE_HIERARCHY[modifierRole] || 0;
    const targetLevel = this.ROLE_HIERARCHY[targetRole] || 0;
    
    // Super admin can modify anyone
    if (modifierRole === 'super_admin') {
      return true;
    }
    
    // Can only modify users with lower or equal level
    return modifierLevel > targetLevel;
  }

  /**
   * List users (admin only)
   */
  async listUsers(filters = {}) {
    const {
      page = 1,
      limit = 50,
      role,
      subscriptionTier,
      isActive,
      search,
    } = filters;

    try {
      return await userService.listUsers({
        page,
        limit,
        role,
        subscriptionTier,
        isActive,
        search,
      });
    } catch (error) {
      logger.error('Error listing users in admin service', {
        error: error.message,
        filters,
      });
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId, newRole, requestedBy) {
    try {
      // Get requester info
      const requester = await userService.getUserById(requestedBy);
      if (!requester) {
        throw new Error('Requester not found');
      }

      // Get target user
      const targetUser = await userService.getUserById(userId);
      if (!targetUser) {
        throw new Error('User not found');
      }

      // Check permissions
      if (!AdminService.canModifyRole(requester.role, targetUser.role)) {
        throw new Error('You do not have permission to modify this user\'s role');
      }

      // Check if new role is valid
      if (!AdminService.ROLE_HIERARCHY[newRole]) {
        throw new Error(`Invalid role: ${newRole}`);
      }

      // Check if requester can assign this role
      if (!AdminService.canModifyRole(requester.role, newRole)) {
        throw new Error('You do not have permission to assign this role');
      }

      // Update role
      const updated = await userService.updateUserRole(userId, newRole, requestedBy);

      // Log activity
      await this.logActivity({
        userId: requestedBy,
        action: 'update_user_role',
        resourceType: 'user',
        resourceId: userId,
        details: {
          oldRole: targetUser.role,
          newRole,
        },
      });

      return updated;
    } catch (error) {
      logger.error('Error updating user role', {
        error: error.message,
        userId,
        newRole,
        requestedBy,
      });
      throw error;
    }
  }

  /**
   * Create admin invitation
   */
  async createInvitation(data) {
    const { email, role, countryCode, invitedBy, metadata } = data;

    try {
      // Validate role
      const allowedRoles = ['admin', 'country_admin', 'moderator', 'developer'];
      if (!allowedRoles.includes(role)) {
        throw new Error(`Invalid role for invitation: ${role}`);
      }

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Check if invitation already exists and is not expired
      const existingInvitation = await db.query(
        'SELECT id FROM admin_invitations WHERE email = $1 AND expires_at > CURRENT_TIMESTAMP AND accepted_at IS NULL',
        [email.toLowerCase()]
      );

      if (existingInvitation.rows.length > 0) {
        throw new Error('An active invitation already exists for this email');
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invitation
      const invitationId = uuidv4();
      const result = await db.query(
        `INSERT INTO admin_invitations (
          id, email, role, country_code, invited_by, token, expires_at, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          invitationId,
          email.toLowerCase(),
          role,
          countryCode || null,
          invitedBy,
          token,
          expiresAt,
          JSON.stringify(metadata || {}),
        ]
      );

      // Log activity
      await this.logActivity({
        userId: invitedBy,
        action: 'create_admin_invitation',
        resourceType: 'admin_invitation',
        resourceId: invitationId,
        details: {
          email,
          role,
          countryCode,
        },
      });

      return {
        ...result.rows[0],
        invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/invite/${token}`,
      };
    } catch (error) {
      logger.error('Error creating admin invitation', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Get invitation by token
   */
  async getInvitationByToken(token) {
    try {
      const result = await db.query(
        `SELECT ai.*, u.name as inviter_name, u.email as inviter_email
         FROM admin_invitations ai
         LEFT JOIN users u ON ai.invited_by = u.id
         WHERE ai.token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const invitation = result.rows[0];

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        return { ...invitation, expired: true };
      }

      // Check if already accepted
      if (invitation.accepted_at) {
        return { ...invitation, accepted: true };
      }

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        countryCode: invitation.country_code,
        invitedBy: invitation.invited_by,
        inviter: {
          name: invitation.inviter_name,
          email: invitation.inviter_email,
        },
        expiresAt: invitation.expires_at,
        metadata: invitation.metadata || {},
        createdAt: invitation.created_at,
      };
    } catch (error) {
      logger.error('Error fetching invitation', { error: error.message, token });
      throw error;
    }
  }

  /**
   * List invitations
   */
  async listInvitations(filters = {}) {
    const { status, limit = 50, offset = 0 } = filters;

    try {
      let whereConditions = [];
      const values = [];
      let paramIndex = 1;

      if (status === 'pending') {
        whereConditions.push(
          'accepted_at IS NULL AND expires_at > CURRENT_TIMESTAMP'
        );
      } else if (status === 'accepted') {
        whereConditions.push('accepted_at IS NOT NULL');
      } else if (status === 'expired') {
        whereConditions.push(
          'accepted_at IS NULL AND expires_at <= CURRENT_TIMESTAMP'
        );
      }

      const whereClause =
        whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM admin_invitations ${whereClause}`,
        values
      );
      const total = parseInt(countResult.rows[0].total);

      // Get invitations
      values.push(limit, offset);
      const result = await db.query(
        `SELECT ai.*, u.name as inviter_name, u.email as inviter_email
         FROM admin_invitations ai
         LEFT JOIN users u ON ai.invited_by = u.id
         ${whereClause}
         ORDER BY ai.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        values
      );

      const invitations = result.rows.map((row) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        countryCode: row.country_code,
        invitedBy: row.invited_by,
        inviter: {
          name: row.inviter_name,
          email: row.inviter_email,
        },
        expiresAt: row.expires_at,
        acceptedAt: row.accepted_at,
        acceptedBy: row.accepted_by,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        status: row.accepted_at
          ? 'accepted'
          : new Date(row.expires_at) < new Date()
          ? 'expired'
          : 'pending',
      }));

      return {
        invitations,
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Error listing invitations', { error: error.message, filters });
      throw error;
    }
  }

  /**
   * Accept invitation (creates user account)
   */
  async acceptInvitation(token, userData) {
    const { name, password } = userData;
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Get invitation
      const invitation = await this.getInvitationByToken(token);
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      if (invitation.expired) {
        throw new Error('Invitation has expired');
      }

      if (invitation.accepted) {
        throw new Error('Invitation has already been accepted');
      }

      // Create user account with the invited role
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      const userResult = await client.query(
        `INSERT INTO users (
          id, email, password_hash, name, role, subscription_tier,
          is_email_verified, is_active, country_code, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, email, name, role, subscription_tier, is_email_verified, is_active, country_code, created_at`,
        [
          userId,
          invitation.email.toLowerCase().trim(),
          passwordHash,
          name.trim(),
          invitation.role,
          'free',
          false,
          true,
          invitation.countryCode || null,
        ]
      );

      const userRow = userResult.rows[0];

      // Mark invitation as accepted
      await client.query(
        `UPDATE admin_invitations 
         SET accepted_at = CURRENT_TIMESTAMP, accepted_by = $1
         WHERE id = $2`,
        [userId, invitation.id]
      );

      const user = {
        user: {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          role: userRow.role,
          subscriptionTier: userRow.subscription_tier,
          isEmailVerified: userRow.is_email_verified,
          isActive: userRow.is_active,
          countryCode: userRow.country_code,
          createdAt: userRow.created_at,
        },
        token: null, // User will need to login to get token
      };

      await client.query('COMMIT');

      // Log activity
      await this.logActivity({
        userId: user.user.id,
        action: 'accept_admin_invitation',
        resourceType: 'admin_invitation',
        resourceId: invitation.id,
        details: {
          email: invitation.email,
          role: invitation.role,
        },
      });

      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error accepting invitation', {
        error: error.message,
        token,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Log activity to audit log
   */
  async logActivity(data) {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
    } = data;

    try {
      await db.query(
        `INSERT INTO audit_logs (
          user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
        [
          userId || null,
          action,
          resourceType || null,
          resourceId || null,
          JSON.stringify(details || {}),
          ipAddress || null,
          userAgent || null,
        ]
      );
    } catch (error) {
      // Don't throw - logging should not break the main flow
      logger.warn('Error logging activity', { error: error.message, data });
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters = {}) {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      limit = 100,
      offset = 0,
    } = filters;

    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;

      if (userId) {
        conditions.push(`user_id = $${paramIndex}`);
        values.push(userId);
        paramIndex++;
      }

      if (action) {
        conditions.push(`action = $${paramIndex}`);
        values.push(action);
        paramIndex++;
      }

      if (resourceType) {
        conditions.push(`resource_type = $${paramIndex}`);
        values.push(resourceType);
        paramIndex++;
      }

      if (resourceId) {
        conditions.push(`resource_id = $${paramIndex}`);
        values.push(resourceId);
        paramIndex++;
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
        values
      );
      const total = parseInt(countResult.rows[0].total);

      // Get logs
      values.push(limit, offset);
      const result = await db.query(
        `SELECT al.*, u.name as user_name, u.email as user_email
         FROM audit_logs al
         LEFT JOIN users u ON al.user_id = u.id
         ${whereClause}
         ORDER BY al.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        values
      );

      const logs = result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        user: row.user_name
          ? {
              id: row.user_id,
              name: row.user_name,
              email: row.user_email,
            }
          : null,
        action: row.action,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        details: row.details || {},
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at,
      }));

      return {
        logs,
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Error fetching audit logs', { error: error.message, filters });
      throw error;
    }
  }

  /**
   * Get platform analytics
   */
  async getPlatformAnalytics() {
    try {
      // Get user counts by role
      const userCountsResult = await db.query(
        `SELECT role, COUNT(*) as count 
         FROM users 
         GROUP BY role`
      );

      // Get total users
      const totalUsersResult = await db.query('SELECT COUNT(*) as total FROM users');
      const totalUsers = parseInt(totalUsersResult.rows[0].total);

      // Get active users (logged in last 30 days)
      const activeUsersResult = await db.query(
        `SELECT COUNT(*) as total 
         FROM users 
         WHERE last_login_at > CURRENT_TIMESTAMP - INTERVAL '30 days'`
      );
      const activeUsers = parseInt(activeUsersResult.rows[0].total);

      // Get subscription counts
      const subscriptionCountsResult = await db.query(
        `SELECT subscription_tier, COUNT(*) as count 
         FROM users 
         GROUP BY subscription_tier`
      );

      // Get recent activity (last 7 days)
      const recentActivityResult = await db.query(
        `SELECT COUNT(*) as total 
         FROM audit_logs 
         WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'`
      );
      const recentActivity = parseInt(recentActivityResult.rows[0].total);

      // Get contribution stats
      const contributionStatsResult = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'verified') as verified,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
         FROM contributions`
      );
      const contributionStats = contributionStatsResult.rows[0];

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          byRole: userCountsResult.rows.reduce((acc, row) => {
            acc[row.role] = parseInt(row.count);
            return acc;
          }, {}),
        },
        subscriptions: {
          byTier: subscriptionCountsResult.rows.reduce((acc, row) => {
            acc[row.subscription_tier] = parseInt(row.count);
            return acc;
          }, {}),
        },
        activity: {
          recent: recentActivity,
        },
        contributions: {
          total: parseInt(contributionStats.total),
          verified: parseInt(contributionStats.verified),
          pending: parseInt(contributionStats.pending),
          rejected: parseInt(contributionStats.rejected),
        },
      };
    } catch (error) {
      logger.error('Error fetching platform analytics', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AdminService();

