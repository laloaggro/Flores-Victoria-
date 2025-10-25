#!/usr/bin/env node

const express = require('express');
const promClient = require('prom-client');

const app = express();

// Port management con fallback
let PORT;
try {
  const PortManager = require('./scripts/port-manager');
  const portManager = new PortManager();
  const environment = process.env.NODE_ENV || 'development';
  PORT = portManager.getPort('order-service', environment);
} catch (error) {
  // Fallback a argumento CLI o variable de ambiente (Docker)
  PORT =
    process.argv.find((arg) => arg.startsWith('--port='))?.split('=')[1] ||
    process.env.ORDER_SERVICE_PORT ||
    process.env.PORT ||
    3004; // Puerto por defecto development
}

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register, prefix: 'order_service_' });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'order_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestsTotal = new promClient.Counter({
  name: 'order_service_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const ordersTotal = new promClient.Gauge({
  name: 'order_service_orders_total',
  help: 'Total number of orders in system',
  registers: [register],
});

// Middleware for metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
  });
  next();
});

app.use(express.json());

// Simulación de datos de pedidos
const orders = [
  {
    id: 1,
    userId: 1,
    customerName: 'Ana García',
    customerEmail: 'ana.garcia@email.com',
    items: [
      { productId: 1, productName: 'Ramo de Rosas Rojas', quantity: 1, price: 45000 }
    ],
    total: 45000,
    status: 'Completado',
    date: '2025-10-23T10:30:00Z',
    shippingAddress: 'Av. Providencia 1234, Santiago',
    paymentMethod: 'Tarjeta de crédito'
  },
  {
    id: 2,
    userId: 2,
    customerName: 'Carlos López',
    customerEmail: 'carlos.lopez@email.com',
    items: [
      { productId: 2, productName: 'Bouquet de Tulipanes', quantity: 2, price: 35000 },
      { productId: 3, productName: 'Arreglo Primaveral', quantity: 1, price: 55000 }
    ],
    total: 125000,
    status: 'En preparación',
    date: '2025-10-23T14:15:00Z',
    shippingAddress: 'Las Condes 5678, Santiago',
    paymentMethod: 'Transferencia bancaria'
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Order Service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Obtener todos los pedidos
app.get('/api/orders', (req, res) => {
  res.json({
    status: 'success',
    data: {
      orders: orders,
      total: orders.length
    }
  });
});

// Obtener pedido por ID
app.get('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return res.status(404).json({
      status: 'fail',
      message: 'Pedido no encontrado'
    });
  }
  
  res.json({
    status: 'success',  
    data: { order }
  });
});

// Crear nuevo pedido
app.post('/api/orders', (req, res) => {
  const { userId, customerName, customerEmail, items, shippingAddress, paymentMethod } = req.body;
  
  if (!userId || !items || !items.length || !customerName || !customerEmail) {
    return res.status(400).json({
      status: 'fail',
      message: 'Datos requeridos: userId, customerName, customerEmail, items'
    });
  }
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const newOrder = {
    id: orders.length + 1,
    userId,
    customerName,
    customerEmail,
    items,
    total,
    status: 'Pendiente',
    date: new Date().toISOString(),
    shippingAddress: shippingAddress || 'Dirección no especificada',
    paymentMethod: paymentMethod || 'Por definir'
  };
  
  orders.push(newOrder);
  
  res.status(201).json({
    status: 'success',
    data: { order: newOrder }
  });
});

// Actualizar estado de pedido
app.put('/api/orders/:id/status', (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;
  
  const validStatuses = ['Pendiente', 'En preparación', 'En camino', 'Completado', 'Cancelado'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ')
    });
  }
  
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Pedido no encontrado'
    });
  }
  
  orders[orderIndex].status = status;
  
  res.json({
    status: 'success',
    data: { order: orders[orderIndex] }
  });
});

// Obtener pedidos por usuario
app.get('/api/orders/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userOrders = orders.filter(o => o.userId === userId);
  
  res.json({
    status: 'success',
    data: {
      orders: userOrders,
      total: userOrders.length
    }
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Order Service - Flores Victoria v3.0',
    version: '3.0.0',
    endpoints: [
      'GET /health - Health check',
      'GET /api/orders - Listar todos los pedidos',
      'GET /api/orders/:id - Obtener pedido por ID',
      'POST /api/orders - Crear nuevo pedido',
      'PUT /api/orders/:id/status - Actualizar estado',
      'GET /api/orders/user/:userId - Pedidos por usuario'
    ]
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  // Update orders gauge
  ordersTotal.set(orders.length);
  
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada'
  });
});

// Export para pruebas y arranque condicional
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🛒 Order Service running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Orders: http://localhost:${PORT}/api/orders`);
  });
}

module.exports = app;