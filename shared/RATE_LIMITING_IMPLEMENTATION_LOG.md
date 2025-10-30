# Implementación Completada: Rate Limiting Granular con Redis

**Fecha:** 29 de octubre de 2025  
**Parte de:** Mejoras de Observabilidad y Confiabilidad (Fase B de 4)

## ✅ Trabajo Completado

### 1. Infraestructura Compartida Creada

#### `shared/middleware/rate-limiter.js`
Sistema completo de rate limiting con Redis que incluye:

- ✅ **Función principal:** `createRateLimiter(redisClient, options)`
  - Soporte para múltiples scopes: 'user', 'ip', 'endpoint'
  - Headers informativos: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  - Retry-After header en respuestas 429
  - TTL automático en Redis con expiración
  - Fail open: permite requests si Redis falla (alta disponibilidad)

- ✅ **Rate limiters predefinidos:**
  - `globalRateLimiter()` - 1000 req/15min por IP
  - `userRateLimiter()` - 500 req/15min por usuario (fallback a IP)
  - `authRateLimiter()` - 5 req/15min por IP (brute force prevention)
  - `strictRateLimiter()` - 10 req/1min por endpoint
  - `customRateLimiter()` - Configuración flexible

- ✅ **Sistema de bypass:**
  - Admins: `req.user.role === 'admin'` o `req.user.isAdmin`
  - Servicios internos: Header `X-API-Key` con `INTERNAL_API_KEY`
  - Health checks: `/health`, `/ready`, `/metrics`

- ✅ **Utilidades:**
  - `getUserId(req)` - Extrae userId de JWT
  - `getClientIp(req)` - Extrae IP considerando proxies (x-forwarded-for)
  - `shouldBypass(req)` - Determina si aplica bypass

- ✅ **Integración con sistema existente:**
  - Usa `TooManyRequestsError` del error handling (Fase A)
  - Logging con `req.log` del sistema de logging
  - Metadata estructurada en errores

- ✅ **Sintaxis validada:** `node --check` pasó correctamente

### 2. Documentación Completa

#### `shared/RATE_LIMITING.md` (Creado)
Documentación exhaustiva con:

- ✅ **Características y arquitectura**
  - Diagrama de flujo del rate limiter
  - Tabla de scopes y patrones de keys en Redis
  
- ✅ **Guía de instalación**
  - Setup de Redis
  - Configuración de variables de entorno
  
- ✅ **Rate limiters disponibles**
  - Descripción de cada limiter predefinido
  - Límites por defecto y uso recomendado
  
- ✅ **Ejemplos de integración completos**
  - Auth Service con múltiples niveles
  - Product Service con límites diferenciados
  - API Gateway con cascada de limiters
  
- ✅ **Headers de respuesta**
  - Documentación de headers estándar
  - Ejemplo de respuesta 429 con metadata
  
- ✅ **Sistema de bypass**
  - Usuarios con bypass automático
  - Cómo agregar bypass personalizado
  
- ✅ **Troubleshooting**
  - Problemas comunes y soluciones
  - Comandos de debugging
  
- ✅ **Mejores prácticas**
  - Patrones recomendados
  - Anti-patrones a evitar
  - Configuración por tipo de servicio

### 3. Ejemplos de Integración

#### `shared/examples/cart-service-rate-limiting-integration.js` (Creado)
Ejemplo completo que muestra:

- ✅ Migración de express-rate-limit a rate-limiter con Redis
- ✅ Múltiples niveles de rate limiting (global → user → endpoint)
- ✅ Rate limiters personalizados para operaciones específicas
- ✅ Comparación ANTES vs DESPUÉS con análisis de beneficios
- ✅ Ejemplo de respuesta 429 con todos los headers

## 📊 Características Implementadas

