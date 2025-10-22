# Auditoría del Stack de Desarrollo

**Fecha:** 21 de octubre de 2025  
**Objetivo:** Revisar cada detalle del entorno de desarrollo

---

## Actualización (21 de octubre de 2025)

- RESUELTO: Se corrigió la configuración del frontend para que todas las URLs apunten al API Gateway
  en puerto 3000.
  - Archivo actualizado: `frontend/public/js/config/api.js`
  - Cambios clave: `PRODUCT_SERVICE`, `USER_SERVICE`, `ORDER_SERVICE`, `CART_SERVICE`,
    `WISHLIST_SERVICE`, `REVIEW_SERVICE`, `CONTACT_SERVICE` ahora usan
    `http://localhost:3000/api/...`
  - Verificación: Health checks vía gateway OK (`/api/auth/health`, `/api/products/health`).

---

## 1. Estado de Contenedores

### ✅ Servicios Core (Dev) - ACTIVOS

- `api-gateway` → Up 39min → 3000:3000
- `frontend` → Up 39min → 5173:5173
- `product-service` → Up 39min → 3009:3009
- `auth-service` → Up 26min → 3001:3001
- `admin-panel` → Up 39min → 3010:3010

### ⚠️ Servicios Legacy (Prod) - ACTIVOS (No necesarios en dev)

- `contact-service` → Up 32h (healthy) → 3008:3008
- `user-service` → Up 32h (unhealthy) → 3003:3003
- `wishlist-service` → Up 32h (healthy) → 3006:3006
- `review-service` → Up 32h (unhealthy) → 3007:3007
- `order-service` → Up 32h (healthy) → 3004:3004
- `cart-service` → Up 32h (healthy) → 3005:3005

### ✅ Dependencias - ACTIVAS

- `mongodb` → Up 19h → 27018:27017
- `postgres` → Up 33h (healthy) → 5433:5432
- `redis` → Up 33h (healthy) → 6380:6379
- `rabbitmq` → Up 33h (healthy) → 5672,15672
- `jaeger` → Up 33h (healthy) → 16686, 6831-6832/udp

### ❌ Servicios con Problemas

- `mcp-server` → Up 24h (unhealthy) → 5050/tcp
- `user-service` → unhealthy
- `review-service` → unhealthy

---

## 2. Health Checks

### ✅ Gateway y Servicios Core

```json
// GET http://localhost:3000/api/auth/health
{
  "status": "OK",
  "service": "auth-service",
  "via": "/api/auth/health"
}

// GET http://localhost:3000/api/products/health
{
  "status": "OK",
  "service": "product-service"
}
```

---

## 3. Configuración de Docker Compose (dev)

### ✅ Archivo: `docker-compose.dev.yml`

**Servicios definidos:** 5 (gateway, auth, products, frontend, admin)  
**Volumenes:** Montados para hot reload  
**Env file:** `./microservices/.env`  
**Puertos correctos:** 3000, 3001, 3009, 5173, 3010

---

## 4. Variables de Entorno

### ✅ Archivo: `microservices/.env`

**Puertos definidos:**

- API_GATEWAY_PORT=3000 ✅
- AUTH_SERVICE_PORT=3001 ✅
- PRODUCT_SERVICE_PORT=3009 ✅

**Secretos:**

- JWT_SECRET=change-me-in-development ⚠️ (débil, solo dev)

**Bases de datos:**

- MONGO_URI=mongodb://mongo:27017/flores_dev ⚠️ (host 'mongo' no existe en dev)

---

## 5. Frontend - Configuración API

### ✅ Estado actual en `frontend/public/js/config/api.js`

```javascript
BASE_URL: 'http://localhost:3000/api',
AUTH_SERVICE: 'http://localhost:3000/api/auth',      // Correcto
PRODUCT_SERVICE: 'http://localhost:3000/api/products',
USER_SERVICE: 'http://localhost:3000/api/users',
ORDER_SERVICE: 'http://localhost:3000/api/orders',
CART_SERVICE: 'http://localhost:3000/api/cart',
WISHLIST_SERVICE: 'http://localhost:3000/api/wishlist',
REVIEW_SERVICE: 'http://localhost:3000/api/reviews',
CONTACT_SERVICE: 'http://localhost:3000/api/contact'
```

**Impacto:**

- Frontend ahora enrutará todas las peticiones a través del API Gateway (3000)

---

## 6. Hallazgos Principales

### 🔴 CRÍTICO

1. ~~**API config con puertos incorrectos** → Frontend no puede comunicarse con
   products/orders/cart/etc~~ (RESUELTO)
2. **Servicios legacy corriendo** → Consumiendo recursos innecesarios (32h activos)
3. **Servicios unhealthy** → mcp-server, user-service, review-service

### 🟡 ADVERTENCIA

1. **MONGO_URI apunta a 'mongo'** pero contenedor se llama 'mongodb'
2. **JWT_SECRET débil** (OK para dev, pero documentar)
3. **Variables de entorno no usadas** en docker-compose.dev.yml

### 🟢 BIEN

1. Stack core de desarrollo funcional
2. Hot reload configurado
3. Health checks implementados
4. Documentación actualizada

---

## 7. Acciones Recomendadas (Prioridad)

### 🔥 Alta Prioridad

1. **Corregir `api.js`**: Cambiar todos los puertos 8000 → 3000
2. **Limpiar servicios legacy**: `docker compose down --remove-orphans`
3. **Verificar MONGO_URI**: Actualizar a 'mongodb' o crear alias

### 🔸 Media Prioridad

4. **Detener servicios unhealthy**: mcp-server, user-service, review-service (no necesarios en dev)
5. **Crear script de verificación**: `npm run dev:verify` para health checks
6. **Documentar secretos**: Añadir .env.example

### 🔹 Baja Prioridad

7. Optimizar imágenes Docker (cache layers)
8. Configurar hot reload en microservicios (nodemon)
9. Añadir tests de integración

---

## 8. Siguiente Paso

**Limpiar servicios legacy** y alinear `MONGO_URI` con el host del contenedor (`mongodb`), luego
validar flujo E2E (login, menú admin, productos) usando el gateway.
