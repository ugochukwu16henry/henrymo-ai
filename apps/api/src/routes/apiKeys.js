/**
 * API Keys Management Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const apiKeyService = require('../services/apiKeyService');

// Create API key
router.post(
  '/keys',
  authenticate,
  validate(z.object({
    body: z.object({
      keyName: z.string().min(1).max(255),
      scopes: z.array(z.string()).optional(),
      rateLimitPerMinute: z.number().int().positive().optional(),
      rateLimitPerDay: z.number().int().positive().optional(),
      expiresAt: z.string().datetime().optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await apiKeyService.createApiKey(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get user's API keys
router.get(
  '/keys',
  authenticate,
  async (req, res) => {
    try {
      const result = await apiKeyService.getUserApiKeys(req.user.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Revoke API key
router.delete(
  '/keys/:id',
  authenticate,
  async (req, res) => {
    try {
      const result = await apiKeyService.revokeApiKey(req.user.id, req.params.id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get API usage statistics
router.get(
  '/keys/:id/usage',
  authenticate,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const result = await apiKeyService.getUsageStats(
        req.user.id,
        req.params.id,
        startDate || null,
        endDate || null
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get API plans
router.get(
  '/plans',
  authenticate,
  async (req, res) => {
    try {
      const result = await apiKeyService.getApiPlans();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get user's API subscription
router.get(
  '/subscription',
  authenticate,
  async (req, res) => {
    try {
      const result = await apiKeyService.getUserApiSubscription(req.user.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;

