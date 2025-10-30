# Stack Completo de Observabilidad y Confiabilidad

Implementación completa de las 4 fases de mejoras para microservicios en producción.

## 🎯 Resumen Ejecutivo

Se implementó un stack completo de observabilidad y confiabilidad que incluye:

✅ **Fase A:** Error Handling Estandarizado  
✅ **Fase B:** Rate Limiting Granular con Redis  
✅ **Fase C:** Validación de Requests con Joi  
✅ **Fase D:** Métricas con Prometheus

**Beneficio:** Servicios production-ready con manejo consistente de errores, protección contra abusos, validación robusta y observabilidad completa.

---

## 📚 Componentes del Stack

### Fase A: Error Handling
**Ubicación:** `shared/errors/` y `shared/middleware/error-handler.js`  
**Documentación:** `shared/ERROR_HANDLING.md`

**Características:**
- 8 clases de error personalizadas (BadRequest, NotFound, Unauthorized, etc.)
- Middleware `asyncHandler` para eliminar try-catch
- Error handler global con normalización automática
- Integración con logging (requestId incluido)
- Metadata estructurada en errores

**Integración:**
```javascript
const { errorHandler, notFoundHandler, asyncHandler } = require('../../../shared/middleware/error-handler');
const { NotFoundError } = require('../../../shared/errors/AppError');

// Al final de app.js
app.use(notFoundHandler);
app.use(errorHandler);

// En routes
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await Model.findById(req.params.id);
  if (!item) throw new NotFoundError('Item', { id: req.params.id });
  res.json({ data: item });
}));
```

---

### Fase B: Rate Limiting
**Ubicación:** `shared/middleware/rate-limiter.js`  
**Documentación:** `shared/RATE_LIMITING.md`

**Características:**
- Rate limiting basado en Redis (compartido entre instancias)
- 3 scopes: user, ip, endpoint
- 5 limiters predefinidos (global, user, auth, strict, custom)
- Bypass automático (admins, servicios internos, health checks)
- Headers informativos (X-RateLimit-*)
- Fail open (permite requests si Redis falla)

**Integración:**
```javascript
const { globalRateLimiter, authRateLimiter } = require('../../../shared/middleware/rate-limiter');

// Rate limiter global
app.use(globalRateLimiter(redisClient));

// Rate limiter para auth endpoints
router.post('/login', authRateLimiter(redisClient), loginHandler);
```

---

### Fase C: Validación
**Ubicación:** `shared/middleware/validator.js`  
**Documentación:** `shared/VALIDATION.md`

**Características:**
- Validación de body, query, params, headers
- Schemas reutilizables (commonSchemas)
- Schemas predefinidos (createUser, login, productFilters, etc.)
- Integración con ValidationError (422)
- Sanitización automática

**Integración:**
```javascript
const { validateBody, validateQuery, schemas, Joi } = require('../../../shared/middleware/validator');

const createProductSchema = Joi.object({
  name: Joi.string().min(3).required(),
  price: commonSchemas.price.required(),
});

router.post('/products',
  validateBody(createProductSchema),
  async (req, res) => {
    // req.body ya está validado y sanitizado
  }
);

router.get('/products',
  validateQuery(schemas.productFilters),
  async (req, res) => { ... }
);
```

---

### Fase D: Métricas
**Ubicación:** `shared/middleware/metrics.js`  
**Documentación:** Este archivo

**Características:**
- Métricas HTTP (requests, duration, active, size)
- Métricas de errores (total, validación)
- Métricas de rate limiting (hits, blocks, bypass)
- Métricas de base de datos (query duration, connections)
- Métricas de negocio personalizables
- Helper para medir operaciones

**Integración:**
```javascript
const { initMetrics, metricsMiddleware, metricsEndpoint } = require('../../../shared/middleware/metrics');

// Inicializar
const { registry, metrics } = initMetrics('product-service');

// Middleware (al inicio del stack)
app.use(metricsMiddleware());

// Endpoint
app.get('/metrics', metricsEndpoint());
```

---

## 🏗️ Arquitectura Completa

