/**
 * @fileoverview Request Queue con Dead Letter Queue (DLQ)
 * @description Sistema de cola con manejo de fallos persistentes
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms inicial
  retryBackoff: 2, // multiplicador exponencial
  maxRetryDelay: 30000, // máximo delay entre reintentos
  processingTimeout: 60000, // timeout de procesamiento
  batchSize: 10, // items a procesar por lote
  dlqPrefix: 'dlq:',
  queuePrefix: 'queue:',
};

/**
 * Estados de los items en la cola
 */
const ItemStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DEAD: 'dead', // movido a DLQ
};

/**
 * Clase principal de Request Queue
 */
class RequestQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.name = options.name || 'default';
    this.store = options.store || new MemoryStore();
    this.processors = new Map();
    this.isProcessing = false;
    this.stats = {
      processed: 0,
      failed: 0,
      deadLettered: 0,
      retried: 0,
    };
  }

  /**
   * Añade un item a la cola
   * @param {string} type - Tipo de operación
   * @param {Object} data - Datos del item
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<string>} ID del item
   */
  async enqueue(type, data, options = {}) {
    const item = {
      id: crypto.randomUUID(),
      type,
      data,
      status: ItemStatus.PENDING,
      retries: 0,
      maxRetries: options.maxRetries ?? this.config.maxRetries,
      priority: options.priority ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledFor: options.delay ? new Date(Date.now() + options.delay).toISOString() : null,
      metadata: options.metadata || {},
    };

    const key = `${this.config.queuePrefix}${this.name}:${item.id}`;
    await this.store.set(key, item);
    await this.store.addToList(`${this.config.queuePrefix}${this.name}:pending`, item.id);

    this.emit('enqueued', item);

    // Iniciar procesamiento si no está activo
    if (!this.isProcessing) {
      this._startProcessing();
    }

    return item.id;
  }

  /**
   * Registra un procesador para un tipo de operación
   * @param {string} type - Tipo de operación
   * @param {Function} handler - Función procesadora
   */
  registerProcessor(type, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    this.processors.set(type, handler);
    console.info(`[Queue] Registered processor for type: ${type}`);
  }

  /**
   * Inicia el procesamiento de la cola
   * @private
   */
  async _startProcessing() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    console.info(`[Queue] Started processing queue: ${this.name}`);

    while (this.isProcessing) {
      try {
        const items = await this._fetchPendingItems();

        if (items.length === 0) {
          // Esperar antes de volver a verificar
          await this._sleep(1000);
          continue;
        }

        // Procesar items en paralelo (limitado por batchSize)
        await Promise.allSettled(items.map((item) => this._processItem(item)));
      } catch (error) {
        console.error(`[Queue] Processing error:`, error);
        await this._sleep(5000);
      }
    }
  }

  /**
   * Detiene el procesamiento
   */
  stop() {
    this.isProcessing = false;
    console.info(`[Queue] Stopped processing queue: ${this.name}`);
  }

  /**
   * Obtiene items pendientes
   * @private
   * @returns {Promise<Array>}
   */
  async _fetchPendingItems() {
    const pendingIds = await this.store.getList(`${this.config.queuePrefix}${this.name}:pending`, 0, this.config.batchSize - 1);

    const items = [];
    for (const id of pendingIds) {
      const item = await this.store.get(`${this.config.queuePrefix}${this.name}:${id}`);
      if (item && item.status === ItemStatus.PENDING) {
        // Verificar si está programado para después
        if (item.scheduledFor && new Date(item.scheduledFor) > new Date()) {
          continue;
        }
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Procesa un item individual
   * @private
   * @param {Object} item - Item a procesar
   */
  async _processItem(item) {
    const processor = this.processors.get(item.type);

    if (!processor) {
      console.warn(`[Queue] No processor for type: ${item.type}`);
      return;
    }

    // Marcar como procesando
    item.status = ItemStatus.PROCESSING;
    item.updatedAt = new Date().toISOString();
    item.processingStartedAt = new Date().toISOString();
    await this._updateItem(item);

    try {
      // Ejecutar con timeout
      const result = await this._withTimeout(processor(item.data, item.metadata), this.config.processingTimeout);

      // Éxito
      item.status = ItemStatus.COMPLETED;
      item.result = result;
      item.completedAt = new Date().toISOString();
      await this._updateItem(item);
      await this._removeFromPending(item.id);

      this.stats.processed++;
      this.emit('completed', item);
    } catch (error) {
      await this._handleFailure(item, error);
    }
  }

  /**
   * Maneja el fallo de un item
   * @private
   * @param {Object} item - Item que falló
   * @param {Error} error - Error ocurrido
   */
  async _handleFailure(item, error) {
    item.retries++;
    item.lastError = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
    item.errors = item.errors || [];
    item.errors.push(item.lastError);

    if (item.retries >= item.maxRetries) {
      // Mover a Dead Letter Queue
      await this._moveToDLQ(item);
    } else {
      // Programar reintento con backoff exponencial
      const delay = Math.min(
        this.config.retryDelay * Math.pow(this.config.retryBackoff, item.retries - 1),
        this.config.maxRetryDelay
      );

      item.status = ItemStatus.PENDING;
      item.scheduledFor = new Date(Date.now() + delay).toISOString();
      item.updatedAt = new Date().toISOString();
      await this._updateItem(item);

      this.stats.retried++;
      this.emit('retry', item, delay);
      console.warn(`[Queue] Item ${item.id} scheduled for retry in ${delay}ms (attempt ${item.retries}/${item.maxRetries})`);
    }
  }

  /**
   * Mueve un item a la Dead Letter Queue
   * @private
   * @param {Object} item - Item a mover
   */
  async _moveToDLQ(item) {
    item.status = ItemStatus.DEAD;
    item.deadLetteredAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    // Guardar en DLQ
    const dlqKey = `${this.config.dlqPrefix}${this.name}:${item.id}`;
    await this.store.set(dlqKey, item);
    await this.store.addToList(`${this.config.dlqPrefix}${this.name}:items`, item.id);

    // Remover de cola principal
    await this._removeFromPending(item.id);
    await this.store.delete(`${this.config.queuePrefix}${this.name}:${item.id}`);

    this.stats.failed++;
    this.stats.deadLettered++;
    this.emit('deadLettered', item);
    console.error(`[Queue] Item ${item.id} moved to DLQ after ${item.retries} retries`);
  }

  /**
   * Actualiza un item en el store
   * @private
   */
  async _updateItem(item) {
    const key = `${this.config.queuePrefix}${this.name}:${item.id}`;
    await this.store.set(key, item);
  }

  /**
   * Remueve un item de la lista de pendientes
   * @private
   */
  async _removeFromPending(itemId) {
    await this.store.removeFromList(`${this.config.queuePrefix}${this.name}:pending`, itemId);
  }

  /**
   * Ejecuta con timeout
   * @private
   */
  _withTimeout(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Processing timeout')), timeout)),
    ]);
  }

  /**
   * Sleep helper
   * @private
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obtiene estadísticas
   * @returns {Object}
   */
  getStats() {
    return { ...this.stats, queueName: this.name };
  }
}

