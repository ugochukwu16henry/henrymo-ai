/**
 * Debugging Routes
 * Endpoints for error debugging and analysis
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const debuggingService = require('../services/debuggingService');
const debuggingHistoryService = require('../services/debuggingHistoryService');
const logger = require('../utils/logger');

/**
 * POST /api/ai-capabilities/debug/error
 * Debug an error with code context
 */
router.post(
  '/error',
  authenticate,
  validate(
    z.object({
      body: z.object({
        errorMessage: z.string().min(1, 'Error message is required'),
        stackTrace: z.string().optional(),
        code: z.string().optional(),
        language: z.string().default('javascript'),
        context: z.record(z.unknown()).optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const {
        errorMessage,
        stackTrace,
        code,
        language,
        context = {},
      } = req.body;

      const debugResult = await debuggingService.debugError({
        errorMessage,
        stackTrace,
        code,
        language,
        context,
      });

      // Save to history
      await debuggingHistoryService.saveDebug(req.user.id, {
        errorMessage,
        stackTrace: stackTrace || '',
        language,
        result: debugResult,
      });

      res.json({
        success: true,
        data: debugResult,
      });
    } catch (error) {
      logger.error('Error debugging', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * POST /api/ai-capabilities/debug/analyze
 * Analyze error without code context
 */
router.post(
  '/analyze',
  authenticate,
  validate(
    z.object({
      body: z.object({
        errorMessage: z.string().min(1, 'Error message is required'),
        stackTrace: z.string().optional(),
        language: z.string().default('javascript'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { errorMessage, stackTrace, language } = req.body;

      const analysis = await debuggingService.analyzeError(
        errorMessage,
        stackTrace || '',
        language
      );

      // Save to history
      await debuggingHistoryService.saveDebug(req.user.id, {
        errorMessage,
        stackTrace: stackTrace || '',
        language,
        result: analysis,
      });

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      logger.error('Error analyzing error', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/ai-capabilities/debugs
 * List debugging history
 */
router.get(
  '/debugs',
  authenticate,
  validate(
    z.object({
      query: z.object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
        language: z.string().optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { limit = 20, offset = 0, language } = req.query;

      const debugs = await debuggingHistoryService.listDebugs(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        language: language || null,
      });

      res.json({
        success: true,
        data: debugs,
        count: debugs.length,
      });
    } catch (error) {
      logger.error('Error listing debugs', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/ai-capabilities/debugs/:id
 * Get debugging session by ID
 */
router.get(
  '/debugs/:id',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid debug ID'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const debug = await debuggingHistoryService.getDebugById(
        req.params.id,
        req.user.id
      );

      if (!debug) {
        return res.status(404).json({
          success: false,
          error: 'Debugging session not found',
        });
      }

      res.json({
        success: true,
        data: debug,
      });
    } catch (error) {
      logger.error('Error getting debug', {
        error: error.message,
        debugId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

module.exports = router;

