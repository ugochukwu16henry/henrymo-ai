/**
 * File Upload Routes
 * Endpoints for file upload, retrieval, and management
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const fileService = require('../services/fileService');
const logger = require('../utils/logger');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types (can be restricted later)
    cb(null, true);
  },
});

/**
 * POST /api/upload
 * Upload a file
 */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
        });
      }

      const { folder, metadata } = req.body;
      const parsedMetadata = metadata ? JSON.parse(metadata) : {};

      const file = await fileService.uploadFile(req.user.id, {
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        folder: folder || 'uploads',
        metadata: parsedMetadata,
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: file,
      });
    } catch (error) {
      logger.error('Error uploading file', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/upload
 * List user files
 */
router.get(
  '/',
  authenticate,
  validate(
    z.object({
      query: z.object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
        folder: z.string().optional(),
        mimeType: z.string().optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { limit = 50, offset = 0, folder, mimeType } = req.query;

      const files = await fileService.listFiles(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        folder: folder || null,
        mimeType: mimeType || null,
      });

      res.json({
        success: true,
        data: files,
        count: files.length,
      });
    } catch (error) {
      logger.error('Error listing files', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/upload/:id
 * Get file by ID
 */
router.get(
  '/:id',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid file ID'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const file = await fileService.getFileById(req.params.id, req.user.id);

      res.json({
        success: true,
        data: file,
      });
    } catch (error) {
      if (error.message === 'File not found') {
        return res.status(404).json({
          success: false,
          error: 'File not found',
        });
      }

      logger.error('Error getting file', {
        error: error.message,
        fileId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/upload/:id/url
 * Get signed URL for file
 */
router.get(
  '/:id/url',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid file ID'),
      }),
      query: z.object({
        expiresIn: z.coerce.number().int().min(60).max(86400).optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { expiresIn = 3600 } = req.query;
      const signedUrl = await fileService.getSignedUrl(
        req.params.id,
        req.user.id,
        parseInt(expiresIn)
      );

      res.json({
        success: true,
        data: {
          url: signedUrl,
          expiresIn: parseInt(expiresIn),
        },
      });
    } catch (error) {
      if (error.message === 'File not found') {
        return res.status(404).json({
          success: false,
          error: 'File not found',
        });
      }

      logger.error('Error getting signed URL', {
        error: error.message,
        fileId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * DELETE /api/upload/:id
 * Delete file
 */
router.delete(
  '/:id',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid file ID'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      await fileService.deleteFile(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      if (error.message === 'File not found') {
        return res.status(404).json({
          success: false,
          error: 'File not found',
        });
      }

      logger.error('Error deleting file', {
        error: error.message,
        fileId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

module.exports = router;

