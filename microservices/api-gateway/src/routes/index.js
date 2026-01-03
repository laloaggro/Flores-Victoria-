const http = require('http');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const {
  criticalLimiter,
  searchLimiter,
} = require('@flores-victoria/shared/middleware/rate-limiter');
const config = require('../config');
const loggerMiddleware = require('../middleware/logger');
const { logger } = require('../middleware/logger');
const aiImagesRouter = require('./aiImages.routes');

const router = express.Router();

// Helper para proxy HTTP nativo (más confiable que http-proxy-middleware en Railway)
async function nativeHttpProxy(targetUrl, reqPath, method, body, reqId, authHeader) {
  const url = new URL(targetUrl);
  const postData = body && Object.keys(body).length > 0 ? JSON.stringify(body) : '';

  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: reqPath,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(postData && { 'Content-Length': Buffer.byteLength(postData) }),
      ...(reqId && { 'X-Request-ID': reqId }),
      ...(authHeader && { Authorization: authHeader }),
    },
    timeout: 10000,
  };

  return new Promise((resolve, reject) => {
    const proxyReq = http.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => (data += chunk));
      proxyRes.on('end', () => {
        resolve({ status: proxyRes.statusCode, data, headers: proxyRes.headers });
      });
    });
    proxyReq.on('error', (e) => reject(e));
    proxyReq.on('timeout', () => reject(new Error('Timeout')));
    if (postData) proxyReq.write(postData);
    proxyReq.end();
  });
}

// Helper para manejar errores de proxy con respuesta JSON consistente
function handleProxyError(err, req, res, serviceName) {
  logger.error({ service: 'api-gateway', error: err, serviceName }, 'Proxy error');

  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(502).json({
      status: 'error',
      message: `Servicio ${serviceName} no disponible`,
      requestId: req.id,
    });
  }
}

// Ruta raíz - versión actualizada para verificar deploy
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway - Arreglos Victoria',
    version: '2.1.0-simplified',
    timestamp: new Date().toISOString(),
    routes: {
      auth: config.services.authService,
      products: config.services.productService,
      users: config.services.userService,
    },
  });
});

// Debug route to verify router is working
router.get('/debug', (req, res) => {
  res.json({
    status: 'debug',
    authServiceUrl: config.services.authService,
    routesLoaded: true,
    timestamp: new Date().toISOString(),
  });
});

// Test auth route - direct check before proxy
router.get('/auth-test', (req, res) => {
  res.json({
    status: 'auth-test-reached',
    authServiceUrl: config.services.authService,
    message: 'If you see this, routes are working up to auth middleware',
  });
});

// Simple POST test to verify POST requests work
router.post('/post-test', (req, res) => {
  res.json({
    status: 'post-test-success',
    receivedBody: req.body,
    message: 'POST request received successfully',
  });
});

// Manual proxy test - bypassing http-proxy-middleware entirely
// Using different prefix to avoid any routing conflicts with /auth
router.post('/manual-auth/login', async (req, res) => {
  const http = require('http');
  const authUrl = config.services.authService;
  const url = new URL(authUrl);

  const postData = JSON.stringify(req.body);

  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
    timeout: 5000,
  };

  try {
    const result = await new Promise((resolve, reject) => {
      const proxyReq = http.request(options, (proxyRes) => {
        let data = '';
        proxyRes.on('data', (chunk) => (data += chunk));
        proxyRes.on('end', () => {
          resolve({ status: proxyRes.statusCode, data });
        });
      });
      proxyReq.on('error', (e) => reject(e));
      proxyReq.on('timeout', () => reject(new Error('Timeout')));
      proxyReq.write(postData);
      proxyReq.end();
    });

    // Simple JSON response - don't forward headers
    res.status(result.status).json(JSON.parse(result.data));
  } catch (e) {
    res.status(502).json({ error: 'Proxy failed', message: e.message });
  }
});

