# 🚨 CONFIGURACIÓN CRÍTICA RAILWAY - ACCIÓN MANUAL REQUERIDA

## ❌ Problema Identificado

Los servicios **Frontend** y **Order Service** tienen error 502 porque Railway NO tiene configurado el **Root Directory** correcto.

## ✅ Solución (Configurar en Railway Dashboard)

### 1. Frontend Service

**URL**: https://frontend-v2-production-7508.up.railway.app

**Pasos**:
1. Abrir Railway Dashboard → Proyecto Flores Victoria
2. Seleccionar servicio `Frontend-v2` (el que termina en 7508)
3. Ir a **Settings** → **Service Settings**
4. Buscar **Root Directory**
5. Configurar: `frontend`
6. Click **Save** y esperar redespliegue automático

### 2. Order Service  

**URL**: https://order-service-production-29eb.up.railway.app

**Pasos**:
1. Abrir Railway Dashboard → Proyecto Flores Victoria
2. Seleccionar servicio `ORDER-SERVICE`
3. Ir a **Settings** → **Service Settings**
4. Buscar **Root Directory**
5. Configurar: `microservices/order-service`
6. Click **Save** y esperar redespliegue automático

---

## 🔍 Por Qué Este Error

### Frontend
- Railway busca archivos en raíz del repo
- Pero el frontend está en `/frontend/`
- Sin Root Directory correcto, Railway no encuentra `Dockerfile.railway`

### Order Service
- Railway ejecuta en raíz del repo
- El servicio está en `/microservices/order-service/`
- Nixpacks no puede resolver `../shared` correctamente
- El symlink `shared/` no funciona en Railway

## ✅ Verificación Post-Fix

Después de configurar, ejecutar:

```bash
# Esperar 3-5 minutos después de guardar en Railway
./scripts/monitor-all-services.sh
```

**Resultado esperado**:
```
✅ Frontend: HEALTHY
✅ Order Service: HEALTHY
✅ 8/8 servicios funcionando (100%)
```

## 📋 Servicios Que Ya Funcionan (Configurados Correctamente)

Estos servicios tienen Root Directory correcto:
- ✅ API Gateway → `microservices/api-gateway`
- ✅ Auth Service → `microservices/auth-service`
- ✅ User Service → `microservices/user-service`
- ✅ Cart Service → `microservices/cart-service`
- ✅ Product Service → `microservices/product-service`
- ✅ Admin Dashboard → `microservices/admin-dashboard-service`

## 🎯 Alternativa: Railway CLI

Si prefieres usar CLI:

```bash
# Frontend
railway service Frontend-v2
railway settings --set rootDirectory=frontend

# Order Service  
railway service ORDER-SERVICE
railway settings --set rootDirectory=microservices/order-service
```

---

**Prioridad**: 🔴 CRÍTICA - Estos 2 servicios no funcionarán hasta que se configure Root Directory
