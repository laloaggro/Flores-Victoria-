const redis = require('redis');
const { createLogger } = require('../../logging/logger');

const logger = createLogger('cache-middleware');
let redisClient;

// Inicializar cliente de Redis
const initializeRedisClient = async () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });

    redisClient.on('error', (err) => {
      logger.error('Error de conexión con Redis en middleware:', err);
    });

    try {
      await redisClient.connect();
      logger.info('Cliente de Redis conectado correctamente en middleware');
    } catch (error) {
      logger.error('Error al conectar con Redis en middleware:', error);
    }
  }
  return redisClient;
};

// Middleware para cachear respuestas
const cacheMiddleware = (keyPrefix, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      // Inicializar cliente de Redis si no está conectado
      if (!redisClient) {
        await initializeRedisClient();
      }

      // Generar clave de caché
      const key = `${keyPrefix}:${req.originalUrl}` || `${keyPrefix}:${req.url}`;
      
      // Intentar obtener datos de la caché
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        logger.info(`Datos obtenidos de la caché para la clave: ${key}`);
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Interceptando la función send para guardar en caché
      const originalSend = res.send;
      res.send = function (data) {
        // Guardar en caché solo si la respuesta es exitosa
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, ttl, data)
            .then(() => logger.info(`Datos guardados en caché para la clave: ${key}`))
            .catch(err => logger.error('Error al guardar en caché:', err));
        }
        // Llamar a la función send original
        return originalSend.call(this, data);
      };

      // Continuar con la ejecución
      next();
    } catch (error) {
      logger.error('Error en middleware de caché:', error);
      next();
    }
  };
};

// Función para limpiar la caché
const clearCache = async (keyPattern) => {
  if (!redisClient) {
    await initializeRedisClient();
  }

  try {
    const keys = await redisClient.keys(keyPattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Caché limpiado para las claves: ${keyPattern}`);
    }
  } catch (error) {
    logger.error('Error al limpiar la caché:', error);
  }
};

module.exports = {
  cacheMiddleware,
  clearCache,
  initializeRedisClient
};