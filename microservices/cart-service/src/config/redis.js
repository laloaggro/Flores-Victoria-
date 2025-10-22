const redis = require('redis');

const config = require('./index');

// Crear cliente de Redis
// Use REDIS_URL if provided (recommended). Fallback to host/port from config.
const redisUrl = process.env.REDIS_URL || `redis://${config.redis.host}:${config.redis.port}`;
const redisClient = redis.createClient({ url: redisUrl });

// Manejar errores de conexión
redisClient.on('error', (err) => {
  console.error('Error de conexión a Redis:', err);
});

// Conectar a Redis
redisClient
  .connect()
  .then(() => {
    console.log('Conexión a Redis establecida correctamente');
  })
  .catch((err) => {
    console.error('Error conectando a Redis:', err);
  });

module.exports = redisClient;
