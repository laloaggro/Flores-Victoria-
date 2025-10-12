// Servicio de Email
const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth.user ? {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      } : undefined
    });
  }

  async sendEmail(to, subject, html, text) {
    try {
      const mailOptions = {
        from: config.email.auth.user,
        to,
        subject,
        html,
        text
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { messageId: info.messageId, to });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error sending email', { error: error.message, to });
      return { success: false, error: error.message };
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email server connection verified');
      return true;
    } catch (error) {
      logger.error('Email server connection failed', { error: error.message });
      return false;
    }
  }
}

module.exports = EmailService;