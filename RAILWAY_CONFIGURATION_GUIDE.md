# 🚀 Guía de Configuración Railway - Paso a Paso

**Fecha**: 9 de diciembre de 2025  
**Proyecto**: Arreglos Victoria  
**Commit**: 0d159e1 (Dockerfiles deshabilitados)

---

## 📋 Servicios a Configurar

| #   | Servicio         | Puerto | Base de Datos | Redis | Estado         |
| --- | ---------------- | ------ | ------------- | ----- | -------------- |
| 1   | USER-SERVICE     | 3002   | PostgreSQL    | ✅    | ⚠️ **URGENTE** |
| 2   | CART-SERVICE     | 3003   | MongoDB       | ✅    | ⏳ Pendiente   |
| 3   | ORDER-SERVICE    | 3004   | MongoDB       | ✅    | ⏳ Pendiente   |
| 4   | WISHLIST-SERVICE | 3005   | MongoDB       | ✅    | ⏳ Pendiente   |
| 5   | REVIEW-SERVICE   | 3006   | MongoDB       | ✅    | ⏳ Pendiente   |
| 6   | CONTACT-SERVICE  | 3007   | MongoDB       | ❌    | ⏳ Pendiente   |

---

## 🎯 PASO 1: Configurar USER-SERVICE (PRIORITARIO)

### Por qué es urgente:

- Actualmente está ejecutando código de `auth-service` ❌
- Puerto configurado como `3003` en lugar de `3002` ❌
- Custom Build Command apunta al servicio equivocado ❌

### Ir a Railway Dashboard:

```
https://railway.app → Arreglos Victoria → USER-SERVICE → Settings
```

### A. Configurar Build Settings

1. **Buscar**: "Build" o "Deploy" section
2. **Root Directory**:

   ```
   (DEJAR VACÍO - muy importante!)
   ```

3. **Custom Build Command**:

   ```bash
   cd microservices/shared && npm install --production && cd ../user-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
   ```

   ⚠️ **Importante**: Asegúrate que dice `user-service` y NO `auth-service`

4. **Custom Start Command**:
   ```bash
   cd microservices/user-service && node src/server.js
   ```

### B. Configurar Variables de Entorno

Click en "Variables" tab:

```bash
PORT=3002
NODE_ENV=production
SERVICE_NAME=USER-SERVICE
DATABASE_URL=postgresql://postgres:GnpChUscOAzadwBbRWTgGueejprKeVUf@postgres.railway.internal:5432/railway
REDIS_URL=redis://default:rLfTSWwWzVGWLmSwSjXPGMmrdWZagqrM@redis-4sdp.railway.internal:6379
JWT_SECRET=160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

⚠️ **Verificar especialmente**:

- `PORT=3002` (NO 3003)
- `SERVICE_NAME=USER-SERVICE`

### C. Trigger Deploy

1. Click en "Deployments" tab
2. Click en botón "Deploy" o "Redeploy"
3. Esperar build (aprox. 2-3 minutos)

### D. Verificar Logs

Después del deploy, click en "View Logs" y buscar:

✅ **Logs correctos**:

```
[info] [user-service]: User Service running on port 3002
[info] [user-service]: Connected to PostgreSQL
[info] [user-service]: Connected to Redis
```

❌ **Si ves esto (INCORRECTO)**:

```
[info] [auth-service]: Servicio de Autenticación corriendo en puerto 3003
```

→ Volver al Custom Build Command y verificar que dice `user-service`

---

## 🎯 PASO 2: Configurar CART-SERVICE

### Ir a Railway Dashboard:

```
https://railway.app → Arreglos Victoria → CART-SERVICE → Settings
```

### A. Build Settings

**Root Directory**: (vacío)

**Custom Build Command**:

```bash
cd microservices/shared && npm install --production && cd ../cart-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```bash
cd microservices/cart-service && node src/server.js
```

### B. Variables de Entorno

```bash
PORT=3003
NODE_ENV=production
SERVICE_NAME=CART-SERVICE
DATABASE_URL=mongodb://mongo:27017/flores_cart
REDIS_URL=redis://default:rLfTSWwWzVGWLmSwSjXPGMmrdWZagqrM@redis-4sdp.railway.internal:6379
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

### C. Deploy y Verificar

Click "Deploy" y verificar logs:

```
✅ [cart-service]: Cart Service running on port 3003
✅ Connected to MongoDB
✅ Connected to Redis
```

---

## 🎯 PASO 3: Configurar ORDER-SERVICE

### Ir a Railway Dashboard:

```
https://railway.app → Arreglos Victoria → ORDER-SERVICE → Settings
```

### A. Build Settings

**Root Directory**: (vacío)

**Custom Build Command**:

```bash
cd microservices/shared && npm install --production && cd ../order-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```bash
cd microservices/order-service && node src/server.js
```

### B. Variables de Entorno

