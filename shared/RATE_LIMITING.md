# Sistema de Rate Limiting Granular con Redis

Sistema avanzado de control de tasa de peticiones con soporte para límites por usuario, endpoint e
IP, con bypass para administradores.

## 📋 Índice

1. [Características](#características)
2. [Arquitectura](#arquitectura)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Uso Básico](#uso-básico)
5. [Rate Limiters Disponibles](#rate-limiters-disponibles)
6. [Ejemplos de Integración](#ejemplos-de-integración)
7. [Headers de Respuesta](#headers-de-respuesta)
8. [Bypass y Excepciones](#bypass-y-excepciones)
9. [Troubleshooting](#troubleshooting)
10. [Mejores Prácticas](#mejores-prácticas)

## Características

✅ **Límites por Usuario:** Tracking basado en userId extraído de JWT  
✅ **Límites por IP:** Fallback para usuarios no autenticados  
✅ **Límites por Endpoint:** Control granular por ruta específica  
✅ **Bypass para Admins:** Excepciones automáticas para usuarios privilegiados  
✅ **Headers Informativos:** `X-RateLimit-*` headers estándar  
✅ **Fail Open:** Si Redis falla, permite requests (no bloquea el servicio)  
✅ **Logging Integrado:** Usa `req.log` para trazabilidad  
✅ **Error Handling:** Lanza `TooManyRequestsError` con metadata

## Arquitectura

```
Request → Rate Limiter Middleware → Redis
                ↓
        Check Count & TTL
                ↓
    ┌───────────┴───────────┐
    │                       │
  Allow                  Block
    │                       │
Set Headers          429 Error
    │
  next()
```

### Scopes de Rate Limiting

| Scope        | Key Pattern                        | Uso                          |
| ------------ | ---------------------------------- | ---------------------------- |
| **user**     | `rl:user:{userId}`                 | Usuarios autenticados        |
| **ip**       | `rl:ip:{ipAddress}`                | Usuarios anónimos o fallback |
| **endpoint** | `rl:endpoint:{id}:{method}:{path}` | Por ruta específica          |

## Instalación y Configuración

### 1. Prerequisitos

Asegurar que Redis esté disponible:

```javascript
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

await redisClient.connect();
```

### 2. Importar Rate Limiter

```javascript
const {
  globalRateLimiter,
  userRateLimiter,
  authRateLimiter,
  strictRateLimiter,
  customRateLimiter,
} = require('../../../shared/middleware/rate-limiter');
```

### 3. Variables de Entorno (Opcional)

```bash
# .env
INTERNAL_API_KEY=secret_key_for_service_to_service  # Para bypass interno
```

## Uso Básico

### Rate Limiter Global (Por IP)

Aplicar a toda la aplicación:

```javascript
const { globalRateLimiter } = require('../../../shared/middleware/rate-limiter');

// En app.js
app.use(globalRateLimiter(redisClient));
```

**Configuración por defecto:**

- Ventana: 15 minutos
- Máximo: 1000 requests
- Scope: IP

### Rate Limiter por Usuario

Para usuarios autenticados (requiere middleware de autenticación primero):

```javascript
const { userRateLimiter } = require('../../../shared/middleware/rate-limiter');

// En app.js, DESPUÉS del middleware de autenticación
app.use(authenticate); // JWT middleware
app.use(userRateLimiter(redisClient));
```

**Configuración por defecto:**

- Ventana: 15 minutos
- Máximo: 500 requests
- Scope: User (fallback a IP si no autenticado)

## Rate Limiters Disponibles

### 1. `globalRateLimiter(redisClient)`

Rate limiter básico por IP. Límites generosos para no afectar usuarios legítimos.

```javascript
app.use(globalRateLimiter(redisClient));
```

**Límites:** 1000 requests / 15 minutos

### 2. `userRateLimiter(redisClient)`

Rate limiter por usuario autenticado. Más restrictivo que el global.

```javascript
app.use(userRateLimiter(redisClient));
```

**Límites:** 500 requests / 15 minutos

### 3. `authRateLimiter(redisClient)`

Rate limiter para endpoints de autenticación. Previene brute force attacks.

```javascript
const { authRateLimiter } = require('../../../shared/middleware/rate-limiter');

router.post('/login', authRateLimiter(redisClient), loginController);
router.post('/register', authRateLimiter(redisClient), registerController);
```

**Límites:** 5 requests / 15 minutos  
**Scope:** IP (para evitar bypass sin autenticación)

### 4. `strictRateLimiter(redisClient)`

Rate limiter muy restrictivo para operaciones críticas.

```javascript
router.post('/admin/delete-all', strictRateLimiter(redisClient), deleteAllController);
```

**Límites:** 10 requests / 1 minuto  
**Scope:** Endpoint

### 5. `customRateLimiter(redisClient, options)`

Rate limiter personalizado con opciones flexibles.

```javascript
const { customRateLimiter } = require('../../../shared/middleware/rate-limiter');

const searchLimiter = customRateLimiter(redisClient, {
  windowMs: 60 * 1000, // 1 minuto
  max: 30,
  keyPrefix: 'rl:search',
  scope: 'user',
});

router.get('/search', searchLimiter, searchController);
```

**Opciones:**

- `windowMs`: Ventana de tiempo en ms
- `max`: Máximo de requests por ventana
- `keyPrefix`: Prefijo para keys de Redis
- `scope`: 'user', 'ip', o 'endpoint'

## Ejemplos de Integración

### Ejemplo 1: Auth Service Completo

```javascript
// microservices/auth-service/src/app.js
const express = require('express');
const redis = require('redis');
const {
  globalRateLimiter,
  authRateLimiter,
  userRateLimiter,
} = require('../../../shared/middleware/rate-limiter');

const app = express();

// Conectar Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
});
await redisClient.connect();

// 1. Rate limiter global (bajo, para no bloquear tráfico legítimo)
app.use(globalRateLimiter(redisClient));

// 2. Middleware de autenticación (extrae userId de JWT)
app.use(authenticate);

// 3. Rate limiter por usuario (más restrictivo)
app.use(userRateLimiter(redisClient));

// 4. Rate limiter estricto en endpoints de auth
app.post('/api/auth/login', authRateLimiter(redisClient), loginController);
app.post('/api/auth/register', authRateLimiter(redisClient), registerController);
app.post('/api/auth/reset-password', authRateLimiter(redisClient), resetPasswordController);

// Otras rutas...
app.use('/api/auth', authRoutes);
```

### Ejemplo 2: Product Service con Límites Diferenciados

```javascript
// microservices/product-service/src/app.js
const { globalRateLimiter, customRateLimiter } = require('../../../shared/middleware/rate-limiter');

// Global limiter
app.use(globalRateLimiter(redisClient));

// Search endpoint: más restrictivo (consumo intensivo)
const searchLimiter = customRateLimiter(redisClient, {
  windowMs: 60 * 1000,
  max: 20,
  keyPrefix: 'rl:search',
  scope: 'user',
});

router.get('/products/search', searchLimiter, searchProducts);

// Create product: muy restrictivo
const createLimiter = customRateLimiter(redisClient, {
  windowMs: 5 * 60 * 1000,
  max: 10,
  keyPrefix: 'rl:create',
  scope: 'user',
});

router.post('/products', authenticate, createLimiter, createProduct);
```

### Ejemplo 3: API Gateway con Múltiples Niveles

```javascript
// microservices/api-gateway/src/app.js
const { globalRateLimiter, userRateLimiter } = require('../../../shared/middleware/rate-limiter');

// Nivel 1: Rate limiter global muy generoso (prevenir DDoS)
app.use(globalRateLimiter(redisClient));

// Nivel 2: Rate limiter por usuario (después de autenticación)
app.use('/api', authenticate);
app.use('/api', userRateLimiter(redisClient));

// Nivel 3: Rate limiters específicos por servicio
const authLimiter = customRateLimiter(redisClient, {
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: 'rl:gateway:auth',
  scope: 'ip',
});

app.use('/api/auth/login', authLimiter);
```

## Headers de Respuesta

Todos los rate limiters agregan headers informativos:

### Headers en Requests Permitidos

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1698765432000
```

### Headers en Requests Bloqueados (429)

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1698765432000
Retry-After: 847
```

**Descripción:**

- `X-RateLimit-Limit`: Máximo de requests permitidos
- `X-RateLimit-Remaining`: Requests restantes en la ventana actual
- `X-RateLimit-Reset`: Timestamp (ms) cuando se resetea el contador
- `Retry-After`: Segundos hasta que se puede reintentar

### Ejemplo de Respuesta 429

```json
{
  "status": "error",
  "message": "Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.",
  "metadata": {
    "limit": 100,
    "current": 105,
    "window": "900s",
    "retryAfter": 847,
    "resetTime": 1698765432000
  },
  "requestId": "req_abc123"
}
```

## Bypass y Excepciones

### Usuarios con Bypass Automático

El rate limiting se omite automáticamente para:

1. **Administradores**: `req.user.role === 'admin'` o `req.user.isAdmin === true`
2. **Servicios Internos**: Header `X-API-Key` con valor de `INTERNAL_API_KEY` env var
3. **Health Checks**: Rutas `/health`, `/ready`, `/metrics`

### Implementación de Bypass

```javascript
// El bypass es automático, pero puedes verificarlo manualmente:
const { shouldBypass } = require('../../../shared/middleware/rate-limiter');

if (shouldBypass(req)) {
  // Request no está sujeto a rate limiting
}
```

### Agregar Bypass Personalizado

Modificar `shouldBypass()` en `shared/middleware/rate-limiter.js`:

```javascript
function shouldBypass(req) {
  // ... código existente ...

  // Bypass personalizado: usuarios premium
  if (req.user && req.user.plan === 'premium') {
    return true;
  }

  return false;
}
```

## Troubleshooting

### Problema: Rate Limiter No Funciona

**Síntomas:** Requests no son bloqueados a pesar de exceder límites

**Causas posibles:**

1. Redis no está conectado
2. Usuario tiene bypass automático (admin, API key interna)
3. Middleware no está en el orden correcto

**Solución:**

```javascript
// Verificar conexión Redis
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Verificar orden de middleware
app.use(globalRateLimiter(redisClient)); // ✅ Correcto
app.use(authenticate); // ✅ Después del rate limiter global
app.use(userRateLimiter(redisClient)); // ✅ Después de authenticate
```

### Problema: Todos los Requests Retornan 429

**Síntomas:** Incluso el primer request está bloqueado

**Causas posibles:**

1. Límite configurado demasiado bajo (`max: 0` o `max: 1`)
2. Redis tiene keys antiguas con TTL incorrecto

**Solución:**

```bash
# Limpiar keys de rate limiting en Redis
redis-cli KEYS "rl:*" | xargs redis-cli DEL
```

```javascript
// Verificar configuración
const limiter = customRateLimiter(redisClient, {
  max: 100, // ✅ Asegurar que sea > 0
  windowMs: 60000,
});
```

### Problema: Rate Limiting No Persiste Entre Restarts

**Síntomas:** Contadores se resetean al reiniciar el servicio

**Causa:** Redis no está siendo usado correctamente (está usando memoria local)

**Solución:** Verificar que `redisClient` esté conectado:

```javascript
// ❌ Incorrecto
const limiter = globalRateLimiter(); // Falta redisClient

// ✅ Correcto
const limiter = globalRateLimiter(redisClient);
```

### Problema: Error "Cannot read property 'incr' of undefined"

**Causa:** Redis client no está pasado o no está conectado

**Solución:**

```javascript
const redisClient = redis.createClient();
await redisClient.connect(); // ✅ Importante: conectar antes de usar

app.use(globalRateLimiter(redisClient));
```

## Mejores Prácticas

### ✅ Hacer

1. **Usar múltiples niveles de rate limiting**

   ```javascript
   app.use(globalRateLimiter(redisClient)); // Nivel 1: Global
   app.use(userRateLimiter(redisClient));   // Nivel 2: Por usuario
   router.post('/critical', strictRateLimiter(redisClient), ...); // Nivel 3: Específico
   ```

2. **Aplicar límites estrictos en endpoints sensibles**

   ```javascript
   // Auth endpoints (prevenir brute force)
   router.post('/login', authRateLimiter(redisClient), ...);

   // Admin endpoints
   router.delete('/users/:id', strictRateLimiter(redisClient), ...);
   ```

3. **Configurar límites apropiados por tipo de operación**

   ```javascript
   // Read operations: generoso
   const readLimiter = customRateLimiter(redisClient, { max: 500 });

   // Write operations: restrictivo
   const writeLimiter = customRateLimiter(redisClient, { max: 50 });

   // Search/expensive operations: muy restrictivo
   const searchLimiter = customRateLimiter(redisClient, { max: 20, windowMs: 60000 });
   ```

4. **Logging para debugging**

   ```javascript
   // El rate limiter loggea automáticamente cuando está cerca del límite
   // Revisar logs: "Rate limit warning" indica que un usuario está cerca del límite
   ```

5. **Monitorear métricas de rate limiting**
   ```javascript
   // TODO: Integrar con Prometheus
   // Métricas útiles:
   // - rate_limit_hits_total
   // - rate_limit_blocks_total
   // - rate_limit_bypass_total
   ```

### ❌ Evitar

1. **No usar rate limiting sin Redis**

   ```javascript
   // ❌ Malo: express-rate-limit sin store (usa memoria local)
   const limiter = rateLimit({ max: 100 });

   // ✅ Bueno: Redis-backed rate limiting
   const limiter = globalRateLimiter(redisClient);
   ```

2. **No bloquear servicios internos**

   ```javascript
   // ✅ Asegurar que health checks y métricas tengan bypass
   // (ya implementado automáticamente en shouldBypass)
   ```

3. **No usar límites demasiado restrictivos sin pruebas**

   ```javascript
   // ❌ Muy restrictivo para API pública
   const limiter = customRateLimiter(redisClient, { max: 5, windowMs: 60000 });

   // ✅ Empezar con límites generosos y ajustar según datos
   const limiter = customRateLimiter(redisClient, { max: 100, windowMs: 60000 });
   ```

4. **No ignorar errores de Redis**
   ```javascript
   redisClient.on('error', (err) => {
     logger.error('Redis error', { error: err.message });
     // El rate limiter hace "fail open" automáticamente
   });
   ```

## Configuración Recomendada por Tipo de Servicio

### Auth Service

```javascript
// Global: prevenir DDoS
app.use(globalRateLimiter(redisClient));

// Login/Register: prevenir brute force
router.post('/login', authRateLimiter(redisClient), ...);
router.post('/register', authRateLimiter(redisClient), ...);

// Password reset: muy restrictivo
const resetLimiter = customRateLimiter(redisClient, {
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
});
router.post('/reset-password', resetLimiter, ...);
```

### Product Service (Público)

```javascript
// Global generoso (tráfico anónimo)
app.use(globalRateLimiter(redisClient));

// Search: restrictivo (operación costosa)
const searchLimiter = customRateLimiter(redisClient, {
  windowMs: 60 * 1000,
  max: 30,
  scope: 'ip',
});
router.get('/products/search', searchLimiter, ...);

// Create/Update/Delete: requiere autenticación + límite por usuario
router.post('/products', authenticate, userRateLimiter(redisClient), ...);
```

### Admin Service (Interno)

```javascript
// Global básico
app.use(globalRateLimiter(redisClient));

// No aplicar user rate limiter (admins tienen bypass automático)
// Solo aplicar límites estrictos en operaciones destructivas

const deleteLimiter = customRateLimiter(redisClient, {
  windowMs: 5 * 60 * 1000,
  max: 5,
  scope: 'user',
});
router.delete('/admin/delete-all', deleteLimiter, ...);
```

## Integración con Otros Sistemas

### Con Error Handling

El rate limiter lanza `TooManyRequestsError` que es capturado automáticamente por el error handler:

```javascript
// No requiere código adicional, ya integrado
const { errorHandler } = require('../../../shared/middleware/error-handler');
app.use(errorHandler); // Captura TooManyRequestsError automáticamente
```

### Con Logging

El rate limiter usa `req.log` automáticamente:

```javascript
// Logs generados:
// - "Rate limit bypassed" (debug) - cuando hay bypass
// - "Rate limit warning" (info) - cuando está cerca del límite (>80%)
// - "Rate limit exceeded" (warn) - cuando se bloquea el request
// - "Rate limiter error" (error) - cuando Redis falla
```

### Con Métricas (Pendiente - Fase D)

```javascript
// TODO: Agregar contadores Prometheus
// - rate_limit_requests_total{service, endpoint, status}
// - rate_limit_blocks_total{service, scope}
// - rate_limit_bypass_total{service, reason}
```

## Referencias

- Implementación: `shared/middleware/rate-limiter.js`
- Error Handling: `shared/ERROR_HANDLING.md`
- Logging: `shared/LOGGING_GUIDE.md`
- Health Checks: `shared/HEALTH_CHECKS.md`
