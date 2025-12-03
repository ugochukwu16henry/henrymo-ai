/**
 * Payment Service
 * Stripe integration for payment processing
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');
const subscriptionService = require('./subscriptionService');

// Stripe is optional - will gracefully degrade if not configured
let stripe = null;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  logger.warn('Stripe not configured. Payment processing will be disabled.');
}

class PaymentService {
  /**
   * Create Stripe customer
   */
  async createStripeCustomer(userId, email, name) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer', {
        error: error.message,
        userId,
        email,
      });
      throw error;
    }
  }

  /**
   * Create subscription payment
   */
  async createSubscriptionPayment(userId, tier, billingPeriod, paymentMethodId) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      // Get or create Stripe customer
      const userResult = await db.query(
        'SELECT email, name FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const { email, name } = userResult.rows[0];

      // Get existing subscription to check for Stripe customer
      const existingSubscription = await subscriptionService.getSubscriptionByUserId(userId);
      let stripeCustomerId = existingSubscription?.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await this.createStripeCustomer(userId, email, name);
        stripeCustomerId = customer.id;
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      // Set as default payment method
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create Stripe subscription
      const priceId = this.getStripePriceId(tier, billingPeriod);
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Create subscription in database
      const subscription = await subscriptionService.createSubscription(userId, {
        tier,
        billingPeriod,
        status: 'active',
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      });

      // Create payment record
      const payment = await this.createPaymentRecord({
        userId,
        subscriptionId: subscription.id,
        amount: subscriptionService.getPrice(tier, billingPeriod),
        currency: 'USD',
        status: 'processing',
        paymentMethod: 'stripe',
        stripePaymentIntentId: stripeSubscription.latest_invoice.payment_intent.id,
        description: `${tier} subscription (${billingPeriod})`,
      });

      return {
        subscription,
        payment,
        clientSecret: stripeSubscription.latest_invoice.payment_intent.client_secret,
      };
    } catch (error) {
      logger.error('Error creating subscription payment', {
        error: error.message,
        userId,
        tier,
        billingPeriod,
      });
      throw error;
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(event) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePayment(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoiceFailure(event.data.object);
          break;

        default:
          logger.debug('Unhandled Stripe webhook event', { type: event.type });
      }
    } catch (error) {
      logger.error('Error handling Stripe webhook', {
        error: error.message,
        eventType: event.type,
      });
      throw error;
    }
  }

  /**
   * Handle payment success
   */
  async handlePaymentSuccess(paymentIntent) {
    try {
      await db.query(
        `UPDATE payments 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE stripe_payment_intent_id = $1`,
        [paymentIntent.id]
      );

      logger.info('Payment succeeded', { paymentIntentId: paymentIntent.id });
    } catch (error) {
      logger.error('Error handling payment success', {
        error: error.message,
        paymentIntentId: paymentIntent.id,
      });
    }
  }

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(paymentIntent) {
    try {
      await db.query(
        `UPDATE payments 
         SET status = 'failed', updated_at = CURRENT_TIMESTAMP
         WHERE stripe_payment_intent_id = $1`,
        [paymentIntent.id]
      );

      logger.warn('Payment failed', { paymentIntentId: paymentIntent.id });
    } catch (error) {
      logger.error('Error handling payment failure', {
        error: error.message,
        paymentIntentId: paymentIntent.id,
      });
    }
  }

  /**
   * Handle subscription update
   */
  async handleSubscriptionUpdate(stripeSubscription) {
    try {
      const subscription = await db.query(
        'SELECT id FROM subscriptions WHERE stripe_subscription_id = $1',
        [stripeSubscription.id]
      );

      if (subscription.rows.length === 0) {
        logger.warn('Subscription not found for Stripe subscription', {
          stripeSubscriptionId: stripeSubscription.id,
        });
        return;
      }

      await subscriptionService.updateSubscription(subscription.rows[0].id, {
        status: stripeSubscription.status === 'active' ? 'active' : 'cancelled',
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
      });

      logger.info('Subscription updated', {
        subscriptionId: subscription.rows[0].id,
        status: stripeSubscription.status,
      });
    } catch (error) {
      logger.error('Error handling subscription update', {
        error: error.message,
        stripeSubscriptionId: stripeSubscription.id,
      });
    }
  }

  /**
   * Handle subscription cancellation
   */
  async handleSubscriptionCancellation(stripeSubscription) {
    try {
      const subscription = await db.query(
        'SELECT id FROM subscriptions WHERE stripe_subscription_id = $1',
        [stripeSubscription.id]
      );

      if (subscription.rows.length > 0) {
        await subscriptionService.cancelSubscription(subscription.rows[0].id, false);
        logger.info('Subscription cancelled', {
          subscriptionId: subscription.rows[0].id,
        });
      }
    } catch (error) {
      logger.error('Error handling subscription cancellation', {
        error: error.message,
        stripeSubscriptionId: stripeSubscription.id,
      });
    }
  }

  /**
   * Handle invoice payment
   */
  async handleInvoicePayment(invoice) {
    try {
      if (invoice.subscription) {
        const subscription = await db.query(
          'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1',
          [invoice.subscription]
        );

        if (subscription.rows.length > 0) {
          // Create payment record for recurring payment
          await this.createPaymentRecord({
            userId: subscription.rows[0].user_id,
            subscriptionId: subscription.rows[0].id,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency.toUpperCase(),
            status: 'completed',
            paymentMethod: 'stripe',
            stripeChargeId: invoice.charge,
            description: `Subscription payment - ${invoice.description || 'Recurring payment'}`,
          });
        }
      }
    } catch (error) {
      logger.error('Error handling invoice payment', {
        error: error.message,
        invoiceId: invoice.id,
      });
    }
  }

  /**
   * Handle invoice failure
   */
  async handleInvoiceFailure(invoice) {
    try {
      if (invoice.subscription) {
        const subscription = await db.query(
          'SELECT id FROM subscriptions WHERE stripe_subscription_id = $1',
          [invoice.subscription]
        );

        if (subscription.rows.length > 0) {
          await subscriptionService.updateSubscription(subscription.rows[0].id, {
            status: 'past_due',
          });
        }
      }
    } catch (error) {
      logger.error('Error handling invoice failure', {
        error: error.message,
        invoiceId: invoice.id,
      });
    }
  }

  /**
   * Create payment record
   */
  async createPaymentRecord(data) {
    const {
      userId,
      subscriptionId = null,
      amount,
      currency = 'USD',
      status = 'pending',
      paymentMethod = 'stripe',
      stripePaymentIntentId = null,
      stripeChargeId = null,
      description = null,
      metadata = {},
    } = data;

    try {
      const paymentId = uuidv4();
      const result = await db.query(
        `INSERT INTO payments (
          id, user_id, subscription_id, amount, currency, status, payment_method,
          stripe_payment_intent_id, stripe_charge_id, description, metadata,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          paymentId,
          userId,
          subscriptionId,
          amount,
          currency,
          status,
          paymentMethod,
          stripePaymentIntentId,
          stripeChargeId,
          description,
          JSON.stringify(metadata),
        ]
      );

      return this.formatPayment(result.rows[0]);
    } catch (error) {
      logger.error('Error creating payment record', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Get Stripe price ID (from environment or construct)
   */
  getStripePriceId(tier, billingPeriod) {
    // Check environment variables first
    const envKey = `STRIPE_PRICE_${tier.toUpperCase()}_${billingPeriod.toUpperCase()}`;
    if (process.env[envKey]) {
      return process.env[envKey];
    }

    // Fallback: return a placeholder (should be configured in Stripe dashboard)
    throw new Error(
      `Stripe price ID not configured for ${tier} ${billingPeriod}. Please set ${envKey} environment variable.`
    );
  }

  /**
   * Format payment for response
   */
  formatPayment(row) {
    return {
      id: row.id,
      userId: row.user_id,
      subscriptionId: row.subscription_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      paymentMethod: row.payment_method,
      stripePaymentIntentId: row.stripe_payment_intent_id,
      stripeChargeId: row.stripe_charge_id,
      description: row.description,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
    };
  }
}

module.exports = new PaymentService();

