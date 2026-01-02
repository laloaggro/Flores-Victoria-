/**
 * SMS Service
 * Handles SMS notifications via multiple providers (Twilio, AWS SNS)
 */

const logger = require('../utils/logger') || console;

class SMSService {
  constructor() {
    this.provider = null;
    this.initialized = false;
    this.providerName = process.env.SMS_PROVIDER || 'twilio';
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      switch (this.providerName) {
        case 'twilio':
          await this.initializeTwilio();
          break;
        case 'aws':
          await this.initializeAWS();
          break;
        default:
          logger.warn(`Unknown SMS provider: ${this.providerName}`);
          return false;
      }

      this.initialized = true;
      logger.info(`✅ SMS service initialized (${this.providerName})`);
      return true;
    } catch (error) {
      logger.error('Failed to initialize SMS service:', error.message);
      return false;
    }
  }

  async initializeTwilio() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    // Dynamic import for Twilio
    const twilio = require('twilio');
    this.provider = twilio(accountSid, authToken);
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async initializeAWS() {
    const AWS = require('aws-sdk');
    
    AWS.config.update({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.provider = new AWS.SNS();
  }

  async sendSMS({ to, message }) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.provider) {
      throw new Error('SMS service not configured');
    }

    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(to);

    let result;
    switch (this.providerName) {
      case 'twilio':
        result = await this.sendViaTwilio(normalizedPhone, message);
        break;
      case 'aws':
        result = await this.sendViaAWS(normalizedPhone, message);
        break;
    }

    logger.info(`SMS sent to ${normalizedPhone}`);
    return result;
  }

  async sendViaTwilio(to, message) {
    return this.provider.messages.create({
      body: message,
      from: this.fromNumber,
      to: to,
    });
  }

  async sendViaAWS(to, message) {
    const params = {
      Message: message,
      PhoneNumber: to,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    };

    return this.provider.publish(params).promise();
  }

  normalizePhoneNumber(phone) {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add Chile country code if not present
    if (cleaned.startsWith('9') && cleaned.length === 9) {
      cleaned = '56' + cleaned;
    }
    
    return '+' + cleaned;
  }

  // Template methods
  async sendOrderConfirmation(phone, orderNumber) {
    const message = `✅ Flores Victoria: Tu pedido #${orderNumber} ha sido confirmado. Te notificaremos cuando esté en camino. 🌸`;
    return this.sendSMS({ to: phone, message });
  }

  async sendShippingNotification(phone, orderNumber, trackingUrl) {
    const message = `📦 Flores Victoria: Tu pedido #${orderNumber} está en camino. Rastrea tu envío: ${trackingUrl}`;
    return this.sendSMS({ to: phone, message });
  }

  async sendDeliveryNotification(phone, orderNumber) {
    const message = `🎉 Flores Victoria: Tu pedido #${orderNumber} ha sido entregado. ¡Esperamos que lo disfrutes! 💐`;
    return this.sendSMS({ to: phone, message });
  }

  async sendOTP(phone, code) {
    const message = `🔐 Tu código de verificación de Flores Victoria es: ${code}. Válido por 5 minutos.`;
    return this.sendSMS({ to: phone, message });
  }

  async sendAppointmentReminder(phone, date, time) {
    const message = `⏰ Flores Victoria: Recordatorio de tu cita para el ${date} a las ${time}. ¡Te esperamos! 🌷`;
    return this.sendSMS({ to: phone, message });
  }
}

module.exports = new SMSService();
