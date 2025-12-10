# 🚀 Plan de Despliegue de Servicios Faltantes

**Fecha:** 10 de diciembre de 2025  
**Estado:** Configuración completada, listo para desplegar

## 📊 Resumen de Cambios

### ✅ Problema Identificado
Railway estaba usando el `nixpacks.toml` de la raíz (configurado para auth-service) para compilar todos los servicios, causando:
- Instalación de dependencias incorrectas
- Error: "Cannot find module 'dotenv'" en order-service
- Falta de módulo shared en otros servicios

### ✅ Solución Implementada
Actualizado `railway.toml` de todos los servicios para usar el **Dockerfile genérico** con build args específicos:

**Commits realizados:**
1. `ea80632` - fix(order-service): configurar Dockerfile en railway.toml
2. `95a73ae` - fix(microservices): configurar Dockerfile para user, wishlist, review y contact services

---

## 🔧 Servicios Actualizados

### 1. Order Service (CRÍTICO) ✅
- **Puerto:** 3004
- **Railway.toml:** Actualizado con Dockerfile
- **Estado:** Railway redesplegando automáticamente
- **Build Args:**
  ```toml
  SERVICE_NAME = "order-service"
  SERVICE_PORT = "3004"
  ```

### 2. User Service (CRÍTICO) ✅
- **Puerto:** 3002
- **Railway.toml:** Actualizado con Dockerfile
- **Estado:** Listo para desplegar (requiere crear servicio en Railway)
- **Build Args:**
  ```toml
  SERVICE_NAME = "user-service"
  SERVICE_PORT = "3002"
  ```

### 3. Wishlist Service ✅
- **Puerto:** 3006
- **Railway.toml:** Actualizado con Dockerfile
- **Estado:** Listo para desplegar (requiere crear servicio en Railway)
- **Build Args:**
  ```toml
  SERVICE_NAME = "wishlist-service"
  SERVICE_PORT = "3006"
  ```

### 4. Review Service ✅
- **Puerto:** 3007
- **Railway.toml:** Actualizado con Dockerfile
- **Estado:** Listo para desplegar (requiere crear servicio en Railway)
- **Build Args:**
  ```toml
  SERVICE_NAME = "review-service"
  SERVICE_PORT = "3007"
  ```

### 5. Contact Service ✅
- **Puerto:** 3008
- **Railway.toml:** Actualizado con Dockerfile
- **Estado:** Listo para desplegar (requiere crear servicio en Railway)
- **Build Args:**
  ```toml
  SERVICE_NAME = "contact-service"
  SERVICE_PORT = "3008"
  ```

---

## 📝 Pasos para Desplegar en Railway

### Opción A: Despliegue Manual (Recomendado para primeros servicios)

#### 1. User Service (CRÍTICO)
```bash
# En Railway Dashboard:
# 1. New > Service > "user-service"
# 2. Settings:
#    - Root Directory: microservices
#    - Branch: main
# 3. Deploy automáticamente al conectar repo
# 4. Variables de entorno (Railway CLI):

railway link  # Seleccionar proyecto y servicio user-service
railway variables --set "NODE_ENV=production"
railway variables --set "DATABASE_URL=postgresql://..."
railway variables --set "JWT_SECRET=..."
railway variables --set "API_GATEWAY_URL=https://api-gateway-production-949b.up.railway.app"
```

#### 2. Wishlist Service
```bash
railway link  # Seleccionar servicio wishlist-service
railway variables --set "NODE_ENV=production"
railway variables --set "DATABASE_URL=postgresql://..."
railway variables --set "USER_SERVICE_URL=https://user-service-production-xxx.up.railway.app"
railway variables --set "PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app"
```

#### 3. Review Service
```bash
railway link  # Seleccionar servicio review-service
railway variables --set "NODE_ENV=production"
railway variables --set "DATABASE_URL=postgresql://..."
railway variables --set "USER_SERVICE_URL=https://user-service-production-xxx.up.railway.app"
railway variables --set "PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app"
```

#### 4. Contact Service
```bash
railway link  # Seleccionar servicio contact-service
railway variables --set "NODE_ENV=production"
railway variables --set "MONGODB_URI=mongodb://..."
railway variables --set "NOTIFICATION_SERVICE_URL=https://notification-service-production-xxx.up.railway.app"
```

---

## ⚡ Variables de Entorno Comunes

### Todas los servicios necesitan:
```bash
NODE_ENV=production
LOG_LEVEL=info
```

### Servicios con base de datos PostgreSQL:
- user-service
- order-service
- review-service
- wishlist-service

```bash
DATABASE_URL=postgresql://postgres.xxx:xxx@xxx.railway.app:5432/railway
```

### Servicios con MongoDB:
- contact-service

```bash
MONGODB_URI=mongodb://xxx:xxx@xxx.railway.app:27017/flores-db
```

