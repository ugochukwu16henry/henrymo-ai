/**
 * Financial Validators
 * Zod schemas for financial-related requests
 */

const { z } = require('zod');

const createSubscriptionSchema = z.object({
  tier: z.enum(['free', 'starter', 'pro', 'enterprise']),
  billingPeriod: z.enum(['monthly', 'yearly']),
  paymentMethodId: z.string().min(1),
});

const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().optional(),
});

const listInvoicesSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

const getFinancialDashboardSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

module.exports = {
  createSubscriptionSchema,
  cancelSubscriptionSchema,
  listInvoicesSchema,
  getFinancialDashboardSchema,
};

