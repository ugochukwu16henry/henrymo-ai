/**
 * Developer Console Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const consoleService = require('../services/consoleService');

// Execute command
router.post(
  '/execute',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      command: z.string().min(1),
      commandType: z.enum(['terminal', 'database', 'system', 'module']),
    }),
  })),
  async (req, res) => {
    try {
      const result = await consoleService.executeCommand(
        req.body.command,
        req.body.commandType,
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

// Get command history
router.get(
  '/history',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const filters = {
        userId: req.query.userId,
        commandType: req.query.commandType,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
      };
      const result = await consoleService.getCommandHistory(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get system logs
router.get(
  '/logs',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const filters = {
        level: req.query.level,
        module: req.query.module,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 100,
      };
      const result = await consoleService.getLogs(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get system resources
router.get(
  '/resources',
  authenticate,
  authorize('super_admin'),
  async (req, res) => {
    try {
      const result = await consoleService.getSystemResources();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Read file
router.post(
  '/file/read',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      filePath: z.string().min(1),
    }),
  })),
  async (req, res) => {
    try {
      const result = await consoleService.readFile(req.body.filePath, req.user.id);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Write file
router.post(
  '/file/write',
  authenticate,
  authorize('super_admin'),
  validate(z.object({
    body: z.object({
      filePath: z.string().min(1),
      content: z.string(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await consoleService.writeFile(
        req.body.filePath,
        req.body.content,
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

module.exports = router;

