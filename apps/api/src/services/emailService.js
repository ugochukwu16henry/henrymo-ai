/**
 * Email Service
 * Handles email sending using Nodemailer
 */

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');
const emailTemplates = require('../templates/emailTemplates');

class EmailService {
  constructor() {
    // Create transporter (graceful degradation if not configured)
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    } else {
      logger.warn('Email service not configured. Emails will be logged only.');
      this.transporter = null;
    }
  }

  /**
   * Send email
   */
  async sendEmail(options) {
    const {
      to,
      subject,
      html,
      text,
      from = config.email.from,
      attachments = [],
    } = options;

    try {
      if (!this.transporter) {
        logger.info('Email would be sent (not configured)', {
          to,
          subject,
          from,
        });
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from,
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      logger.error('Error sending email', {
        error: error.message,
        to,
        subject,
      });
      throw error;
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(userEmail, userName, verificationToken) {
    const verificationUrl = `${config.frontendUrl}/auth/verify?token=${verificationToken}`;
    const { html, text } = emailTemplates.verificationEmail(
      userName,
      verificationUrl
    );

    return await this.sendEmail({
      to: userEmail,
      subject: 'Verify your email address',
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetUrl = `${config.frontendUrl}/auth/reset-password?token=${resetToken}`;
    const { html, text } = emailTemplates.passwordResetEmail(
      userName,
      resetUrl
    );

    return await this.sendEmail({
      to: userEmail,
      subject: 'Reset your password',
      html,
      text,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userEmail, userName) {
    const { html, text } = emailTemplates.welcomeEmail(userName);

    return await this.sendEmail({
      to: userEmail,
      subject: 'Welcome to HenryMo AI!',
      html,
      text,
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(userEmail, userName, notification) {
    const { html, text } = emailTemplates.notificationEmail(
      userName,
      notification
    );

    return await this.sendEmail({
      to: userEmail,
      subject: notification.subject || 'Notification from HenryMo AI',
      html,
      text,
    });
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(userEmail, userName, invoice) {
    const { html, text } = emailTemplates.invoiceEmail(userName, invoice);

    return await this.sendEmail({
      to: userEmail,
      subject: `Invoice ${invoice.invoiceNumber} from HenryMo AI`,
      html,
      text,
    });
  }

  /**
   * Send weekly digest email
   */
  async sendWeeklyDigest(userEmail, userName, digestData) {
    const { html, text } = emailTemplates.weeklyDigestEmail(
      userName,
      digestData
    );

    return await this.sendEmail({
      to: userEmail,
      subject: 'Your weekly HenryMo AI digest',
      html,
      text,
    });
  }

  /**
   * Convert HTML to plain text (simple implementation)
   */
  htmlToText(html) {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Verify email configuration
   */
  async verifyConnection() {
    if (!this.transporter) {
      return { verified: false, message: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { verified: true };
    } catch (error) {
      logger.error('Email connection verification failed', {
        error: error.message,
      });
      return { verified: false, message: error.message };
    }
  }
}

module.exports = new EmailService();

