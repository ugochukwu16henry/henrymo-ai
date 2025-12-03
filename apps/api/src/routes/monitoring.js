/**
 * Auto-Monitoring Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const autoMonitoringService = require('../services/autoMonitoringService');

// Perform health check
router.get(
  '/health-check',
  authenticate,
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const result = await autoMonitoringService.performHealthCheck();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Diagnose issue
router.post(
  '/diagnose',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      moduleName: z.string().min(1),
      issueType: z.enum(['health_check', 'performance', 'security', 'error_analysis']),
      description: z.string().min(1),
    }),
  })),
  async (req, res) => {
    try {
      const result = await autoMonitoringService.diagnoseIssue(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get recent diagnostics
router.get(
  '/diagnostics',
  authenticate,
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const result = await autoMonitoringService.getRecentDiagnostics(limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Mark diagnostic as fixed
router.post(
  '/diagnostics/:id/fix',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await autoMonitoringService.markFixed(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get optimization suggestions
router.get(
  '/optimization-suggestions',
  authenticate,
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const result = await autoMonitoringService.getOptimizationSuggestions();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;

