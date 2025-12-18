const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const logger = require('./logger.simple');
const config = require('./config');

const app = express();

// CORS configuration - allow requests from admin dashboard and API gateway
const corsOptions = {
  origin: [
    'https://admin-dashboard-service-production.up.railway.app',
    'https://api-gateway-production-b02f.up.railway.app',
    'https://flores-victoria-frontend.up.railway.app',
    'http://localhost:3000',
    'http://localhost:5173',
    /\.railway\.app$/, // Allow all Railway subdomains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
};

// Middleware básico
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging simple
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// In-memory storage para órdenes (respaldo si MongoDB no está disponible)
let orders = [];
let mongoConnected = false;
let ordersCollection = null;

// Inicializar MongoDB (no bloqueante)
const initMongoDB = async () => {
  try {
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('flores_victoria');
    ordersCollection = db.collection('orders');
    mongoConnected = true;
    logger.info('✅ MongoDB conectado para orders');

    // Cargar órdenes existentes a memoria como respaldo
    const existingOrders = await ordersCollection.find({}).toArray();
    orders = existingOrders;
  } catch (error) {
    logger.warn('⚠️ MongoDB no disponible, usando almacenamiento en memoria:', error.message);
  }
};

// Ejecutar inicialización de MongoDB
initMongoDB();

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de autenticación requerido',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Formato de token inválido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch (error) {
    logger.error('Auth error:', error.message);
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado',
    });
  }
};

// Health check - DEBE responder rápido
app.get('/health', (req, res) => {
  logger.info('Health check request received');
  res.status(200).json({
    status: 'healthy',
    service: 'order-service',
    port: config.port,
    mongoConnected,
    timestamp: new Date().toISOString(),
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Order Service - Arreglos Victoria',
    version: '3.0.0-simple',
    endpoints: ['/health', '/', '/api/orders'],
  });
});

// ======== RUTAS DE ORDERS ========

// Listar órdenes del usuario autenticado
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    let userOrders;
    if (mongoConnected && ordersCollection) {
      userOrders = await ordersCollection.find({ userId: String(userId) }).toArray();
    } else {
      userOrders = orders.filter((o) => String(o.userId) === String(userId));
    }

    res.json({
      status: 'success',
      data: { orders: userOrders },
      count: userOrders.length,
    });
  } catch (error) {
    logger.error('Error al listar órdenes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener órdenes',
    });
  }
});

// Crear nueva orden
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validación básica
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'items es requerido y debe ser un array no vacío',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'shippingAddress es requerido',
      });
    }

    // Calcular total
    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const newOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: String(userId),
      items,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'credit_card',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (mongoConnected && ordersCollection) {
      await ordersCollection.insertOne(newOrder);
    }

    orders.push(newOrder);

    res.status(201).json({
      status: 'success',
      message: 'Orden creada exitosamente',
      data: { order: newOrder },
    });
  } catch (error) {
    logger.error('Error al crear orden:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear la orden',
    });
  }
});

// Obtener orden por ID
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let order;
    if (mongoConnected && ordersCollection) {
      order = await ordersCollection.findOne({
        $or: [{ id }, { _id: id }],
        userId: String(userId),
      });
    } else {
      order = orders.find((o) => o.id === id && String(o.userId) === String(userId));
    }

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Orden no encontrada',
      });
    }

    res.json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    logger.error('Error al obtener orden:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener la orden',
    });
  }
});

// Actualizar estado de orden
app.patch('/api/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`,
      });
    }

    let order;
    if (mongoConnected && ordersCollection) {
      const result = await ordersCollection.findOneAndUpdate(
        { $or: [{ id }, { _id: id }], userId: String(userId) },
        { $set: { status, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      order = result;
    } else {
      const idx = orders.findIndex((o) => o.id === id && String(o.userId) === String(userId));
      if (idx >= 0) {
        orders[idx].status = status;
        orders[idx].updatedAt = new Date().toISOString();
        order = orders[idx];
      }
    }

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Orden no encontrada',
      });
    }

    res.json({
      status: 'success',
      message: 'Estado actualizado',
      data: { order },
    });
  } catch (error) {
    logger.error('Error al actualizar orden:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar la orden',
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor',
  });
});

module.exports = app;
