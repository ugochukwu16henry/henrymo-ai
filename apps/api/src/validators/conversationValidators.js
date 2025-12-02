/**
 * Conversation Validators
 * Zod schemas for conversation validation
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { z } = require('zod');

/**
 * Create conversation schema
 */
const createConversationSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  mode: z.enum(['general', 'developer', 'learning', 'business']).optional(),
  provider: z.enum(['anthropic', 'openai', 'google']).optional(),
  model: z.string().max(100).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Update conversation schema
 */
const updateConversationSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  mode: z.enum(['general', 'developer', 'learning', 'business']).optional(),
  provider: z.enum(['anthropic', 'openai', 'google']).optional(),
  model: z.string().max(100).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * List conversations query schema
 */
const listConversationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  orderBy: z.enum(['created_at', 'updated_at', 'last_message_at']).optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  mode: z.enum(['general', 'developer', 'learning', 'business']).optional(),
});

/**
 * UUID param schema
 */
const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid conversation ID format'),
});

/**
 * Create message schema
 */
const createMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Content cannot be empty'),
  tokensUsed: z.number().int().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  provider: z.string().max(50).optional().nullable(),
  model: z.string().max(100).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Update message schema
 */
const updateMessageSchema = z.object({
  content: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Get messages query schema
 */
const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  orderBy: z.enum(['created_at']).optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
});

module.exports = {
  createConversationSchema,
  updateConversationSchema,
  listConversationsQuerySchema,
  uuidParamSchema,
  createMessageSchema,
  updateMessageSchema,
  getMessagesQuerySchema,
};

