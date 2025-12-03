/**
 * Memory Routes
 * Endpoints for AI memory management
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const memoryService = require('../services/memoryService');
const semanticSearchService = require('../services/semanticSearchService');
const db = require('../config/database');
const logger = require('../utils/logger');
const {
  createMemorySchema,
  updateMemorySchema,
  listMemoriesQuerySchema,
  uuidParamSchema,
} = require('../validators/memoryValidators');

/**
 * POST /api/memory
 * Create a new memory
 */
router.post(
  '/',
  authenticate,
  validate(z.object({ body: createMemorySchema })),
  async (req, res, next) => {
    try {
      const memory = await memoryService.createMemory(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Memory created successfully',
        data: memory,
      });
    } catch (error) {
      logger.error('Error creating memory', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/memory
 * List user memories
 */
router.get(
  '/',
  authenticate,
  validate(z.object({ query: listMemoriesQuerySchema })),
  async (req, res, next) => {
    try {
      const options = { ...req.query };
      
      // Parse tags if provided
      if (options.tags) {
        options.tags = options.tags.split(',').map(tag => tag.trim());
      }

      const memories = await memoryService.listMemories(req.user.id, options);

      res.json({
        success: true,
        data: memories,
        count: memories.length,
      });
    } catch (error) {
      logger.error('Error listing memories', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/memory/search
 * Search memories (text search)
 */
router.get(
  '/search',
  authenticate,
  validate(
    z.object({
      query: z.object({
        q: z.string().min(1, 'Search query is required'),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
        contentType: z.enum(['note', 'code_snippet', 'documentation', 'conversation_summary', 'other']).optional(),
        tags: z.string().optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { q, ...options } = req.query;
      
      if (options.tags) {
        options.tags = options.tags.split(',').map(tag => tag.trim());
      }

      const memories = await memoryService.searchMemories(req.user.id, q, options);

      res.json({
        success: true,
        data: memories,
        count: memories.length,
      });
    } catch (error) {
      logger.error('Error searching memories', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/memory/semantic-search
 * Semantic search memories
 */
router.get(
  '/semantic-search',
  authenticate,
  validate(
    z.object({
      query: z.object({
        q: z.string().min(1, 'Search query is required'),
        topK: z.coerce.number().int().min(1).max(50).optional(),
        minScore: z.coerce.number().min(0).max(1).optional(),
        contentType: z.enum(['note', 'code_snippet', 'documentation', 'conversation_summary', 'other']).optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { q, topK, minScore, contentType } = req.query;

      const memories = await semanticSearchService.searchMemories(
        req.user.id,
        q,
        {
          topK: topK ? parseInt(topK) : 10,
          minScore: minScore ? parseFloat(minScore) : 0.7,
          contentType: contentType || null,
        }
      );

      res.json({
        success: true,
        data: memories,
        count: memories.length,
      });
    } catch (error) {
      logger.error('Error in semantic search', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/memory/:id
 * Get memory by ID
 */
router.get(
  '/:id',
  authenticate,
  validate(z.object({ params: uuidParamSchema })),
  async (req, res, next) => {
    try {
      const memory = await memoryService.getMemoryById(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        data: memory,
      });
    } catch (error) {
      if (error.message === 'Memory not found') {
        return res.status(404).json({
          success: false,
          error: 'Memory not found',
        });
      }

      logger.error('Error getting memory', {
        error: error.message,
        memoryId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * PUT /api/memory/:id
 * Update memory
 */
router.put(
  '/:id',
  authenticate,
  validate(
    z.object({
      params: uuidParamSchema,
      body: updateMemorySchema,
    })
  ),
  async (req, res, next) => {
    try {
      const memory = await memoryService.updateMemory(
        req.params.id,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        message: 'Memory updated successfully',
        data: memory,
      });
    } catch (error) {
      if (error.message === 'Memory not found') {
        return res.status(404).json({
          success: false,
          error: 'Memory not found',
        });
      }

      logger.error('Error updating memory', {
        error: error.message,
        memoryId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * DELETE /api/memory/:id
 * Delete memory
 */
router.delete(
  '/:id',
  authenticate,
  validate(z.object({ params: uuidParamSchema })),
  async (req, res, next) => {
    try {
      await memoryService.deleteMemory(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Memory deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Memory not found') {
        return res.status(404).json({
          success: false,
          error: 'Memory not found',
        });
      }

      logger.error('Error deleting memory', {
        error: error.message,
        memoryId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * POST /api/memory/:id/pin
 * Toggle memory pin status
 */
router.post(
  '/:id/pin',
  authenticate,
  validate(z.object({ params: uuidParamSchema })),
  async (req, res, next) => {
    try {
      const memory = await memoryService.togglePin(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        message: `Memory ${memory.isPinned ? 'pinned' : 'unpinned'} successfully`,
        data: memory,
      });
    } catch (error) {
      if (error.message === 'Memory not found') {
        return res.status(404).json({
          success: false,
          error: 'Memory not found',
        });
      }

      logger.error('Error toggling pin', {
        error: error.message,
        memoryId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/memory/tags
 * Get all unique tags for user
 */
router.get(
  '/tags',
  authenticate,
  async (req, res, next) => {
    try {
      const result = await db.query(
        `SELECT DISTINCT unnest(tags) as tag
         FROM ai_memory
         WHERE user_id = $1
         ORDER BY tag`,
        [req.user.id]
      );

      const tags = result.rows.map(row => row.tag).filter(Boolean);

      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      logger.error('Error getting tags', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

module.exports = router;

