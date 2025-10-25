const path = require('path');

const express = require('express');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const client = require('prom-client');

const healthMonitor = require('./routes/health-monitor');
const PortManager = require('./scripts/port-manager');
const environment = process.env.NODE_ENV || 'development';

// Admin access configuration
const DEV_ADMIN_BYPASS = process.env.DEV_ADMIN_BYPASS === 'true' && environment === 'development';
const ADMIN_BYPASS_ALLOWED_IPS = (process.env.ADMIN_BYPASS_ALLOWED_IPS || '127.0.0.1,::1')
  .split(',')
  .map((ip) => ip.trim());
const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || (environment === 'development' ? 'dev-admin-secret' : undefined);

let PORT = 3000; // Default gateway port
let SERVICE_PORTS = {};

try {
  const portManager = new PortManager();
  const portConfig = portManager.getAllPorts(environment);
  
  // Get all service ports for this environment
  SERVICE_PORTS = {
    ai: portConfig.core['ai-service'],
    order: portConfig.core['order-service'],
    admin: portConfig.core['admin-panel'],
    auth: portConfig.additional['auth-service'],
    payment: portConfig.additional['payment-service'],
    notification: portConfig.additional['notification-service'],
  };
  
  PORT = portConfig.frontend['main-site'];
} catch (error) {
  console.warn('PortManager unavailable, using defaults');
  SERVICE_PORTS = {
    ai: 3013,
    order: 3004,
    admin: 3021,
    auth: 3017,
    payment: 3018,
    notification: 3016,
  };
}

const app = express();

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Admin auth middleware with dev bypass (localhost only)
const isIpAllowed = (req) => {
  const ip = (req.ip || '').replace('::ffff:', '');
  return ADMIN_BYPASS_ALLOWED_IPS.includes(ip) || ADMIN_BYPASS_ALLOWED_IPS.includes('*');
};

const requireAdminAuth = (req, res, next) => {
  // Dev bypass: only when enabled, in development, and from allowed IPs
  if (DEV_ADMIN_BYPASS && isIpAllowed(req)) return next();

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token)
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing Bearer token' });

  try {
    if (!ADMIN_JWT_SECRET) {
      return res
        .status(500)
        .json({ error: 'Server config error', message: 'ADMIN_JWT_SECRET not set' });
    }
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    const isAdmin =
      payload?.role === 'admin' || payload?.roles?.includes('admin') || payload?.isAdmin === true;
    if (!isAdmin)
      return res.status(403).json({ error: 'Forbidden', message: 'Admin role required' });
    req.admin = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

// Serve admin-site statically via Gateway so admin pages are accessible (protected)
app.use('/admin-site', requireAdminAuth, express.static(path.join(__dirname, 'admin-site')));

// Prometheus Metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'gateway_http_requests_total',
  help: 'Total HTTP requests through gateway',
  labelNames: ['method', 'route', 'status', 'service'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'gateway_http_request_duration_seconds',
  help: 'HTTP request duration',
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  labelNames: ['method', 'route', 'service'],
  registers: [register],
});

const activeConnections = new client.Gauge({
  name: 'gateway_active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// Rate Limiting
const createLimiter = (windowMs, max) =>
  rateLimit({
    windowMs,
    max,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Different rate limits for different routes
const generalLimiter = createLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
const authLimiter = createLimiter(15 * 60 * 1000, 20); // 20 requests per 15 minutes
const paymentLimiter = createLimiter(15 * 60 * 1000, 10); // 10 requests per 15 minutes

// Request logging and metrics middleware
app.use((req, res, next) => {
  activeConnections.inc();
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const service = req.path.split('/')[2] || 'unknown';
    
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
      service,
    });
    
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.path,
        service,
      },
      duration
    );
    
    activeConnections.dec();
  });
  
  next();
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'api-gateway',
    environment,
    port: PORT,
    timestamp: new Date().toISOString(),
    upstreamServices: SERVICE_PORTS,
  });
});

// Metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Gateway Info
app.get('/', (req, res) => {
  res.json({
    name: 'Flores Victoria API Gateway',
    version: '3.0.0',
    environment,
    endpoints: {
      '/api/ai/*': `Proxy to AI Service (port ${SERVICE_PORTS.ai})`,
      '/api/orders/*': `Proxy to Order Service (port ${SERVICE_PORTS.order})`,
      '/api/admin/*': `Proxy to Admin Panel (port ${SERVICE_PORTS.admin})`,
      '/api/auth/*': `Proxy to Auth Service (port ${SERVICE_PORTS.auth})`,
      '/api/payments/*': `Proxy to Payment Service (port ${SERVICE_PORTS.payment})`,
      '/api/notifications/*': `Proxy to Notification Service (port ${SERVICE_PORTS.notification})`,
    },
    documentation: '/docs',
    health: '/health',
    metrics: '/metrics',
  });
});

