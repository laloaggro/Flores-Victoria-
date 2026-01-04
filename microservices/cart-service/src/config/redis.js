const redis = require('redis');
const logger = require('../logger.simple');
const config = require('./index');

// Crear cliente de Valkey
// Use VALKEY_URL if provided (recommended). Fallback to host/port from config.
const valkeyUrl = config.valkey.url || `redis://${config.valkey.host}:${config.valkey.port}`;

// Configuration for retry strategy
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 5000; // 5 seconds
let retryCount = 0;
let isConnected = false;

// Log Valkey URL (masked for security)
const maskedUrl = valkeyUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
logger.info({ service: 'cart-service', valkeyUrl: maskedUrl }, 'Inicializando conexión a Valkey');

const redisClient = redis.createClient({
  url: valkeyUrl,
  socket: {
    reconnectStrategy: (times) => {
      if (times > MAX_RETRIES) {
        logger.warn(
          { service: 'cart-service' },
          `Valkey: Máximo de reintentos (${MAX_RETRIES}) alcanzado. El servicio funcionará sin caché.`
        );
        return false; // Stop retrying
      }
      const delay = Math.min(times * INITIAL_RETRY_DELAY, 30000); // Max 30 seconds
      logger.info(
        { service: 'cart-service', attempt: times, nextRetryMs: delay },
        `Valkey: Reintentando conexión...`
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
  };

  // Solo logear errores de conexión una vez por ciclo para evitar spam
  if (!isConnected && retryCount === 0) {
    logger.error(
      { service: 'cart-service', error: errorInfo, valkeyUrl: maskedUrl },
      `Valkey: Error de conexión - ${errorInfo.message}`
    );
  }
  retryCount++;
});

redisClient.on('connect', () => {
  retryCount = 0;
  logger.info({ service: 'cart-service' }, 'Valkey: Conectando...');
});

redisClient.on('ready', () => {
  isConnected = true;
  retryCount = 0;
  logger.info({ service: 'cart-service' }, 'Valkey: Conexión establecida correctamente');
});

redisClient.on('end', () => {
  isConnected = false;
  logger.warn({ service: 'cart-service' }, 'Valkey: Conexión cerrada');
});

// Conectar a Valkey
redisClient
  .connect()
  .then(() => {
    logger.info({ service: 'cart-service' }, 'Valkey: Cliente inicializado');
  })
  .catch((err) => {
    const errorInfo = {
      message: err?.message || 'Error desconocido',
      code: err?.code || 'UNKNOWN',
    };
    logger.error(
      { service: 'cart-service', error: errorInfo },
      `Valkey: Error inicial de conexión - ${errorInfo.message}. El servicio funcionará sin caché.`
    );
  });

// Export helper to check connection status
redisClient.isHealthy = () => isConnected;

module.exports = redisClient;
