# 🔍 Diagnóstico de Servicios Railway - Estado Actual

**Fecha:** 29 de noviembre de 2025  
**Hora:** 07:29 UTC

---

## 📊 Estado Actual de Servicios

### ✅ Servicios Operativos (1/12)

| Servicio | Estado | HTTP Code | Nota |
|----------|--------|-----------|------|
| API Gateway | ✅ OPERATIVO | 200 | Funcionando perfectamente |

### ❌ Servicios con Problemas (11/12)

| Servicio | Estado | HTTP Code | Error |
|----------|--------|-----------|-------|
| Auth Service | ❌ NO DISPONIBLE | 404 | Ruta no encontrada |
| User Service | ❌ NO DISPONIBLE | 502 | Servicio no disponible |
| Product Service | ❌ NO DISPONIBLE | 502 | Servicio no disponible |
| Order Service | ❌ NO DISPONIBLE | 502 | Servicio no disponible |
| Cart Service | ❌ NO DISPONIBLE | 502 | Servicio no disponible |
| Wishlist Service | ❌ NO DISPONIBLE | 502 | Servicio no disponible |
| Review Service | ❌ NO DISPONIBLE | 502 | Servicio no disponible |
| Contact Service | ❌ NO DISPONIBLE | 404 | Ruta no encontrada |
| Payment Service | ❌ NO DISPONIBLE | 404 | Ruta no encontrada |
| Promotion Service | ❌ NO DISPONIBLE | 502 | Servicio no disponible |
| Notification Service | ❌ NO DISPONIBLE | 404 | Ruta no encontrada |

---

## 🔍 Análisis de Errores

### HTTP 502 (Bad Gateway) - 7 servicios
**Causa:** El API Gateway no puede conectarse al servicio backend.

**Posibles razones:**
1. ❌ **Servicio no está corriendo** (más probable)
2. ❌ **URL del servicio incorrecta en el API Gateway**
3. ❌ **Servicio crasheando al iniciar por falta de base de datos**
4. ❌ **Puerto incorrecto configurado**

**Servicios afectados:**
- User Service
- Product Service  
- Order Service
- Cart Service
- Wishlist Service
- Review Service
- Promotion Service

### HTTP 404 (Not Found) - 4 servicios
**Causa:** La ruta del health check no existe en el servicio.

**Posibles razones:**
1. ❌ **El servicio no tiene endpoint `/health`**
2. ❌ **La ruta en el API Gateway está mal configurada**
3. ❌ **El servicio tiene el health en otra ruta**

**Servicios afectados:**
- Auth Service (`/auth/health`)
- Contact Service (`/api/contacts/health`)
- Payment Service (`/payments/health`)
- Notification Service (`/api/notifications/health`)

---

## 🎯 Plan de Acción Prioritario

### ✅ Fase 1: Verificar que servicios están corriendo (5 min)

1. **En Railway Dashboard:**
   ```
   Ve a tu proyecto → Verifica que cada servicio muestre:
   - Estado: "Active" (no "Crashed" o "Building")
   - Recent deployment: Successful
   - Logs: Sin errores críticos
   ```

2. **Verificar logs de cada servicio:**
   ```bash
   # Desde CLI
   railway service select USER-SERVICE
   railway logs
   
   # Buscar errores como:
   # - "Connection refused"
   # - "Database connection failed"
   # - "ECONNREFUSED"
   # - "Cannot connect to MongoDB"
   ```

### ✅ Fase 2: Configurar bases de datos (20 min)

**Para servicios PostgreSQL (User, Order, Auth):**
```bash
# 1. Crear servicio PostgreSQL si no existe
railway service create postgres-db --template postgres

# 2. Obtener DATABASE_URL
railway service select postgres-db
railway variables get DATABASE_URL

# 3. Configurar en servicios
railway service select USER-SERVICE
railway variables set DATABASE_URL="<url-obtenida>"

railway service select ORDER-SERVICE
railway variables set DATABASE_URL="<url-obtenida>"

railway service select AUTH-SERVICE
railway variables set DATABASE_URL="<url-obtenida>"
```

**Para servicios MongoDB (Product, Review, Cart, Wishlist):**
```bash
# 1. Crear servicio MongoDB si no existe
railway service create mongodb --template mongodb

# 2. Obtener MONGODB_URI
railway service select mongodb
railway variables get MONGO_URL

# 3. Configurar en servicios
railway service select PRODUCT-SERVICE
railway variables set MONGODB_URI="<url-obtenida>"

railway service select REVIEW-SERVICE
railway variables set MONGODB_URI="<url-obtenida>"

railway service select CART-SERVICE
railway variables set MONGODB_URI="<url-obtenida>"

railway service select WISHLIST-SERVICE
railway variables set MONGODB_URI="<url-obtenida>"
```

### ✅ Fase 3: Verificar rutas de health checks (10 min)

**Servicios con 404 necesitan verificación:**

1. **Auth Service:**
   - Verificar si tiene `/health` o `/auth/health`
   - Actualizar ruta en API Gateway si es necesario

2. **Contact Service:**
   - Verificar si tiene `/health` o `/api/health`
   - Actualizar ruta en API Gateway

