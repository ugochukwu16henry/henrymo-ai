/**
 * Training Mode Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const trainingModeService = require('../services/trainingModeService');

// Create training session
router.post(
  '/sessions',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      name: z.string().min(1),
      objective: z.string().min(1),
      datasetPath: z.string().optional(),
      trainingConfig: z.record(z.any()).optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await trainingModeService.createTrainingSession(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// List training sessions
router.get(
  '/sessions',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const filters = {
        status: req.query.status,
        createdBy: req.query.createdBy,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
      };
      const result = await trainingModeService.listTrainingSessions(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get training session
router.get(
  '/sessions/:id',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await trainingModeService.getTrainingSession(req.params.id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Start training
router.post(
  '/sessions/:id/start',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await trainingModeService.startTraining(req.params.id, req.user.id);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Pause training
router.post(
  '/sessions/:id/pause',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await trainingModeService.pauseTraining(req.params.id, req.user.id);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Export model
router.post(
  '/sessions/:id/export',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await trainingModeService.exportModel(req.params.id, req.user.id);
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

