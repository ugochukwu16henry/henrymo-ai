/**
 * Analytics Routes
 * API endpoints for analytics and usage statistics
 */

const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const logger = require('../utils/logger');

/**
 * GET /api/analytics/overview
 * Get overview statistics
 */
router.get('/overview', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const overview = await analyticsService.getOverview(
      req.user.id,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    logger.error('Error getting overview analytics', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
});

/**
 * GET /api/analytics/usage
 * Get usage statistics
 */
router.get('/usage', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const stats = await analyticsService.getUsageStats(
      req.user.id,
      startDate,
      endDate,
      groupBy
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting usage stats', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
});

/**
 * GET /api/analytics/costs
 * Get cost analysis
 */
router.get('/costs', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const analysis = await analyticsService.getCostAnalysis(
      req.user.id,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Error getting cost analysis', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
});

/**
 * GET /api/analytics/providers
 * Get provider usage statistics
 */
router.get('/providers', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const usage = await analyticsService.getProviderUsage(
      req.user.id,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    logger.error('Error getting provider usage', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
});

module.exports = router;

