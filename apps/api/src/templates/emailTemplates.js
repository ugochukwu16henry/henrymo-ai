/**
 * Email Templates
 * HTML and text email templates
 */

class EmailTemplates {
  /**
   * Verification email template
   */
  verificationEmail(userName, verificationUrl) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">HenryMo AI</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <p>Thank you for signing up for HenryMo AI. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #667eea; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} HenryMo AI. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${userName}!

Thank you for signing up for HenryMo AI. Please verify your email address by visiting this link:

${verificationUrl}

This link will expire in 24 hours.

© ${new Date().getFullYear()} HenryMo AI. All rights reserved.
    `;

    return { html, text };
  }

  /**
   * Password reset email template
   */
  passwordResetEmail(userName, resetUrl) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">HenryMo AI</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #667eea; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #d32f2f; font-size: 14px; margin-top: 30px;"><strong>If you didn't request this, please ignore this email.</strong></p>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} HenryMo AI. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${userName}!

We received a request to reset your password. Visit this link to reset it:

${resetUrl}

If you didn't request this, please ignore this email.

This link will expire in 1 hour.

© ${new Date().getFullYear()} HenryMo AI. All rights reserved.
    `;

    return { html, text };
  }

  /**
   * Welcome email template
   */
  welcomeEmail(userName) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HenryMo AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to HenryMo AI!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <p>We're excited to have you on board! HenryMo AI is your all-in-one AI development platform.</p>
          <h3 style="color: #667eea;">What you can do:</h3>
          <ul>
            <li>Chat with ChatBoss AI assistant</li>
            <li>Analyze and debug your code</li>
            <li>Generate images and videos</li>
            <li>Manage your AI memories</li>
            <li>Contribute to the Streets platform</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} HenryMo AI. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${userName}!

Welcome to HenryMo AI! We're excited to have you on board.

What you can do:
- Chat with ChatBoss AI assistant
- Analyze and debug your code
- Generate images and videos
- Manage your AI memories
- Contribute to the Streets platform

Get started: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

If you have any questions, feel free to reach out to our support team.

© ${new Date().getFullYear()} HenryMo AI. All rights reserved.
    `;

    return { html, text };
  }

  /**
   * Notification email template
   */
  notificationEmail(userName, notification) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.subject || 'Notification'}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">HenryMo AI</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            ${notification.message || notification.content || ''}
          </div>
          ${notification.actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${notification.actionUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">${notification.actionText || 'View Details'}</a>
            </div>
          ` : ''}
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} HenryMo AI. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${userName}!

${notification.message || notification.content || ''}

${notification.actionUrl ? `\n${notification.actionText || 'View Details'}: ${notification.actionUrl}` : ''}

© ${new Date().getFullYear()} HenryMo AI. All rights reserved.
    `;

    return { html, text };
  }

  /**
   * Invoice email template
   */
  invoiceEmail(userName, invoice) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Invoice</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <p>Thank you for your payment. Here's your invoice:</p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0;"><strong>Invoice Number:</strong></td>
                <td style="text-align: right;">${invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Date:</strong></td>
                <td style="text-align: right;">${new Date(invoice.issueDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Amount:</strong></td>
                <td style="text-align: right; font-size: 20px; font-weight: bold; color: #667eea;">${invoice.currency} ${invoice.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          <p style="color: #666; font-size: 14px;">This invoice has been paid successfully.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} HenryMo AI. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${userName}!

Thank you for your payment. Here's your invoice:

Invoice Number: ${invoice.invoiceNumber}
Date: ${new Date(invoice.issueDate).toLocaleDateString()}
Amount: ${invoice.currency} ${invoice.total.toFixed(2)}

This invoice has been paid successfully.

© ${new Date().getFullYear()} HenryMo AI. All rights reserved.
    `;

    return { html, text };
  }

  /**
   * Weekly digest email template
   */
  weeklyDigestEmail(userName, digestData) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly Digest</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Your Weekly Digest</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <p>Here's what happened this week:</p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #667eea;">Activity Summary</h3>
            <ul>
              <li><strong>Conversations:</strong> ${digestData.conversations || 0}</li>
              <li><strong>Messages:</strong> ${digestData.messages || 0}</li>
              <li><strong>Tokens Used:</strong> ${digestData.tokens || 0}</li>
              <li><strong>Memories Created:</strong> ${digestData.memories || 0}</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} HenryMo AI. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${userName}!

Here's what happened this week:

Activity Summary:
- Conversations: ${digestData.conversations || 0}
- Messages: ${digestData.messages || 0}
- Tokens Used: ${digestData.tokens || 0}
- Memories Created: ${digestData.memories || 0}

View Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

© ${new Date().getFullYear()} HenryMo AI. All rights reserved.
    `;

    return { html, text };
  }
}

module.exports = new EmailTemplates();

