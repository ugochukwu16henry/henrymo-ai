/**
 * User Service
 * Handles user profile management, CRUD operations, password changes
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get user by ID (excludes sensitive data)
 */
const getUserById = async (userId) => {
  try {
    const result = await db.query(
      `SELECT 
        id, email, name, avatar_url, role, subscription_tier,
        is_email_verified, is_active, is_suspended, 
        country_code, metadata, created_at, updated_at, last_login_at
      FROM users 
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error getting user by ID', {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Get user by email (excludes sensitive data)
 */
const getUserByEmail = async (email) => {
  try {
    const result = await db.query(
      `SELECT 
        id, email, name, avatar_url, role, subscription_tier,
        is_email_verified, is_active, is_suspended,
        country_code, metadata, created_at, updated_at, last_login_at
      FROM users 
      WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error getting user by email', {
      error: error.message,
      email,
    });
    throw error;
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  const { name, avatarUrl, countryCode, metadata } = updateData;

  try {
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(avatarUrl);
    }

    if (countryCode !== undefined) {
      updates.push(`country_code = $${paramIndex++}`);
      values.push(countryCode);
    }

    if (metadata !== undefined) {
      // Merge with existing metadata
      const currentUser = await getUserById(userId);
      const mergedMetadata = {
        ...(currentUser.metadata || {}),
        ...metadata,
      };
      updates.push(`metadata = $${paramIndex++}::jsonb`);
      values.push(JSON.stringify(mergedMetadata));
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, avatar_url, role, subscription_tier,
        is_email_verified, is_active, is_suspended,
        country_code, metadata, created_at, updated_at, last_login_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info('User profile updated', {
      userId,
      updatedFields: Object.keys(updateData),
    });

    return result.rows[0];
  } catch (error) {
    logger.error('Error updating user profile', {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Change user password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get user with password hash
    const result = await db.query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    logger.info('User password changed', { userId });

    return { success: true };
  } catch (error) {
    logger.error('Error changing password', {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Delete user account (soft delete by setting is_active = false)
 */
const deleteUser = async (userId) => {
  try {
    const result = await db.query(
      `UPDATE users 
       SET is_active = false, is_suspended = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info('User account deleted', { userId });

    return { success: true };
  } catch (error) {
    logger.error('Error deleting user', {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * List users (admin only)
 */
const listUsers = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    role,
    subscriptionTier,
    isActive,
    search,
  } = options;

  try {
    // Build query
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (role) {
      conditions.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (subscriptionTier) {
      conditions.push(`subscription_tier = $${paramIndex++}`);
      values.push(subscriptionTier);
    }

    if (isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }

    if (search) {
      conditions.push(
        `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get paginated results
    const offset = (page - 1) * limit;
    values.push(limit, offset);
    const query = `
      SELECT 
        id, email, name, avatar_url, role, subscription_tier,
        is_email_verified, is_active, is_suspended,
        country_code, created_at, updated_at, last_login_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const result = await db.query(query, values);

    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error listing users', {
      error: error.message,
      options,
    });
    throw error;
  }
};

/**
 * Update user role (admin only)
 */
const updateUserRole = async (userId, newRole, requestedBy) => {
  const allowedRoles = [
    'user',
    'contributor',
    'verifier',
    'developer',
    'moderator',
    'admin',
    'country_admin',
    'super_admin',
  ];

  if (!allowedRoles.includes(newRole)) {
    throw new Error(`Invalid role: ${newRole}`);
  }

  try {
    // Prevent downgrading super_admin or self-role changes without proper permissions
    const user = await getUserById(userId);

    // Check if trying to modify super_admin
    if (user.role === 'super_admin' && requestedBy.role !== 'super_admin') {
      throw new Error('Cannot modify super admin role');
    }

    // Check if trying to assign super_admin
    if (newRole === 'super_admin' && requestedBy.role !== 'super_admin') {
      throw new Error('Only super admins can assign super admin role');
    }

    const result = await db.query(
      `UPDATE users 
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, name, role`,
      [newRole, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info('User role updated', {
      userId,
      oldRole: user.role,
      newRole,
      requestedBy: requestedBy.id,
    });

    return result.rows[0];
  } catch (error) {
    logger.error('Error updating user role', {
      error: error.message,
      userId,
      newRole,
    });
    throw error;
  }
};

/**
 * Update user subscription tier (admin only)
 */
const updateSubscriptionTier = async (userId, newTier) => {
  const allowedTiers = ['free', 'starter', 'pro', 'enterprise'];

  if (!allowedTiers.includes(newTier)) {
    throw new Error(`Invalid subscription tier: ${newTier}`);
  }

  try {
    const result = await db.query(
      `UPDATE users 
       SET subscription_tier = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, subscription_tier`,
      [newTier, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info('User subscription tier updated', {
      userId,
      newTier,
    });

    return result.rows[0];
  } catch (error) {
    logger.error('Error updating subscription tier', {
      error: error.message,
      userId,
      newTier,
    });
    throw error;
  }
};

/**
 * Suspend/unsuspend user (admin only)
 */
const suspendUser = async (userId, suspend = true) => {
  try {
    const user = await getUserById(userId);

    // Prevent suspending super_admin
    if (user.role === 'super_admin') {
      throw new Error('Cannot suspend super admin');
    }

    const result = await db.query(
      `UPDATE users 
       SET is_suspended = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, is_suspended`,
      [suspend, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info('User suspension status updated', {
      userId,
      suspended: suspend,
    });

    return result.rows[0];
  } catch (error) {
    logger.error('Error updating user suspension', {
      error: error.message,
      userId,
    });
    throw error;
  }
};

module.exports = {
  getUserById,
  getUserByEmail,
  updateUserProfile,
  changePassword,
  deleteUser,
  listUsers,
  updateUserRole,
  updateSubscriptionTier,
  suspendUser,
};

