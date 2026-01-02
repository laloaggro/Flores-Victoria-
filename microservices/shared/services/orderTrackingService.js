/**
 * @fileoverview Sistema de Seguimiento de Pedidos - Flores Victoria
 * Tracking con timeline detallado y notificaciones
 * 
 * @version 1.0.0
 */

const { v4: uuidv4 } = require('uuid');
const { AuditService } = require('@flores-victoria/shared/services/auditService');

// ═══════════════════════════════════════════════════════════════
// ESTADOS Y EVENTOS DEL PEDIDO
// ═══════════════════════════════════════════════════════════════

/**
 * Estados posibles de un pedido
 */
const ORDER_STATUSES = {
  PENDING: 'pending',           // Pendiente de pago
  PAID: 'paid',                 // Pagado, esperando confirmación
  CONFIRMED: 'confirmed',       // Confirmado por la tienda
  PREPARING: 'preparing',       // En preparación
  READY: 'ready',               // Listo para despacho
  ASSIGNED: 'assigned',         // Asignado a repartidor
  PICKED_UP: 'picked_up',       // Recogido por repartidor
  IN_TRANSIT: 'in_transit',     // En camino
  NEARBY: 'nearby',             // Cerca del destino
  DELIVERED: 'delivered',       // Entregado
  CANCELLED: 'cancelled',       // Cancelado
  REFUNDED: 'refunded',         // Reembolsado
};

/**
 * Eventos del timeline del pedido
 */
const TRACKING_EVENTS = {
  ORDER_CREATED: 'order_created',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  ORDER_CONFIRMED: 'order_confirmed',
  PREPARATION_STARTED: 'preparation_started',
  PREPARATION_COMPLETED: 'preparation_completed',
  PHOTOS_ADDED: 'photos_added',
  QUALITY_CHECK_PASSED: 'quality_check_passed',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_PICKED_UP: 'driver_picked_up',
  IN_TRANSIT: 'in_transit',
  NEAR_DESTINATION: 'near_destination',
  DELIVERY_ATTEMPTED: 'delivery_attempted',
  DELIVERED: 'delivered',
  DELIVERY_PHOTO_ADDED: 'delivery_photo_added',
  RECIPIENT_SIGNED: 'recipient_signed',
  ORDER_CANCELLED: 'order_cancelled',
  REFUND_INITIATED: 'refund_initiated',
  REFUND_COMPLETED: 'refund_completed',
  NOTE_ADDED: 'note_added',
  ETA_UPDATED: 'eta_updated',
  CUSTOMER_NOTIFIED: 'customer_notified',
};

/**
 * Iconos y colores para cada evento (para UI)
 */
