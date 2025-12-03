/**
 * Super Admin Control Routes
 * Routes for approval workflow and module control
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const superAdminControlService = require('../services/superAdminControlService');

// Approve update proposal
router.post(
  '/proposals/:id/approve',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      comments: z.string().optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await superAdminControlService.approveProposal(
        req.params.id,
        req.user.id,
        req.body.comments
      );
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Reject update proposal
router.post(
  '/proposals/:id/reject',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      reason: z.string().optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await superAdminControlService.rejectProposal(
        req.params.id,
        req.user.id,
        req.body.reason
      );
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Freeze module
router.post(
  '/modules/:name/freeze',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      reason: z.string().optional(),
      expiresAt: z.string().datetime().optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await superAdminControlService.freezeModule(
        req.params.name,
        req.user.id,
        req.body.reason,
        req.body.expiresAt
      );
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Unfreeze module
router.post(
  '/modules/:name/unfreeze',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await superAdminControlService.unfreezeModule(
        req.params.name,
        req.user.id
      );
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get audit logs
router.get(
  '/audit-logs',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const filters = {
        actionType: req.query.actionType,
        userId: req.query.userId,
        severity: req.query.severity,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0,
      };
      const result = await superAdminControlService.getAuditLogs(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;

