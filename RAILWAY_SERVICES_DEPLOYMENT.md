# Railway Services Deployment Guide

## Servicios Configurados ✅

Todos los servicios ya tienen:

- ✅ `railway.json` con NIXPACKS builder
- ✅ `nixpacks.toml` con instalación de shared module
- ✅ `package-lock.json` para builds reproducibles
- ✅ Correcto `startCommand` desde raíz del repositorio

## Orden de Despliegue Recomendado

### 1. AUTH-SERVICE (Prioridad Alta)

**Variables de Entorno Requeridas:**

```bash
PORT=3001
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}  # PostgreSQL
JWT_SECRET=<generar-secreto-seguro>
JWT_EXPIRES_IN=7d
REDIS_URL=${{Redis-4SDP.REDIS_URL}}
DISABLE_CACHE=false
```

**Healthcheck:** `/health` **Comando Start:** `cd microservices/auth-service && node src/server.js`

---

### 2. USER-SERVICE

**Variables de Entorno Requeridas:**

```bash
PORT=3002
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}  # PostgreSQL
```

**Healthcheck:** `/health` **Comando Start:** `cd microservices/user-service && node src/server.js`

---

### 3. API-GATEWAY (Prioridad Alta)

**Variables de Entorno Requeridas:**

```bash
PORT=3000
NODE_ENV=production

# URLs de microservicios
AUTH_SERVICE_URL=${{AUTH-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
CART_SERVICE_URL=${{CART-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
WISHLIST_SERVICE_URL=${{WISHLIST-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
ORDER_SERVICE_URL=${{ORDER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
REVIEW_SERVICE_URL=${{REVIEW-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
CONTACT_SERVICE_URL=${{CONTACT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}

# CORS
CORS_ORIGIN=https://arreglos-victoria-production.up.railway.app,https://floresvictoria.cl
```

**Healthcheck:** `/health`
