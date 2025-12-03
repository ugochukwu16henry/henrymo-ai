/**
 * Admin Validators
 * Zod schemas for admin-related requests
 */

const { z } = require('zod');

const updateUserRoleSchema = z.object({
  role: z.enum([
    'user',
    'contributor',
    'verifier',
    'developer',
    'moderator',
    'country_admin',
    'admin',
    'super_admin',
  ]),
});

const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'country_admin', 'moderator', 'developer']),
  countryCode: z.string().length(2).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

const acceptInvitationSchema = z.object({
  name: z.string().min(1).max(255),
  password: z.string().min(8),
});

const listInvitationsSchema = z.object({
  status: z.enum(['pending', 'accepted', 'expired']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

const listUsersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  role: z.string().optional(),
  subscriptionTier: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

const getAuditLogsSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

module.exports = {
  updateUserRoleSchema,
  createInvitationSchema,
  acceptInvitationSchema,
  listInvitationsSchema,
  listUsersSchema,
  getAuditLogsSchema,
};