/**
 * Dead Letter Queue Manager
 */
class DeadLetterQueue {
  constructor(store, options = {}) {
    this.store = store;
    this.prefix = options.dlqPrefix || DEFAULT_CONFIG.dlqPrefix;
  }

  /**
   * Lista items en DLQ
   * @param {string} queueName - Nombre de la cola
   * @param {number} limit - Límite de items
   * @returns {Promise<Array>}
   */
  async list(queueName, limit = 100) {
    const ids = await this.store.getList(`${this.prefix}${queueName}:items`, 0, limit - 1);
    const items = [];

    for (const id of ids) {
      const item = await this.store.get(`${this.prefix}${queueName}:${id}`);
      if (item) items.push(item);
    }

    return items;
  }

  /**
   * Obtiene un item específico
   * @param {string} queueName - Nombre de la cola
   * @param {string} itemId - ID del item
   * @returns {Promise<Object|null>}
   */
  async get(queueName, itemId) {
    return this.store.get(`${this.prefix}${queueName}:${itemId}`);
  }

  /**
   * Reintenta un item de DLQ
   * @param {string} queueName - Nombre de la cola
   * @param {string} itemId - ID del item
   * @param {RequestQueue} queue - Cola destino
   * @returns {Promise<string>} Nuevo ID
   */
  async retry(queueName, itemId, queue) {
    const item = await this.get(queueName, itemId);
    if (!item) throw new Error(`Item ${itemId} not found in DLQ`);

    // Re-encolar con nueva oportunidad
    const newId = await queue.enqueue(item.type, item.data, {
      maxRetries: item.maxRetries,
      metadata: {
        ...item.metadata,
        retriedFromDLQ: true,
        originalId: itemId,
        originalErrors: item.errors,
      },
    });

    // Eliminar de DLQ
    await this.delete(queueName, itemId);

    console.info(`[DLQ] Item ${itemId} retried as ${newId}`);
    return newId;
  }