```
Request
  ↓
[metricsMiddleware]        → Prometheus (count, duration, active)
  ↓
[requestId]                → Genera/propaga correlation ID
  ↓
[withLogger]               → Attach req.log con requestId
  ↓
[accessLog]                → Log HTTP access
  ↓
[globalRateLimiter]        → Rate limit por IP (1000/15min)
  ↓
[authenticate]             → JWT validation
  ↓
[userRateLimiter]          → Rate limit por user (500/15min)
  ↓
[validateQuery/Body]       → Joi validation
  ↓
[Routes with asyncHandler] → Business logic
  ↓
[notFoundHandler]          → 404 para rutas no definidas
  ↓
[errorHandler]             → Error global handler
  ↓
Response (con headers X-RateLimit-*, métricas registradas)
```

---

## 📦 Integración Completa en un Servicio

### Ejemplo: Product Service

```javascript
// microservices/product-service/src/app.js
const express = require('express');
const redis = require('redis');

// Logging
const { createLogger } = require('../../../shared/logging/logger');
const { accessLog } = require('../../../shared/middleware/access-log');
const { requestId, withLogger } = require('../../../shared/middleware/request-id');

// Error Handling
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/error-handler');

// Rate Limiting
const { globalRateLimiter, userRateLimiter } = require('../../../shared/middleware/rate-limiter');

// Validation
const { validateBody, validateQuery } = require('../../../shared/middleware/validator');

// Metrics
const { initMetrics, metricsMiddleware, metricsEndpoint } = require('../../../shared/middleware/metrics');

const app = express();

// ═══════════════════════════════════════════════════════════════
// 1. INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

const logger = createLogger('product-service');
const redisClient = await redis.createClient().connect();
const { registry, metrics } = initMetrics('product-service');

// ═══════════════════════════════════════════════════════════════
// 2. MIDDLEWARE STACK (ORDEN IMPORTANTE)
// ═══════════════════════════════════════════════════════════════

// Métricas (primero para medir todo)
app.use(metricsMiddleware());

// Logging y correlación
app.use(requestId());
app.use(withLogger(logger));
app.use(accessLog(logger));

// Parsing
app.use(express.json());

// Rate limiting (nivel global)
app.use(globalRateLimiter(redisClient));

// Autenticación (extrae req.user)
app.use(authenticate);

// Rate limiting (nivel usuario)
app.use(userRateLimiter(redisClient));

// ═══════════════════════════════════════════════════════════════
// 3. RUTAS
// ═══════════════════════════════════════════════════════════════

router.post('/products',
  validateBody(createProductSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ data: product });
  })
);

router.get('/products',
  validateQuery(schemas.productFilters),
  asyncHandler(async (req, res) => {
    const products = await Product.find();
    res.json({ data: products });
  })
);

app.use('/api/products', router);

// Health checks
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/metrics', metricsEndpoint());

// ═══════════════════════════════════════════════════════════════
// 4. ERROR HANDLING (AL FINAL)
// ═══════════════════════════════════════════════════════════════

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
```

---

## 📊 Métricas Disponibles

### HTTP Metrics
```
http_request_duration_seconds{method, route, status_code}
http_requests_total{method, route, status_code}
http_requests_active{method}
http_request_size_bytes{method, route}
http_response_size_bytes{method, route, status_code}
```

### Error Metrics
```
errors_total{type, status_code, route}
validation_errors_total{source, field}
```

### Rate Limiting Metrics
```
rate_limit_hits_total{scope, identifier_type}
rate_limit_blocks_total{scope, identifier_type}
rate_limit_bypass_total{reason}
```

### Database Metrics
```
db_query_duration_seconds{operation, collection}
db_connections_active{type}
```

### Business Metrics
```
business_operations_total{operation, status}
business_operation_duration_seconds{operation}
```

---

## 🛠️ Uso del Helper de Métricas

```javascript
const { getMetricsHelper } = require('../../../shared/middleware/metrics');
const metricsHelper = getMetricsHelper();

// Medir operación de negocio
const result = await metricsHelper.measureOperation('checkout', async () => {
  return await processCheckout(order);
});

// Medir query de BD
const products = await metricsHelper.measureDbQuery('find', 'products', async () => {
  return await Product.find({ category: 'roses' });
});

// Registrar error de validación
metricsHelper.recordValidationError('body', 'email');

// Registrar rate limiting
metricsHelper.recordRateLimitBlock('user', 'userId');
metricsHelper.recordRateLimitBypass('admin');

// Actualizar conexiones de BD
metricsHelper.setDbConnections(10, 'mongodb');
```

