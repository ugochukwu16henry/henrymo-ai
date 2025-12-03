/**
 * Invoice Service
 * Generates and manages invoices for payments
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

class InvoiceService {
  /**
   * Generate invoice from payment
   */
  async generateInvoice(paymentId) {
    try {
      const paymentResult = await db.query(
        `SELECT p.*, u.email, u.name, u.country_code, s.tier, s.billing_period
         FROM payments p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN subscriptions s ON p.subscription_id = s.id
         WHERE p.id = $1`,
        [paymentId]
      );

      if (paymentResult.rows.length === 0) {
        throw new Error('Payment not found');
      }

      const payment = paymentResult.rows[0];

      // Generate invoice number
      const invoiceNumber = this.generateInvoiceNumber(payment.created_at);

      const invoice = {
        invoiceNumber,
        paymentId: payment.id,
        userId: payment.user_id,
        customer: {
          name: payment.name,
          email: payment.email,
          countryCode: payment.country_code,
        },
        items: [
          {
            description: payment.description || 'Subscription payment',
            quantity: 1,
            unitPrice: parseFloat(payment.amount),
            total: parseFloat(payment.amount),
          },
        ],
        subtotal: parseFloat(payment.amount),
        tax: 0, // Can be calculated based on country
        total: parseFloat(payment.amount),
        currency: payment.currency,
        status: payment.status,
        issueDate: payment.created_at,
        dueDate: payment.created_at,
        paidAt: payment.completed_at,
        metadata: {
          subscriptionTier: payment.tier,
          billingPeriod: payment.billing_period,
          paymentMethod: payment.payment_method,
        },
      };

      return invoice;
    } catch (error) {
      logger.error('Error generating invoice', {
        error: error.message,
        paymentId,
      });
      throw error;
    }
  }

  /**
   * List invoices for user
   */
  async listInvoices(filters = {}) {
    const {
      userId,
      status,
      limit = 50,
      offset = 0,
    } = filters;

    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;

      if (userId) {
        conditions.push(`p.user_id = $${paramIndex}`);
        values.push(userId);
        paramIndex++;
      }

      if (status) {
        conditions.push(`p.status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM payments p ${whereClause}`,
        values
      );
      const total = parseInt(countResult.rows[0].total);

      // Get payments
      values.push(limit, offset);
      const result = await db.query(
        `SELECT p.*, u.email, u.name, u.country_code, s.tier, s.billing_period
         FROM payments p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN subscriptions s ON p.subscription_id = s.id
         ${whereClause}
         ORDER BY p.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        values
      );

      const invoices = await Promise.all(
        result.rows.map(async (row) => {
          const invoiceNumber = this.generateInvoiceNumber(row.created_at);
          return {
            invoiceNumber,
            paymentId: row.id,
            userId: row.user_id,
            customer: {
              name: row.name,
              email: row.email,
            },
            amount: parseFloat(row.amount),
            currency: row.currency,
            status: row.status,
            description: row.description,
            issueDate: row.created_at,
            paidAt: row.completed_at,
            metadata: {
              subscriptionTier: row.tier,
              billingPeriod: row.billing_period,
            },
          };
        })
      );

      return {
        invoices,
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Error listing invoices', {
        error: error.message,
        filters,
      });
      throw error;
    }
  }

  /**
   * Get invoice by payment ID
   */
  async getInvoiceByPaymentId(paymentId) {
    try {
      return await this.generateInvoice(paymentId);
    } catch (error) {
      logger.error('Error getting invoice', {
        error: error.message,
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Generate invoice number
   */
  generateInvoiceNumber(date) {
    const year = new Date(date).getFullYear();
    const month = String(new Date(date).getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }
}

module.exports = new InvoiceService();

