const express = require('express');
const redis = require('redis');
const { metricsMiddleware, metricsEndpoint } = require('./middlewares/metrics');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.json());
app.use(metricsMiddleware);

// Crear cliente Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Error de Redis:', err);
});

redisClient.connect();

// Rutas
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'cart-service' });
});

// Endpoint para métricas
app.get('/metrics', metricsEndpoint);

// Agregar item al carrito
app.post('/cart/:userId/items', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    
    // Crear clave para el carrito del usuario
    const cartKey = `cart:${userId}`;
    
    // Agregar item al carrito (hash en Redis)
    await redisClient.hSet(cartKey, productId, quantity);
    
    res.status(201).json({ message: 'Item agregado al carrito' });
  } catch (error) {
    console.error('Error al agregar item al carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener carrito de un usuario
app.get('/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Crear clave para el carrito del usuario
    const cartKey = `cart:${userId}`;
    
    // Obtener todos los items del carrito
    const items = await redisClient.hGetAll(cartKey);
    
    res.status(200).json({ userId, items });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar item del carrito
app.delete('/cart/:userId/items/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    // Crear clave para el carrito del usuario
    const cartKey = `cart:${userId}`;
    
    // Eliminar item del carrito
    await redisClient.hDel(cartKey, productId);
    
    res.status(200).json({ message: 'Item eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar item del carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio de carrito ejecutándose en el puerto ${PORT}`);
});

module.exports = app;