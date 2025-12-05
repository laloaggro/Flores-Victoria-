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

**Healthcheck:** `/health`
**Comando Start:** `cd microservices/auth-service && node src/server.js`

---

### 2. USER-SERVICE
**Variables de Entorno Requeridas:**
```bash
PORT=3002
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}  # PostgreSQL
```

**Healthcheck:** `/health`
**Comando Start:** `cd microservices/user-service && node src/server.js`

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
**Comando Start:** `cd microservices/api-gateway && node src/server.js`

---

### 4. CART-SERVICE
**Variables de Entorno Requeridas:**
```bash
PORT=3005
NODE_ENV=production
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis-4SDP.REDIS_URL}}
DISABLE_CACHE=false
```

**Healthcheck:** `/health`
**Comando Start:** `cd microservices/cart-service && node src/server.js`

---

### 5. WISHLIST-SERVICE
**Variables de Entorno Requeridas:**
```bash
PORT=3006
NODE_ENV=production
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

**Healthcheck:** `/health`
**Comando Start:** `cd microservices/wishlist-service && node src/server.js`

---

### 6. ORDER-SERVICE
**Variables de Entorno Requeridas:**
```bash
PORT=3004
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}  # PostgreSQL
```

**Healthcheck:** `/health`
**Comando Start:** `cd microservices/order-service && node src/server.js`

---

### 7. REVIEW-SERVICE
**Variables de Entorno Requeridas:**
```bash
PORT=3007
NODE_ENV=production
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

**Healthcheck:** `/health`
**Comando Start:** `cd microservices/review-service && node src/server.js`

---

### 8. CONTACT-SERVICE
**Variables de Entorno Requeridas:**
```bash
PORT=3008
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}  # PostgreSQL o MongoDB según implementación
```

**Healthcheck:** `/health`
**Comando Start:** `cd microservices/contact-service && node src/server.js`

---

## Pasos para Desplegar Cada Servicio en Railway

### Opción A: Desde Railway Dashboard (UI)

1. **Crear Nuevo Servicio:**
   - Railway Dashboard → Project "Arreglos Victoria"
   - Click "New Service" → "GitHub Repo"
   - Seleccionar repositorio: `Flores-Victoria-`

2. **Configurar Servicio:**
   - **Service Name:** AUTH-SERVICE (o el nombre correspondiente)
   - **Root Directory:** ⚠️ DEJAR VACÍO (usa repo root)
   - Railway detectará automáticamente `railway.json` del servicio

3. **Variables de Entorno:**
   - Ir a pestaña "Variables"
   - Copiar y pegar las variables del servicio correspondiente
   - Usar referencias a otros servicios: `${{SERVICE.VARIABLE}}`

4. **Configuración Adicional:**
   - ✅ Healthcheck ya configurado en `railway.json`
   - ✅ Start command ya configurado en `railway.json`
   - ⚠️ Si Railway muestra Custom Start Command, ELIMINARLO (dejar que use railway.json)

5. **Deploy:**
   - Railway desplegará automáticamente al detectar el commit
   - O click "Deploy" manualmente

### Opción B: Desde CLI (Más Rápido)

Para cada servicio, necesitarás cambiarlo manualmente en Railway y configurar variables.

---

## Verificación Post-Deploy

Para cada servicio desplegado:

```bash
# Healthcheck
curl https://[service-url].up.railway.app/health

# Ver logs
railway logs --service [SERVICE-NAME]

# Verificar variables
railway variables --service [SERVICE-NAME]
```

---

## Troubleshooting Común

### Error: MODULE_NOT_FOUND 'winston-daily-rotate-file'
✅ **Ya resuelto** - El `nixpacks.toml` instala dependencias de `shared` primero

### Error: Cannot find module '@flores-victoria/shared'
✅ **Ya resuelto** - El `nixpacks.toml` copia `shared` a `node_modules/@flores-victoria/`

### Build usa Dockerfile en lugar de Nixpacks
❌ **Solución:** 
1. Verificar que `railway.json` tenga `"builder": "NIXPACKS"`
2. En Railway UI, eliminar cualquier "Custom Start Command"
3. Eliminar o renombrar Dockerfiles si existen

### Container crashes inmediatamente
Verificar:
1. Variables de entorno configuradas correctamente
2. Base de datos accesible (PostgreSQL, MongoDB, Redis)
3. Puerto correcto (debe coincidir con código del servicio)

---

## Orden de Importancia

**Críticos (Deploy primero):**
1. ✅ PRODUCT-SERVICE (Ya desplegado)
2. 🔴 AUTH-SERVICE
3. 🔴 API-GATEWAY

**Secundarios:**
4. USER-SERVICE
5. CART-SERVICE
6. WISHLIST-SERVICE

**Opcionales (pueden esperar):**
7. ORDER-SERVICE
8. REVIEW-SERVICE
9. CONTACT-SERVICE

---

## Notas Importantes

- ⚠️ **Root Directory debe estar VACÍO** en Railway para que use el repo completo
- ⚠️ **No configurar Custom Start Command** en Railway UI (ya está en railway.json)
- ✅ Todos los servicios comparten el mismo `shared` module con winston configurado
- ✅ Redis cache está habilitado para servicios que lo necesitan
- 📊 Después de desplegar, configurar monitoreo es el siguiente paso

---

## Scripts Útiles

```bash
# Ver todos los servicios de Railway
railway service list

# Cambiar a un servicio específico
railway service

# Ver logs de un servicio
railway logs

# Ver variables de entorno
railway variables

# Forzar nuevo deploy
git commit --allow-empty -m "chore: Force redeploy [service-name]" && git push
```
