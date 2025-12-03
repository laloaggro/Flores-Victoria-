# Guía de Despliegue Backend en Railway

## 📋 Arquitectura de Despliegue

```
Cliente → Frontend-v2 → API Gateway → Microservicios
                            ↓
                        PostgreSQL
                        MongoDB
                        Redis
```

## 🚀 Paso a Paso

### 1️⃣ Crear Bases de Datos

En Railway Dashboard del proyecto "Arreglos Victoria":

#### PostgreSQL
1. Click **+ New** → **Database** → **Add PostgreSQL**
2. Railway crea automáticamente: `DATABASE_URL`, `PGHOST`, `PGPORT`, etc.

#### MongoDB  
1. Click **+ New** → **Database** → **Add MongoDB**
2. Railway crea: `MONGO_URL`

#### Redis
1. Click **+ New** → **Database** → **Add Redis**
2. Railway crea: `REDIS_URL`

---

### 2️⃣ Desplegar Auth Service

1. **Crear servicio**:
   - Click **+ New** → **GitHub Repo** → Seleccionar "Flores-Victoria-"
   - Railway detecta el monorepo

2. **Configurar servicio**:
   - Name: `Auth-Service`
   - Root Directory: `/` (dejar vacío, usa railway.json)
   - El archivo `microservices/auth-service/railway.json` especifica todo

3. **Variables de entorno** (Settings → Variables):
   ```bash
   # Generar JWT_SECRET: openssl rand -base64 32
   JWT_SECRET=<pegar-valor-generado>
   
   # Referenciar PostgreSQL
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   
   # Puerto (Railway lo asigna automáticamente)
   PORT=3001
   
   # Configuración
   NODE_ENV=production
   LOG_LEVEL=info
   ```

4. **Deploy**: Railway inicia build automáticamente

5. **Verificar**: 
   ```bash
   curl https://<auth-service-url>.railway.app/health
   ```

---

### 3️⃣ Desplegar Product Service

1. **Crear servicio**:
   - Click **+ New** → **GitHub Repo** → "Flores-Victoria-"
   
2. **Configurar**:
   - Name: `Product-Service`

3. **Variables**:
   ```bash
   MONGO_URL=${{MongoDB.MONGO_URL}}
   MONGODB_URI=${{MongoDB.MONGO_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   PORT=3009
   NODE_ENV=production
   LOG_LEVEL=info
   ```

4. **Deploy** y verificar healthcheck

---

### 4️⃣ Desplegar API Gateway

1. **Crear servicio**:
   - Click **+ New** → **GitHub Repo** → "Flores-Victoria-"

2. **Configurar**:
   - Name: `API-Gateway`

3. **Variables** (IMPORTANTE - URLs de servicios):
   ```bash
   PORT=3000
   NODE_ENV=production
   
   # URLs de microservicios (usar dominios de Railway)
   AUTH_SERVICE_URL=https://${{Auth-Service.RAILWAY_PUBLIC_DOMAIN}}
   PRODUCT_SERVICE_URL=https://${{Product-Service.RAILWAY_PUBLIC_DOMAIN}}
   
   # Redis para rate limiting
   REDIS_URL=${{Redis.REDIS_URL}}
   
   # JWT (mismo que auth-service)
   JWT_SECRET=${{Auth-Service.JWT_SECRET}}
   
   # CORS - URL del frontend
   FRONTEND_URL=https://frontend-v2-production-7508.up.railway.app
   ```

4. **Deploy** y obtener la URL pública del API Gateway

---

### 5️⃣ Actualizar Frontend

El frontend debe apuntar al API Gateway de Railway:

```javascript
// frontend/js/config/api.js
const API_BASE_URL = 'https://<api-gateway-url>.railway.app';
```

Redeploy frontend después de este cambio.

---

## ✅ Verificación

### Healthchecks
```bash
# Auth
curl https://<auth-service>.railway.app/health

# Product
curl https://<product-service>.railway.app/health

# Gateway
curl https://<api-gateway>.railway.app/health
```

### Logs
Railway Dashboard → Service → Logs → Ver en tiempo real

---

## 🔧 Troubleshooting

### "JWT_SECRET no configurado"
```bash
# Generar secret seguro
openssl rand -base64 32

# Copiar a Railway Variables
```

### "Cannot connect to database"
- Verifica plugin activo
- Verifica sintaxis: `${{Postgres.DATABASE_URL}}`
- Revisa logs

### Build falla
- Primera build: 3-5 min (normal)
- Verifica Dockerfile.railway existe
- Verifica railway.json configurado

---

## 📊 Siguiente: Optimizaciones PWA

Una vez backend funcionando, continuamos con:
- Service Worker mejorado
- Manifest.json completo
- Iconos PWA
- Funcionalidad offline

