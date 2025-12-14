/**
 * @fileoverview Event Bus - Sistema de eventos entre microservicios
 * @description Implementación ligera de pub/sub para comunicación asíncrona
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const { EventEmitter } = require('events');
const { EVENTS, SERVICES } = require('../constants');

/**
 * Event Bus para comunicación entre microservicios
 * Implementa patrón Observer/Pub-Sub
 */
class EventBus extends EventEmitter {
  constructor(options = {}) {
    super();
    this.serviceName = options.serviceName || process.env.SERVICE_NAME || 'unknown';
    this.maxListeners = options.maxListeners || 100;
    this.setMaxListeners(this.maxListeners);

    // Almacén de eventos pendientes (para retry)
    this.pendingEvents = new Map();
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;

    // Métricas
    this.metrics = {
      published: 0,
      delivered: 0,
      failed: 0,
      retried: 0,
    };

    // Event history (para debugging)
    this.historyEnabled = options.historyEnabled || process.env.NODE_ENV !== 'production';
    this.history = [];
    this.maxHistory = options.maxHistory || 100;
  }

  /**
   * Publica un evento
   * @param {string} eventName - Nombre del evento
   * @param {Object} payload - Datos del evento
   * @param {Object} options - Opciones adicionales
   * @returns {boolean} true si el evento fue emitido
   */
  publish(eventName, payload = {}, options = {}) {
    const event = {
      id: this.generateEventId(),
      name: eventName,
      payload,
      source: this.serviceName,
      timestamp: new Date().toISOString(),
      correlationId: options.correlationId || payload.correlationId,
    };

    // Guardar en historial
    this.addToHistory(event);

    // Emitir evento
    const hasListeners = this.emit(eventName, event);
    this.metrics.published++;

    if (hasListeners) {
      this.metrics.delivered++;
    }

    // Log en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[EventBus] Published: ${eventName}`, {
        source: this.serviceName,
        hasListeners,
      });
    }

    return hasListeners;
  }

  /**
   * Suscribe un handler a un evento
   * @param {string} eventName - Nombre del evento
   * @param {Function} handler - Función manejadora
   * @param {Object} options - Opciones (once, priority)
   * @returns {EventBus} this para chaining
   */
  subscribe(eventName, handler, options = {}) {
    const wrappedHandler = async (event) => {
      try {
        await handler(event.payload, event);
      } catch (error) {
        this.metrics.failed++;
        console.error(`[EventBus] Handler error for ${eventName}:`, error.message);

        // Retry logic
        if (options.retry !== false) {
          await this.retryHandler(eventName, handler, event, options);
        }
      }
    };

    if (options.once) {
      this.once(eventName, wrappedHandler);
    } else {
      this.on(eventName, wrappedHandler);
    }

    console.info(`[EventBus] Subscribed to: ${eventName} (service: ${this.serviceName})`);

    return this;
  }

  /**
   * Desuscribe de un evento
   * @param {string} eventName - Nombre del evento
   * @param {Function} handler - Handler a remover
   * @returns {EventBus} this
   */
  unsubscribe(eventName, handler) {
    this.off(eventName, handler);
    return this;
  }

  /**
   * Suscribe una sola vez
   * @param {string} eventName - Nombre del evento
   * @param {Function} handler - Handler
   * @returns {EventBus} this
   */
  subscribeOnce(eventName, handler) {
    return this.subscribe(eventName, handler, { once: true });
  }

  /**
   * Publica y espera respuesta (request-reply)
   * @param {string} eventName - Evento de request
   * @param {Object} payload - Datos
   * @param {number} timeout - Timeout en ms
   * @returns {Promise<*>} Respuesta
   */
  async request(eventName, payload = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const correlationId = this.generateEventId();
      const replyEvent = `${eventName}.reply.${correlationId}`;

      const timeoutId = setTimeout(() => {
        this.off(replyEvent, replyHandler);
        reject(new Error(`Request timeout for ${eventName}`));
      }, timeout);

      const replyHandler = (event) => {
        clearTimeout(timeoutId);
        resolve(event.payload);
      };

      this.once(replyEvent, replyHandler);
      this.publish(eventName, { ...payload, replyTo: replyEvent, correlationId });
    });
  }

  /**
   * Responde a un request
   * @param {Object} event - Evento original
   * @param {*} response - Respuesta
   */
  reply(event, response) {
    if (event.payload?.replyTo) {
      this.publish(event.payload.replyTo, response, {
        correlationId: event.correlationId,
      });
    }
  }

  /**
   * Retry de handler fallido
   * @private
   */
  async retryHandler(eventName, handler, event, options) {
    const maxRetries = options.retryAttempts || this.retryAttempts;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await this.delay(this.retryDelay * attempt);

      try {
        await handler(event.payload, event);
        this.metrics.retried++;
        console.info(`[EventBus] Retry successful for ${eventName} (attempt ${attempt})`);
        return;
      } catch {
        if (attempt === maxRetries) {
          console.error(`[EventBus] All retries failed for ${eventName}`);
          this.emit('error', { eventName, event, error: 'Max retries exceeded' });
        }
      }
    }
  }

  /**
   * Genera ID único para evento
   * @private
   */
  generateEventId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Añade evento al historial
   * @private
   */
  addToHistory(event) {
    if (!this.historyEnabled) return;

    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Delay helper
   * @private
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obtiene métricas del bus
   * @returns {Object} Métricas
   */
  getMetrics() {
    return {
      ...this.metrics,
      listenerCount: this.eventNames().reduce((acc, name) => acc + this.listenerCount(name), 0),
      eventTypes: this.eventNames().length,
    };
  }

  /**
   * Obtiene historial de eventos
   * @param {number} limit - Límite de eventos
   * @returns {Array} Eventos
   */
  getHistory(limit = 50) {
    return this.history.slice(-limit);
  }

  /**
   * Limpia el bus
   */
  clear() {
    this.removeAllListeners();
    this.history = [];
    this.pendingEvents.clear();
  }
}

