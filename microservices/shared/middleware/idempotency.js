/**
 * @fileoverview Idempotency Middleware
 * @description Previene requests duplicados en operaciones críticas
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const crypto = require('crypto');

/**
 * Almacenamiento en memoria para idempotency keys (usar Redis en producción)
 */
const memoryStore = new Map();

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  headerName: 'Idempotency-Key',
  ttlMs: 24 * 60 * 60 * 1000, // 24 horas
  maxKeyLength: 256,
  methods: ['POST', 'PUT', 'PATCH'], // Métodos que requieren idempotencia
};

/**
 * Estado de una operación idempotente
 */
const IDEMPOTENCY_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

/**
 * Middleware de idempotencia
 * Previene la ejecución duplicada de operaciones con la misma key
 *
 * @param {Object} options - Opciones de configuración
 * @param {Object} [options.store] - Store para keys (debe tener get/set/del)
 * @param {number} [options.ttlMs] - TTL para keys
 * @param {string} [options.headerName] - Nombre del header
 * @param {Array} [options.methods] - Métodos HTTP que requieren idempotencia
 * @param {boolean} [options.required] - Si es requerido el header
 * @returns {Function} Express middleware
 */
const idempotencyMiddleware = (options = {}) => {
  const config = { ...DEFAULT_CONFIG, ...options };
  const store = options.store || createMemoryStore();

  return async (req, res, next) => {
    // Solo aplicar a métodos especificados
    if (!config.methods.includes(req.method)) {
      return next();
    }

    // Obtener idempotency key
    const idempotencyKey = req.headers[config.headerName.toLowerCase()];

    // Si no hay key y no es requerido, continuar normalmente
    if (!idempotencyKey) {
      if (config.required) {
        return res.status(400).json({
          error: true,
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: `Header ${config.headerName} es requerido para esta operación`,
        });
      }
      return next();
    }

    // Validar formato de la key
    if (idempotencyKey.length > config.maxKeyLength) {
      return res.status(400).json({
        error: true,
        code: 'IDEMPOTENCY_KEY_INVALID',
        message: `${config.headerName} excede longitud máxima de ${config.maxKeyLength}`,
      });
    }

    // Generar key única combinando idempotency key + path + método
    const uniqueKey = generateUniqueKey(idempotencyKey, req);

    try {
      // Verificar si ya existe un resultado para esta key
      const existing = await store.get(uniqueKey);

      if (existing) {
        // Si está pendiente, retornar conflicto
        if (existing.status === IDEMPOTENCY_STATUS.PENDING) {
          return res.status(409).json({
            error: true,
            code: 'IDEMPOTENCY_CONFLICT',
            message: 'Una operación con esta key está en progreso',
          });
        }

        // Si completó, retornar el resultado almacenado
        if (existing.status === IDEMPOTENCY_STATUS.COMPLETED) {
          res.setHeader('Idempotency-Replayed', 'true');
          return res.status(existing.statusCode).json(existing.body);
        }

        // Si falló, permitir retry
        // Continuar con la operación
      }

      // Marcar como pendiente
      await store.set(
        uniqueKey,
        {
          status: IDEMPOTENCY_STATUS.PENDING,
          createdAt: Date.now(),
          request: {
            method: req.method,
            path: req.path,
            ip: req.ip,
          },
        },
        config.ttlMs
      );

      // Interceptar la respuesta para guardar el resultado
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        await store.set(
          uniqueKey,
          {
            status: IDEMPOTENCY_STATUS.COMPLETED,
            statusCode: res.statusCode,
            body,
            completedAt: Date.now(),
          },
          config.ttlMs
        );
        return originalJson(body);
      };

      // Manejar errores
      res.on('finish', async () => {
        if (res.statusCode >= 500) {
          // Marcar como fallido para permitir retry
          await store.set(
            uniqueKey,
            {
              status: IDEMPOTENCY_STATUS.FAILED,
              statusCode: res.statusCode,
              failedAt: Date.now(),
            },
            config.ttlMs
          );
        }
      });

      next();
    } catch (error) {
      console.error('[Idempotency] Store error:', error.message);
      // En caso de error del store, continuar sin idempotencia
      next();
    }
  };
};

/**
 * Genera una key única para la operación
 * @param {string} idempotencyKey - Key proporcionada por el cliente
 * @param {Object} req - Express request
 * @returns {string} Key única
 */
const generateUniqueKey = (idempotencyKey, req) => {
  // Combinar key con ruta y método para evitar colisiones
  const combined = `${req.method}:${req.path}:${idempotencyKey}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
};

/**
 * Crea un store en memoria (para desarrollo/testing)
 * @returns {Object} Store con métodos get/set/del
 */
const createMemoryStore = () => {
  return {
    async get(key) {
      const entry = memoryStore.get(key);
      if (entry && entry.expiresAt > Date.now()) {
        return entry.data;
      }
      memoryStore.delete(key);
      return null;
    },

    async set(key, data, ttlMs) {
      memoryStore.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
    },

    async del(key) {
      memoryStore.delete(key);
    },

    // Limpieza periódica
    cleanup() {
      const now = Date.now();
      for (const [key, entry] of memoryStore.entries()) {
        if (entry.expiresAt <= now) {
          memoryStore.delete(key);
        }
      }
    },
  };
};

/**
 * Crea un store basado en Redis
 * @param {Object} redisClient - Cliente Redis (ioredis)
 * @param {string} [prefix='idempotency:'] - Prefijo para keys
 * @returns {Object} Store con métodos get/set/del
 */
const createRedisStore = (redisClient, prefix = 'idempotency:') => {
  return {
    async get(key) {
      const data = await redisClient.get(`${prefix}${key}`);
      return data ? JSON.parse(data) : null;
    },

    async set(key, data, ttlMs) {
      const ttlSeconds = Math.ceil(ttlMs / 1000);
      await redisClient.setex(`${prefix}${key}`, ttlSeconds, JSON.stringify(data));
    },

    async del(key) {
      await redisClient.del(`${prefix}${key}`);
    },
  };
};

/**
 * Genera una idempotency key del lado del cliente
 * @param {Object} [context] - Contexto adicional para la key
 * @returns {string} Key generada
 */
const generateIdempotencyKey = (context = {}) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const contextStr = JSON.stringify(context);
  return crypto
    .createHash('sha256')
    .update(`${timestamp}:${random}:${contextStr}`)
    .digest('hex')
    .substring(0, 32);
};

// Limpieza periódica del store en memoria (cada 5 minutos)
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.expiresAt <= now) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

module.exports = {
  idempotencyMiddleware,
  generateIdempotencyKey,
  createMemoryStore,
  createRedisStore,
  generateUniqueKey,
  IDEMPOTENCY_STATUS,
  DEFAULT_CONFIG,
};