---

## 📈 Dashboard Prometheus

### Queries Útiles

**Request rate:**
```promql
rate(http_requests_total[5m])
```

**Latency p95:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Error rate:**
```promql
rate(errors_total[5m])
```

**Active requests:**
```promql
http_requests_active
```

**Rate limit blocks:**
```promql
rate(rate_limit_blocks_total[5m])
```

---

## 🔍 Troubleshooting

### Error: "Metrics not initialized"
```javascript
// Asegurar que initMetrics() se llame antes de usar middleware
const { initMetrics, metricsMiddleware } = require('...');
initMetrics('service-name');
app.use(metricsMiddleware());
```

### Métricas duplicadas entre servicios
```javascript
// Cada servicio debe tener su propio nombre único
initMetrics('product-service'); // ✅
initMetrics('auth-service');    // ✅
// NO usar el mismo nombre en múltiples servicios
```

### Registry vacío en /metrics
```javascript
// Verificar que metricsMiddleware() esté antes de las rutas
app.use(metricsMiddleware()); // ✅ Primero
app.use('/api', routes);      // ✅ Después
```

---

## 📝 Checklist de Integración

### Para cada servicio:

- [ ] **Logging**
  - [ ] Importar `createLogger`, `requestId`, `withLogger`, `accessLog`
  - [ ] Crear logger: `const logger = createLogger('service-name')`
  - [ ] Aplicar: `app.use(requestId())`, `app.use(withLogger(logger))`, `app.use(accessLog(logger))`

- [ ] **Error Handling**
  - [ ] Importar `errorHandler`, `notFoundHandler`, `asyncHandler`
  - [ ] Importar clases de error: `NotFoundError`, `ValidationError`, etc.
  - [ ] Aplicar al final: `app.use(notFoundHandler)`, `app.use(errorHandler)`
  - [ ] Convertir rutas a usar `asyncHandler` y throw errors

- [ ] **Rate Limiting** (si tiene Redis)
  - [ ] Conectar Redis
  - [ ] Importar `globalRateLimiter`, `userRateLimiter`
  - [ ] Aplicar: `app.use(globalRateLimiter(redisClient))`
  - [ ] Aplicar después de auth: `app.use(userRateLimiter(redisClient))`

- [ ] **Validation**
  - [ ] Importar `validateBody`, `validateQuery`, `validateParams`
  - [ ] Crear schemas con Joi o usar `commonSchemas`/`schemas`
  - [ ] Aplicar en rutas: `router.post('/', validateBody(schema), handler)`

- [ ] **Metrics**
  - [ ] Importar `initMetrics`, `metricsMiddleware`, `metricsEndpoint`
  - [ ] Inicializar: `initMetrics('service-name')`
  - [ ] Aplicar al inicio: `app.use(metricsMiddleware())`
  - [ ] Exponer endpoint: `app.get('/metrics', metricsEndpoint())`

---

## 🎯 Resultado Final

Con el stack completo implementado, cada servicio tiene:

✅ **Observabilidad:** Logs estructurados con requestId, métricas Prometheus  
✅ **Confiabilidad:** Error handling consistente, rate limiting, fail open  
✅ **Seguridad:** Validación de inputs, protección brute force  
✅ **Developer Experience:** Código limpio, middleware reutilizable, buena documentación  
✅ **Production Ready:** Health checks, métricas, logging, error handling

---

## 📚 Documentación Completa

1. `shared/ERROR_HANDLING.md` - Error handling y clases de error
2. `shared/RATE_LIMITING.md` - Rate limiting con Redis
3. `shared/VALIDATION.md` - Validación con Joi
4. `shared/LOGGING_GUIDE.md` - Sistema de logging
5. `shared/HEALTH_CHECKS.md` - Health y readiness checks
6. Este archivo - Integración completa del stack

---

**Versión:** 1.0.0  
**Fecha:** 29 de octubre de 2025  
**Estado:** ✅ COMPLETO - Listo para producción
