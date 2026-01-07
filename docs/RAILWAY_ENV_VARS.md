# 🔐 Variables de Entorno para Railway - Flores Victoria

**Fecha:** 7 de enero de 2026  
**Versión:** 1.0  
**Estado:** Fase 1 - Correcciones Urgentes

---

## ⚠️ PROBLEMA DETECTADO

Se encontraron **múltiples valores diferentes de JWT_SECRET** entre servicios:

| Servicio | JWT_SECRET | Estado |
|----------|------------|--------|
| `api-gateway` | `tu_jwt_secreto` (placeholder) | ❌ Incorrecto |
| `microservices/.env` | `8nZ43P+ihoPfVjIEVTZuaEicAVKzz1ng1Hnwfgr39iA=` | ⚠️ Diferente |
| `order-service` | `+i3Kuq2LrzP+oXmv7mLcyB8iDSvzTEdBHA4rcF8q5ats...` | ✅ |
| `cart-service` | `+i3Kuq2LrzP+oXmv7mLcyB8iDSvzTEdBHA4rcF8q5ats...` | ✅ |
| `review-service` | `+i3Kuq2LrzP+oXmv7mLcyB8iDSvzTEdBHA4rcF8q5ats...` | ✅ |

---

## 🎯 SOLUCIÓN: Variables Unificadas

### Variables Críticas (TODOS los servicios)

```env
# ═══════════════════════════════════════════════════════════════
# AUTENTICACIÓN JWT - DEBE SER IGUAL EN TODOS LOS SERVICIOS
# ═══════════════════════════════════════════════════════════════
JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=

# Para comunicación inter-servicio (admin-dashboard → otros servicios)
SERVICE_TOKEN=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=

# Si user-service usa un secret diferente (situación actual)
USER_SERVICE_JWT_SECRET=160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb
```

---

## 📋 Configuración por Servicio en Railway

### 1. API Gateway (`api-gateway`)

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=
SERVICE_TOKEN=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=

# URLs de microservicios
AUTH_SERVICE_URL=https://auth-service-production.up.railway.app
USER_SERVICE_URL=https://user-service-production-9ff7.up.railway.app
PRODUCT_SERVICE_URL=https://product-service-production.up.railway.app
ORDER_SERVICE_URL=https://order-service-production-29eb.up.railway.app
CART_SERVICE_URL=https://cart-service-production.up.railway.app
REVIEW_SERVICE_URL=https://review-service-production-4431.up.railway.app

# Redis/Valkey
VALKEY_URL=<URL_RAILWAY_VALKEY>
```

### 2. Auth Service (`auth-service`)

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<REFRESH_SECRET_DIFERENTE>
JWT_REFRESH_EXPIRES_IN=7d

# PostgreSQL
DATABASE_URL=<URL_POSTGRESQL_RAILWAY>

# Redis
VALKEY_URL=<URL_RAILWAY_VALKEY>
```

### 3. User Service (`user-service`)

```env
PORT=3002
NODE_ENV=production
JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=
SERVICE_TOKEN=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=

# PostgreSQL
DATABASE_URL=<URL_POSTGRESQL_RAILWAY>
DB_HOST=<HOST>
DB_PORT=5432
DB_NAME=flores_db
DB_USER=flores_user
DB_PASSWORD=<PASSWORD>

# Redis
VALKEY_URL=<URL_RAILWAY_VALKEY>
```

### 4. Order Service (`ORDER-SERVICE`)

```env
PORT=3003
NODE_ENV=production
JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=
SERVICE_TOKEN=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=

# MongoDB
MONGODB_URI=<URL_MONGODB_RAILWAY>

# Redis
VALKEY_URL=<URL_RAILWAY_VALKEY>
```

### 5. Product Service (`product-service`)

```env
PORT=3009
NODE_ENV=production
JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=

# MongoDB
MONGODB_URI=<URL_MONGODB_RAILWAY>

# Redis
VALKEY_URL=<URL_RAILWAY_VALKEY>
```

### 6. Admin Dashboard Service (`admin-dashboard-service`)

```env
PORT=3021
NODE_ENV=production
JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=
SERVICE_TOKEN=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=

# Si user-service mantiene un JWT diferente
USER_SERVICE_JWT_SECRET=160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb

# URLs de servicios
USER_SERVICE_URL=https://user-service-production-9ff7.up.railway.app
ORDER_SERVICE_URL=https://order-service-production-29eb.up.railway.app
PRODUCT_SERVICE_URL=https://product-service-production.up.railway.app
REVIEW_SERVICE_URL=https://review-service-production-4431.up.railway.app
```

---

## 🚀 Pasos de Implementación en Railway

### Paso 1: Acceder a Railway Dashboard

1. Ir a https://railway.com
2. Seleccionar proyecto "Arreglos Victoria" → production

### Paso 2: Actualizar Variables por Servicio

Para cada servicio:

1. Click en el servicio
2. Variables → Raw Editor
3. Actualizar/agregar las variables listadas arriba
4. Guardar cambios

### Paso 3: Redeploy Manual

Después de actualizar variables:

```bash
# En cada servicio
railway service <NOMBRE_SERVICIO>
railway redeploy -y
```

O desde el Dashboard:
1. Click en el servicio
2. Deployments → Redeploy (botón superior derecho)

### Paso 4: Verificar

```bash
# Ejecutar script de verificación
./scripts/verify-services.sh

# O manualmente
curl https://user-service-production-9ff7.up.railway.app/internal/users/stats \
  -H "Authorization: Bearer y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=" \
  -H "x-internal-request: true" \
  -H "x-service-name: test"
```

---

## ⚙️ Configurar Auto-Deploy

Para cada servicio en Railway:

1. **Settings → Source**
   - Root Directory: `microservices/<nombre-servicio>`
   - Branch: `main`

2. **Settings → Build**
   - Watch Paths: 
     - `src/**`
     - `package.json`
     - `Dockerfile`

3. **Triggers**
   - ✅ Auto Deploy: Enabled
   - ✅ Build from Dockerfile

---

## 📞 URLs de Verificación

| Servicio | Health Check | Stats |
|----------|--------------|-------|
| API Gateway | `/health` | N/A |
| User Service | `/health` | `/internal/users/stats` |
| Order Service | `/health` | `/api/orders/stats` |
| Product Service | `/health` | `/api/products/stats` |
| Admin Dashboard | `/health` | N/A |

---

## 🔄 Generar Nuevos Secrets (Referencia)

```bash
# Generar JWT_SECRET (64 chars hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar JWT_SECRET (base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# O con openssl
openssl rand -base64 32
```

---

**Actualizado:** 7 de enero de 2026
