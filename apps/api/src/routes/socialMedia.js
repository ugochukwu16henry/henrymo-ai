/**
 * Social Media Management Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const socialMediaService = require('../services/socialMediaService');

// Connect social media account
router.post(
  '/accounts/connect',
  authenticate,
  validate(z.object({
    body: z.object({
      platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'tiktok', 'youtube']),
      accountName: z.string().min(1),
      accountId: z.string().min(1),
      accessToken: z.string().min(1),
      refreshToken: z.string().optional(),
      tokenExpiresAt: z.string().datetime().optional(),
      profileData: z.record(z.any()).optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await socialMediaService.connectAccount(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get user's social accounts
router.get(
  '/accounts',
  authenticate,
  async (req, res) => {
    try {
      const result = await socialMediaService.getUserAccounts(req.user.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Create social media post
router.post(
  '/posts',
  authenticate,
  validate(z.object({
    body: z.object({
      accountId: z.string().uuid(),
      content: z.string().min(1),
      mediaUrls: z.array(z.string().url()).optional(),
      scheduledAt: z.string().datetime().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      hashtags: z.array(z.string()).optional(),
      metadata: z.record(z.any()).optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await socialMediaService.createPost(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Bulk schedule posts
router.post(
  '/posts/bulk-schedule',
  authenticate,
  validate(z.object({
    body: z.object({
      name: z.string().min(1),
      accountIds: z.array(z.string().uuid()),
      posts: z.array(z.object({
        content: z.string().min(1),
        mediaUrls: z.array(z.string().url()).optional(),
        scheduledAt: z.string().datetime().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        hashtags: z.array(z.string()).optional(),
      })),
      scheduleStrategy: z.enum(['spread', 'batch', 'custom']).optional(),
      startDate: z.string().date(),
      endDate: z.string().date().optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await socialMediaService.bulkSchedule(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get scheduled posts
router.get(
  '/posts/scheduled',
  authenticate,
  async (req, res) => {
    try {
      const filters = {
        accountId: req.query.accountId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        status: req.query.status,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
      };
      const result = await socialMediaService.getScheduledPosts(req.user.id, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get analytics
router.get(
  '/analytics',
  authenticate,
  async (req, res) => {
    try {
      const filters = {
        accountId: req.query.accountId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        metricType: req.query.metricType,
      };
      const result = await socialMediaService.getAnalytics(req.user.id, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get Smart Inbox
router.get(
  '/inbox',
  authenticate,
  async (req, res) => {
    try {
      const filters = {
        platform: req.query.platform,
        mentionType: req.query.mentionType,
        isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
      };
      const result = await socialMediaService.getSmartInbox(req.user.id, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Track hashtag
router.post(
  '/hashtags/track',
  authenticate,
  validate(z.object({
    body: z.object({
      hashtag: z.string().min(1),
      platform: z.string().optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await socialMediaService.trackHashtag(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Add competitor
router.post(
  '/competitors',
  authenticate,
  validate(z.object({
    body: z.object({
      competitorName: z.string().min(1),
      platform: z.string().min(1),
      accountUrl: z.string().url().optional(),
      followersCount: z.number().optional(),
      postsCount: z.number().optional(),
      engagementRate: z.number().optional(),
      analysisData: z.record(z.any()).optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await socialMediaService.addCompetitor(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Create content category
router.post(
  '/categories',
  authenticate,
  validate(z.object({
    body: z.object({
      name: z.string().min(1),
      color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      isEvergreen: z.boolean().optional(),
    }),
  })),
  async (req, res) => {
    try {
      const result = await socialMediaService.createCategory(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get content calendar
router.get(
  '/calendar',
  authenticate,
  async (req, res) => {
    try {
      const startDate = req.query.startDate || new Date().toISOString().split('T')[0];
      const endDate = req.query.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const result = await socialMediaService.getContentCalendar(req.user.id, startDate, endDate);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;

