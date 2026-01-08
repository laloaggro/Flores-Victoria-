# Plan de Acción - Flores Victoria

**Fecha:** 7 de enero de 2026  
**Versión:** 1.0  
**Estado:** En progreso

---

## 📋 Resumen Ejecutivo

Este documento presenta un plan de acción integral para mejorar la plataforma Flores Victoria, abarcando desde correcciones urgentes hasta mejoras a largo plazo en arquitectura, seguridad, rendimiento y experiencia de usuario.

---

## 🚨 FASE 1: Correcciones Urgentes (1-2 días)

### 1.1 Despliegue de Servicios Pendientes en Railway

**Problema:** Los servicios `user-service` y `ORDER-SERVICE` no están desplegando el código actualizado desde GitHub.

**Acciones:**

| # | Acción | Responsable | Prioridad |
|---|--------|-------------|-----------|
| 1 | Acceder a Railway Dashboard (https://railway.com) | DevOps | 🔴 Alta |
| 2 | Navegar a proyecto "Arreglos Victoria" → production | DevOps | 🔴 Alta |
| 3 | En `user-service`: click "Redeploy" → confirmar | DevOps | 🔴 Alta |
| 4 | En `ORDER-SERVICE`: click "Redeploy" → confirmar | DevOps | 🔴 Alta |
| 5 | Verificar que `/internal/users/stats` responda 200 | DevOps | 🔴 Alta |
| 6 | Verificar que `/api/orders/stats` responda 200 | DevOps | 🔴 Alta |

**Verificación post-deploy:**
```bash
# Ejecutar desde terminal
curl -s "https://user-service-production-9ff7.up.railway.app/internal/users/stats" \
  -H "Authorization: Bearer <JWT>" | jq .

curl -s "https://order-service-production-29eb.up.railway.app/api/orders/stats" \
  -H "Authorization: Bearer <SERVICE_TOKEN>" | jq .
```

### 1.2 Configurar Auto-Deploy en Railway

**Problema:** Los servicios no detectan cambios en GitHub automáticamente.

**Acciones:**

1. Para cada servicio en Railway:
   - Settings → Source → Verificar "Root Directory" esté configurado:
     - `user-service`: `microservices/user-service`
     - `ORDER-SERVICE`: `microservices/order-service`
     - `admin-dashboard-service`: `microservices/admin-dashboard-service`
   
2. Verificar "Watch Paths" incluya:
   - `src/**`
   - `package.json`
   - `Dockerfile`

3. Habilitar "Auto Deploy" si está deshabilitado

### 1.3 Sincronizar JWT_SECRET entre Servicios

**Problema:** `user-service` usa un JWT_SECRET diferente al resto de servicios.

**Opción A - Unificar secrets (Recomendado):**
```bash
# En Railway, para user-service:
railway service user-service
railway variables --set "JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA="
railway redeploy -y
```

**Opción B - Mantener separados (ya implementado):**
- El `admin-dashboard-service` ya tiene `USER_SERVICE_JWT_SECRET` configurado
- Genera JWTs específicos para cada servicio

---

## 🔒 FASE 2: Mejoras de Seguridad (1 semana)

### 2.1 Autenticación y Autorización

| # | Mejora | Estado | Prioridad |
|---|--------|--------|-----------|
| 1 | ✅ Implementar validación JWT server-side en admin-dashboard | Completado | 🔴 Alta |
| 2 | ✅ Middleware `serviceAuth` para comunicación inter-servicio | Completado | 🔴 Alta |
| 3 | ✅ Implementar refresh tokens con rotación | Completado | 🟡 Media |
| 4 | ✅ Rate limiting por usuario en endpoints sensibles | Completado | 🟡 Media |
| 5 | ✅ Implementar CSRF tokens para formularios | Completado | 🟡 Media |
| 6 | ✅ Auditoría de acciones administrativas | Completado | 🟢 Baja |

**Archivos creados/actualizados:**
- `microservices/shared/middleware/csrf.js` - Protección CSRF con double-submit cookie
- `microservices/shared/middleware/security-headers.js` - Configuración Helmet unificada
- `microservices/shared/services/refreshTokenService.js` - Sistema de refresh tokens con rotación
- `microservices/auth-service/src/routes/refreshToken.js` - Endpoints de refresh token
- `docs/FASE2_SECURITY_GUIDE.md` - Guía de implementación para frontend

**Endpoints agregados:**
- `POST /api/auth/token/refresh` - Renovar access token usando refresh token
- `POST /api/auth/token/revoke` - Revocar un refresh token (logout de dispositivo)
- `POST /api/auth/logout-all` - Cerrar todas las sesiones del usuario
- `GET /api/auth/sessions` - Listar sesiones activas
- `GET /api/csrf-token` - Obtener token CSRF

### 2.2 Gestión de Secretos

| # | Mejora | Descripción |
|---|--------|-------------|
| 1 | Rotar JWT_SECRET | Cambiar cada 90 días con migración gradual |
| 2 | Usar Railway Secrets | Migrar de variables de entorno a secrets encriptados |
| 3 | Implementar vault | Considerar HashiCorp Vault para producción |

### 2.3 Headers de Seguridad

Verificar que todos los servicios tengan:
```javascript
// helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

## 🏗️ FASE 3: Mejoras de Arquitectura (2-4 semanas)

### 3.1 Comunicación Inter-Servicio

**Estado Actual:**
- Comunicación síncrona via HTTP REST
- SERVICE_TOKEN para autenticación básica

**Mejoras Propuestas:**

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA OBJETIVO                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐     ┌─────────────┐     ┌──────────────┐    │
│  │ Frontend │────▶│ API Gateway │────▶│ Auth Service │    │
│  └──────────┘     └──────┬──────┘     └──────────────┘    │
│                          │                                 │
│         ┌────────────────┼────────────────┐               │
│         ▼                ▼                ▼               │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐        │
│  │  Product   │   │   Order    │   │    User    │        │
│  │  Service   │   │  Service   │   │  Service   │        │
│  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘        │
│        │                │                │               │
│        └────────────────┼────────────────┘               │
│                         ▼                                 │
│                  ┌─────────────┐                          │
│                  │  RabbitMQ   │  ◀── Eventos Async      │
│                  └─────────────┘                          │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

**Acciones:**

| # | Acción | Complejidad | Beneficio |
|---|--------|-------------|-----------|
| 1 | Implementar circuit breaker (opossum) | Media | Alta disponibilidad |
| 2 | Agregar retry con backoff exponencial | Baja | Resiliencia |
| 3 | Implementar eventos async con RabbitMQ | Alta | Desacoplamiento |
| 4 | Cache distribuido con Redis/Valkey | Media | Rendimiento |

**Implementación de Circuit Breaker:**
```javascript
// microservices/shared/utils/circuit-breaker.js
const CircuitBreaker = require('opossum');

const defaultOptions = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

function createBreaker(fn, options = {}) {
  return new CircuitBreaker(fn, { ...defaultOptions, ...options });
}

module.exports = { createBreaker };
```

### 3.2 Base de Datos

**Estado Actual:**
- PostgreSQL: user-service, auth-service
- MongoDB: product-service, order-service, review-service
- Redis/Valkey: cache, sessions, token revocation

**Mejoras Propuestas:**

| # | Mejora | Servicio | Impacto |
|---|--------|----------|---------|
| 1 | Índices optimizados para queries frecuentes | Todos | Rendimiento |
| 2 | Connection pooling configurado | PostgreSQL | Escalabilidad |
| 3 | Read replicas para reportes | PostgreSQL | Separación carga |
| 4 | TTL indexes para datos temporales | MongoDB | Limpieza auto |

**Script de índices pendientes:**
```javascript
// scripts/create-indexes.js
// MongoDB
db.products.createIndex({ category: 1, isActive: 1 });
db.orders.createIndex({ userId: 1, createdAt: -1 });
db.orders.createIndex({ status: 1, createdAt: -1 });

// PostgreSQL
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY idx_users_created ON users(created_at DESC);
```

### 3.3 Observabilidad

**Estado Actual:**
- ✅ Logging con pino/winston
- ✅ Health checks en cada servicio
- ⏳ Métricas con Prometheus (parcial)
- ⏳ Tracing con Jaeger (parcial)

**Mejoras:**

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3100:3000"
    volumes:
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "6831:6831/udp"
```

**Dashboard recomendado para Grafana:**
- Latencia p50, p95, p99 por servicio
- Request rate por endpoint
- Error rate
- CPU/Memory por contenedor
- Database connection pool usage

---

## 🚀 FASE 4: Rendimiento y Escalabilidad (2-4 semanas)

### 4.1 Optimizaciones de Frontend

| # | Optimización | Estado | Impacto |
|---|--------------|--------|---------|
| 1 | ✅ Lazy loading de imágenes | Completado | LCP |
| 2 | ✅ Critical CSS inlined | Completado | FCP |
| 3 | ⏳ Service Worker para offline | Parcial | UX |
| 4 | ⏳ Preconnect a APIs | Pendiente | TTFB |
| 5 | ⏳ Image optimization (WebP/AVIF) | Pendiente | LCP |

**Métricas objetivo (Core Web Vitals):**
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### 4.2 Optimizaciones de Backend

| # | Optimización | Servicio | Beneficio |
|---|--------------|----------|-----------|
| 1 | Cache de productos populares | product-service | -80% DB queries |
| 2 | Paginación con cursor | order-service | Eficiencia |
| 3 | Compresión gzip/brotli | API Gateway | -60% bandwidth |
| 4 | Connection keep-alive | Todos | -30% latencia |

**Implementación de cache en product-service:**
```javascript
// microservices/product-service/src/cache/productCache.js
const redis = require('../config/redis');

const CACHE_TTL = 300; // 5 minutos

async function getCachedProducts(key) {
  const cached = await redis.get(`products:${key}`);
  return cached ? JSON.parse(cached) : null;
}

async function setCachedProducts(key, data) {
  await redis.setex(`products:${key}`, CACHE_TTL, JSON.stringify(data));
}

async function invalidateCache(pattern) {
  const keys = await redis.keys(`products:${pattern}*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

module.exports = { getCachedProducts, setCachedProducts, invalidateCache };
```

### 4.3 Escalabilidad Horizontal

**Preparación para auto-scaling:**

1. **Stateless services:** ✅ Ya implementado
2. **Shared session storage:** ✅ Redis/Valkey
3. **Load balancer ready:** ⏳ Configurar Railway scaling
4. **Database connection limits:** ⏳ Configurar por réplica

---

## 📱 FASE 5: Mejoras de UX/UI (3-4 semanas)

### 5.1 Admin Dashboard

| # | Mejora | Prioridad | Estimación |
|---|--------|-----------|------------|
| 1 | ✅ Design System v2 implementado | Alta | Completado |
| 2 | ⏳ Gráficos interactivos (Chart.js) | Media | 2 días |
| 3 | ⏳ Notificaciones en tiempo real | Media | 3 días |
| 4 | ⏳ Exportación de reportes (PDF/Excel) | Baja | 2 días |
| 5 | ⏳ Filtros avanzados en tablas | Media | 1 día |

### 5.2 Frontend Cliente

| # | Mejora | Prioridad | Estimación |
|---|--------|-----------|------------|
| 1 | PWA completo con offline support | Alta | 1 semana |
| 2 | Push notifications | Media | 3 días |
| 3 | Wishlist sincronizada | Media | 2 días |
| 4 | Comparador de productos | Baja | 2 días |
| 5 | Reviews con fotos | Baja | 3 días |

---

## 🧪 FASE 6: Testing y CI/CD (2-3 semanas)

### 6.1 Cobertura de Tests

**Estado actual:** ~15% cobertura estimada

**Objetivo:** 70% cobertura mínima

| Tipo | Actual | Objetivo | Herramienta |
|------|--------|----------|-------------|
| Unit tests | 10% | 60% | Jest |
| Integration tests | 5% | 40% | Supertest |
| E2E tests | 0% | 20% | Playwright |

**Estructura de tests propuesta:**
```
microservices/
├── [service-name]/
│   ├── src/
│   └── tests/
│       ├── unit/
│       │   └── *.test.js
│       ├── integration/
│       │   └── *.integration.test.js
│       └── fixtures/
│           └── *.json
```

### 6.2 Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, user-service, product-service, order-service]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd microservices/${{ matrix.service }} && npm ci
      - name: Run tests
        run: cd microservices/${{ matrix.service }} && npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy:
    needs: [test, lint, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 📊 FASE 7: Monitoreo y Alertas (1-2 semanas)

### 7.1 Alertas Críticas

| Alerta | Condición | Canal |
|--------|-----------|-------|
| Service Down | Health check falla 3 veces | Slack + Email |
| High Error Rate | >5% errores en 5 min | Slack |
| High Latency | p95 > 2s por 5 min | Slack |
| Database Connection | Pool exhausted | Slack + PagerDuty |
| Disk Space | >80% usado | Email |

### 7.2 Dashboards

1. **Operations Dashboard:**
   - Status de todos los servicios
   - Métricas de infraestructura
   - Logs en tiempo real

2. **Business Dashboard:**
   - Ventas del día/semana/mes
   - Productos más vendidos
   - Usuarios nuevos
   - Tasa de conversión

---

## 📅 Cronograma Propuesto

```
Semana 1:  [████████████████████] FASE 1 - Correcciones Urgentes
Semana 2:  [████████████████████] FASE 2 - Seguridad (inicio)
Semana 3:  [████████████████████] FASE 2 - Seguridad (fin) + FASE 3 inicio
Semana 4:  [████████████████████] FASE 3 - Arquitectura
Semana 5:  [████████████████████] FASE 4 - Rendimiento
Semana 6:  [████████████████████] FASE 5 - UX/UI (inicio)
Semana 7:  [████████████████████] FASE 5 - UX/UI (fin)
Semana 8:  [████████████████████] FASE 6 - Testing + CI/CD
Semana 9:  [████████████████████] FASE 7 - Monitoreo
Semana 10: [████████████████████] Buffer + Documentación
```

---

## ✅ Checklist de Verificación Final

### Antes de cada release:

- [ ] Todos los tests pasan
- [ ] Sin vulnerabilidades críticas (npm audit)
- [ ] Health checks responden 200
- [ ] Logs no muestran errores
- [ ] Métricas de rendimiento aceptables
- [ ] Documentación actualizada

### Mensualmente:

- [ ] Revisar y rotar secretos
- [ ] Actualizar dependencias
- [ ] Revisar logs de seguridad
- [ ] Backup de bases de datos verificado
- [ ] Revisar costos de infraestructura

---

## 📞 Contactos y Recursos

| Recurso | URL |
|---------|-----|
| Railway Dashboard | https://railway.com |
| GitHub Repository | https://github.com/laloaggro/Flores-Victoria- |
| Documentación API | /api/docs (Swagger) |
| Admin Dashboard | https://admin-dashboard-service-production.up.railway.app |

---

## 📝 Notas Adicionales

### Variables de Entorno Críticas

```env
# Tokens unificados (recomendado)
JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=
SERVICE_TOKEN=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=

# User service (si se mantiene separado)
USER_SERVICE_JWT_SECRET=160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb

# URLs de servicios (Railway)
PRODUCT_SERVICE_URL=https://product-service-production.up.railway.app
ORDER_SERVICE_URL=https://order-service-production-29eb.up.railway.app
USER_SERVICE_URL=https://user-service-production-9ff7.up.railway.app
REVIEW_SERVICE_URL=https://review-service-production-4431.up.railway.app
```

### Commits Relevantes Recientes

| Commit | Descripción |
|--------|-------------|
| `c6d82a8d` | Add /internal/users path and fallback |
| `44c85617` | Generate service-specific JWTs |
| `7fa16b3a` | Fix inter-service auth for stats endpoints |
| `82525b65` | Modernización completa Admin Dashboard |

---

**Documento generado automáticamente**  
**Última actualización:** 7 de enero de 2026
