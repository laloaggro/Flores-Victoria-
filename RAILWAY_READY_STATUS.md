# 🚀 Estado de Preparación para Railway

**Fecha**: 26 de Noviembre 2025  
**Autor**: GitHub Copilot  
**Estado**: ✅ 9/10 servicios principales listos

---

## ✅ Servicios Completamente Listos (9/10)

Todos estos servicios tienen:
- ✅ Dockerfiles optimizados (multi-stage builds, Node 22-alpine)
- ✅ Módulo `@flores-victoria/shared` correctamente integrado
- ✅ Health endpoints funcionando
- ✅ Rate limiting configurado
- ✅ Métricas Prometheus
- ✅ Logs estructurados
- ✅ Docker compose validado localmente

### Lista de Servicios Listos:

| # | Servicio | Puerto | Health Check | Estado |
|---|----------|--------|--------------|--------|
| 1 | api-gateway | 3000 | ✅ healthy | LISTO |
| 2 | auth-service | 3001 | ✅ healthy | LISTO |
| 3 | user-service | 3003 | ✅ OK | LISTO |
| 4 | order-service | 3004 | ✅ healthy | LISTO |
| 5 | cart-service | 3005 | ✅ healthy | LISTO |
| 6 | wishlist-service | 3006 | ✅ healthy | LISTO |
| 7 | review-service | 3007 | ✅ healthy | LISTO |
| 8 | contact-service | 3008 | ✅ healthy | LISTO |
| 9 | product-service | 3009 | ✅ running | LISTO |

---

## 🔧 Configuración Docker

### Patrón de Dockerfile (Todos los servicios)

```dockerfile
# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY {service}/package.json ./
RUN npm install --production && npm cache clean --force
RUN mkdir -p node_modules/@flores-victoria
COPY shared node_modules/@flores-victoria/shared
RUN cd node_modules/@flores-victoria/shared && npm install --production && npm cache clean --force

# Stage 2: Production
FROM node:22-alpine
RUN apk add --no-cache curl dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs {service}/package.json ./
COPY --chown=nodejs:nodejs {service}/src/ ./src/
RUN mkdir -p logs && chown nodejs:nodejs logs
USER nodejs
EXPOSE {port}
HEALTHCHECK CMD curl -f http://localhost:{port}/health || exit 1
CMD ["dumb-init", "node", "src/server.js"]
```

### Docker Compose Context

```yaml
services:
  {service}:
    build:
      context: .          # ← Raíz de microservices/
      dockerfile: {service}/Dockerfile
    environment:
      - NODE_ENV=development
      - JWT_SECRET=${JWT_SECRET}
      # ... otras variables
```

---

## 📦 Módulo Shared

### Ubicación
```
microservices/
  └── shared/
      ├── package.json (con express-rate-limit, ioredis, etc.)
      ├── middleware/
      │   ├── rate-limiter.js (✅ Fixed - constantes, no funciones)
      │   ├── metrics.js (✅ Fixed - retorna {registry})
      │   └── ...
      └── ...
```

### Dependencias Críticas Agregadas

```json
{
  "dependencies": {
    "express-rate-limit": "^7.1.5",
    "ioredis": "^5.3.2",
    "rate-limit-redis": "^4.2.0",
    // ... otras
  }
}
```

---

## 🛠️ Correcciones Aplicadas

### 1. Rate Limiter Error (cart-service)

**Problema**: `ERR_ERL_CREATED_IN_REQUEST_HANDLER` - rate limiters creados en cada request

**Solución**: Convertir de funciones a constantes

```javascript
// ANTES (❌ Malo)
function publicLimiter(customOptions = {}) {
  return createRateLimiter({ tier: 'public', ...customOptions });
}

// DESPUÉS (✅ Correcto)
const publicLimiter = createRateLimiter({ tier: 'public' });
```

**Servicios afectados**: Todos (pero cart-service fue el único con error visible)

### 2. Metrics Registry Error

**Problema**: `cannot destructure 'registry' of undefined`

**Solución**: `initMetrics()` ahora retorna `{registry: register}`

```javascript
// shared/middleware/metrics.js línea 33
return { registry: register };
```