| Característica | Estado | Descripción |
|----------------|--------|-------------|
| Redis Storage | ✅ | Contador compartido entre instancias |
| User-based Limiting | ✅ | Límites por userId extraído de JWT |
| IP-based Limiting | ✅ | Fallback para usuarios no autenticados |
| Endpoint-based Limiting | ✅ | Límites granulares por ruta |
| Admin Bypass | ✅ | Admins no sujetos a límites |
| Service Bypass | ✅ | API Key para servicios internos |
| Health Check Bypass | ✅ | /health, /ready, /metrics excluidos |
| Informative Headers | ✅ | X-RateLimit-*, Retry-After |
| Fail Open | ✅ | Permite requests si Redis falla |
| Logging Integration | ✅ | Usa req.log con requestId |
| Error Integration | ✅ | Lanza TooManyRequestsError |
| Custom Configuration | ✅ | customRateLimiter con opciones flexibles |

## 🎯 Límites por Defecto Configurados

```javascript
DEFAULT_LIMITS = {
  global: {
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 1000,                  // 1000 requests
  },
  perUser: {
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 500,                   // 500 requests
  },
  strict: {
    windowMs: 60 * 1000,       // 1 minuto
    max: 10,                    // 10 requests
  },
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 5,                     // 5 requests (brute force protection)
  },
}
```

## 🔍 Headers de Respuesta Implementados

### En requests permitidos:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1698765432000
```

### En requests bloqueados (429):
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1698765432000
Retry-After: 847
```

### Respuesta JSON:
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

## 🧪 Validación Realizada

### Validación de Sintaxis
- ✅ `shared/middleware/rate-limiter.js` - Sintaxis válida
- ✅ Todas las funciones exportadas correctamente
- ✅ Importaciones de dependencias correctas

### Validación de Funcionalidad (Teórica)
- ✅ **Incremento de contador:** `redisClient.incr(key)` con TTL automático
- ✅ **Extracción de userId:** Desde `req.user.id` o `req.user.userId`
- ✅ **Extracción de IP:** Considera headers de proxy (x-forwarded-for)
- ✅ **Bypass logic:** Verifica role, API key, y rutas de health
- ✅ **Error handling:** Lanza TooManyRequestsError con metadata completa
- ✅ **Fail open:** Permite requests si Redis.incr falla

## 🚀 Casos de Uso Soportados

### 1. Prevención de Brute Force
```javascript
router.post('/login', authRateLimiter(redisClient), loginController);
// Límite: 5 intentos cada 15 minutos por IP
```

### 2. Protección de Operaciones Costosas
```javascript
const searchLimiter = customRateLimiter(redisClient, {
  windowMs: 60000,
  max: 20,
  scope: 'user',
});
router.get('/search', searchLimiter, searchController);
// Límite: 20 búsquedas por minuto por usuario
```

### 3. Control de Creación de Recursos
```javascript
const createLimiter = customRateLimiter(redisClient, {
  windowMs: 5 * 60 * 1000,
  max: 10,
  scope: 'user',
});
router.post('/products', authenticate, createLimiter, createProduct);
// Límite: 10 productos cada 5 minutos por usuario
```

### 4. API Gateway con Múltiples Niveles
```javascript
// Nivel 1: Global anti-DDoS
app.use(globalRateLimiter(redisClient));

// Nivel 2: Por usuario
app.use('/api', authenticate);
app.use('/api', userRateLimiter(redisClient));

// Nivel 3: Por endpoint crítico
app.post('/api/auth/login', authRateLimiter(redisClient), ...);
```

## 📝 Formato de Keys en Redis

```
# Por usuario
rl:user:{userId}

# Por IP
rl:ip:{ipAddress}

# Por endpoint
rl:endpoint:{userId|IP}:{method}:{path}

# Custom (con keyPrefix personalizado)
rl:search:user:{userId}
rl:cart:add:user:{userId}
rl:checkout:user:{userId}
```

## 🔗 Integración con Otros Sistemas

### Error Handling (Fase A)
- ✅ Usa `TooManyRequestsError` con statusCode 429
- ✅ Metadata estructurada: limit, current, window, retryAfter, resetTime
- ✅ Capturado automáticamente por `errorHandler`

