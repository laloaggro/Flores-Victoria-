const redis = require('redis');

const config = require('./index');

// Crear cliente de Redis
const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
});

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
