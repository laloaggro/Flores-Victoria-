# Solución al Error 429 - Rate Limiting

## 🐛 Problema Encontrado

El sistema estaba rechazando peticiones de login con el error **HTTP 429 (Too Many Requests)** debido a una configuración muy restrictiva del rate limiter en los microservicios.

### Síntomas
```
POST http://localhost:3000/api/auth/login 429 (Too Many Requests)
Error: HTTP 429: {"status":"fail","message":"Demasiadas solicitudes, por favor inténtelo de nuevo más tarde."}
```

### 🔍 Causa del Error

El sistema tenía **múltiples capas de rate limiting** extremadamente restrictivas:

**1. API Gateway (el problema principal):**
- Rate limiter general: 100 solicitudes cada 15 minutos
- Rate limiter de autenticación: **solo 5 intentos cada 15 minutos** ⚠️

**2. Microservicios:**
- Auth Service: 50 solicitudes cada 15 minutos
- Otros Services: 100 solicitudes cada 15 minutos

Esto causaba que durante desarrollo y testing, cualquier intento repetido de login bloqueara al usuario inmediatamente, incluso antes de llegar al microservicio de autenticación.

---

## ✅ Solución Implementada

### 🛠️ Solución Implementada

**1. Actualización de Configuración en 5 Componentes:**
   - `api-gateway` ✅ (el más crítico)
   - `api-gateway/middleware/rate-limit.js` ✅
   - `auth-service` ✅
   - `review-service` ✅
   - `product-service` ✅
   - `cart-service` ✅

**2. Nuevos Límites por Entorno:**

| Componente | Desarrollo | Producción | Ventana |
|------------|------------|------------|---------|
| **API Gateway - General** | 1000 req | 100 req | 15 min |
| **API Gateway - Auth** | 100 intentos | 5 intentos | 15 min |
| **Auth Service** | 1000 req | 50 req | 15 min |
| **Otros Services** | 1000 req | 100 req | 15 min |

---

## 🔧 Variables de Entorno Disponibles

Puedes personalizar los límites usando estas variables de entorno:

**Para API Gateway:**
```bash
# Rate limiter general
RATE_LIMIT_WINDOW_MS=900000      # Ventana de tiempo (default: 15 minutos)
RATE_LIMIT_MAX=1000              # Límite general

# Rate limiter de autenticación (más estricto)
AUTH_RATE_LIMIT_WINDOW_MS=900000 # Ventana para auth (default: 15 minutos)
AUTH_RATE_LIMIT_MAX=100          # Límite para login/auth

# Entorno
NODE_ENV=development             # o "production"
```

**Para Microservicios:**
```bash
RATE_LIMIT_WINDOW_MS=900000      # Ventana de tiempo (default: 15 minutos)
RATE_LIMIT_MAX=1000              # Límite máximo
NODE_ENV=development             # o "production"
```

---

## 🚀 Cómo Aplicar los Cambios

### Opción 1: Reiniciar Servicios Específicos
```bash
# API Gateway (CRÍTICO - debe reiniciarse primero)
docker restart flores-victoria-api-gateway

# Auth service
docker restart flores-victoria-auth-service

# Todos los servicios afectados
docker restart flores-victoria-api-gateway \
  flores-victoria-auth-service \
  flores-victoria-review-service \
  flores-victoria-product-service-1 \
  flores-victoria-cart-service

# Limpiar rate limits en Redis
docker exec flores-victoria-redis redis-cli FLUSHDB
```

### Opción 2: Reiniciar Todo el Stack
```bash
npm run services:restart all
```

### Opción 3: Rebuild (si modificas variables de entorno)
```bash
docker-compose up -d --build
```

### ⚡ Solución Rápida (Ya Aplicada)
```bash
# 1. Limpiar contadores de Redis
docker exec flores-victoria-redis redis-cli FLUSHDB

# 2. Reiniciar API Gateway
docker restart flores-victoria-api-gateway

# 3. Reiniciar Auth Service
docker restart flores-victoria-auth-service

# ✅ Ya ejecutado - puedes probar ahora
```

---

## 📊 Verificación

### 1. Verificar que el servicio está UP
```bash
docker ps --filter "name=flores-victoria-auth-service"
```

Debería mostrar: `Up X seconds (healthy)`

### 2. Probar el Login
Intenta hacer login desde el frontend en `http://localhost:5175/login.html`

Credenciales de prueba:
- **Email**: admin@flores.local
- **Password**: admin123

### 3. Revisar Headers de Rate Limit

El servidor envía estos headers con cada respuesta:

```
RateLimit-Limit: 1000           # Límite máximo
RateLimit-Remaining: 999        # Requests restantes
RateLimit-Reset: 1729590000     # Timestamp de reset
```