### Logging
- ✅ Usa `req.log.debug()` para bypass
- ✅ Usa `req.log.info()` para warnings (>80% del límite)
- ✅ Usa `req.log.warn()` para límite excedido
- ✅ Usa `req.log.error()` para errores de Redis
- ✅ Todos los logs incluyen `requestId` automáticamente

### Health Checks
- ✅ Rutas de health automáticamente exentas de rate limiting
- ⚠️ **Pendiente:** Agregar métrica de disponibilidad de Redis

### Métricas (Fase D - Pendiente)
- ⚠️ Pendiente: Contador `rate_limit_requests_total`
- ⚠️ Pendiente: Contador `rate_limit_blocks_total`
- ⚠️ Pendiente: Contador `rate_limit_bypass_total`

## 🛠️ Próximos Pasos (Opcionales)

### Para Completar Rate Limiting
1. Integrar en auth-service (requiere agregar Redis)
2. Integrar en product-service (requiere agregar Redis)
3. Integrar en order-service (requiere agregar Redis)
4. Integrar en cart-service (ya tiene Redis, solo aplicar nuevos limiters)
5. Crear tests unitarios para rate-limiter.js
6. Crear tests de integración con Redis mock

### Para Continuar con el Plan de 4 Fases
**✅ Fase A Completada:** Error Handling Estandarizado  
**✅ Fase B Completada:** Rate Limiting Granular con Redis

**Siguiente: Fase C - Validación de Requests**
- Schemas con Joi o Zod
- Validación de body, query params, headers
- Mensajes de error descriptivos
- Integración con error handling existente

## 📂 Archivos Creados/Modificados

### Creados
1. `shared/middleware/rate-limiter.js` - Implementación completa (291 líneas)
2. `shared/RATE_LIMITING.md` - Documentación (600+ líneas)
3. `shared/examples/cart-service-rate-limiting-integration.js` - Ejemplo de integración

### Sin Modificar (Implementación Lista para Uso)
- Servicios existentes no modificados (integración opcional)
- Redis ya disponible en: cart-service
- Redis pendiente en: auth-service, product-service, order-service, user-service

## ✨ Beneficios Obtenidos

1. **Escalabilidad:** Redis compartido entre todas las instancias del servicio
2. **Granularidad:** Diferentes límites por usuario, IP, y endpoint
3. **Seguridad:** Protección contra brute force y DDoS
4. **Observabilidad:** Headers informativos y logging detallado
5. **Flexibilidad:** Bypass para admins y servicios internos
6. **Confiabilidad:** Fail open si Redis no está disponible
7. **Consistencia:** Integrado con error handling y logging existentes
8. **Developer Experience:** Múltiples factories para casos comunes

## 🔍 Diferencias vs Express-Rate-Limit Básico

| Característica | express-rate-limit | Rate Limiter con Redis |
|----------------|-------------------|------------------------|
| Storage | Memoria local | Redis (compartido) |
| Límites por usuario | ❌ | ✅ |
| Bypass para admins | ❌ | ✅ |
| Múltiples scopes | ❌ | ✅ (user/ip/endpoint) |
| Headers informativos | Básicos | Completos (X-RateLimit-*) |
| Fail open | ❌ | ✅ |
| Logging integrado | ❌ | ✅ |
| Metadata en errores | ❌ | ✅ |
| Configuración flexible | Limitada | Alta (customRateLimiter) |

## 📊 Resumen Estadístico

- **Archivos creados:** 3
- **Líneas de código:** ~291 (rate-limiter.js)
- **Líneas de documentación:** ~600 (RATE_LIMITING.md)
- **Rate limiters predefinidos:** 5
- **Scopes soportados:** 3 (user, ip, endpoint)
- **Headers implementados:** 4 (X-RateLimit-Limit, Remaining, Reset, Retry-After)
- **Métodos de bypass:** 3 (admin, API key, health checks)
- **Validación:** Sintaxis ✅

---

**Estado:** ✅ COMPLETADO  
**Listo para:** Integración en servicios que tengan Redis  
**Siguiente Fase:** C - Validación de Requests con Joi/Zod
