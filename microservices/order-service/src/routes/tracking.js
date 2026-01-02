/**
 * @fileoverview Rutas de Tracking de Pedidos - Flores Victoria
 * API para seguimiento en tiempo real de pedidos
 */

const express = require('express');
const router = express.Router();
const { OrderTrackingService, ORDER_STATUSES, TRACKING_EVENTS } = require('@flores-victoria/shared/services/orderTrackingService');

let trackingService = null;

/**
 * Inicializa el servicio de tracking
 * @param {Object} options - {db, cache, notificationService}
 */
function initializeTracking(options) {
  trackingService = new OrderTrackingService(options);
}

// Middleware de verificación
const requireTracking = (req, res, next) => {
  if (!trackingService) {
    return res.status(503).json({
      success: false,
      error: 'Servicio de tracking no inicializado',
    });
  }
  next();
};

// ═══════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /tracking/public/{trackingCode}:
 *   get:
 *     summary: Obtiene tracking público por código
 *     tags: [Tracking]
 *     parameters:
 *       - in: path
 *         name: trackingCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información de tracking
 */
router.get('/public/:trackingCode', requireTracking, async (req, res) => {
  try {
    const { trackingCode } = req.params;
    const tracking = await trackingService.getPublicTracking(trackingCode);
    
    res.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    console.error('[Tracking] Error getting public tracking:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// RUTAS AUTENTICADAS (CLIENTE)
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /tracking/orders/{orderId}:
 *   get:
 *     summary: Obtiene tracking completo de un pedido
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders/:orderId', requireTracking, async (req, res) => {
  try {
    const { orderId } = req.params;
    const tracking = await trackingService.getOrderTracking(orderId);
    
    res.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    console.error('[Tracking] Error getting order tracking:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// RUTAS DE ADMINISTRACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /tracking/orders/{orderId}/status:
 *   put:
 *     summary: Actualiza el estado de un pedido
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 */
router.put('/orders/:orderId/status', requireTracking, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, data } = req.body;
    const actorId = req.user?.id;

    if (!status || !Object.values(ORDER_STATUSES).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado no válido',
        validStatuses: Object.values(ORDER_STATUSES),
      });
    }

    const result = await trackingService.updateStatus(orderId, status, data, actorId);
    
    res.json({
      success: true,
      message: `Estado actualizado de ${result.oldStatus} a ${result.newStatus}`,
      data: result,
    });
  } catch (error) {
    console.error('[Tracking] Error updating status:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracking/orders/{orderId}/events:
 *   post:
 *     summary: Agrega un evento al timeline
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 */
router.post('/orders/:orderId/events', requireTracking, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { event, data } = req.body;
    const actorId = req.user?.id;

    if (!event || !Object.values(TRACKING_EVENTS).includes(event)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de evento no válido',
        validEvents: Object.values(TRACKING_EVENTS),
      });
    }

    const eventId = await trackingService.addTrackingEvent(orderId, event, data, actorId);
    
    res.status(201).json({
      success: true,
      message: 'Evento agregado al timeline',
      data: { eventId },
    });
  } catch (error) {
    console.error('[Tracking] Error adding event:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracking/orders/{orderId}/driver:
 *   put:
 *     summary: Asigna un repartidor al pedido
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 */
router.put('/orders/:orderId}/driver', requireTracking, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId, driverName, driverPhone } = req.body;
    const actorId = req.user?.id;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        error: 'ID de repartidor requerido',
      });
    }

    await trackingService.assignDriver(orderId, {
      id: driverId,
      name: driverName,
      phone: driverPhone,
    }, actorId);
    
    res.json({
      success: true,
      message: 'Repartidor asignado correctamente',
    });
  } catch (error) {
    console.error('[Tracking] Error assigning driver:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracking/orders/{orderId}/pickup:
 *   post:
 *     summary: Marca el pedido como recogido por el repartidor
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 */
router.post('/orders/:orderId/pickup', requireTracking, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { location } = req.body;
    const driverId = req.user?.id;

    await trackingService.markPickedUp(orderId, driverId, location);
    
    res.json({
      success: true,
      message: 'Pedido marcado como recogido',
    });
  } catch (error) {
    console.error('[Tracking] Error marking pickup:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracking/orders/{orderId}/location:
 *   put:
 *     summary: Actualiza la ubicación del repartidor
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 */
router.put('/orders/:orderId/location', requireTracking, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lat, lng } = req.body;
    const driverId = req.user?.id;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Coordenadas requeridas (lat, lng)',
      });
    }

    await trackingService.updateDriverLocation(orderId, { lat, lng }, driverId);
    
    res.json({
      success: true,
      message: 'Ubicación actualizada',
    });
  } catch (error) {
    console.error('[Tracking] Error updating location:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracking/orders/{orderId}/delivered:
 *   post:
 *     summary: Marca el pedido como entregado
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 */
router.post('/orders/:orderId/delivered', requireTracking, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { recipientName, photoUrl, signature, notes } = req.body;
    const driverId = req.user?.id;

    await trackingService.markDelivered(orderId, {
      recipientName,
      photoUrl,
      signature,
      notes,
    }, driverId);
    
    res.json({
      success: true,
      message: '¡Pedido entregado exitosamente!',
    });
  } catch (error) {
    console.error('[Tracking] Error marking delivered:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracking/orders/{orderId}/quality-photo:
 *   post:
 *     summary: Agrega foto de control de calidad
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 */
router.post('/orders/:orderId/quality-photo', requireTracking, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { photoUrl } = req.body;
    const actorId = req.user?.id;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL de foto requerida',
      });
    }

    await trackingService.addQualityPhoto(orderId, photoUrl, actorId);
    
    res.status(201).json({
      success: true,
      message: 'Foto de calidad agregada',
    });
  } catch (error) {
    console.error('[Tracking] Error adding quality photo:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracking/orders/{orderId}/eta:
 *   put:
 *     summary: Actualiza el tiempo estimado de entrega
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 */
router.put('/orders/:orderId/eta', requireTracking, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { eta, reason } = req.body;
    const actorId = req.user?.id;

    if (!eta) {
      return res.status(400).json({
        success: false,
        error: 'Nueva hora estimada (eta) requerida',
      });
    }

    await trackingService.updateETA(orderId, new Date(eta), reason, actorId);
    
    res.json({
      success: true,
      message: 'Hora de entrega actualizada',
    });
  } catch (error) {
    console.error('[Tracking] Error updating ETA:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// INFORMACIÓN DE REFERENCIA
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /tracking/statuses:
 *   get:
 *     summary: Lista de estados disponibles
 *     tags: [Tracking]
 */
router.get('/statuses', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(ORDER_STATUSES).map(([key, value]) => ({
      id: value,
      name: key,
    })),
  });
});

/**
 * @swagger
 * /tracking/events:
 *   get:
 *     summary: Lista de tipos de eventos disponibles
 *     tags: [Tracking]
 */
router.get('/events', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(TRACKING_EVENTS).map(([key, value]) => ({
      id: value,
      name: key,
    })),
  });
});

module.exports = router;
module.exports.initializeTracking = initializeTracking;