```bash
PORT=3004
NODE_ENV=production
SERVICE_NAME=ORDER-SERVICE
DATABASE_URL=mongodb://mongo:27017/flores_orders
REDIS_URL=redis://default:rLfTSWwWzVGWLmSwSjXPGMmrdWZagqrM@redis-4sdp.railway.internal:6379
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

### C. Deploy y Verificar

Click "Deploy" y verificar logs:

```
✅ [order-service]: Order Service running on port 3004
✅ Connected to MongoDB
✅ Connected to Redis
```

---

## 🎯 PASO 4: Configurar WISHLIST-SERVICE

### Ir a Railway Dashboard:

```
https://railway.app → Arreglos Victoria → WISHLIST-SERVICE → Settings
```

### A. Build Settings

**Root Directory**: (vacío)

**Custom Build Command**:

```bash
cd microservices/shared && npm install --production && cd ../wishlist-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```bash
cd microservices/wishlist-service && node src/server.js
```

### B. Variables de Entorno

```bash
PORT=3005
NODE_ENV=production
SERVICE_NAME=WISHLIST-SERVICE
DATABASE_URL=mongodb://mongo:27017/flores_wishlist
REDIS_URL=redis://default:rLfTSWwWzVGWLmSwSjXPGMmrdWZagqrM@redis-4sdp.railway.internal:6379
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

### C. Deploy y Verificar

Click "Deploy" y verificar logs:

```
✅ [wishlist-service]: Wishlist Service running on port 3005
✅ Connected to MongoDB
✅ Connected to Redis
```

---

## 🎯 PASO 5: Configurar REVIEW-SERVICE

### Ir a Railway Dashboard:

```
https://railway.app → Arreglos Victoria → REVIEW-SERVICE → Settings
```

### A. Build Settings

**Root Directory**: (vacío)

**Custom Build Command**:

```bash
cd microservices/shared && npm install --production && cd ../review-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```bash
cd microservices/review-service && node src/server.js
```

### B. Variables de Entorno

```bash
PORT=3006
NODE_ENV=production
SERVICE_NAME=REVIEW-SERVICE
DATABASE_URL=mongodb://mongo:27017/flores_reviews
REDIS_URL=redis://default:rLfTSWwWzVGWLmSwSjXPGMmrdWZagqrM@redis-4sdp.railway.internal:6379
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

### C. Deploy y Verificar

Click "Deploy" y verificar logs:

```
✅ [review-service]: Review Service running on port 3006
✅ Connected to MongoDB
✅ Connected to Redis
```

---

## 🎯 PASO 6: Configurar CONTACT-SERVICE

### Ir a Railway Dashboard:

```
https://railway.app → Arreglos Victoria → CONTACT-SERVICE → Settings
```

### A. Build Settings

**Root Directory**: (vacío)

**Custom Build Command**:

```bash
cd microservices/shared && npm install --production && cd ../contact-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```bash
cd microservices/contact-service && node src/server.js
```

### B. Variables de Entorno

```bash
PORT=3007
NODE_ENV=production
SERVICE_NAME=CONTACT-SERVICE
DATABASE_URL=mongodb://mongo:27017/flores_contact
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

⚠️ **Nota**: CONTACT-SERVICE NO usa Redis (solo MongoDB)

### C. Deploy y Verificar

Click "Deploy" y verificar logs:

```
✅ [contact-service]: Contact Service running on port 3007
✅ Connected to MongoDB
```

---

## ✅ PASO 7: Verificación Final

### Desde Terminal Local:

```bash
# Verificar healthchecks de todos los servicios
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/railway-verify-all-services.sh
```

**Resultado Esperado**:

```
✅ product-service (uptime: XXXs)
✅ auth-service (uptime: XXXs)
✅ api-gateway (uptime: XXXs)
✅ user-service (uptime: XXXs)
✅ cart-service (uptime: XXXs)
✅ order-service (uptime: XXXs)
✅ wishlist-service (uptime: XXXs)
✅ review-service (uptime: XXXs)
✅ contact-service (uptime: XXXs)

Resumen:
Healthy: 9
Unhealthy: 0
Unknown: 0
```

### Verificar Logs Individuales:

```bash
# Cambiar a cada servicio y ver logs
railway service USER-SERVICE && railway logs --tail 20
railway service CART-SERVICE && railway logs --tail 20
railway service ORDER-SERVICE && railway logs --tail 20
railway service WISHLIST-SERVICE && railway logs --tail 20
railway service REVIEW-SERVICE && railway logs --tail 20
railway service CONTACT-SERVICE && railway logs --tail 20
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "MODULE_NOT_FOUND: @flores-victoria/shared"

**Causa**: Custom Build Command no configurado o incorrecto.

**Solución**:

1. Verificar que Root Directory esté VACÍO
2. Verificar que Custom Build Command incluya:
   ```bash
   cd microservices/shared && npm install --production
   ```
   y
   ```bash
   mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
   ```

### Problema 2: Logs muestran servicio incorrecto

