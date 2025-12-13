const redis = require('redis');
const logger = require('../logger.simple');
const config = require('./index');

// Crear cliente de Redis
// Use REDIS_URL if provided (recommended). Fallback to host/port from config.
const redisUrl = process.env.REDIS_URL || `redis://${config.redis.host}:${config.redis.port}`;
const redisClient = redis.createClient({ url: redisUrl });

// Manejar errores de conexión
redisClient.on('error', (err) => {
  logger.error({ service: 'wishlist-service', err }, 'Error de conexión a Redis');
});

// Conectar a Redis
redisClient
  .connect()
  .then(() => {
    logger.info({ service: 'wishlist-service' }, 'Conexión a Redis establecida correctamente');
  })
  .catch((err) => {
    logger.error({ service: 'wishlist-service', err }, 'Error conectando a Redis');
  });

module.exports = redisClient;