// Debug: Test direct HTTP connection to auth-service from Gateway
router.get('/auth-connect-test', async (req, res) => {
  const http = require('http');
  const authUrl = config.services.authService;

  const results = {
    target: authUrl,
    timestamp: new Date().toISOString(),
    tests: {},
  };

  // Parse URL
  const url = new URL(authUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    timeout: 5000,
  };

  // Test 1: /health endpoint
  try {
    const healthResult = await new Promise((resolve, reject) => {
      const request = http.get({ ...options, path: '/health' }, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () =>
          resolve({ status: response.statusCode, data: data.substring(0, 200) })
        );
      });
      request.on('error', (e) => reject(e));
      request.on('timeout', () => reject(new Error('Timeout')));
    });
    results.tests.health = healthResult;
  } catch (e) {
    results.tests.health = { error: e.message };
  }

  // Test 2: POST /auth/login (direct HTTP)
  try {
    const loginResult = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({ email: 'test@test.com', password: 'test' });
      const request = http.request(
        {
          ...options,
          path: '/auth/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
        },
        (response) => {
          let data = '';
          response.on('data', (chunk) => (data += chunk));
          response.on('end', () =>
            resolve({ status: response.statusCode, data: data.substring(0, 200) })
          );
        }
      );
      request.on('error', (e) => reject(e));
      request.on('timeout', () => reject(new Error('Timeout')));
      request.write(postData);
      request.end();
    });
    results.tests.login = loginResult;
  } catch (e) {
    results.tests.login = { error: e.message };
  }

  res.json(results);
});

// Debug: Test direct HTTP connection to user-service from Gateway
router.get('/user-connect-test', async (req, res) => {
  const http = require('http');
  const userUrl = config.services.userService;

  const results = {
    target: userUrl,
    timestamp: new Date().toISOString(),
    tests: {},
  };

  const url = new URL(userUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    timeout: 5000,
  };

  // Test 1: /health endpoint
  try {
    const healthResult = await new Promise((resolve, reject) => {
      const request = http.get({ ...options, path: '/health' }, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () =>
          resolve({ status: response.statusCode, data: data.substring(0, 200) })
        );
      });
      request.on('error', (e) => reject(e));
      request.on('timeout', () => reject(new Error('Timeout')));
    });
    results.tests.health = healthResult;
  } catch (e) {
    results.tests.health = { error: e.message };
  }

  // Test 2: GET /api/users
  try {
    const usersResult = await new Promise((resolve, reject) => {
      const request = http.get({ ...options, path: '/api/users' }, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () =>
          resolve({ status: response.statusCode, data: data.substring(0, 300) })
        );
      });
      request.on('error', (e) => reject(e));
      request.on('timeout', () => reject(new Error('Timeout')));
    });
    results.tests.users = usersResult;
  } catch (e) {
    results.tests.users = { error: e.message };
  }

  res.json(results);
});

// Simple proxy test for auth - without rate limiting to debug
router.use(
  '/auth-simple',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.authService,
    changeOrigin: true,
    // Use object format like products (works reliably)
    pathRewrite: {
      '^/': '/auth/', // router.use('/auth-simple') strips prefix, so req.url is '/login' -> '/auth/login'
    },
    onProxyReq: (proxyReq, req, _res) => {
      logger.info(
        { service: 'api-gateway', originalUrl: req.originalUrl, url: req.url, path: req.path },
        'auth-simple proxy request'
      );
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'auth-simple'),
  })
);

// Auth proxy using native HTTP (sin circuit breaker - módulo no disponible)
router.use(
  '/auth',
  criticalLimiter,
  loggerMiddleware.logRequest,
  async (req, res) => {
    try {
      const targetPath = `/auth${req.url}`; // req.url is already without /auth prefix

      const result = await nativeHttpProxy(
        config.services.authService,
        targetPath,
        req.method,
        req.body,
        req.id,
        req.headers.authorization
      );

      // Forward relevant headers
      if (result.headers['set-cookie']) {
        res.setHeader('Set-Cookie', result.headers['set-cookie']);
      }

      res.status(result.status);
      try {
        res.json(JSON.parse(result.data));
      } catch {
        res.send(result.data);
      }
    } catch (e) {
      logger.error({ service: 'api-gateway', error: e.message }, 'auth proxy error');
      res.status(502).json({
        status: 'error',
        message: 'Servicio auth no disponible',
        requestId: req.id,
      });
    }
  }
);

