/**
 * Financial Routes
 * API endpoints for financial dashboard and invoices
 */

const express = require('express');
const router = express.Router();
const invoiceService = require('../services/invoiceService');
const paymentService = require('../services/paymentService');
const subscriptionService = require('../services/subscriptionService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  listInvoicesSchema,
  getFinancialDashboardSchema,
} = require('../validators/financialValidators');
const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/financial/dashboard
 * Get financial dashboard data
 */
router.get(
  '/dashboard',
  authenticate,
  validate({ query: getFinancialDashboardSchema }),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user.id;

      // Get user subscription
      const subscription = await subscriptionService.getSubscriptionByUserId(userId);

      // Get payment statistics
      let paymentStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'failed') as failed,
          COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as totalSpent
        FROM payments
        WHERE user_id = $1
      `;
      const paymentStatsValues = [userId];

      if (startDate) {
        paymentStatsQuery += ` AND created_at >= $${paymentStatsValues.length + 1}`;
        paymentStatsValues.push(startDate);
      }

      if (endDate) {
        paymentStatsQuery += ` AND created_at <= $${paymentStatsValues.length + 1}`;
        paymentStatsValues.push(endDate);
      }

      const paymentStatsResult = await db.query(paymentStatsQuery, paymentStatsValues);
      const paymentStats = paymentStatsResult.rows[0];

      // Get recent payments
      const recentPaymentsResult = await db.query(
        `SELECT * FROM payments 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 5`,
        [userId]
      );

      const dashboard = {
        subscription: subscription || null,
        payments: {
          total: parseInt(paymentStats.total),
          completed: parseInt(paymentStats.completed),
          pending: parseInt(paymentStats.pending),
          failed: parseInt(paymentStats.failed),
          totalSpent: parseFloat(paymentStats.totalspent || 0),
        },
        recentPayments: recentPaymentsResult.rows.map((row) =>
          paymentService.formatPayment(row)
        ),
      };

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      logger.error('Error fetching financial dashboard', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/financial/invoices
 * List invoices
 */
router.get(
  '/invoices',
  authenticate,
  validate({ query: listInvoicesSchema }),
  async (req, res, next) => {
    try {
      const result = await invoiceService.listInvoices({
        userId: req.user.id,
        status: req.query.status,
        limit: parseInt(req.query.limit || '50'),
        offset: parseInt(req.query.offset || '0'),
      });

      res.json({
        success: true,
        data: result.invoices,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.invoices.length < result.total,
        },
      });
    } catch (error) {
      logger.error('Error listing invoices', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/financial/invoices/:paymentId
 * Get invoice by payment ID
 */
router.get('/invoices/:paymentId', authenticate, async (req, res, next) => {
  try {
    // Verify payment belongs to user
    const paymentResult = await db.query(
      'SELECT user_id FROM payments WHERE id = $1',
      [req.params.paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    if (paymentResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view this invoice',
      });
    }

    const invoice = await invoiceService.getInvoiceByPaymentId(req.params.paymentId);

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    logger.error('Error getting invoice', {
      error: error.message,
      paymentId: req.params.paymentId,
      userId: req.user?.id,
    });
    next(error);
  }
});

module.exports = router;

