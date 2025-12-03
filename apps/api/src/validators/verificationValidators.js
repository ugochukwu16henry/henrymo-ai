/**
 * Verification Validators
 * Zod schemas for verification-related requests
 */

const { z } = require('zod');

const verifyContributionSchema = z.object({
  verdict: z.enum(['approved', 'rejected', 'needs_review', 'flagged']),
  comment: z.string().max(2000).optional().nullable(),
  confidenceScore: z.number().min(0).max(1).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

const listVerificationsSchema = z.object({
  verifierId: z.string().uuid().optional(),
  contributionId: z.string().uuid().optional(),
  verdict: z.enum(['approved', 'rejected', 'needs_review', 'flagged']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

module.exports = {
  verifyContributionSchema,
  listVerificationsSchema,
};

