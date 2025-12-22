/**
 * Notification Routes
 * Handles all notification-related endpoints
 */

const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');
const logger = require('../logger.simple');
const { serviceAuth, readAuth } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════
// SEND EMAIL NOTIFICATIONS (Protected - Internal services or Admin only)
// ═══════════════════════════════════════════════════════════════

/**
 * Send generic email
 * POST /api/notifications/email
 */
router.post('/email', serviceAuth, async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        error: 'to y subject son requeridos',
        code: 'MISSING_FIELDS',
      });
    }

    if (!text && !html) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere text o html',
        code: 'MISSING_CONTENT',
      });
    }

    const result = await emailService.sendEmail({ to, subject, text, html });

    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Email enviado exitosamente',
    });
  } catch (error) {
    logger.error('Send email error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'EMAIL_SEND_ERROR',
    });
  }
});

/**
 * Send welcome email
 * POST /api/notifications/welcome
 */
router.post('/welcome', serviceAuth, async (req, res) => {
  try {
    const { email, name, userId } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'email y name son requeridos',
        code: 'MISSING_FIELDS',
      });
    }

    const result = await emailService.sendWelcomeEmail({ email, name, id: userId });

    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Email de bienvenida enviado',
    });
  } catch (error) {
    logger.error('Welcome email error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'WELCOME_EMAIL_ERROR',
    });
  }
});

/**
 * Send order confirmation
 * POST /api/notifications/order-confirmation
 */
router.post('/order-confirmation', serviceAuth, async (req, res) => {
  try {
    const { orderId, customerEmail, customerName, items, total, shippingAddress } = req.body;

    if (!orderId || !customerEmail || !items) {
      return res.status(400).json({
        success: false,
        error: 'orderId, customerEmail e items son requeridos',
        code: 'MISSING_FIELDS',
      });
    }

    const order = {
      id: orderId,
      customerEmail,
      customerName: customerName || 'Cliente',
      items,
      total: total || items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      shippingAddress: shippingAddress || 'Por confirmar',
    };

    const result = await emailService.sendOrderConfirmation(order);

    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Confirmación de pedido enviada',
    });
  } catch (error) {
    logger.error('Order confirmation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'ORDER_CONFIRMATION_ERROR',
    });
  }
});

/**
 * Send password reset email
 * POST /api/notifications/password-reset
 */
router.post('/password-reset', serviceAuth, async (req, res) => {
  try {
    const { email, name, resetToken } = req.body;

    if (!email || !resetToken) {
      return res.status(400).json({
        success: false,
        error: 'email y resetToken son requeridos',
        code: 'MISSING_FIELDS',
      });
    }

    const result = await emailService.sendPasswordReset(
      { email, name: name || 'Usuario' },
      resetToken
    );

    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Email de restablecimiento enviado',
    });
  } catch (error) {
    logger.error('Password reset email error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'PASSWORD_RESET_ERROR',
    });
  }
});

/**
 * Send shipping update
 * POST /api/notifications/shipping-update
 */
router.post('/shipping-update', serviceAuth, async (req, res) => {
  try {
    const { orderId, customerEmail, customerName, status, trackingNumber } = req.body;

    if (!orderId || !customerEmail || !status) {
      return res.status(400).json({
        success: false,
        error: 'orderId, customerEmail y status son requeridos',
        code: 'MISSING_FIELDS',
      });
    }

    const validStatuses = ['preparing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status debe ser uno de: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS',
      });
    }

    const order = {
      id: orderId,
      customerEmail,
      customerName: customerName || 'Cliente',
      trackingNumber,
    };

    const result = await emailService.sendShippingUpdate(order, status);

    res.json({
      success: true,
      messageId: result.messageId,
      message: `Actualización de envío (${status}) enviada`,
    });
  } catch (error) {
    logger.error('Shipping update error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'SHIPPING_UPDATE_ERROR',
    });
  }
});

/**
 * Send contact response
 * POST /api/notifications/contact-response
 */
router.post('/contact-response', serviceAuth, async (req, res) => {
  try {
    const { email, name, originalMessage, responseMessage } = req.body;

    if (!email || !responseMessage) {
      return res.status(400).json({
        success: false,
        error: 'email y responseMessage son requeridos',
        code: 'MISSING_FIELDS',
      });
    }

    const result = await emailService.sendContactResponse(
      { email, name: name || 'Cliente', originalMessage: originalMessage || '' },
      responseMessage
    );

    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Respuesta de contacto enviada',
    });
  } catch (error) {
    logger.error('Contact response error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'CONTACT_RESPONSE_ERROR',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION HISTORY (In-memory for demo, use DB in production)
// ═══════════════════════════════════════════════════════════════

const notificationHistory = [];

/**
 * Get notification history
 * GET /api/notifications/history
 */
router.get('/history', (req, res) => {
  const { limit = 50, type, status } = req.query;

  let filtered = [...notificationHistory];

  if (type) {
    filtered = filtered.filter((n) => n.type === type);
  }

  if (status) {
    filtered = filtered.filter((n) => n.status === status);
  }

  const result = filtered.slice(-parseInt(limit));

  res.json({
    success: true,
    total: filtered.length,
    notifications: result,
  });
});

/**
 * Get notification by ID
 * GET /api/notifications/:id
 */
router.get('/:id', (req, res) => {
  const notification = notificationHistory.find((n) => n.id === req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notificación no encontrada',
      code: 'NOT_FOUND',
    });
  }

  res.json({
    success: true,
    notification,
  });
});

// Middleware to log notifications
const logNotification = (type, data, status) => {
  const notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    status,
    createdAt: new Date().toISOString(),
  };
  notificationHistory.push(notification);

  // Keep only last 1000 notifications
  if (notificationHistory.length > 1000) {
    notificationHistory.shift();
  }

  return notification;
};

module.exports = router;
module.exports.logNotification = logNotification;
