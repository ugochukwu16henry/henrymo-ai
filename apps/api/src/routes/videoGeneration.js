/**
 * Video Generation Routes
 * Endpoints for AI video generation
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const videoGenerationService = require('../services/videoGenerationService');
const generatedVideoService = require('../services/generatedVideoService');
const logger = require('../utils/logger');

/**
 * POST /api/media/video/generate
 * Generate video from images
 */
router.post(
  '/generate',
  authenticate,
  validate(
    z.object({
      body: z.object({
        imageUrls: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').max(50, 'Maximum 50 images allowed'),
        duration: z.coerce.number().min(1).max(10).optional(),
        fps: z.coerce.number().min(24).max(60).optional(),
        width: z.coerce.number().min(480).max(3840).optional(),
        height: z.coerce.number().min(270).max(2160).optional(),
        transition: z.enum(['fade', 'slide', 'none']).optional(),
        outputFormat: z.enum(['mp4', 'webm']).optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const {
        imageUrls,
        duration = 3,
        fps = 30,
        width = 1920,
        height = 1080,
        transition = 'fade',
        outputFormat = 'mp4',
      } = req.body;

      // Generate and store video
      const videoData = await videoGenerationService.generateAndStoreVideo(
        req.user.id,
        imageUrls,
        {
          duration,
          fps,
          width,
          height,
          transition,
          outputFormat,
        }
      );

      // Save metadata to database
      const savedVideo = await generatedVideoService.saveGeneratedVideo(req.user.id, {
        s3Key: videoData.s3Key,
        s3Url: videoData.s3Url,
        format: videoData.format,
        width: videoData.width,
        height: videoData.height,
        fps: videoData.fps,
        duration: videoData.duration,
        frameCount: videoData.frameCount,
      });

      res.status(201).json({
        success: true,
        message: 'Video generated successfully',
        data: savedVideo,
      });
    } catch (error) {
      logger.error('Error generating video', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/media/video/:id
 * Get generated video by ID
 */
router.get(
  '/:id',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid video ID'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const video = await generatedVideoService.getVideoById(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        data: video,
      });
    } catch (error) {
      if (error.message === 'Video not found') {
        return res.status(404).json({
          success: false,
          error: 'Video not found',
        });
      }

      logger.error('Error getting video', {
        error: error.message,
        videoId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/media/videos
 * List user's generated videos
 */
router.get(
  '/',
  authenticate,
  validate(
    z.object({
      query: z.object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const videos = await generatedVideoService.listVideos(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: videos,
        count: videos.length,
      });
    } catch (error) {
      logger.error('Error listing videos', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * DELETE /api/media/video/:id
 * Delete generated video
 */
router.delete(
  '/:id',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid video ID'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      await generatedVideoService.deleteVideo(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Video deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Video not found') {
        return res.status(404).json({
          success: false,
          error: 'Video not found',
        });
      }

      logger.error('Error deleting video', {
        error: error.message,
        videoId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

module.exports = router;

