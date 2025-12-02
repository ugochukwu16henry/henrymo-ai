/**
 * Authentication Validation Schemas
 * Input validation for authentication endpoints
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { z } = require('zod');

/**
 * Email validation regex
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password strength requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Registration validation schema
 */
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters')
    .transform((val) => val.trim()),
  countryCode: z
    .string()
    .length(2, 'Country code must be 2 characters (ISO 3166-1 alpha-2)')
    .optional()
    .nullable(),
});

/**
 * Login validation schema
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

/**
 * Validate registration data
 */
const validateRegister = (data) => {
  return registerSchema.parse(data);
};

/**
 * Validate login data
 */
const validateLogin = (data) => {
  return loginSchema.parse(data);
};

/**
 * Validate refresh token data
 */
const validateRefreshToken = (data) => {
  return refreshTokenSchema.parse(data);
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  validateRegister,
  validateLogin,
  validateRefreshToken,
};