  /**
   * Elimina un item de DLQ
   * @param {string} queueName - Nombre de la cola
   * @param {string} itemId - ID del item
   */
  async delete(queueName, itemId) {
    await this.store.delete(`${this.prefix}${queueName}:${itemId}`);
    await this.store.removeFromList(`${this.prefix}${queueName}:items`, itemId);
  }

  /**
   * Purga toda la DLQ
   * @param {string} queueName - Nombre de la cola
   */
  async purge(queueName) {
    const ids = await this.store.getList(`${this.prefix}${queueName}:items`, 0, -1);
    for (const id of ids) {
      await this.delete(queueName, id);
    }
    console.info(`[DLQ] Purged ${ids.length} items from ${queueName}`);
  }

  /**
   * Cuenta items en DLQ
   * @param {string} queueName - Nombre de la cola
   * @returns {Promise<number>}
   */
  async count(queueName) {
    return this.store.listLength(`${this.prefix}${queueName}:items`);
  }
}

/**
 * Memory Store (para desarrollo/testing)
 */
class MemoryStore {
  constructor() {
    this.data = new Map();
    this.lists = new Map();
  }

  async set(key, value) {
    this.data.set(key, JSON.stringify(value));
  }

  async get(key) {
    const value = this.data.get(key);
    return value ? JSON.parse(value) : null;
  }

  async delete(key) {
    this.data.delete(key);
  }

  async addToList(key, value) {
    if (!this.lists.has(key)) this.lists.set(key, []);
    this.lists.get(key).push(value);
  }

  async removeFromList(key, value) {
    const list = this.lists.get(key) || [];
    const index = list.indexOf(value);
    if (index > -1) list.splice(index, 1);
  }

  async getList(key, start, end) {
    const list = this.lists.get(key) || [];
    return list.slice(start, end === -1 ? undefined : end + 1);
  }

  async listLength(key) {
    return (this.lists.get(key) || []).length;
  }
}

/**
 * Redis Store adapter
 * @param {Object} redisClient - Cliente Redis
 */
const createRedisStore = (redisClient) => ({
  async set(key, value) {
    await redisClient.set(key, JSON.stringify(value));
  },

  async get(key) {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  },

  async delete(key) {
    await redisClient.del(key);
  },

  async addToList(key, value) {
    await redisClient.rPush(key, value);
  },

  async removeFromList(key, value) {
    await redisClient.lRem(key, 1, value);
  },

  async getList(key, start, end) {
    return redisClient.lRange(key, start, end);
  },

  async listLength(key) {
    return redisClient.lLen(key);
  },
});

module.exports = {
  RequestQueue,
  DeadLetterQueue,
  MemoryStore,
  createRedisStore,
  ItemStatus,
  DEFAULT_CONFIG,
};