3. **Payment Service:**
   - Verificar si tiene `/health` o `/payments/health`
   - Actualizar ruta en API Gateway

4. **Notification Service:**
   - Verificar si tiene `/health` o `/api/health`
   - Actualizar ruta en API Gateway

### ✅ Fase 4: Verificar variables de entorno en API Gateway (5 min)

**Verificar que el API Gateway tenga configuradas las URLs:**
```bash
railway service select API-GATEWAY
railway variables list

# Debe tener:
AUTH_SERVICE_URL=${{AUTH-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
ORDER_SERVICE_URL=${{ORDER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
CART_SERVICE_URL=${{CART-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
WISHLIST_SERVICE_URL=${{WISHLIST-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
REVIEW_SERVICE_URL=${{REVIEW-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
CONTACT_SERVICE_URL=${{CONTACT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
PAYMENT_SERVICE_URL=${{PAYMENT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
PROMOTION_SERVICE_URL=${{PROMOTION-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
NOTIFICATION_SERVICE_URL=${{NOTIFICATION-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
```

---

## 🚀 Script Automatizado

Usa el script automatizado para configurar todo:
```bash
./scripts/railway-database-setup.sh
```

---

## 🔧 Solución Más Rápida (Script en una línea)

```bash
# 1. Verificar que todos los servicios estén activos en Railway Dashboard

# 2. Crear y configurar PostgreSQL
railway service create postgres-db --template postgres
PG_URL=$(railway service select postgres-db && railway variables get DATABASE_URL)

# 3. Configurar servicios PostgreSQL
for svc in USER-SERVICE ORDER-SERVICE AUTH-SERVICE; do
  railway service select $svc
  railway variables set DATABASE_URL="$PG_URL"
done

# 4. Crear y configurar MongoDB
railway service create mongodb --template mongodb
MONGO_URL=$(railway service select mongodb && railway variables get MONGO_URL)

# 5. Configurar servicios MongoDB
for svc in PRODUCT-SERVICE REVIEW-SERVICE CART-SERVICE WISHLIST-SERVICE; do
  railway service select $svc
  railway variables set MONGODB_URI="$MONGO_URL"
done

# 6. Esperar redespliegue (2-3 minutos)
echo "Esperando redespliegue de servicios..."
sleep 180

# 7. Verificar
./scripts/railway-service-validator.sh
```

---

## 📋 Checklist de Verificación

### Antes de configurar:
- [ ] Todos los servicios muestran estado "Active" en Railway
- [ ] No hay errores de build en los logs
- [ ] API Gateway está funcionando (✅ ya confirmado)

### Durante configuración:
- [ ] PostgreSQL service creado
- [ ] MongoDB service creado
- [ ] DATABASE_URL configurado en servicios PostgreSQL
- [ ] MONGODB_URI configurado en servicios MongoDB
- [ ] Servicios redesplegados automáticamente

### Después de configurar:
- [ ] Esperar 2-3 minutos para redespliegue
- [ ] Ejecutar `./scripts/railway-service-validator.sh`
- [ ] Todos los servicios retornan HTTP 200
- [ ] Health checks pasando
- [ ] Endpoints funcionales

---

## 🎯 Resultado Esperado

Después de configurar las bases de datos, deberías ver:

```bash
✅ API Gateway - HTTP 200
✅ Auth Service - HTTP 200
✅ User Service - HTTP 200
✅ Product Service - HTTP 200
✅ Order Service - HTTP 200
✅ Cart Service - HTTP 200
✅ Wishlist Service - HTTP 200
✅ Review Service - HTTP 200
✅ Contact Service - HTTP 200
✅ Payment Service - HTTP 200
✅ Promotion Service - HTTP 200
✅ Notification Service - HTTP 200
```

---

## 🐛 Troubleshooting Avanzado

### Si después de configurar DB siguen fallando:

1. **Revisar logs detallados:**
   ```bash
   railway service select <SERVICE-NAME>
   railway logs --tail 100
   ```

2. **Verificar que el servicio tiene el health endpoint:**
   ```bash
   # Buscar en el código
   grep -r "health" microservices/<service-name>/src/
   ```

3. **Verificar el puerto del servicio:**
   ```bash
   # En Railway, debe coincidir con process.env.PORT
   railway service select <SERVICE-NAME>
   railway variables get PORT
   ```

4. **Redeploy manual si es necesario:**
   ```bash
   railway service select <SERVICE-NAME>
   railway up --detach
   ```

---

## ⏱️ Tiempo Estimado Total

| Fase | Tiempo |
|------|--------|
| Verificar servicios activos | 5 min |
| Crear y configurar PostgreSQL | 10 min |
| Crear y configurar MongoDB | 10 min |
| Esperar redespliegue | 3 min |
| Verificar y probar | 5 min |
| **TOTAL** | **~33 min** |

---

## 🔗 Próximo Paso

**Ejecuta este comando para iniciar la configuración:**
```bash
./scripts/railway-database-setup.sh
```

O sigue el plan manual arriba paso a paso.

---

**Estado actual:** 🔴 1/12 servicios operativos  
**Estado esperado:** 🟢 12/12 servicios operativos  
**Bloqueador principal:** Falta de bases de datos configuradas
