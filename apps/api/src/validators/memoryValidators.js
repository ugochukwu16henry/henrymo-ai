/**
 * Memory Validators
 * Zod schemas for memory validation
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { z } = require('zod');

/**
 * Create memory schema
 */
const createMemorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  contentType: z.enum(['note', 'code_snippet', 'documentation', 'conversation_summary', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  embeddingVectorId: z.string().max(255).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Update memory schema
 */
const updateMemorySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  contentType: z.enum(['note', 'code_snippet', 'documentation', 'conversation_summary', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  embeddingVectorId: z.string().max(255).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * List memories query schema
 */
const listMemoriesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  orderBy: z.enum(['created_at', 'updated_at', 'title']).optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  contentType: z.enum(['note', 'code_snippet', 'documentation', 'conversation_summary', 'other']).optional(),
  tags: z.string().optional(), // Comma-separated tags
  isPinned: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

/**
 * UUID param schema
 */
const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid memory ID format'),
});

module.exports = {
  createMemorySchema,
  updateMemorySchema,
  listMemoriesQuerySchema,
  uuidParamSchema,
};

