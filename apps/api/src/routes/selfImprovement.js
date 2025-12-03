/**
 * Self-Improvement Routes
 * Routes for update proposals and code analysis
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const selfImprovementService = require('../services/selfImprovementService');

// Analyze a module
router.post(
  '/analyze/:moduleName',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await selfImprovementService.analyzeModule(req.params.moduleName);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Create update proposal
router.post(
  '/proposals',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      moduleName: z.string().min(1),
      proposalType: z.enum(['improvement', 'bug_fix', 'feature', 'optimization', 'security']),
      description: z.string().min(1),
      proposedChanges: z.record(z.any()),
      impactAnalysis: z.record(z.any()).optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await selfImprovementService.createProposal(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get all pending proposals
router.get(
  '/proposals/pending',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await selfImprovementService.getPendingProposals();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get proposal by ID
router.get(
  '/proposals/:id',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await selfImprovementService.getProposal(req.params.id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Check mission alignment
router.post(
  '/proposals/:id/check-alignment',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await selfImprovementService.checkMissionAlignment(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;