### 3. Dependencias Faltantes

**Problema**: `rate-limit-redis` y `express-rate-limit` no estaban en shared/package.json

**Solución**: Agregadas junto con ioredis

---

## 🌐 Configuración para Railway

### Build Settings (Por Servicio)

```yaml
Build:
  Root Directory: /
  Dockerfile Path: microservices/{service-name}/Dockerfile
  Docker Build Context: microservices
```

### Variables de Entorno Globales

```bash
# Seguridad
NODE_ENV=production
JWT_SECRET=<generar con: openssl rand -base64 32>

# Bases de datos (provistas por Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
MONGODB_URI=${{MongoDB.MONGODB_URI}}
REDIS_URL=${{Redis.REDIS_URL}}
```

### Variables por Servicio

#### API Gateway (Puerto 3000)
```bash
PORT=3000
AUTH_SERVICE_URL=https://auth-service.railway.app
PRODUCT_SERVICE_URL=https://product-service.railway.app
USER_SERVICE_URL=https://user-service.railway.app
ORDER_SERVICE_URL=https://order-service.railway.app
CART_SERVICE_URL=https://cart-service.railway.app
WISHLIST_SERVICE_URL=https://wishlist-service.railway.app
REVIEW_SERVICE_URL=https://review-service.railway.app
CONTACT_SERVICE_URL=https://contact-service.railway.app
```

#### Auth Service (Puerto 3001)
```bash
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=<mismo que api-gateway>
```

#### Product Service (Puerto 3009)
```bash
PORT=3009
MONGODB_URI=${{MongoDB.MONGODB_URI}}/products_db
REDIS_URL=${{Redis.REDIS_URL}}
```

#### User Service (Puerto 3003)
```bash
PORT=3003
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

#### Order Service (Puerto 3004)
```bash
PORT=3004
DATABASE_URL=${{Postgres.DATABASE_URL}}
MONGODB_URI=${{MongoDB.MONGODB_URI}}/orders_db
REDIS_URL=${{Redis.REDIS_URL}}
```

#### Cart Service (Puerto 3005)
```bash
PORT=3005
REDIS_URL=${{Redis.REDIS_URL}}
```

#### Wishlist Service (Puerto 3006)
```bash
PORT=3006
REDIS_URL=${{Redis.REDIS_URL}}
```

#### Review Service (Puerto 3007)
```bash
PORT=3007
MONGODB_URI=${{MongoDB.MONGODB_URI}}/reviews_db
REDIS_URL=${{Redis.REDIS_URL}}
```

#### Contact Service (Puerto 3008)
```bash
PORT=3008
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

---

## 🔍 Validación Local Completada

### Health Checks Realizados

```bash
# Todos respondieron correctamente
curl http://localhost:3000/health  # api-gateway: healthy
curl http://localhost:3001/health  # auth-service: healthy
curl http://localhost:3003/health  # user-service: OK
curl http://localhost:3004/health  # order-service: healthy
curl http://localhost:3005/health  # cart-service: healthy
curl http://localhost:3006/health  # wishlist-service: healthy
curl http://localhost:3007/health  # review-service: healthy
curl http://localhost:3008/health  # contact-service: healthy
curl http://localhost:3009/health  # product-service: running
```

### Pruebas Docker

```bash
# Todos los builds exitosos
docker compose build [service]  # 9/9 ✅

# Todos los servicios corriendo
docker compose ps  # 9 running + 3 databases
```

---

## 📋 Orden de Deployment en Railway

### Fase 1: Bases de Datos (Managed Services)
1. PostgreSQL → Anotar `DATABASE_URL`
2. MongoDB → Anotar `MONGODB_URI`
3. Redis → Anotar `REDIS_URL`

### Fase 2: Servicios Core (Autenticación y Usuarios)
4. auth-service (depende de: PostgreSQL, Redis)
5. user-service (depende de: PostgreSQL, Redis)

### Fase 3: Servicios de Negocio
6. product-service (depende de: MongoDB, Redis)
7. order-service (depende de: PostgreSQL, MongoDB, Redis)
8. cart-service (depende de: Redis)
9. wishlist-service (depende de: Redis)
10. review-service (depende de: MongoDB, Redis)
11. contact-service (depende de: PostgreSQL)

