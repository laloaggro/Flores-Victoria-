const redis = require('redis');
const logger = require('../logger.simple');
const config = require('./index');

// Crear cliente de Redis
// Use REDIS_URL if provided (recommended). Fallback to host/port from config.
const redisUrl = process.env.REDIS_URL || `redis://${config.redis.host}:${config.redis.port}`;

// Configuration for retry strategy
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 5000; // 5 seconds
let retryCount = 0;
let isConnected = false;

// Log Redis URL (masked for security)
const maskedUrl = redisUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
logger.info({ service: 'wishlist-service', redisUrl: maskedUrl }, 'Inicializando conexión a Redis');

const redisClient = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (times) => {
      if (times > MAX_RETRIES) {
        logger.warn(
          { service: 'wishlist-service' },
          `Redis: Máximo de reintentos (${MAX_RETRIES}) alcanzado. El servicio funcionará sin caché.`
        );
        return false; // Stop retrying
      }
      const delay = Math.min(times * INITIAL_RETRY_DELAY, 30000); // Max 30 seconds
      logger.info(
        { service: 'wishlist-service', attempt: times, nextRetryMs: delay },
        `Redis: Reintentando conexión...`
      );
      return delay;
    },
  },
});

// Manejar errores de conexión - serializar el error correctamente
redisClient.on('error', (err) => {
  const errorInfo = {
    message: err?.message || 'Error desconocido',
    code: err?.code || 'UNKNOWN',
    stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
  };

  // Solo logear errores de conexión una vez por ciclo para evitar spam
  if (!isConnected && retryCount === 0) {
    logger.error(
      {
        service: 'wishlist-service',
        error: errorInfo,
        redisUrl: redisUrl.replace(/\/\/.*@/, '//***@'),
      },
      `Redis: Error de conexión - ${errorInfo.message}`
    );
  }
  retryCount++;
});

redisClient.on('connect', () => {
  retryCount = 0;
  logger.info({ service: 'wishlist-service' }, 'Redis: Conectando...');
});

redisClient.on('ready', () => {
  isConnected = true;
  retryCount = 0;
  logger.info({ service: 'wishlist-service' }, 'Redis: Conexión establecida correctamente');
});

redisClient.on('end', () => {
  isConnected = false;
  logger.warn({ service: 'wishlist-service' }, 'Redis: Conexión cerrada');
});

// Conectar a Redis
redisClient
  .connect()
  .then(() => {
    logger.info({ service: 'wishlist-service' }, 'Redis: Cliente inicializado');
  })
  .catch((err) => {
    const errorInfo = {
      message: err?.message || 'Error desconocido',
      code: err?.code || 'UNKNOWN',
    };
    logger.error(
      { service: 'wishlist-service', error: errorInfo },
      `Redis: Error inicial de conexión - ${errorInfo.message}. El servicio funcionará sin caché.`
    );
  });

// Export helper to check connection status
redisClient.isHealthy = () => isConnected;

module.exports = redisClient;
