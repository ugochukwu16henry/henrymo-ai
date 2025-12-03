/**
 * Payment Routes
 * API endpoints for payment processing
 */

const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const subscriptionService = require('../services/subscriptionService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  createSubscriptionSchema,
  cancelSubscriptionSchema,
} = require('../validators/financialValidators');
const logger = require('../utils/logger');

/**
 * POST /api/payment/subscription
 * Create subscription with payment
 */
router.post(
  '/subscription',
  authenticate,
  validate({ body: createSubscriptionSchema }),
  async (req, res, next) => {
    try {
      const { tier, billingPeriod, paymentMethodId } = req.body;

      const result = await paymentService.createSubscriptionPayment(
        req.user.id,
        tier,
        billingPeriod,
        paymentMethodId
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Subscription created successfully',
      });
    } catch (error) {
      logger.error('Error creating subscription payment', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * POST /api/payment/webhook
 * Stripe webhook endpoint
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        logger.warn('Stripe webhook secret not configured');
        return res.status(400).json({
          success: false,
          error: 'Webhook secret not configured',
        });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        logger.warn('Webhook signature verification failed', {
          error: err.message,
        });
        return res.status(400).json({
          success: false,
          error: `Webhook Error: ${err.message}`,
        });
      }

      // Handle the event
      await paymentService.handleWebhook(event);

      res.json({ success: true, received: true });
    } catch (error) {
      logger.error('Error handling webhook', {
        error: error.message,
      });
      next(error);
    }
  }
);

/**
 * POST /api/payment/subscription/:id/cancel
 * Cancel subscription
 */
router.post(
  '/subscription/:id/cancel',
  authenticate,
  validate({ body: cancelSubscriptionSchema }),
  async (req, res, next) => {
    try {
      const subscription = await subscriptionService.getSubscriptionById(req.params.id);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
      }

      if (subscription.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to cancel this subscription',
        });
      }

      const cancelled = await subscriptionService.cancelSubscription(
        req.params.id,
        req.body.cancelAtPeriodEnd || false
      );

      res.json({
        success: true,
        data: cancelled,
        message: 'Subscription cancelled successfully',
      });
    } catch (error) {
      logger.error('Error cancelling subscription', {
        error: error.message,
        subscriptionId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

module.exports = router;

