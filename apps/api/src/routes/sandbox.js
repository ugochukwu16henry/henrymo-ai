/**
 * Sandbox Testing Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const sandboxService = require('../services/sandboxService');

// Test proposal in sandbox
router.post(
  '/proposals/:id/test',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await sandboxService.testProposal(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get test results
router.get(
  '/proposals/:id/test-results',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await sandboxService.getTestResults(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Deploy approved update
router.post(
  '/proposals/:id/deploy',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await sandboxService.deployUpdate(req.params.id, req.user.id);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Rollback deployed update
router.post(
  '/proposals/:id/rollback',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await sandboxService.rollbackUpdate(req.params.id, req.user.id);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;

