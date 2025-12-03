/**
 * Contribution Validators
 * Zod schemas for contribution-related requests
 */

const { z } = require('zod');

const createContributionSchema = z.object({
  streetId: z.string().uuid().nullable().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  streetName: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

const updateContributionSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(['pending', 'verified', 'rejected', 'needs_review', 'flagged']).optional(),
  streetId: z.string().uuid().nullable().optional(),
});

const listContributionsSchema = z.object({
  userId: z.string().uuid().optional(),
  streetId: z.string().uuid().optional(),
  status: z.enum(['pending', 'verified', 'rejected', 'needs_review', 'flagged']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

module.exports = {
  createContributionSchema,
  updateContributionSchema,
  listContributionsSchema,
};