// Singleton para uso global
let globalEventBus = null;

/**
 * Obtiene el Event Bus global
 * @param {Object} options - Opciones de configuración
 * @returns {EventBus}
 */
const getEventBus = (options = {}) => {
  if (!globalEventBus) {
    globalEventBus = new EventBus(options);
  }
  return globalEventBus;
};

/**
 * Event names predefinidos para el sistema
 */
const EventNames = {
  // User events
  USER_CREATED: EVENTS.USER_CREATED,
  USER_UPDATED: EVENTS.USER_UPDATED,
  USER_DELETED: EVENTS.USER_DELETED,
  USER_LOGIN: EVENTS.USER_LOGIN,
  USER_LOGOUT: EVENTS.USER_LOGOUT,

  // Order events
  ORDER_CREATED: EVENTS.ORDER_CREATED,
  ORDER_UPDATED: EVENTS.ORDER_UPDATED,
  ORDER_CANCELLED: EVENTS.ORDER_CANCELLED,
  ORDER_SHIPPED: EVENTS.ORDER_SHIPPED,
  ORDER_DELIVERED: EVENTS.ORDER_DELIVERED,
  PAYMENT_RECEIVED: EVENTS.PAYMENT_RECEIVED,
  PAYMENT_FAILED: EVENTS.PAYMENT_FAILED,

  // Product events
  PRODUCT_CREATED: EVENTS.PRODUCT_CREATED,
  PRODUCT_UPDATED: EVENTS.PRODUCT_UPDATED,
  PRODUCT_DELETED: EVENTS.PRODUCT_DELETED,
  STOCK_LOW: EVENTS.STOCK_LOW,
  STOCK_OUT: EVENTS.STOCK_OUT,

  // Cart events
  CART_UPDATED: EVENTS.CART_UPDATED,
  CART_CLEARED: EVENTS.CART_CLEARED,
  ITEM_ADDED_TO_CART: EVENTS.ITEM_ADDED_TO_CART,
  ITEM_REMOVED_FROM_CART: EVENTS.ITEM_REMOVED_FROM_CART,

  // Review events
  REVIEW_CREATED: EVENTS.REVIEW_CREATED,
  REVIEW_UPDATED: EVENTS.REVIEW_UPDATED,
  REVIEW_DELETED: EVENTS.REVIEW_DELETED,

  // Notification events
  NOTIFICATION_SENT: EVENTS.NOTIFICATION_SENT,
  EMAIL_SENT: EVENTS.EMAIL_SENT,

  // System events
  CACHE_INVALIDATED: EVENTS.CACHE_INVALIDATED,
};

module.exports = {
  EventBus,
  getEventBus,
  EventNames,
};
