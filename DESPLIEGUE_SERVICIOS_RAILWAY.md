# 🚀 Guía Rápida: Desplegar Servicios Faltantes en Railway

## 📊 Estado Actual
- ✅ **4 servicios funcionando:** API Gateway, Auth, Cart, Product
- ❌ **5 servicios faltantes:** User, Order, Wishlist, Review, Contact
- 🎯 **Objetivo:** 9/9 servicios HEALTHY (100%)

## ⚠️ CORRECCIÓN CRÍTICA APLICADA

**Problema identificado:** Railway estaba usando `nixpacks.toml` (configurado solo para auth-service) en lugar del Dockerfile genérico, causando que Order Service compilara con código de auth-service.

**Solución aplicada:** 
- ✅ Renombrado `nixpacks.toml` → `nixpacks.toml.old-auth-only`
- ✅ Railway ahora usará `railway.toml` que especifica Dockerfile
- ✅ Cada servicio compilará con su código correcto
- ✅ Commit `94149bc` pushed a GitHub

**Railway redesplegará automáticamente todos los servicios en ~2-3 minutos.**

---

## ⚡ Método Rápido: Crear Servicios desde Railway Dashboard

### 🔴 CRÍTICO: User Service (Prioridad 1)

**1. Crear el servicio:**
```
Railway Dashboard → New → Service
→ GitHub Repo → laloaggro/Flores-Victoria-
→ Service Name: user-service
```

**2. Configurar Root Directory:**
```
Settings → Root Directory: microservices
```

**3. Variables de entorno:**
```bash
NODE_ENV=production
SERVICE_NAME=user-service
SERVICE_PORT=3002
LOG_LEVEL=info
DATABASE_URL=postgresql://postgres:Qqw6YQ6CcOkZ9sLnOPp0yDH8t6A17X6w@monorail.proxy.rlwy.net:53134/railway
JWT_SECRET=tu-jwt-secret-seguro-aqui
API_GATEWAY_URL=https://api-gateway-production-949b.up.railway.app
```

**4. Deploy automático:**
- Railway detectará `railway.toml` y usará Dockerfile
- Build tomará ~2-3 minutos
- Health check en `/health`

---

### 🔴 CRÍTICO: Order Service (Prioridad 2)

**1. Crear servicio:** `order-service`

**2. Root Directory:** `microservices`

**3. Variables:**
```bash
NODE_ENV=production
SERVICE_NAME=order-service
SERVICE_PORT=3004
LOG_LEVEL=info
DATABASE_URL=postgresql://postgres:Qqw6YQ6CcOkZ9sLnOPp0yDH8t6A17X6w@monorail.proxy.rlwy.net:53134/railway
JWT_SECRET=tu-jwt-secret-seguro-aqui
USER_SERVICE_URL=https://user-service-production.up.railway.app
PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app
CART_SERVICE_URL=https://cart-service-production-73f6.up.railway.app
```

---

### 🟡 Wishlist Service (Prioridad 3)

**1. Crear servicio:** `wishlist-service`

**2. Root Directory:** `microservices`

**3. Variables:**
```bash
NODE_ENV=production
SERVICE_NAME=wishlist-service
SERVICE_PORT=3006
LOG_LEVEL=info
DATABASE_URL=postgresql://postgres:Qqw6YQ6CcOkZ9sLnOPp0yDH8t6A17X6w@monorail.proxy.rlwy.net:53134/railway
USER_SERVICE_URL=https://user-service-production.up.railway.app
PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app
```

---

### 🟡 Review Service (Prioridad 4)

**1. Crear servicio:** `review-service`

**2. Root Directory:** `microservices`

**3. Variables:**
```bash
NODE_ENV=production
SERVICE_NAME=review-service
SERVICE_PORT=3007
LOG_LEVEL=info
DATABASE_URL=postgresql://postgres:Qqw6YQ6CcOkZ9sLnOPp0yDH8t6A17X6w@monorail.proxy.rlwy.net:53134/railway
USER_SERVICE_URL=https://user-service-production.up.railway.app
PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app
```

---

### 🟢 Contact Service (Prioridad 5)

**1. Crear servicio:** `contact-service`

**2. Root Directory:** `microservices`

**3. Variables:**
```bash
NODE_ENV=production
SERVICE_NAME=contact-service
SERVICE_PORT=3008
LOG_LEVEL=info
MONGODB_URI=mongodb://mongo:lDzMNlkiGkqLxOKzZJ2TIQb7sGYz32D8@monorail.proxy.rlwy.net:54902
NOTIFICATION_SERVICE_URL=https://notification-service-production.up.railway.app
```

---

## 🔧 Configuración Técnica

### Railway.toml (ya configurado en el repo)
Todos los servicios ya tienen su `railway.toml` configurado:

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[build.args]
SERVICE_NAME = "nombre-del-servicio"
SERVICE_PORT = "puerto"