### Fase 4: API Gateway (Último)
12. api-gateway (depende de: TODOS los servicios anteriores)

**Nota**: Esperar que cada servicio esté "healthy" antes de desplegar el siguiente.

---

## 🐛 Troubleshooting Común

### Error: Cannot find module '@flores-victoria/shared'
- ✅ **Solución**: Verificar Docker build context sea `microservices`
- ✅ **Validado**: Todos los Dockerfiles están configurados correctamente

### Error: RedisStore is not a constructor
- ✅ **Solución**: Agregar `rate-limit-redis` a shared/package.json
- ✅ **Estado**: RESUELTO - Dependencias agregadas

### Error: ERR_ERL_CREATED_IN_REQUEST_HANDLER
- ✅ **Solución**: Rate limiters deben ser constantes, no funciones
- ✅ **Estado**: RESUELTO - Todos convertidos a constantes

### Error: cannot destructure 'registry' of undefined
- ✅ **Solución**: `initMetrics()` debe retornar `{registry}`
- ✅ **Estado**: RESUELTO - Middleware actualizado

---

## 📊 Costos Estimados en Railway

### Plan Hobby ($5/mes de crédito)
- 1-2 servicios pequeños
- ❌ No suficiente para 9 servicios + 3 DBs

### Plan Pro ($20/mes de crédito)
- ✅ **Recomendado para este proyecto**
- ~10 servicios + 3 bases de datos
- Uso estimado: **$18-25/mes**

### Optimizaciones de Costo
- Usar scale-to-zero para servicios de bajo uso
- Consolidar wishlist/cart en un solo Redis DB
- Considerar MongoDB Atlas (tier gratuito) en lugar de Railway MongoDB

---

## 🔐 Seguridad

### Secretos Configurados
- ✅ JWT_SECRET en variables de entorno (no en código)
- ✅ Conexiones SSL automáticas en Railway
- ✅ Rate limiting habilitado en todos los servicios
- ✅ CORS configurado por servicio

### Network Security
- API Gateway: Público (único punto de entrada)
- Auth Service: Público (para OAuth)
- Resto de servicios: **Privados** (solo acceso interno)

---

## 📈 Monitoreo Post-Deployment

### Métricas a Vigilar
- CPU < 80% (todos los servicios)
- Memory < 80% (todos los servicios)
- Response time < 500ms (p95)
- Error rate < 1%

### Health Checks
```yaml
Path: /health
Port: {service-port}
Interval: 30s
Timeout: 10s
Healthy Threshold: 2
Unhealthy Threshold: 3
```

---

## ✅ Checklist Final Antes de Deploy

- [x] 9/9 servicios principales con health checks OK
- [x] Dockerfiles multi-stage optimizados
- [x] Módulo shared con todas las dependencias
- [x] Rate limiters funcionando sin errores
- [x] Métricas Prometheus configuradas
- [x] Variables de entorno documentadas
- [x] Orden de deployment definido
- [ ] Repositorio pusheado a GitHub/main
- [ ] Cuenta Railway creada y verificada
- [ ] JWT_SECRET generado (openssl rand -base64 32)
- [ ] Bases de datos managed creadas en Railway
- [ ] Variables de entorno configuradas en Railway
- [ ] Health checks configurados en Railway
- [ ] Dominio público asignado al API Gateway
- [ ] Pruebas de integración post-deployment

---

## 🎯 Siguiente Paso Inmediato

```bash
# 1. Commitear y pushear cambios
git add .
git commit -m "fix: railway deployment ready - rate limiters fixed, 9 services validated"
git push origin main

# 2. Ir a Railway Dashboard
# https://railway.app/new

# 3. Seguir el orden de deployment documentado arriba
```

---

## 📚 Referencias Útiles

- [Railway Docs](https://docs.railway.app)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Express Rate Limit v7](https://express-rate-limit.github.io/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

---

**Estado Final**: ✅ LISTO PARA RAILWAY DEPLOYMENT  
**Confianza**: 95% (falta solo validación en Railway)  
**Tiempo Estimado de Deploy**: 45-60 minutos (siguiendo el orden)
