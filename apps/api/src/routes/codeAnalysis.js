/**
 * Code Analysis Routes
 * Endpoints for code analysis, security scanning, and performance analysis
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const codeAnalysisService = require('../services/codeAnalysisService');
const analysisHistoryService = require('../services/analysisHistoryService');
const logger = require('../utils/logger');

/**
 * POST /api/ai-capabilities/analyze/code
 * Analyze code for issues
 */
router.post(
  '/code',
  authenticate,
  validate(
    z.object({
      body: z.object({
        code: z.string().min(1, 'Code is required'),
        language: z.string().min(1, 'Language is required'),
        includeSecurity: z.boolean().optional(),
        includePerformance: z.boolean().optional(),
        includeBugs: z.boolean().optional(),
        includeBestPractices: z.boolean().optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const {
        code,
        language,
        includeSecurity = true,
        includePerformance = true,
        includeBugs = true,
        includeBestPractices = true,
      } = req.body;

      const analysis = await codeAnalysisService.analyzeCode(code, language, {
        includeSecurity,
        includePerformance,
        includeBugs,
        includeBestPractices,
      });

      // Save to history
      await analysisHistoryService.saveAnalysis(req.user.id, {
        type: 'code',
        language,
        codeLength: code.length,
        result: analysis,
      });

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      logger.error('Error analyzing code', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * POST /api/ai-capabilities/analyze/security
 * Security scan
 */
router.post(
  '/security',
  authenticate,
  validate(
    z.object({
      body: z.object({
        code: z.string().min(1, 'Code is required'),
        language: z.string().min(1, 'Language is required'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { code, language } = req.body;

      // Run security scan
      const securityScan = await codeAnalysisService.securityScan(code, language);

      // Detect secrets
      const secrets = await codeAnalysisService.detectSecrets(code);
      securityScan.secrets = [...securityScan.secrets, ...secrets];

      // Save to history
      await analysisHistoryService.saveAnalysis(req.user.id, {
        type: 'security',
        language,
        codeLength: code.length,
        result: securityScan,
      });

      res.json({
        success: true,
        data: securityScan,
      });
    } catch (error) {
      logger.error('Error in security scan', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * POST /api/ai-capabilities/analyze/performance
 * Performance analysis
 */
router.post(
  '/performance',
  authenticate,
  validate(
    z.object({
      body: z.object({
        code: z.string().min(1, 'Code is required'),
        language: z.string().min(1, 'Language is required'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { code, language } = req.body;

      const analysis = await codeAnalysisService.performanceAnalysis(code, language);

      // Save to history
      await analysisHistoryService.saveAnalysis(req.user.id, {
        type: 'performance',
        language,
        codeLength: code.length,
        result: analysis,
      });

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      logger.error('Error in performance analysis', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/ai-capabilities/analyses
 * List analysis history
 */
router.get(
  '/analyses',
  authenticate,
  validate(
    z.object({
      query: z.object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
        type: z.enum(['code', 'security', 'performance']).optional(),
        language: z.string().optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { limit = 20, offset = 0, type, language } = req.query;

      const analyses = await analysisHistoryService.listAnalyses(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        type,
        language,
      });

      res.json({
        success: true,
        data: analyses,
        count: analyses.length,
      });
    } catch (error) {
      logger.error('Error listing analyses', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/ai-capabilities/analyses/:id
 * Get analysis by ID
 */
router.get(
  '/analyses/:id',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid analysis ID'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const analysis = await analysisHistoryService.getAnalysisById(
        req.params.id,
        req.user.id
      );

      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: 'Analysis not found',
        });
      }

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      logger.error('Error getting analysis', {
        error: error.message,
        analysisId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

module.exports = router;