### Servicios que necesitan JWT:
- user-service
- order-service

```bash
JWT_SECRET=<mismo que auth-service>
```

---

## 🎯 Orden Recomendado de Despliegue

**Prioridad Alta (desplegar primero):**
1. ✅ Order Service - Ya redesplegando con nuevo config
2. 🔴 User Service - CRÍTICO, muchos servicios dependen de él
3. 🟡 Review Service - Mejora la experiencia del usuario
4. 🟡 Wishlist Service - Funcionalidad importante
5. 🟢 Contact Service - Menor prioridad

---

## 📊 Estado Actual Post-Configuración

### Railway Build Configuration:
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

### Dockerfile Genérico (microservices/Dockerfile):
- ✅ Instala dependencias de shared module
- ✅ Crea symlink a @flores-victoria/shared
- ✅ Instala dependencias del servicio específico
- ✅ Expone puerto correcto
- ✅ Ejecuta `node src/server.js`

---

## 🔍 Verificación de Despliegue

### Después de cada despliegue, verificar:

1. **Build exitoso:**
   ```bash
   railway logs --service [service-name]
   ```

2. **Health check:**
   ```bash
   curl https://[service-name]-production-xxx.up.railway.app/health
   ```

3. **Dashboard de monitoreo:**
   - Abrir: https://admin-dashboard-service-production.up.railway.app
   - Verificar que el servicio aparece como "HEALTHY"
   - Tiempo de respuesta < 500ms

---

## 🐛 Troubleshooting

### Si el build falla con "Cannot find module":
1. Verificar que `railway.toml` tiene la configuración del Dockerfile
2. Verificar que `Root Directory` en Railway settings está en `microservices`
3. Verificar que `SERVICE_NAME` coincide con el nombre de la carpeta

### Si el health check falla:
1. Verificar variables de entorno con `railway variables`
2. Verificar que `DATABASE_URL` o `MONGODB_URI` están configuradas
3. Ver logs completos con `railway logs --service [name] --follow`

### Si el servicio se reinicia constantemente:
1. Revisar logs para ver el error específico
2. Verificar que todas las variables requeridas están configuradas
3. Verificar conectividad con base de datos

---

## 📈 Métricas Esperadas

Después del despliegue completo:

- **Total servicios:** 9
- **Servicios healthy:** 9 (100%) ✅
- **Servicios críticos operativos:** 4/4 ✅
  - API Gateway ✅
  - Auth Service ✅
  - User Service 🔄
  - Order Service 🔄

---

## ✅ Checklist de Despliegue

### Order Service (en progreso)
- [x] railway.toml actualizado
- [x] Commit y push
- [x] Railway redesplegando automáticamente
- [ ] Verificar build exitoso
- [ ] Verificar health check
- [ ] Actualizar URL en admin-dashboard

### User Service
- [x] railway.toml actualizado
- [x] Commit y push
- [ ] Crear servicio en Railway
- [ ] Configurar variables de entorno
- [ ] Desplegar
- [ ] Verificar health check
- [ ] Actualizar URL en admin-dashboard

### Wishlist Service
- [x] railway.toml actualizado
- [x] Commit y push
- [ ] Crear servicio en Railway
- [ ] Configurar variables de entorno
- [ ] Desplegar
- [ ] Verificar health check
- [ ] Actualizar URL en admin-dashboard

### Review Service
- [x] railway.toml actualizado
- [x] Commit y push
- [ ] Crear servicio en Railway
- [ ] Configurar variables de entorno
- [ ] Desplegar
- [ ] Verificar health check
- [ ] Actualizar URL en admin-dashboard

### Contact Service
- [x] railway.toml actualizado
- [x] Commit y push
- [ ] Crear servicio en Railway
- [ ] Configurar variables de entorno
- [ ] Desplegar
- [ ] Verificar health check
- [ ] Actualizar URL en admin-dashboard

---

## 🎉 Resultado Final Esperado

```
Dashboard: https://admin-dashboard-service-production.up.railway.app

Servicios (9/9 HEALTHY):
✅ API Gateway         - 105ms  - HEALTHY
✅ Auth Service        - 166ms  - HEALTHY
✅ User Service        - <200ms - HEALTHY (nuevo)
✅ Cart Service        - 92ms   - HEALTHY
✅ Order Service       - <200ms - HEALTHY (fixed)
✅ Wishlist Service    - <200ms - HEALTHY (nuevo)
✅ Review Service      - <200ms - HEALTHY (nuevo)
✅ Contact Service     - <200ms - HEALTHY (nuevo)
✅ Product Service     - 119ms  - HEALTHY
```

---

**Siguiente paso:** Esperar a que Railway complete el redespliegue de order-service (~2-3 minutos) y luego proceder con el despliegue de los servicios restantes.
