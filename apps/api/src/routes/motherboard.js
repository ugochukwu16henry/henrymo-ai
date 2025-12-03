/**
 * Central Motherboard Routes
 * Routes for module registry and system monitoring
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const centralMotherboardService = require('../services/centralMotherboardService');

// Get all modules (admin only)
router.get(
  '/modules',
  authenticate,
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const result = await centralMotherboardService.getAllModules();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get module by name
router.get(
  '/modules/:name',
  authenticate,
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const result = await centralMotherboardService.getModule(req.params.name);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Register a module (super admin only)
router.post(
  '/modules',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      name: z.string().min(1),
      version: z.string().min(1),
      dependencies: z.array(z.string()).optional(),
      metadata: z.record(z.any()).optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await centralMotherboardService.registerModule(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Update module health
router.put(
  '/modules/:name/health',
  authenticate,
  authorize('admin', 'super_admin'),
  validate(z.object({
    body: z.object({
      healthStatus: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']),
      metrics: z.record(z.any()).optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await centralMotherboardService.updateModuleHealth(
        req.params.name,
        req.body.healthStatus,
        req.body.metrics
      );
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get system health overview
router.get(
  '/health',
  authenticate,
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const result = await centralMotherboardService.getSystemHealth();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get module metrics
router.get(
  '/modules/:name/metrics',
  authenticate,
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const timeRange = req.query.timeRange || '1 hour';
      const result = await centralMotherboardService.getModuleMetrics(
        req.params.name,
        timeRange
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Check module dependencies
router.get(
  '/modules/:name/dependencies',
  authenticate,
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const result = await centralMotherboardService.checkDependencies(req.params.name);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;

