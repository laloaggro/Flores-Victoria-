/**
 * Ejemplo de Integración: Rate Limiting Avanzado en Cart Service
 *
 * Este archivo demuestra cómo migrar del rate limiting básico de express-rate-limit
 * al sistema avanzado con Redis.
 *
 * ANTES vs DESPUÉS: Ver comparación al final del archivo
 */

const express = require('express');

const { createLogger } = require('../../../shared/logging/logger');
const { accessLog } = require('../../../shared/middleware/access-log');
const { withLogger } = require('../../../shared/middleware/request-id');
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/error-handler');

// ✨ NUEVO: Import del rate limiter avanzado
const {
  globalRateLimiter,
  userRateLimiter,
  customRateLimiter,
} = require('../../../shared/middleware/rate-limiter');

const config = require('./config');
const redisClient = require('./config/redis');
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const { router, setRedis } = require('./routes/cart');
const { verifyToken } = require('./utils/jwt');

// Crear aplicación Express
const app = express();

// Aplicar middleware común (CORS, helmet, JSON parsing, etc.)
applyCommonMiddleware(app, config);

// Logger del servicio
const logger = createLogger('cart-service');
app.use(withLogger(logger));
app.use(accessLog(logger));

// ✨ NUEVO: Rate Limiter Global (por IP)
// Límites generosos para no bloquear tráfico legítimo
// 1000 requests / 15 minutos por IP
app.use(globalRateLimiter(redisClient));

// Middleware de autenticación
app.use('/api/cart', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido',
    });
  }
});

// ✨ NUEVO: Rate Limiter por Usuario (después de autenticación)
// Más restrictivo que el global: 500 requests / 15 minutos por usuario
// Si el request no está autenticado, usa IP como fallback
app.use('/api/cart', userRateLimiter(redisClient));

// ✨ NUEVO: Rate Limiters específicos para operaciones costosas
const addToCartLimiter = customRateLimiter(redisClient, {
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto
  keyPrefix: 'rl:cart:add',
  scope: 'user',
});

const checkoutLimiter = customRateLimiter(redisClient, {
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // 10 checkouts cada 5 minutos
  keyPrefix: 'rl:cart:checkout',
  scope: 'user',
});

// Aplicar rate limiters a rutas específicas (en el router)
// Nota: Esto requiere modificar el router para aceptar middleware adicional
// Ver ejemplo en routes/cart.js

// Inicializar controladores con Redis
setRedis(redisClient);

// Configurar health checks (pasa redisClient para readiness check)
setupHealthChecks(app, 'cart-service', redisClient);

// Rutas principales
app.use('/api/cart', router);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Carrito - Arreglos Victoria',
    version: '2.0.0', // Version bump por rate limiting avanzado
  });
});

// 404 handler - reemplaza el manejador básico
app.use(notFoundHandler);

// Error handler - debe ir al final
app.use(errorHandler);

module.exports = app;

/* ═══════════════════════════════════════════════════════════════════
 * COMPARACIÓN: ANTES vs DESPUÉS
 * ═══════════════════════════════════════════════════════════════════
 *
 * ────────────────────────────────────────────────────────────────────
 * ANTES (express-rate-limit básico - memoria local)
 * ────────────────────────────────────────────────────────────────────
 *
 * const rateLimit = require('express-rate-limit');
 *
 * const limiter = rateLimit({
 *   windowMs: config.rateLimit.windowMs,
 *   max: config.rateLimit.max,
 *   message: {
 *     status: 'fail',
 *     message: 'Demasiadas solicitudes...',
 *   },
 * });
 *
 * app.use(limiter); // Un solo limiter para todo
 *
 * PROBLEMAS:
 * ❌ Usa memoria local (no compartido entre instancias)
 * ❌ Límite fijo para todas las rutas
 * ❌ No distingue entre usuarios autenticados y anónimos
 * ❌ No permite bypass para admins
 * ❌ Sin headers informativos estándar
 * ❌ Sin logging detallado
 *
 * ────────────────────────────────────────────────────────────────────
 * DESPUÉS (Redis-based con múltiples niveles)
 * ────────────────────────────────────────────────────────────────────
 *
 * const {
 *   globalRateLimiter,
 *   userRateLimiter,
 *   customRateLimiter
 * } = require('../../../shared/middleware/rate-limiter');
 *
 * // Nivel 1: Global (por IP)
 * app.use(globalRateLimiter(redisClient));
 *
 * // Nivel 2: Por usuario (después de auth)
 * app.use('/api/cart', authenticate);
 * app.use('/api/cart', userRateLimiter(redisClient));
 *
 * // Nivel 3: Específico por operación
 * const addLimiter = customRateLimiter(redisClient, {
 *   max: 30, windowMs: 60000, scope: 'user'
 * });
 *
 * BENEFICIOS:
 * ✅ Redis compartido entre todas las instancias
 * ✅ Múltiples niveles de rate limiting
 * ✅ Límites diferentes por usuario vs IP
 * ✅ Bypass automático para admins
 * ✅ Headers X-RateLimit-* estándar
 * ✅ Logging integrado con requestId
 * ✅ Fail open si Redis falla (alta disponibilidad)
 * ✅ Metadata en errores 429
 *
 * ────────────────────────────────────────────────────────────────────
 * EJEMPLO DE RESPUESTA 429
 * ────────────────────────────────────────────────────────────────────
 *
 * HTTP/1.1 429 Too Many Requests
 * X-RateLimit-Limit: 30
 * X-RateLimit-Remaining: 0
 * X-RateLimit-Reset: 1698765432000
 * Retry-After: 45
 *
 * {
 *   "status": "error",
 *   "message": "Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.",
 *   "metadata": {
 *     "limit": 30,
 *     "current": 35,
 *     "window": "60s",
 *     "retryAfter": 45,
 *     "resetTime": 1698765432000
 *   },
 *   "requestId": "req_abc123"
 * }
 *
 * ═══════════════════════════════════════════════════════════════════
 */