const EVENT_UI_CONFIG = {
  [TRACKING_EVENTS.ORDER_CREATED]: { icon: '🛒', color: '#6366F1' },
  [TRACKING_EVENTS.PAYMENT_RECEIVED]: { icon: '💳', color: '#10B981' },
  [TRACKING_EVENTS.PAYMENT_FAILED]: { icon: '❌', color: '#EF4444' },
  [TRACKING_EVENTS.ORDER_CONFIRMED]: { icon: '✅', color: '#10B981' },
  [TRACKING_EVENTS.PREPARATION_STARTED]: { icon: '🌸', color: '#F59E0B' },
  [TRACKING_EVENTS.PREPARATION_COMPLETED]: { icon: '💐', color: '#10B981' },
  [TRACKING_EVENTS.PHOTOS_ADDED]: { icon: '📷', color: '#8B5CF6' },
  [TRACKING_EVENTS.QUALITY_CHECK_PASSED]: { icon: '✨', color: '#10B981' },
  [TRACKING_EVENTS.DRIVER_ASSIGNED]: { icon: '🚗', color: '#3B82F6' },
  [TRACKING_EVENTS.DRIVER_PICKED_UP]: { icon: '📦', color: '#3B82F6' },
  [TRACKING_EVENTS.IN_TRANSIT]: { icon: '🚚', color: '#3B82F6' },
  [TRACKING_EVENTS.NEAR_DESTINATION]: { icon: '📍', color: '#F59E0B' },
  [TRACKING_EVENTS.DELIVERY_ATTEMPTED]: { icon: '🚪', color: '#F59E0B' },
  [TRACKING_EVENTS.DELIVERED]: { icon: '🎉', color: '#10B981' },
  [TRACKING_EVENTS.DELIVERY_PHOTO_ADDED]: { icon: '📸', color: '#8B5CF6' },
  [TRACKING_EVENTS.RECIPIENT_SIGNED]: { icon: '✍️', color: '#10B981' },
  [TRACKING_EVENTS.ORDER_CANCELLED]: { icon: '🚫', color: '#EF4444' },
  [TRACKING_EVENTS.REFUND_INITIATED]: { icon: '💰', color: '#F59E0B' },
  [TRACKING_EVENTS.REFUND_COMPLETED]: { icon: '💸', color: '#10B981' },
  [TRACKING_EVENTS.NOTE_ADDED]: { icon: '📝', color: '#6B7280' },
  [TRACKING_EVENTS.ETA_UPDATED]: { icon: '🕐', color: '#3B82F6' },
  [TRACKING_EVENTS.CUSTOMER_NOTIFIED]: { icon: '📱', color: '#8B5CF6' },
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE TRACKING
// ═══════════════════════════════════════════════════════════════

/**
 * Servicio de seguimiento de pedidos
 */
class OrderTrackingService {
  constructor(options = {}) {
    this.db = options.db;
    this.cache = options.cache;
    this.notificationService = options.notificationService;
    this.auditService = new AuditService(options);
    this.cacheTTL = options.cacheTTL || 60; // 1 minuto de caché
  }

  // ───────────────────────────────────────────────────────────
  // MÉTODOS DE TRACKING
  // ───────────────────────────────────────────────────────────

  /**
   * Obtiene el tracking completo de un pedido
   * @param {string} orderId - ID del pedido
   * @returns {Object} Información de tracking
   */
  async getOrderTracking(orderId) {
    // Intentar obtener de caché
    const cacheKey = `tracking:${orderId}`;
    if (this.cache) {
      try {
        const cached = await this.cache.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        console.warn('[Tracking] Cache error:', error.message);
      }
    }

    // Obtener de DB
    const order = await this._getOrderWithTracking(orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    const tracking = {
      orderId: order.id,
      orderNumber: order.order_number,
      status: order.status,
      statusDisplay: this._getStatusDisplay(order.status),
      createdAt: order.created_at,
      estimatedDelivery: order.estimated_delivery,
      actualDelivery: order.delivered_at,
      
      // Información de entrega
      delivery: {
        address: order.delivery_address,
        commune: order.delivery_commune,
        zone: order.delivery_zone,
        instructions: order.delivery_instructions,
        recipient: order.recipient_name,
        recipientPhone: this._maskPhone(order.recipient_phone),
      },
      
      // Repartidor (si aplica)
      driver: order.driver_id ? {
        name: order.driver_name,
        phone: this._maskPhone(order.driver_phone),
        photo: order.driver_photo,
        vehicleType: order.driver_vehicle,
        licensePlate: order.driver_plate,
        rating: order.driver_rating,
      } : null,
      
      // Timeline de eventos
      timeline: await this._getTimeline(orderId),
      
      // Progreso visual
      progress: this._calculateProgress(order.status),
      
      // URLs útiles
      urls: {
        publicTracking: `/tracking/${order.tracking_code}`,
        review: order.status === ORDER_STATUSES.DELIVERED 
          ? `/review/${orderId}` 
          : null,
      },
      
      // Información de control de calidad
      qualityPhotos: order.quality_photos || [],
      deliveryPhoto: order.delivery_photo,
    };

    // Guardar en caché
    if (this.cache) {
      try {
        await this.cache.setex(cacheKey, this.cacheTTL, JSON.stringify(tracking));
      } catch (error) {
        console.warn('[Tracking] Cache set error:', error.message);
      }
    }

    return tracking;
  }

  /**
   * Obtiene tracking público por código de tracking
   * @param {string} trackingCode - Código público de tracking
   * @returns {Object} Información de tracking (sin datos sensibles)
   */
  async getPublicTracking(trackingCode) {
    const result = await this.db.query(
      'SELECT id FROM orders WHERE tracking_code = $1',
      [trackingCode]
    );

    if (result.rows.length === 0) {
      throw new Error('Código de tracking no válido');
    }

    const tracking = await this.getOrderTracking(result.rows[0].id);
    
    // Remover información sensible
    return {
      orderNumber: tracking.orderNumber,
      status: tracking.status,
      statusDisplay: tracking.statusDisplay,
      estimatedDelivery: tracking.estimatedDelivery,
      progress: tracking.progress,
      timeline: tracking.timeline.map(event => ({
        event: event.event,
        title: event.title,
        timestamp: event.timestamp,
        icon: event.icon,
        color: event.color,
      })),
      driver: tracking.driver ? {
        name: tracking.driver.name,
        photo: tracking.driver.photo,
        vehicleType: tracking.driver.vehicleType,
      } : null,
    };
  }

  /**
   * Agrega un evento al timeline del pedido
   * @param {string} orderId - ID del pedido
   * @param {string} event - Tipo de evento
   * @param {Object} data - Datos adicionales del evento
   * @param {string} actorId - ID del actor que genera el evento
   */
  async addTrackingEvent(orderId, event, data = {}, actorId = null) {
    const eventId = uuidv4();
    const eventConfig = EVENT_UI_CONFIG[event] || { icon: '📌', color: '#6B7280' };

    await this.db.query(`
      INSERT INTO order_tracking_events (
        id, order_id, event, title, description, icon, color,
        data, actor_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [
      eventId,
      orderId,
      event,
      data.title || this._getEventTitle(event),
      data.description || null,
      eventConfig.icon,
      eventConfig.color,
      JSON.stringify(data),
      actorId,
    ]);

    // Invalidar caché
    if (this.cache) {
      await this.cache.del(`tracking:${orderId}`);
    }

    // Auditoría
    await this.auditService.log({
      action: 'TRACKING_EVENT_ADDED',
      resourceType: 'order',
      resourceId: orderId,
      actorId,
      details: { event, data },
    });

    // Notificar al cliente si es un evento importante
    if (this._shouldNotifyCustomer(event)) {
      await this._notifyCustomer(orderId, event, data);
    }

    return eventId;
  }

  /**
   * Actualiza el estado del pedido y agrega evento al timeline
   * @param {string} orderId - ID del pedido
   * @param {string} newStatus - Nuevo estado
   * @param {Object} data - Datos adicionales
   * @param {string} actorId - ID del actor
   */
  async updateStatus(orderId, newStatus, data = {}, actorId = null) {
    const order = await this._getOrder(orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    const oldStatus = order.status;
    
    // Validar transición de estado
    if (!this._isValidTransition(oldStatus, newStatus)) {
      throw new Error(`Transición de estado no válida: ${oldStatus} -> ${newStatus}`);
    }

    // Actualizar estado en DB
    const updateFields = ['status = $2', 'updated_at = NOW()'];
    const params = [orderId, newStatus];
    let paramCount = 2;

    if (newStatus === ORDER_STATUSES.DELIVERED) {
      paramCount++;
      updateFields.push(`delivered_at = $${paramCount}`);
      params.push(new Date());
    }

    if (data.estimatedDelivery) {
      paramCount++;
      updateFields.push(`estimated_delivery = $${paramCount}`);
      params.push(data.estimatedDelivery);
    }

    if (data.driverId) {
      paramCount++;
      updateFields.push(`driver_id = $${paramCount}`);
      params.push(data.driverId);
    }

    await this.db.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $1`,
      params
    );

    // Mapear estado a evento
    const eventMap = {
      [ORDER_STATUSES.PAID]: TRACKING_EVENTS.PAYMENT_RECEIVED,
      [ORDER_STATUSES.CONFIRMED]: TRACKING_EVENTS.ORDER_CONFIRMED,
      [ORDER_STATUSES.PREPARING]: TRACKING_EVENTS.PREPARATION_STARTED,
      [ORDER_STATUSES.READY]: TRACKING_EVENTS.PREPARATION_COMPLETED,
      [ORDER_STATUSES.ASSIGNED]: TRACKING_EVENTS.DRIVER_ASSIGNED,
      [ORDER_STATUSES.PICKED_UP]: TRACKING_EVENTS.DRIVER_PICKED_UP,
      [ORDER_STATUSES.IN_TRANSIT]: TRACKING_EVENTS.IN_TRANSIT,
      [ORDER_STATUSES.NEARBY]: TRACKING_EVENTS.NEAR_DESTINATION,
      [ORDER_STATUSES.DELIVERED]: TRACKING_EVENTS.DELIVERED,
      [ORDER_STATUSES.CANCELLED]: TRACKING_EVENTS.ORDER_CANCELLED,
      [ORDER_STATUSES.REFUNDED]: TRACKING_EVENTS.REFUND_COMPLETED,
    };

    const event = eventMap[newStatus];
    if (event) {
      await this.addTrackingEvent(orderId, event, data, actorId);
    }

    return { oldStatus, newStatus };
  }

  /**
   * Registra la asignación de un repartidor
   * @param {string} orderId - ID del pedido
   * @param {Object} driver - Información del repartidor
   * @param {string} actorId - ID del actor
   */
  async assignDriver(orderId, driver, actorId = null) {
    await this.updateStatus(orderId, ORDER_STATUSES.ASSIGNED, {
      driverId: driver.id,
      title: 'Repartidor asignado',
      description: `${driver.name} llevará tu pedido`,
    }, actorId);
  }

  /**
   * Registra que el repartidor recogió el pedido
   * @param {string} orderId - ID del pedido
   * @param {string} driverId - ID del repartidor
   * @param {Object} location - Ubicación actual
   */
  async markPickedUp(orderId, driverId, location = null) {
    await this.updateStatus(orderId, ORDER_STATUSES.PICKED_UP, {
      location,
      title: 'Pedido recogido',
      description: 'Tu arreglo está en camino',
    }, driverId);
  }

  /**
   * Actualiza la ubicación del repartidor
   * @param {string} orderId - ID del pedido
   * @param {Object} location - {lat, lng}
   * @param {string} driverId - ID del repartidor
   */
  async updateDriverLocation(orderId, location, driverId) {
    // Guardar ubicación en caché (se actualiza frecuentemente)
    if (this.cache) {
      await this.cache.setex(
        `driver_location:${orderId}`,
        300, // 5 minutos
        JSON.stringify({ ...location, updatedAt: new Date() })
      );
    }

    // Calcular si está cerca del destino
    const order = await this._getOrder(orderId);
    if (order && order.delivery_lat && order.delivery_lng) {
      const distance = this._calculateDistance(
        location.lat, location.lng,
        order.delivery_lat, order.delivery_lng
      );

      // Si está a menos de 500m, marcar como cerca
      if (distance < 500 && order.status === ORDER_STATUSES.IN_TRANSIT) {
        await this.updateStatus(orderId, ORDER_STATUSES.NEARBY, {
          distance,
          title: 'Casi llega',
          description: 'El repartidor está muy cerca',
        }, driverId);
      }
    }
  }

  /**
   * Registra la entrega del pedido
   * @param {string} orderId - ID del pedido
   * @param {Object} data - Datos de entrega
   * @param {string} driverId - ID del repartidor
   */
  async markDelivered(orderId, data = {}, driverId) {
    const deliveryData = {
      title: '¡Entregado!',
      description: data.recipientName 
        ? `Recibido por ${data.recipientName}`
        : 'Tu pedido ha sido entregado',
    };

    // Si hay foto de entrega
    if (data.photoUrl) {
      await this.db.query(
        'UPDATE orders SET delivery_photo = $2 WHERE id = $1',
        [orderId, data.photoUrl]
      );
      deliveryData.photoUrl = data.photoUrl;
    }

    // Si hay firma
    if (data.signature) {
      await this.db.query(
        'UPDATE orders SET delivery_signature = $2 WHERE id = $1',
        [orderId, data.signature]
      );
    }

    await this.updateStatus(orderId, ORDER_STATUSES.DELIVERED, deliveryData, driverId);
  }

  /**
   * Agrega foto de control de calidad
   * @param {string} orderId - ID del pedido
   * @param {string} photoUrl - URL de la foto
   * @param {string} actorId - ID del florista
   */
  async addQualityPhoto(orderId, photoUrl, actorId) {
    const result = await this.db.query(
      'SELECT quality_photos FROM orders WHERE id = $1',
      [orderId]
    );

    const currentPhotos = result.rows[0]?.quality_photos || [];
    currentPhotos.push({
      url: photoUrl,
      addedAt: new Date(),
      addedBy: actorId,
    });

    await this.db.query(
      'UPDATE orders SET quality_photos = $2 WHERE id = $1',
      [orderId, JSON.stringify(currentPhotos)]
    );

    await this.addTrackingEvent(orderId, TRACKING_EVENTS.PHOTOS_ADDED, {
      title: 'Fotos agregadas',
      description: 'Hemos fotografiado tu arreglo',
      photoUrl,
    }, actorId);
  }

  /**
   * Actualiza el tiempo estimado de entrega
   * @param {string} orderId - ID del pedido
   * @param {Date} newEta - Nueva hora estimada
   * @param {string} reason - Razón del cambio
   * @param {string} actorId - ID del actor
   */
  async updateETA(orderId, newEta, reason = '', actorId = null) {
    await this.db.query(
      'UPDATE orders SET estimated_delivery = $2 WHERE id = $1',
      [orderId, newEta]
    );

    await this.addTrackingEvent(orderId, TRACKING_EVENTS.ETA_UPDATED, {
      title: 'Hora de entrega actualizada',
      description: reason || `Nueva hora estimada: ${this._formatTime(newEta)}`,
      newEta,
    }, actorId);
  }

  // ───────────────────────────────────────────────────────────
  // MÉTODOS PRIVADOS
  // ───────────────────────────────────────────────────────────

  async _getOrder(orderId) {
    const result = await this.db.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );
    return result.rows[0];
  }

  async _getOrderWithTracking(orderId) {
    const result = await this.db.query(`
      SELECT 
        o.*,
        u.name as driver_name,
        u.phone as driver_phone,
        u.photo_url as driver_photo,
        u.vehicle_type as driver_vehicle,
        u.license_plate as driver_plate,
        u.rating as driver_rating
      FROM orders o
      LEFT JOIN users u ON o.driver_id = u.id
      WHERE o.id = $1
    `, [orderId]);
    return result.rows[0];
  }

  async _getTimeline(orderId) {
    const result = await this.db.query(`
      SELECT * FROM order_tracking_events
      WHERE order_id = $1
      ORDER BY created_at ASC
    `, [orderId]);

    return result.rows.map(row => ({
      id: row.id,
      event: row.event,
      title: row.title,
      description: row.description,
      icon: row.icon,
      color: row.color,
      timestamp: row.created_at,
      data: row.data,
    }));
  }

  _getStatusDisplay(status) {
    const displays = {
      [ORDER_STATUSES.PENDING]: 'Pendiente de pago',
      [ORDER_STATUSES.PAID]: 'Pago recibido',
      [ORDER_STATUSES.CONFIRMED]: 'Confirmado',
      [ORDER_STATUSES.PREPARING]: 'En preparación',
      [ORDER_STATUSES.READY]: 'Listo para despacho',
      [ORDER_STATUSES.ASSIGNED]: 'Repartidor asignado',
      [ORDER_STATUSES.PICKED_UP]: 'Recogido',
      [ORDER_STATUSES.IN_TRANSIT]: 'En camino',
      [ORDER_STATUSES.NEARBY]: 'Casi llega',
      [ORDER_STATUSES.DELIVERED]: 'Entregado',
      [ORDER_STATUSES.CANCELLED]: 'Cancelado',
      [ORDER_STATUSES.REFUNDED]: 'Reembolsado',
    };
    return displays[status] || status;
  }

  _getEventTitle(event) {
    const titles = {
      [TRACKING_EVENTS.ORDER_CREATED]: 'Pedido creado',
      [TRACKING_EVENTS.PAYMENT_RECEIVED]: 'Pago recibido',
      [TRACKING_EVENTS.PAYMENT_FAILED]: 'Pago fallido',
      [TRACKING_EVENTS.ORDER_CONFIRMED]: 'Pedido confirmado',
      [TRACKING_EVENTS.PREPARATION_STARTED]: 'Preparando tu arreglo',
      [TRACKING_EVENTS.PREPARATION_COMPLETED]: 'Arreglo listo',
      [TRACKING_EVENTS.PHOTOS_ADDED]: 'Fotos del arreglo',
      [TRACKING_EVENTS.QUALITY_CHECK_PASSED]: 'Control de calidad aprobado',
      [TRACKING_EVENTS.DRIVER_ASSIGNED]: 'Repartidor asignado',
      [TRACKING_EVENTS.DRIVER_PICKED_UP]: 'Pedido recogido',
      [TRACKING_EVENTS.IN_TRANSIT]: 'En camino',
      [TRACKING_EVENTS.NEAR_DESTINATION]: 'Casi llega',
      [TRACKING_EVENTS.DELIVERY_ATTEMPTED]: 'Intento de entrega',
      [TRACKING_EVENTS.DELIVERED]: '¡Entregado!',
      [TRACKING_EVENTS.DELIVERY_PHOTO_ADDED]: 'Foto de entrega',
      [TRACKING_EVENTS.RECIPIENT_SIGNED]: 'Firma recibida',
      [TRACKING_EVENTS.ORDER_CANCELLED]: 'Pedido cancelado',
      [TRACKING_EVENTS.REFUND_INITIATED]: 'Reembolso iniciado',
      [TRACKING_EVENTS.REFUND_COMPLETED]: 'Reembolso completado',
      [TRACKING_EVENTS.NOTE_ADDED]: 'Nota agregada',
      [TRACKING_EVENTS.ETA_UPDATED]: 'Hora actualizada',
      [TRACKING_EVENTS.CUSTOMER_NOTIFIED]: 'Cliente notificado',
    };
    return titles[event] || event;
  }

  _calculateProgress(status) {
    const progressMap = {
      [ORDER_STATUSES.PENDING]: 5,
      [ORDER_STATUSES.PAID]: 15,
      [ORDER_STATUSES.CONFIRMED]: 25,
      [ORDER_STATUSES.PREPARING]: 40,
      [ORDER_STATUSES.READY]: 55,
      [ORDER_STATUSES.ASSIGNED]: 65,
      [ORDER_STATUSES.PICKED_UP]: 75,
      [ORDER_STATUSES.IN_TRANSIT]: 85,
      [ORDER_STATUSES.NEARBY]: 95,
      [ORDER_STATUSES.DELIVERED]: 100,
      [ORDER_STATUSES.CANCELLED]: 0,
      [ORDER_STATUSES.REFUNDED]: 0,
    };
    return progressMap[status] || 0;
  }

  _isValidTransition(from, to) {
    const validTransitions = {
      [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.PAID, ORDER_STATUSES.CANCELLED],
      [ORDER_STATUSES.PAID]: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED, ORDER_STATUSES.REFUNDED],
      [ORDER_STATUSES.CONFIRMED]: [ORDER_STATUSES.PREPARING, ORDER_STATUSES.CANCELLED, ORDER_STATUSES.REFUNDED],
      [ORDER_STATUSES.PREPARING]: [ORDER_STATUSES.READY, ORDER_STATUSES.CANCELLED],
      [ORDER_STATUSES.READY]: [ORDER_STATUSES.ASSIGNED, ORDER_STATUSES.CANCELLED],
      [ORDER_STATUSES.ASSIGNED]: [ORDER_STATUSES.PICKED_UP, ORDER_STATUSES.READY],
      [ORDER_STATUSES.PICKED_UP]: [ORDER_STATUSES.IN_TRANSIT],
      [ORDER_STATUSES.IN_TRANSIT]: [ORDER_STATUSES.NEARBY, ORDER_STATUSES.DELIVERED],
      [ORDER_STATUSES.NEARBY]: [ORDER_STATUSES.DELIVERED],
      [ORDER_STATUSES.DELIVERED]: [ORDER_STATUSES.REFUNDED],
      [ORDER_STATUSES.CANCELLED]: [ORDER_STATUSES.REFUNDED],
      [ORDER_STATUSES.REFUNDED]: [],
    };
    return validTransitions[from]?.includes(to) || false;
  }

  _shouldNotifyCustomer(event) {
    const notifiableEvents = [
      TRACKING_EVENTS.ORDER_CONFIRMED,
      TRACKING_EVENTS.PREPARATION_STARTED,
      TRACKING_EVENTS.PHOTOS_ADDED,
      TRACKING_EVENTS.DRIVER_ASSIGNED,
      TRACKING_EVENTS.IN_TRANSIT,
      TRACKING_EVENTS.NEAR_DESTINATION,
      TRACKING_EVENTS.DELIVERED,
      TRACKING_EVENTS.ETA_UPDATED,
    ];
    return notifiableEvents.includes(event);
  }

  async _notifyCustomer(orderId, event, data) {
    if (!this.notificationService) return;

    const order = await this._getOrder(orderId);
    if (!order) return;

    try {
      await this.notificationService.sendOrderUpdate({
        orderId,
        userId: order.user_id,
        event,
        data,
      });
    } catch (error) {
      console.error('[Tracking] Error notifying customer:', error);
    }
  }

  _maskPhone(phone) {
    if (!phone) return null;
    // Mostrar solo últimos 4 dígitos: +56 9 **** 1234
    return phone.replace(/(\+\d{2}\s*\d)(\d{4})(\d{4})/, '$1 **** $3');
  }

  _formatTime(date) {
    return new Date(date).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  _calculateDistance(lat1, lon1, lat2, lon2) {
    // Fórmula de Haversine para calcular distancia en metros
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = this._toRad(lat2 - lat1);
    const dLon = this._toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  _toRad(deg) {
    return deg * (Math.PI / 180);
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  OrderTrackingService,
  ORDER_STATUSES,
  TRACKING_EVENTS,
  EVENT_UI_CONFIG,
};
