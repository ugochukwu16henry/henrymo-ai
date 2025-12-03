/**
 * Contributions Routes
 * API endpoints for contribution management
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const contributionService = require('../services/contributionService');
const imageProcessingService = require('../services/imageProcessingService');
const verificationService = require('../services/verificationService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  createContributionSchema,
  updateContributionSchema,
  listContributionsSchema,
} = require('../validators/contributionValidators');
const { verifyContributionSchema } = require('../validators/verificationValidators');
const logger = require('../utils/logger');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Max 10 images per contribution
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`));
    }
  },
});

/**
 * POST /api/content/streets/upload
 * Upload a contribution with images
 */
router.post(
  '/upload',
  authenticate,
  upload.array('images', 10),
  validate({ body: createContributionSchema }),
  async (req, res, next) => {
    try {
      const { streetId, latitude, longitude, streetName, notes } = req.body;

      // Process images
      const processedImages = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          // Validate image
          const validation = await imageProcessingService.validateImage(
            file.buffer,
            file.mimetype
          );

          // Extract EXIF data
          const exifData = await imageProcessingService.extractEXIF(
            file.buffer,
            file.mimetype
          );

          processedImages.push({
            buffer: file.buffer,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            width: validation.width,
            height: validation.height,
            exifData,
          });
        }
      }

      // Create contribution
      const contribution = await contributionService.createContribution({
        userId: req.user.id,
        streetId: streetId || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        streetName: streetName || null,
        notes: notes || null,
        images: processedImages,
      });

      res.status(201).json({
        success: true,
        data: contribution,
        message: 'Contribution uploaded successfully',
      });
    } catch (error) {
      logger.error('Error uploading contribution', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack,
      });
      next(error);
    }
  }
);

/**
 * GET /api/content/contributions
 * List contributions
 */
router.get(
  '/',
  authenticate,
  validate({ query: listContributionsSchema }),
  async (req, res, next) => {
    try {
      const result = await contributionService.listContributions(req.query);

      res.json({
        success: true,
        data: result.contributions,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.contributions.length < result.total,
        },
      });
    } catch (error) {
      logger.error('Error listing contributions', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/content/contributions/:id
 * Get contribution by ID
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const contribution = await contributionService.getContributionById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found',
      });
    }

    res.json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    logger.error('Error fetching contribution', {
      error: error.message,
      id: req.params.id,
    });
    next(error);
  }
});

/**
 * PUT /api/content/contributions/:id
 * Update contribution
 */
router.put(
  '/:id',
  authenticate,
  validate({ body: updateContributionSchema }),
  async (req, res, next) => {
    try {
      // Check if user owns the contribution or is admin
      const contribution = await contributionService.getContributionById(req.params.id);
      if (!contribution) {
        return res.status(404).json({
          success: false,
          error: 'Contribution not found',
        });
      }

      // Only allow users to update their own contributions (unless admin)
      if (contribution.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to update this contribution',
        });
      }

      const updated = await contributionService.updateContribution(req.params.id, req.body);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      logger.error('Error updating contribution', {
        error: error.message,
        id: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * Check if user can verify contributions
 */
const canVerify = (user) => {
  const allowedRoles = ['admin', 'moderator', 'verifier', 'super_admin'];
  return allowedRoles.includes(user.role);
};

/**
 * POST /api/content/contributions/:id/verify
 * Verify a contribution
 */
router.post(
  '/:id/verify',
  authenticate,
  validate({ body: verifyContributionSchema }),
  async (req, res, next) => {
    try {
      // Check permissions
      if (!canVerify(req.user)) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to verify contributions',
        });
      }

      // Verify contribution
      const result = await verificationService.verifyContribution(
        req.params.id,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        data: result,
        message: `Contribution ${req.body.verdict} successfully`,
      });
    } catch (error) {
      logger.error('Error verifying contribution', {
        error: error.message,
        contributionId: req.params.id,
        verifierId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/content/contributions/:id/verifications
 * Get verifications for a contribution
 */
router.get('/:id/verifications', authenticate, async (req, res, next) => {
  try {
    // Check if contribution exists
    const contribution = await contributionService.getContributionById(req.params.id);
    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found',
      });
    }

    // Check permissions - users can see verifications for their own contributions
    if (
      contribution.userId !== req.user.id &&
      !canVerify(req.user)
    ) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view verifications for this contribution',
      });
    }

    const verifications = await verificationService.getVerificationsByContribution(
      req.params.id
    );

    res.json({
      success: true,
      data: verifications,
    });
  } catch (error) {
    logger.error('Error fetching verifications for contribution', {
      error: error.message,
      contributionId: req.params.id,
    });
    next(error);
  }
});

module.exports = router;