// Middleware para todas las rutas de productos (búsquedas con límite especial)
router.use(
  '/products',
  searchLimiter, // Limitar búsquedas intensivas
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.productService,
    changeOrigin: true,
    pathRewrite: {
      '^/products': '/api/products',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'product-service'),
  })
);

// Users proxy (sin circuit breaker)
router.use(
  '/users',
  loggerMiddleware.logRequest,
  async (req, res) => {
    try {
      const targetPath = `/api/users${req.url}`; // req.url is already without /users prefix

      const result = await nativeHttpProxy(
        config.services.userService,
        targetPath,
        req.method,
        req.body,
        req.id,
        req.headers.authorization // Forward auth header
      );

      res.status(result.status);
      try {
        res.json(JSON.parse(result.data));
      } catch {
        res.send(result.data);
      }
    } catch (e) {
      logger.error({ service: 'api-gateway', error: e.message }, 'users proxy error');
      res.status(502).json({
        status: 'error',
        message: 'Servicio users no disponible',
        requestId: req.id,
      });
    }
  }
);

// Rutas de órdenes
router.use(
  '/orders',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.orderService,
    changeOrigin: true,
    pathRewrite: {
      '^/orders': '/api/orders',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'orders'),
  })
);

// Rutas de carrito
router.use(
  '/cart',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.cartService,
    changeOrigin: true,
    pathRewrite: {
      '^/cart': '/api/cart',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'cart'),
  })
);

// Rutas de wishlist
router.use(
  '/wishlist',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.wishlistService,
    changeOrigin: true,
    pathRewrite: {
      '^/wishlist': '/api/wishlist',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'wishlist'),
  })
);

// Rutas de reseñas
router.use(
  '/reviews',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.reviewService,
    changeOrigin: true,
    pathRewrite: {
      '^/reviews': '/api/reviews',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'reviews'),
  })
);

// Rutas de contacto
router.use(
  '/contact',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.contactService,
    changeOrigin: true,
    pathRewrite: {
      '^/contact': '/api/contacts',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'contact'),
  })
);

// Rutas de AI Horde - Generación de imágenes
router.use('/ai-images', aiImagesRouter);

// Rutas de Recomendaciones de IA
router.use(
  '/ai',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.aiRecommendationsService,
    changeOrigin: true,
    pathRewrite: {
      '^/ai': '',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'ai-recommendations'),
  })
);

// Rutas de WASM Processor
router.use(
  '/wasm',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.wasmService,
    changeOrigin: true,
    pathRewrite: {
      '^/wasm': '',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'wasm'),
  })
);

// Rutas de Pagos (http-proxy-middleware)
router.use(
  '/payments',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.paymentService,
    changeOrigin: true,
    pathRewrite: {
      '^/payments': '/payments',
    },
    onProxyReq: (proxyReq, req, _res) => {
      // Propagar Request ID
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      // Preservar el Content-Type original
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'payments'),
  })
);

// Rutas de Promociones (http-proxy-middleware)
router.use(
  '/promotions',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.promotionService,
    changeOrigin: true,
    pathRewrite: {
      '^/promotions': '/api/promotions',
    },
    onProxyReq: (proxyReq, req, _res) => {
      // Propagar Request ID
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      // Preservar el body para POST/PUT/PATCH
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'promotions'),
    logLevel: 'debug',
  })
);

// Rutas de Gift Cards (proxy a promotion-service)
router.use(
  '/gift-cards',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.promotionService,
    changeOrigin: true,
    pathRewrite: {
      '^/gift-cards': '/api/gift-cards',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'gift-cards'),
    logLevel: 'debug',
  })
);

// Rutas de Reservas de Eventos (proxy a promotion-service)
router.use(
  '/event-reservations',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.promotionService,
    changeOrigin: true,
    pathRewrite: {
      '^/event-reservations': '/api/event-reservations',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'event-reservations'),
    logLevel: 'debug',
  })
);

// Rutas de Recomendaciones (proxy a product-service)
router.use(
  '/recommendations',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.productService,
    changeOrigin: true,
    pathRewrite: {
      '^/recommendations': '/api/recommendations',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'recommendations'),
    logLevel: 'debug',
  })
);

module.exports = router;