// Proxy configurations
const createProxy = (serviceName, target) =>
  createProxyMiddleware({
    target: `http://localhost:${target}`,
    changeOrigin: true,
    pathRewrite: (path) => path.replace(`/api/${serviceName}`, ''),
    onProxyReq: (proxyReq, req) => {
      console.log(
        `[${serviceName.toUpperCase()}] ${req.method} ${req.path} → ${target}${req.path}`
      );
    },
    onError: (err, req, res) => {
      console.error(`[${serviceName.toUpperCase()}] Proxy error:`, err.message);
      res.status(503).json({
        error: 'Service unavailable',
        service: serviceName,
        message: 'The requested service is currently unavailable',
      });
    },
  });

// Apply rate limiters and proxies
app.use('/api/ai', generalLimiter, createProxy('ai', SERVICE_PORTS.ai));
app.use('/api/orders', generalLimiter, createProxy('orders', SERVICE_PORTS.order));
app.use('/api/admin', generalLimiter, createProxy('admin', SERVICE_PORTS.admin));
app.use('/api/auth', authLimiter, createProxy('auth', SERVICE_PORTS.auth));
app.use('/api/payments', paymentLimiter, createProxy('payments', SERVICE_PORTS.payment));
app.use(
  '/api/notifications',
  generalLimiter,
  createProxy('notifications', SERVICE_PORTS.notification)
);

// Health Monitor Routes (Admin only)
// Health Monitor Routes (Admin only)
app.use('/api/health', requireAdminAuth, healthMonitor);

// Service Status Endpoint
app.get('/api/status', async (req, res) => {
  const http = require('http');
  
  const checkService = (name, port) =>
    new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}/health`, { timeout: 2000 }, (response) => {
        resolve({ name, port, status: 'healthy', statusCode: response.statusCode });
      });

      req.on('error', () => {
        resolve({ name, port, status: 'unhealthy', error: 'Connection failed' });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ name, port, status: 'unhealthy', error: 'Timeout' });
      });
    });

  const services = await Promise.all([
    checkService('AI Service', SERVICE_PORTS.ai),
    checkService('Order Service', SERVICE_PORTS.order),
    checkService('Admin Panel', SERVICE_PORTS.admin),
    checkService('Auth Service', SERVICE_PORTS.auth),
    checkService('Payment Service', SERVICE_PORTS.payment),
    checkService('Notification Service', SERVICE_PORTS.notification),
  ]);

  const allHealthy = services.every((s) => s.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    environment,
    overall: allHealthy ? 'healthy' : 'degraded',
    services,
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      '/api/ai',
      '/api/orders',
      '/api/admin',
      '/api/auth',
      '/api/payments',
      '/api/notifications',
      '/api/status',
      '/health',
      '/metrics',
    ],
  });
});

// Error Handler
app.use((err, req, res, _next) => {
  console.error('Gateway error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message,
    ...(environment === 'development' && { stack: err.stack }),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║          🚪 API GATEWAY - Flores Victoria v3.0           ║
╚═══════════════════════════════════════════════════════════╝

  Environment: ${environment}
  Port:        ${PORT}
  Health:      http://localhost:${PORT}/health
  Metrics:     http://localhost:${PORT}/metrics
  Status:      http://localhost:${PORT}/api/status

  📡 Routing Configuration:
  ┌────────────────────────┬────────────────────────┐
  │ Gateway Route          │ Upstream Service       │
  ├────────────────────────┼────────────────────────┤
  │ /api/ai/*              │ localhost:${SERVICE_PORTS.ai}        │
  │ /api/orders/*          │ localhost:${SERVICE_PORTS.order}        │
  │ /api/admin/*           │ localhost:${SERVICE_PORTS.admin}        │
  │ /api/auth/*            │ localhost:${SERVICE_PORTS.auth}        │
  │ /api/payments/*        │ localhost:${SERVICE_PORTS.payment}        │
  │ /api/notifications/*   │ localhost:${SERVICE_PORTS.notification}        │
  └────────────────────────┴────────────────────────┘

  🛡️  Rate Limiting:
  ├─ General endpoints:  100 req/15min
  ├─ Auth endpoints:     20 req/15min
  └─ Payment endpoints:  10 req/15min

  📊 Features:
  ✅ Automatic service discovery via PortManager
  ✅ Health check aggregation
  ✅ Rate limiting per endpoint type
  ✅ Prometheus metrics
  ✅ CORS enabled
  ✅ Request logging
  ✅ Error handling

  🎯 Example Requests:
  curl http://localhost:${PORT}/api/ai/recommend
  curl http://localhost:${PORT}/api/orders
  curl http://localhost:${PORT}/api/auth/login
  curl http://localhost:${PORT}/api/payments
  curl http://localhost:${PORT}/api/status

  Ready to route traffic! 🚀
`);
});

module.exports = app;
