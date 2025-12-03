/**
 * Verifications Routes
 * API endpoints for verification management
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const verificationService = require('../services/verificationService');
const contributionService = require('../services/contributionService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  verifyContributionSchema,
  listVerificationsSchema,
} = require('../validators/verificationValidators');
const { canVerify } = require('../utils/permissions');
const logger = require('../utils/logger');

/**
 * POST /api/content/contributions/:id/verify
 * Verify a contribution
 */
router.post(
  '/contributions/:id/verify',
  authenticate,
  validate(z.object({ body: verifyContributionSchema })),
  async (req, res, next) => {
    try {
      // Check permissions
      if (!canVerify(req.user)) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to verify contributions',
        });
      }

      // Check if contribution exists
      const contribution = await contributionService.getContributionById(req.params.id);
      if (!contribution) {
        return res.status(404).json({
          success: false,
          error: 'Contribution not found',
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
 * GET /api/content/verifications
 * List verifications
 */
router.get(
  '/',
  authenticate,
  validate(z.object({ query: listVerificationsSchema })),
  async (req, res, next) => {
    try {
      // If not admin/moderator, only show their own verifications
      const filters = { ...req.query };
      if (!canVerify(req.user)) {
        filters.verifierId = req.user.id;
      }

      const result = await verificationService.listVerifications(filters);

      res.json({
        success: true,
        data: result.verifications,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.verifications.length < result.total,
        },
      });
    } catch (error) {
      logger.error('Error listing verifications', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/content/verifications/:id
 * Get verification by ID
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const verification = await verificationService.getVerificationById(req.params.id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found',
      });
    }

    // Check permissions - users can only see their own verifications unless admin
    if (
      !canVerify(req.user) &&
      verification.verifierId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this verification',
      });
    }

    res.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    logger.error('Error fetching verification', {
      error: error.message,
      id: req.params.id,
    });
    next(error);
  }
});

/**
 * GET /api/content/contributions/:id/verifications
 * Get verifications for a contribution
 */
router.get('/contributions/:id/verifications', authenticate, async (req, res, next) => {
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

