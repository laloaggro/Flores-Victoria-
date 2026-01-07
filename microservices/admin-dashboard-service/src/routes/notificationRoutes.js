/**
 * Admin Dashboard - Push Notification Routes
 * Proxy para enviar notificaciones push a través del notification-service
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { logger } = require('@flores-victoria/shared/utils/logger');

// URL del notification service
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3008';

/**
 * @route   POST /api/admin/notifications/push/send
 * @desc    Enviar notificación push a un usuario específico
 * @access  Private (requiere auth)
 */
router.post('/push/send', async (req, res) => {
  try {
    const { userId, templateKey, data } = req.body;

    if (!userId || !templateKey) {
      return res.status(400).json({
        success: false,
        message: 'userId y templateKey son requeridos'
      });
    }

    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/push/send`,
      { userId, templateKey, data },
      { timeout: 5000 }
    );

    res.json({
      success: true,
      message: 'Notificación enviada',
      data: response.data
    });

  } catch (error) {
    logger.error('Error sending push notification:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/notifications/push/broadcast
 * @desc    Enviar notificación push a todos los usuarios (o filtrados)
 * @access  Private (requiere auth admin)
 */
router.post('/push/broadcast', async (req, res) => {
  try {
    const { templateKey, data, filters } = req.body;

    if (!templateKey) {
      return res.status(400).json({
        success: false,
        message: 'templateKey es requerido'
      });
    }

    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/push/broadcast`,
      { templateKey, data, filters },
      { timeout: 10000 }
    );

    logger.info('Broadcast notification sent', { templateKey, filters });

    res.json({
      success: true,
      message: 'Notificación broadcast enviada',
      data: response.data
    });

  } catch (error) {
    logger.error('Error broadcasting notification:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al enviar broadcast',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/notifications/push/custom
 * @desc    Enviar notificación personalizada
 * @access  Private (requiere auth admin)
 */
router.post('/push/custom', async (req, res) => {
  try {
    const { userId, title, body, icon, url, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'userId, title y body son requeridos'
      });
    }

    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/push/custom`,
      { userId, title, body, icon, url, data },
      { timeout: 5000 }
    );

    res.json({
      success: true,
      message: 'Notificación personalizada enviada',
      data: response.data
    });

  } catch (error) {
    logger.error('Error sending custom notification:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación personalizada',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/notifications/templates
 * @desc    Obtener plantillas de notificación disponibles
 * @access  Private
 */
router.get('/templates', async (req, res) => {
  try {
    const response = await axios.get(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/push/templates`,
      { timeout: 5000 }
    );

    res.json({
      success: true,
      data: response.data?.data || response.data
    });

  } catch (error) {
    // Fallback: devolver plantillas predefinidas
    const defaultTemplates = {
      order_created: {
        key: 'order_created',
        name: 'Pedido Creado',
        description: 'Notificación cuando se crea un nuevo pedido'
      },
      order_shipped: {
        key: 'order_shipped',
        name: 'Pedido Enviado',
        description: 'Notificación cuando el pedido está en camino'
      },
      order_delivered: {
        key: 'order_delivered',
        name: 'Pedido Entregado',
        description: 'Notificación cuando el pedido fue entregado'
      },
      promotion_new: {
        key: 'promotion_new',
        name: 'Nueva Promoción',
        description: 'Anuncio de nueva promoción'
      },
      flash_sale: {
        key: 'flash_sale',
        name: 'Venta Flash',
        description: 'Alerta de venta rápida'
      },
      cart_abandoned: {
        key: 'cart_abandoned',
        name: 'Carrito Abandonado',
        description: 'Recordatorio de carrito pendiente'
      },
      subscription_reminder: {
        key: 'subscription_reminder',
        name: 'Recordatorio Suscripción',
        description: 'Próxima entrega de suscripción'
      }
    };

    res.json({
      success: true,
      data: defaultTemplates,
      fallback: true
    });
  }
});

/**
 * @route   GET /api/admin/notifications/stats
 * @desc    Obtener estadísticas de notificaciones
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    const response = await axios.get(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/stats`,
      { timeout: 5000 }
    );

    res.json({
      success: true,
      data: response.data?.data || response.data
    });

  } catch (error) {
    // Fallback stats
    res.json({
      success: true,
      data: {
        sent: 0,
        failed: 0,
        pending: 0,
        byType: {},
        lastUpdated: new Date().toISOString()
      },
      fallback: true
    });
  }
});

/**
 * @route   POST /api/admin/notifications/test
 * @desc    Enviar notificación de prueba al admin actual
 * @access  Private
 */
router.post('/test', async (req, res) => {
  try {
    const userId = req.user?.id || 'admin';
    
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/push/custom`,
      {
        userId,
        title: '🔔 Notificación de Prueba',
        body: 'Esta es una notificación de prueba del Admin Dashboard',
        icon: '/icons/test.png',
        data: { type: 'test', timestamp: new Date().toISOString() }
      },
      { timeout: 5000 }
    );

    res.json({
      success: true,
      message: 'Notificación de prueba enviada',
      data: response.data
    });

  } catch (error) {
    logger.warn('Test notification failed (notification service might be unavailable)');
    res.json({
      success: true,
      message: 'Notificación de prueba enviada (simulación)',
      simulated: true
    });
  }
});

module.exports = router;