[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/health"
healthcheckTimeout = 100
```

### Dockerfile (genérico en /microservices/Dockerfile)
- ✅ Instala dependencias de shared module
- ✅ Crea symlink @flores-victoria/shared
- ✅ Instala dependencias del servicio
- ✅ Expone puerto correcto
- ✅ Health check automático

---

## ⚡ Proceso de Despliegue

### Por cada servicio:

1. **Crear en Railway** (~30 segundos)
   - New → Service → GitHub
   - Nombre del servicio
   - Root Directory: microservices

2. **Configurar Variables** (~1 minuto)
   - Copiar/pegar las variables de arriba
   - Railway redespliega automáticamente

3. **Build & Deploy** (~2-3 minutos)
   - Railway ejecuta Dockerfile
   - Instala dependencias
   - Health check
   - Asigna dominio público

4. **Verificación** (~30 segundos)
   - Abrir dashboard: https://admin-dashboard-service-production.up.railway.app
   - Verificar status HEALTHY
   - Tiempo de respuesta < 500ms

---

## 📋 Checklist de Despliegue

### User Service
- [ ] Crear servicio en Railway
- [ ] Root Directory: microservices
- [ ] Configurar 7 variables de entorno
- [ ] Esperar build (2-3 min)
- [ ] Verificar /health
- [ ] Actualizar URL en otros servicios si es necesario

### Order Service
- [ ] Crear servicio
- [ ] Root Directory: microservices
- [ ] Configurar 9 variables
- [ ] Build & Deploy
- [ ] Verificar /health
- [ ] **Dependencia:** Esperar a que User Service esté UP primero

### Wishlist Service
- [ ] Crear servicio
- [ ] Root Directory: microservices
- [ ] Configurar 6 variables
- [ ] Build & Deploy
- [ ] Verificar /health

### Review Service
- [ ] Crear servicio
- [ ] Root Directory: microservices
- [ ] Configurar 6 variables
- [ ] Build & Deploy
- [ ] Verificar /health

### Contact Service
- [ ] Crear servicio
- [ ] Root Directory: microservices
- [ ] Configurar 5 variables (usa MongoDB)
- [ ] Build & Deploy
- [ ] Verificar /health

---

## 🎯 Resultado Final Esperado

```
Dashboard: https://admin-dashboard-service-production.up.railway.app

✅ API Gateway         - <200ms - HEALTHY
✅ Auth Service        - <200ms - HEALTHY
✅ User Service        - <200ms - HEALTHY ⭐ (nuevo)
✅ Cart Service        - <200ms - HEALTHY
✅ Order Service       - <200ms - HEALTHY ⭐ (nuevo)
✅ Wishlist Service    - <200ms - HEALTHY ⭐ (nuevo)
✅ Review Service      - <200ms - HEALTHY ⭐ (nuevo)
✅ Contact Service     - <200ms - HEALTHY ⭐ (nuevo)
✅ Product Service     - <200ms - HEALTHY

Total: 9/9 HEALTHY (100%) 🎉
```

---

## 🐛 Troubleshooting

### Build falla con "Cannot find module"
- ✅ Ya resuelto: railway.toml configurado con Dockerfile
- ✅ Dockerfile instala shared module correctamente
- ✅ Symlink creado para @flores-victoria/shared

### Health check falla
1. Verificar que DATABASE_URL/MONGODB_URI estén configuradas
2. Ver logs en Railway: `railway logs --service [name]`
3. Verificar puerto en railway.toml

### Servicio se reinicia constantemente
1. Ver logs para identificar error
2. Verificar todas las variables requeridas
3. Verificar conectividad con base de datos

---

## ⏱️ Timeline de Despliegue

**Tiempo estimado total:** ~20-25 minutos

- User Service: 0-5 min ⏰
- Order Service: 5-10 min ⏰ (espera User)
- Wishlist Service: 10-13 min ⏰
- Review Service: 13-16 min ⏰
- Contact Service: 16-20 min ⏰
- Estabilización: 20-25 min ⏰

**Después de 25 minutos:** ¡9/9 servicios HEALTHY! 🎉

---

## 🚀 Comando Rápido para Verificar

```bash
# Ver estado actual
curl -s https://admin-dashboard-service-production.up.railway.app/api/dashboard/summary

# Resultado esperado:
# {"total":9,"healthy":9,"unhealthy":0,"criticalDown":0}
```

---

## 📝 Notas Importantes

1. **Orden de despliegue:** Empezar con User Service (crítico)
2. **Dependencias:** Order Service requiere User Service UP
3. **Railway.toml:** Ya configurado, no modificar
4. **Variables:** Copiar exactamente como están listadas
5. **Root Directory:** SIEMPRE debe ser `microservices`
6. **Health Check:** Railway lo hace automáticamente en `/health`

---

**¿Listo para desplegar?** 
1. Abre Railway Dashboard
2. Sigue los pasos de arriba
3. En 25 minutos tendrás todo funcionando! 🚀
