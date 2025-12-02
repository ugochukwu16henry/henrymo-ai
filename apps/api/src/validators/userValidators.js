/**
 * User Validation Schemas
 * Input validation for user management endpoints
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { z } = require('zod');

/**
 * Update user profile validation schema
 */
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters')
    .transform((val) => val.trim())
    .optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  countryCode: z
    .string()
    .length(2, 'Country code must be 2 characters (ISO 3166-1 alpha-2)')
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Change password validation schema
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Update role validation schema
 */
const updateRoleSchema = z.object({
  role: z.enum([
    'user',
    'contributor',
    'verifier',
    'developer',
    'moderator',
    'admin',
    'country_admin',
    'super_admin',
  ], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

/**
 * Update subscription tier validation schema
 */
const updateSubscriptionSchema = z.object({
  subscriptionTier: z.enum(['free', 'starter', 'pro', 'enterprise'], {
    errorMap: () => ({ message: 'Invalid subscription tier' }),
  }),
});

/**
 * List users query parameters schema
 */
const listUsersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  role: z.enum([
    'user',
    'contributor',
    'verifier',
    'developer',
    'moderator',
    'admin',
    'country_admin',
    'super_admin',
  ]).optional(),
  subscriptionTier: z.enum(['free', 'starter', 'pro', 'enterprise']).optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().min(1).optional(),
});

/**
 * Suspend user validation schema
 */
const suspendUserSchema = z.object({
  suspend: z
    .boolean()
    .or(z.string().transform((val) => val === 'true'))
    .optional()
    .default(true),
});

/**
 * UUID parameter validation
 */
const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
  updateRoleSchema,
  updateSubscriptionSchema,
  listUsersQuerySchema,
  suspendUserSchema,
  uuidParamSchema,
};