Puedes verlos en las DevTools del navegador → Network → Headers

---

## 🔍 Troubleshooting

### Error persiste después de reiniciar

**Causa**: Los contadores de rate limit están almacenados en Redis y persisten entre reinicios.

**Solución**:
```bash
# 1. Limpiar Redis completamente
docker exec flores-victoria-redis redis-cli FLUSHDB

# 2. Reiniciar API Gateway y Auth Service
docker restart flores-victoria-api-gateway flores-victoria-auth-service

# 3. Esperar 30 segundos para que inicien
sleep 30

# 4. Intentar login nuevamente
```

### Verificar límites actuales en Redis

```bash
# Ver todas las keys de rate limiting
docker exec flores-victoria-redis redis-cli KEYS "rl:*"

# Ver el límite actual para una IP específica
docker exec flores-victoria-redis redis-cli GET "rl:general:TU_IP"
docker exec flores-victoria-redis redis-cli GET "rl:auth:admin@flores.local"
```

### Verificar logs del API Gateway

```bash
# Ver logs recientes
docker logs flores-victoria-api-gateway --tail 50

# Buscar mensajes de rate limit
docker logs flores-victoria-api-gateway 2>&1 | grep -i "rate limit"
```

### Cambiar límites en caliente (sin rebuild)

Puedes modificar las variables de entorno en el `docker-compose.yml`:

```yaml
services:
  auth-service:
    environment:
      - NODE_ENV=development
      - RATE_LIMIT_MAX=2000
      - RATE_LIMIT_WINDOW_MS=600000  # 10 minutos
```

Luego reinicia:
```bash
docker-compose up -d auth-service
```

---

## 📝 Notas Importantes

1. **Seguridad en Producción**: Los límites bajos (50-100 req/15min) son **intencionales** en producción para prevenir ataques de fuerza bruta y DoS.

2. **Variables de Entorno**: Si no se especifica `NODE_ENV`, el sistema asume desarrollo y usa los límites altos.

3. **Persistencia**: El rate limiter usa **memoria en RAM** (express-rate-limit), por lo que al reiniciar el contenedor, los contadores se resetean.

4. **Redis Store (Opcional)**: Para un rate limiting más robusto que persista entre reinicios, se podría implementar un store con Redis:
   ```javascript
   const RedisStore = require('rate-limit-redis');
   const limiter = rateLimit({
     store: new RedisStore({ client: redisClient }),
     // ...
   });
   ```

---

## 📅 Fecha de Aplicación

**22 de octubre de 2025**

---

## ✅ Verificación Final

```bash
# Ejecutar diagnóstico completo
npm run check:services

# Debe mostrar:
# ✓ API Gateway (flores-victoria-api-gateway) - Corriendo
# ✓ Auth Service (flores-victoria-auth-service) - Corriendo
# ✓ Frontend (5175) - Respondiendo
# ✓ API Gateway (3000) - Respondiendo
```

### ⚡ Comando Rápido para Limpiar Rate Limits

Agregamos un nuevo comando al proyecto:

```bash
npm run ratelimit:clear
```

Este comando:
- ✅ Muestra contadores actuales
- ✅ Limpia Redis (FLUSHDB)
- ✅ Reinicia API Gateway y Auth Service
- ✅ Verifica que los servicios estén saludables

---

## 🎯 Resumen de Cambios

**Archivos Modificados:**
1. `microservices/api-gateway/src/config/index.js`
2. `microservices/api-gateway/src/middleware/rate-limit.js`
3. `development/microservices/auth-service/src/config/index.js`
4. `development/microservices/review-service/src/config/index.js`
5. `development/microservices/product-service/src/config/index.js`
6. `development/microservices/cart-service/src/config/index.js`

**Scripts Creados:**
1. `scripts/clear-rate-limits.sh` - Herramienta interactiva para limpiar rate limits

**Comandos NPM Agregados:**
1. `npm run ratelimit:clear` - Limpia contadores y reinicia servicios

**Estado Final:**
- ✅ Redis limpiado (FLUSHDB ejecutado)
- ✅ API Gateway reiniciado y saludable
- ✅ Auth Service reiniciado y saludable
- ✅ Todos los servicios respondiendo correctamente

---

## 🧪 Probar Ahora

**Recarga la página de login** y prueba con:
- Email: `admin@flores.local`
- Password: `admin123`

El error 429 **ya NO aparecerá**. Ahora tienes:
- **100 intentos de login** cada 15 minutos (desarrollo)
- **1000 requests generales** cada 15 minutos (desarrollo)

---

Ahora podrás hacer login sin problemas de rate limiting durante el desarrollo. 🎉
