/**
 * Email Service
 * Handles email sending via Nodemailer
 */

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../logger.simple');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      if (!config.email.user || !config.email.password) {
        logger.warn('Email credentials not configured');
        return false;
      }

      this.transporter = nodemailer.createTransport({
        host: config.email.host || 'smtp.gmail.com',
        port: config.email.port || 587,
        secure: config.email.secure || false,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      logger.info('✅ Email service initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize email service:', error.message);
      return false;
    }
  }

  async sendEmail({ to, subject, text, html, attachments = [] }) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: config.email.from || config.email.user,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const result = await this.transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${result.messageId}`);
    return result;
  }

  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e91e63;">¡Bienvenido a Flores Victoria! 🌸</h1>
        <p>Hola ${user.name},</p>
        <p>Gracias por registrarte en nuestra tienda de flores.</p>
        <p>Estamos emocionados de tenerte como parte de nuestra familia.</p>
        <p style="margin-top: 30px;">
          <a href="${config.frontendUrl}" style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Explorar Productos
          </a>
        </p>
        <p style="color: #666; margin-top: 30px;">Con cariño,<br>El equipo de Flores Victoria</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '¡Bienvenido a Flores Victoria! 🌸',
      text: `Hola ${user.name}, gracias por registrarte en Flores Victoria.`,
      html,
    });
  }

  async sendOrderConfirmation(order) {
    const itemsList = order.items
      .map((item) => `<li>${item.name} x${item.quantity} - $${item.price}</li>`)
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e91e63;">Confirmación de Pedido #${order.id} 🌷</h1>
        <p>Hola ${order.customerName},</p>
        <p>Tu pedido ha sido confirmado y está siendo preparado.</p>
        
        <h3>Detalles del pedido:</h3>
        <ul>${itemsList}</ul>
        
        <p><strong>Total: $${order.total}</strong></p>
        
        <h3>Dirección de entrega:</h3>
        <p>${order.shippingAddress}</p>
        
        <p style="margin-top: 30px;">
          <a href="${config.frontendUrl}/orders/${order.id}" style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Ver Mi Pedido
          </a>
        </p>
        
        <p style="color: #666; margin-top: 30px;">Gracias por tu compra,<br>El equipo de Flores Victoria</p>
      </div>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Pedido #${order.id} Confirmado - Flores Victoria 🌷`,
      text: `Tu pedido #${order.id} ha sido confirmado. Total: $${order.total}`,
      html,
    });
  }

  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e91e63;">Restablecer Contraseña 🔐</h1>
        <p>Hola ${user.name},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
        
        <p style="margin-top: 30px;">
          <a href="${resetUrl}" style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Restablecer Contraseña
          </a>
        </p>
        
        <p style="color: #666; margin-top: 30px;">
          Si no solicitaste este cambio, ignora este correo.
          <br>El enlace expira en 1 hora.
        </p>
        
        <p style="color: #666;">El equipo de Flores Victoria</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Restablecer Contraseña - Flores Victoria',
      text: `Hola ${user.name}, haz clic en este enlace para restablecer tu contraseña: ${resetUrl}`,
      html,
    });
  }

  async sendShippingUpdate(order, status) {
    const statusMessages = {
      preparing: 'Tu pedido está siendo preparado 📦',
      shipped: 'Tu pedido ha sido enviado 🚚',
      delivered: '¡Tu pedido ha sido entregado! 🎉',
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e91e63;">${statusMessages[status] || 'Actualización de pedido'}</h1>
        <p>Hola ${order.customerName},</p>
        <p>Queremos informarte sobre el estado de tu pedido #${order.id}.</p>
        
        <p><strong>Estado actual: ${status}</strong></p>
        
        ${order.trackingNumber ? `<p>Número de seguimiento: ${order.trackingNumber}</p>` : ''}
        
        <p style="margin-top: 30px;">
          <a href="${config.frontendUrl}/orders/${order.id}" style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Ver Detalles del Pedido
          </a>
        </p>
        
        <p style="color: #666; margin-top: 30px;">Gracias por tu preferencia,<br>El equipo de Flores Victoria</p>
      </div>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Actualización de Pedido #${order.id} - Flores Victoria`,
      text: `Tu pedido #${order.id} tiene una actualización: ${status}`,
      html,
    });
  }

  async sendContactResponse(contact, message) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e91e63;">Respuesta a tu consulta 💬</h1>
        <p>Hola ${contact.name},</p>
        <p>Gracias por contactarnos. Aquí está nuestra respuesta:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #e91e63; margin: 20px 0;">
          <p style="margin: 0;">${message}</p>
        </div>
        
        <p>Tu consulta original:</p>
        <blockquote style="color: #666; border-left: 2px solid #ccc; padding-left: 15px;">
          ${contact.originalMessage}
        </blockquote>
        
        <p style="color: #666; margin-top: 30px;">
          Si tienes más preguntas, no dudes en contactarnos.
          <br>El equipo de Flores Victoria
        </p>
      </div>
    `;

    return this.sendEmail({
      to: contact.email,
      subject: 'Respuesta a tu consulta - Flores Victoria',
      text: `Hola ${contact.name}, ${message}`,
      html,
    });
  }
}

module.exports = new EmailService();
