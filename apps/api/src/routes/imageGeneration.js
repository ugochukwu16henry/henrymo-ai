/**
 * Image Generation Routes
 * Endpoints for AI image generation
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const imageGenerationService = require('../services/imageGenerationService');
const generatedImageService = require('../services/generatedImageService');
const logger = require('../utils/logger');

/**
 * POST /api/media/image/generate
 * Generate AI image
 */
router.post(
  '/generate',
  authenticate,
  validate(
    z.object({
      body: z.object({
        prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
        size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional(),
        style: z.enum(['realistic', 'artistic', 'cartoon', 'abstract', 'vintage']).optional(),
        quality: z.enum(['standard', 'hd']).optional(),
        addWatermark: z.boolean().optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const {
        prompt,
        size = '1024x1024',
        style = 'realistic',
        quality = 'standard',
        addWatermark = true,
      } = req.body;

      // Generate and store image
      const imageData = await imageGenerationService.generateAndStoreImage(
        req.user.id,
        prompt,
        {
          size,
          style,
          quality,
          addWatermark,
        }
      );

      // Save metadata to database
      const savedImage = await generatedImageService.saveGeneratedImage(req.user.id, {
        s3Key: imageData.s3Key,
        s3Url: imageData.s3Url,
        originalUrl: imageData.originalUrl,
        prompt,
        revisedPrompt: imageData.revisedPrompt,
        size: imageData.size,
        style: imageData.style,
      });

      res.status(201).json({
        success: true,
        message: 'Image generated successfully',
        data: savedImage,
      });
    } catch (error) {
      logger.error('Error generating image', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/media/image/:id
 * Get generated image by ID
 */
router.get(
  '/:id',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid image ID'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const image = await generatedImageService.getImageById(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        data: image,
      });
    } catch (error) {
      if (error.message === 'Image not found') {
        return res.status(404).json({
          success: false,
          error: 'Image not found',
        });
      }

      logger.error('Error getting image', {
        error: error.message,
        imageId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * POST /api/media/image/variations
 * Create image variations
 */
router.post(
  '/variations',
  authenticate,
  validate(
    z.object({
      body: z.object({
        prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
        count: z.coerce.number().int().min(1).max(4).optional(),
        size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional(),
        style: z.enum(['realistic', 'artistic', 'cartoon', 'abstract', 'vintage']).optional(),
        quality: z.enum(['standard', 'hd']).optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const {
        prompt,
        count = 4,
        size = '1024x1024',
        style = 'realistic',
        quality = 'standard',
      } = req.body;

      // Generate variations
      const variations = await imageGenerationService.createVariations(
        prompt,
        count,
        {
          size,
          style,
          quality,
        }
      );

      // Store each variation
      const savedImages = [];
      for (const variation of variations) {
        try {
          const imageData = await imageGenerationService.generateAndStoreImage(
            req.user.id,
            variation.revisedPrompt || prompt,
            {
              size: variation.size || size,
              style: variation.style || style,
              quality,
            }
          );

          const saved = await generatedImageService.saveGeneratedImage(req.user.id, {
            s3Key: imageData.s3Key,
            s3Url: imageData.s3Url,
            originalUrl: imageData.originalUrl,
            prompt: variation.revisedPrompt || prompt,
            revisedPrompt: imageData.revisedPrompt,
            size: imageData.size,
            style: imageData.style,
            metadata: {
              variationIndex: variation.variationIndex,
            },
          });

          savedImages.push(saved);
        } catch (error) {
          logger.warn('Error saving variation', {
            error: error.message,
            index: variation.variationIndex,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: `${savedImages.length} image variations generated`,
        data: savedImages,
      });
    } catch (error) {
      logger.error('Error creating image variations', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/media/images
 * List user's generated images
 */
router.get(
  '/',
  authenticate,
  validate(
    z.object({
      query: z.object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
        style: z.enum(['realistic', 'artistic', 'cartoon', 'abstract', 'vintage']).optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { limit = 50, offset = 0, style } = req.query;

      const images = await generatedImageService.listImages(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        style: style || null,
      });

      res.json({
        success: true,
        data: images,
        count: images.length,
      });
    } catch (error) {
      logger.error('Error listing images', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * DELETE /api/media/image/:id
 * Delete generated image
 */
router.delete(
  '/:id',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid image ID'),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      await generatedImageService.deleteImage(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Image not found') {
        return res.status(404).json({
          success: false,
          error: 'Image not found',
        });
      }

      logger.error('Error deleting image', {
        error: error.message,
        imageId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

module.exports = router;

