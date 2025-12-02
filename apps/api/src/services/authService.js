/**
 * Authentication Service
 * Handles user registration, login, JWT token generation
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Register a new user
 */
const register = async (userData) => {
  const { email, password, name, countryCode } = userData;

  try {
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const result = await db.query(
      `INSERT INTO users (
        id, email, password_hash, name, role, subscription_tier,
        is_email_verified, is_active, country_code, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id, email, name, role, subscription_tier, is_email_verified, is_active, country_code, created_at`,
      [
        userId,
        email.toLowerCase().trim(),
        passwordHash,
        name.trim(),
        'user', // Default role
        'free', // Default subscription tier
        false, // Email not verified by default
        true, // Active by default
        countryCode || null,
      ]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken(user);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscription_tier,
        isEmailVerified: user.is_email_verified,
        isActive: user.is_active,
        countryCode: user.country_code,
        createdAt: user.created_at,
      },
      token,
    };
  } catch (error) {
    logger.error('Error registering user', { error: error.message, email });
    throw error;
  }
};

/**
 * Login user
 */
const login = async (email, password) => {
  try {
    // Find user by email
    const result = await db.query(
      'SELECT id, email, password_hash, name, role, subscription_tier, is_email_verified, is_active, is_suspended, country_code, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is inactive. Please contact support.');
    }

    // Check if user is suspended
    if (user.is_suspended) {
      throw new Error('Account is suspended. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login time
    await db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscription_tier,
        isEmailVerified: user.is_email_verified,
        isActive: user.is_active,
        countryCode: user.country_code,
        createdAt: user.created_at,
      },
      token,
    };
  } catch (error) {
    logger.error('Error logging in user', { error: error.message, email });
    throw error;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, subscription_tier, is_email_verified, is_active, country_code, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionTier: user.subscription_tier,
      isEmailVerified: user.is_email_verified,
      isActive: user.is_active,
      countryCode: user.country_code,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  } catch (error) {
    logger.error('Error getting user by ID', { error: error.message, userId });
    throw error;
  }
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Refresh token (generate new token from existing valid token)
 */
const refreshToken = async (token) => {
  try {
    // Verify existing token
    const decoded = verifyToken(token);

    // Get full user data to check status
    const fullUserResult = await db.query(
      'SELECT id, email, name, role, subscription_tier, is_email_verified, is_active, is_suspended, country_code, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (fullUserResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const fullUser = fullUserResult.rows[0];

    // Check if user is still active
    if (!fullUser.is_active) {
      throw new Error('Account is inactive');
    }

    if (fullUser.is_suspended) {
      throw new Error('Account is suspended');
    }

    // Format user data
    const user = {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      role: fullUser.role,
      subscriptionTier: fullUser.subscription_tier,
      isEmailVerified: fullUser.is_email_verified,
      isActive: fullUser.is_active,
      countryCode: fullUser.country_code,
      avatarUrl: fullUser.avatar_url,
      createdAt: fullUser.created_at,
      updatedAt: fullUser.updated_at,
    };

    // Generate new token
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('Token refreshed successfully', { userId: user.id });

    return {
      user,
      token: newToken,
    };
  } catch (error) {
    logger.error('Error refreshing token', { error: error.message });
    throw error;
  }
};

module.exports = {
  register,
  login,
  getUserById,
  generateToken,
  verifyToken,
  refreshToken,
};