**Ejemplo**: USER-SERVICE muestra logs de `[auth-service]`

**Causa**: Custom Build Command apunta al servicio equivocado.

**Solución**:

1. Verificar Custom Build Command
2. Asegurarse que dice `cd ../[NOMBRE-CORRECTO]-service`
3. Redeploy después de corregir

### Problema 3: Puerto incorrecto en logs

**Ejemplo**: Servicio corre en puerto 3003 cuando debería ser 3002

**Causa**: Variable `PORT` configurada incorrectamente.

**Solución**:

1. Variables → Verificar `PORT=XXXX`
2. Debe coincidir con el puerto asignado del servicio
3. Redeploy después de corregir

### Problema 4: Build timeout o muy lento

**Causa**: npm install descargando muchas dependencias.

**Solución**:

- Railway cachea automáticamente node_modules
- Primer build puede tomar 3-5 minutos
- Builds subsecuentes serán más rápidos (1-2 minutos)

### Problema 5: Database connection error

**Causa**: DATABASE_URL no configurado o incorrecto.

**Solución PostgreSQL**:

```bash
DATABASE_URL=postgresql://postgres:GnpChUscOAzadwBbRWTgGueejprKeVUf@postgres.railway.internal:5432/railway
```

**Solución MongoDB**:

```bash
DATABASE_URL=mongodb://mongo:27017/flores_[servicio]
```

### Problema 6: Redis connection error (no crítico)

**Síntoma**: Logs muestran "Redis no disponible, usando memoria local"

**Impacto**: Servicio funciona pero sin caché distribuido.

**Solución**:

```bash
REDIS_URL=redis://default:rLfTSWwWzVGWLmSwSjXPGMmrdWZagqrM@redis-4sdp.railway.internal:6379
```

---

## 📊 Checklist de Progreso

Marca cada servicio cuando esté completamente configurado y desplegado:

- [ ] **USER-SERVICE** (3002)
  - [ ] Root Directory vacío
  - [ ] Custom Build Command configurado (user-service)
  - [ ] Custom Start Command configurado
  - [ ] Variables de entorno (PORT=3002)
  - [ ] Deployed
  - [ ] Logs verificados (muestra user-service, puerto 3002)

- [ ] **CART-SERVICE** (3003)
  - [ ] Root Directory vacío
  - [ ] Custom Build Command configurado
  - [ ] Custom Start Command configurado
  - [ ] Variables de entorno (PORT=3003)
  - [ ] Deployed
  - [ ] Logs verificados

- [ ] **ORDER-SERVICE** (3004)
  - [ ] Root Directory vacío
  - [ ] Custom Build Command configurado
  - [ ] Custom Start Command configurado
  - [ ] Variables de entorno (PORT=3004)
  - [ ] Deployed
  - [ ] Logs verificados

- [ ] **WISHLIST-SERVICE** (3005)
  - [ ] Root Directory vacío
  - [ ] Custom Build Command configurado
  - [ ] Custom Start Command configurado
  - [ ] Variables de entorno (PORT=3005)
  - [ ] Deployed
  - [ ] Logs verificados

- [ ] **REVIEW-SERVICE** (3006)
  - [ ] Root Directory vacío
  - [ ] Custom Build Command configurado
  - [ ] Custom Start Command configurado
  - [ ] Variables de entorno (PORT=3006)
  - [ ] Deployed
  - [ ] Logs verificados

- [ ] **CONTACT-SERVICE** (3007)
  - [ ] Root Directory vacío
  - [ ] Custom Build Command configurado
  - [ ] Custom Start Command configurado
  - [ ] Variables de entorno (PORT=3007, sin Redis)
  - [ ] Deployed
  - [ ] Logs verificados

- [ ] **Verificación Final**
  - [ ] Health check script ejecutado
  - [ ] 9/9 servicios healthy
  - [ ] No errores en logs

---

## ⏱️ Tiempo Estimado

- **USER-SERVICE**: 5-7 minutos (incluye build time)
- **Cada servicio adicional**: 5-6 minutos
- **Total estimado**: 35-40 minutos para los 6 servicios

---

## 🎓 Tips para Ir Más Rápido

1. **Abrir múltiples tabs** de Railway Dashboard (uno por servicio)
2. **Copiar/pegar** los comandos exactamente como aparecen aquí
3. **No cerrar logs** mientras hace build - así puedes ver errores inmediatamente
4. **Hacer servicios en paralelo** - configurar uno mientras otro hace build
5. **Verificar cada servicio** antes de pasar al siguiente

---

## 📞 Si Necesitas Ayuda

Si un servicio falla durante el deploy:

1. Copia los logs completos del error
2. Verifica que Root Directory esté vacío
3. Verifica que el nombre del servicio en Custom Build Command sea correcto
4. Compara tu configuración con AUTH-SERVICE (que ya funciona)

---

**¡Empieza con USER-SERVICE ahora!** Una vez que funcione, los demás serán rápidos. 🚀
