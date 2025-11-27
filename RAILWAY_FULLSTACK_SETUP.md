# 🚀 Configuración Completa de Railway - Flores Victoria

**Fecha**: 27 de Noviembre 2025  
**Análisis**: Configuración fullstack completa para Railway deployment

---

## 📊 Arquitectura del Proyecto

### Microservicios Backend (11 servicios)
1. **api-gateway** (Puerto 3000) - Punto de entrada único, proxy a todos los servicios
2. **auth-service** (Puerto 3001) - Autenticación JWT, manejo de usuarios
3. **user-service** (Puerto 3003) - CRUD de usuarios
4. **product-service** (Puerto 3009) - Catálogo de productos
5. **order-service** (Puerto 3004) - Gestión de pedidos
6. **cart-service** (Puerto 3005) - Carrito de compras
7. **wishlist-service** (Puerto 3006) - Lista de deseos
8. **review-service** (Puerto 3007) - Reseñas de productos
9. **contact-service** (Puerto 3008) - Formularios de contacto
10. **payment-service** (Puerto 3018) - Procesamiento de pagos (Stripe, PayPal, Transbank)
11. **promotion-service** (Puerto 3019) - Promociones y descuentos

### Frontend
- **frontend** (Puerto 5173) - Aplicación web (Vite + HTML/CSS/JS)
- **admin-panel** (Puerto 3021) - Panel de administración

### Bases de Datos Requeridas
- **PostgreSQL** - auth-service, user-service, order-service
- **MongoDB** - product-service (catálogo), order-service (detalles)
- **Redis** - Rate limiting, caché, sesiones

---

## 🏗️ Estrategia de Deployment en Railway

### Opción Recomendada: **Servicios Separados** (12-14 servicios Railway)

Railway funciona mejor con servicios individuales en lugar de docker-compose monolítico.

**Ventajas**:
- ✅ Escalado independiente por servicio
- ✅ Logs separados y más fáciles de debuggear
- ✅ Despliegues incrementales (solo redeploya el servicio modificado)
- ✅ Health checks individuales
- ✅ Railway optimizado para esta arquitectura

**Estructura**:
```
Railway Project: Flores-Victoria
├── PostgreSQL (managed database)
├── MongoDB (managed database)
├── Redis (managed database)
├── api-gateway (service)
├── auth-service (service)
├── user-service (service)
├── product-service (service)
├── order-service (service)
├── cart-service (service)
├── wishlist-service (service)
├── review-service (service)
├── contact-service (service)
├── payment-service (service)
├── promotion-service (service)
├── frontend (service)
└── admin-panel (service)
```

---

## 📝 Plan de Implementación (Paso a Paso)

### FASE 1: Crear railway.toml para Cada Servicio

Cada microservicio necesita su propio `railway.toml` en su directorio:

**Ubicaciones**:
- `microservices/auth-service/railway.toml`
- `microservices/user-service/railway.toml`
- `microservices/product-service/railway.toml`
- (etc. para todos los servicios)

**Template base** (ajustar por servicio):
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "microservices/{service-name}/Dockerfile"

[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/health"
healthcheckTimeout = 100
startCommand = "node src/server.js"
```

### FASE 2: Configurar Bases de Datos en Railway

**Paso 1**: Crear proyecto en Railway
- https://railway.app → "New Project" → "Empty Project"
- Nombre: "Flores-Victoria-Production"

**Paso 2**: Agregar bases de datos managed
```bash
# En Railway dashboard:
1. Click "+ New" → "Database" → "PostgreSQL"
   - Railway genera: DATABASE_URL automáticamente
   
2. Click "+ New" → "Database" → "MongoDB"  
   - Railway genera: MONGODB_URI automáticamente
   
3. Click "+ New" → "Database" → "Redis"
   - Railway genera: REDIS_URL automáticamente
```

### FASE 3: Variables de Entorno Compartidas

**Configurar en Railway → Settings → Shared Variables**:

```env
# Core
NODE_ENV=production
JWT_SECRET=<generar: openssl rand -base64 32>
SESSION_SECRET=<generar: openssl rand -base64 32>

# Bases de datos (Railway las genera automáticamente)
# DATABASE_URL - generado por PostgreSQL
# MONGODB_URI - generado por MongoDB  
# REDIS_URL - generado por Redis

# API Keys externas (opcional)
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
TRANSBANK_API_KEY=...
```

### FASE 4: Desplegar Servicios en Orden

**Orden de deployment** (crítico para dependencias):

```bash
1. Bases de datos (PostgreSQL, MongoDB, Redis) - Ya creadas en Fase 2

2. Servicios base (sin dependencias):
   - auth-service (depende solo de PostgreSQL)
   - user-service (depende solo de PostgreSQL)
   - product-service (depende solo de MongoDB)

3. Servicios intermedios:
   - order-service (PostgreSQL + MongoDB)
   - cart-service (Redis)
   - wishlist-service (Redis)
   - review-service (MongoDB)
   - contact-service (PostgreSQL)
   - payment-service (sin DB)
   - promotion-service (PostgreSQL/MongoDB)

4. API Gateway (depende de todos los servicios):
   - api-gateway

5. Frontend (depende del API Gateway):
   - frontend
   - admin-panel
```

**Cómo desplegar cada servicio**:
```bash
# Para cada servicio:
1. Railway Dashboard → "+ New" → "GitHub Repo"
2. Seleccionar: Flores-Victoria- (tu repo)
3. Root Directory: "microservices/{service-name}"
4. Railway detecta railway.toml automáticamente
5. Click "Deploy"
```

### FASE 5: Configurar Variables por Servicio

**API Gateway** (Puerto 3000):
```env
PORT=3000
AUTH_SERVICE_URL=http://auth-service.railway.internal:3001
USER_SERVICE_URL=http://user-service.railway.internal:3003
PRODUCT_SERVICE_URL=http://product-service.railway.internal:3009
ORDER_SERVICE_URL=http://order-service.railway.internal:3004
CART_SERVICE_URL=http://cart-service.railway.internal:3005
WISHLIST_SERVICE_URL=http://wishlist-service.railway.internal:3006
REVIEW_SERVICE_URL=http://review-service.railway.internal:3007
CONTACT_SERVICE_URL=http://contact-service.railway.internal:3008
PAYMENT_SERVICE_URL=http://payment-service.railway.internal:3018
PROMOTION_SERVICE_URL=http://promotion-service.railway.internal:3019
```

**Auth Service** (Puerto 3001):
```env
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

**User Service** (Puerto 3003):
```env
PORT=3003
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

**Product Service** (Puerto 3009):
```env
PORT=3009
MONGODB_URI=${{MongoDB.MONGODB_URI}}/products_db
REDIS_URL=${{Redis.REDIS_URL}}
DISABLE_CACHE=false
```

**Order Service** (Puerto 3004):
```env
PORT=3004
DATABASE_URL=${{Postgres.DATABASE_URL}}
MONGODB_URI=${{MongoDB.MONGODB_URI}}/orders_db
REDIS_URL=${{Redis.REDIS_URL}}
```

**Cart Service** (Puerto 3005):
```env
PORT=3005
REDIS_URL=${{Redis.REDIS_URL}}
```

**Wishlist Service** (Puerto 3006):
```env
PORT=3006
REDIS_URL=${{Redis.REDIS_URL}}
```

**Review Service** (Porto 3007):
```env
PORT=3007
MONGODB_URI=${{MongoDB.MONGODB_URI}}/reviews_db
```

**Contact Service** (Puerto 3008):
```env
PORT=3008
DATABASE_URL=${{Postgres.DATABASE_URL}}
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=<app-password>
```

**Payment Service** (Puerto 3018):
```env
PORT=3018
STRIPE_SECRET_KEY=${{shared.STRIPE_SECRET_KEY}}
PAYPAL_CLIENT_ID=${{shared.PAYPAL_CLIENT_ID}}
PAYPAL_CLIENT_SECRET=${{shared.PAYPAL_CLIENT_SECRET}}
```

**Promotion Service** (Puerto 3019):
```env
PORT=3019
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

**Frontend** (Puerto 5173):
```env
VITE_API_URL=https://api-gateway-production.up.railway.app
```

**Admin Panel** (Puerto 3021):
```env
PORT=3021
VITE_API_URL=https://api-gateway-production.up.railway.app
```

---

## 🔧 Configuración de Networking

Railway proporciona networking interno automático:

- **URLs públicas**: `https://{service-name}-production.up.railway.app`
- **URLs internas**: `http://{service-name}.railway.internal:{port}`

**IMPORTANTE**: Los microservicios se comunican vía URLs internas, solo API Gateway y Frontend son públicos.

### Configurar Networking en Railway:

1. **API Gateway**: Público (Generate Domain)
2. **Frontend**: Público (Generate Domain)
3. **Admin Panel**: Público (Generate Domain)
4. **Todos los demás**: Privado (sin dominio público)

---

## 🏥 Health Checks

Todos los servicios tienen endpoint `/health`:

```bash
# Verificar desde Railway:
curl https://api-gateway-production.up.railway.app/health
curl https://auth-service.railway.internal:3001/health
```

**Configuración Railway** (en cada railway.toml):
```toml
[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
```

---

## 💰 Estimación de Costos Railway

**Plan Hobby ($5/mes)** - Suficiente para empezar:
- 500 horas de ejecución/mes
- $0.01/hora después

**Estimación mensual**:
- 14 servicios × 24h × 30 días = 10,080 horas/mes
- Con plan Hobby: ~$50-60/mes
- **Recomendación**: Usar 2-3 réplicas de servicios críticos, mantener otros en 1 réplica

**Optimizaciones**:
- Desactivar servicios no críticos en desarrollo (contact, promotion)
- Usar Redis shared para múltiples servicios
- Auto-sleep para admin-panel (bajo tráfico)

---

## 🚀 Comando de Deployment Automatizado

Crear script para deployment:

```bash
#!/bin/bash
# deploy-railway.sh

echo "🚀 Deploying Flores Victoria to Railway..."

# 1. Generar secretos
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

echo "✅ Secrets generated"

# 2. Push código
git add .
git commit -m "feat: railway deployment configuration"
git push origin main

echo "✅ Code pushed"

# 3. Railway CLI deployment (requiere railway CLI instalado)
railway login
railway link

# Deploy databases primero
echo "📦 Deploying databases..."
railway up -d postgres mongodb redis

# Deploy servicios
echo "🔧 Deploying microservices..."
railway up -d auth-service user-service product-service
railway up -d order-service cart-service wishlist-service
railway up -d review-service contact-service payment-service promotion-service

# Deploy gateway y frontend
echo "🌐 Deploying gateway and frontend..."
railway up -d api-gateway
railway up -d frontend admin-panel

echo "✅ Deployment complete!"
echo "🔗 Check status: railway status"
```

---

## ✅ Checklist de Deployment

- [ ] Crear proyecto Railway
- [ ] Agregar PostgreSQL managed
- [ ] Agregar MongoDB managed
- [ ] Agregar Redis managed
- [ ] Generar JWT_SECRET y SESSION_SECRET
- [ ] Configurar shared variables
- [ ] Crear railway.toml para auth-service
- [ ] Crear railway.toml para user-service
- [ ] Crear railway.toml para product-service
- [ ] Crear railway.toml para order-service
- [ ] Crear railway.toml para cart-service
- [ ] Crear railway.toml para wishlist-service
- [ ] Crear railway.toml para review-service
- [ ] Crear railway.toml para contact-service
- [ ] Crear railway.toml para payment-service
- [ ] Crear railway.toml para promotion-service
- [ ] Desplegar auth-service
- [ ] Desplegar user-service
- [ ] Desplegar product-service
- [ ] Desplegar order-service
- [ ] Desplegar cart/wishlist/review/contact
- [ ] Desplegar payment/promotion
- [ ] Desplegar api-gateway
- [ ] Configurar URLs internas en api-gateway
- [ ] Generar dominio público para api-gateway
- [ ] Desplegar frontend con VITE_API_URL
- [ ] Desplegar admin-panel con VITE_API_URL
- [ ] Verificar health checks de todos los servicios
- [ ] Probar flujo completo: Login → Productos → Carrito → Orden
- [ ] Configurar dominios personalizados (opcional)
- [ ] Configurar monitoreo y alertas

---

## 🐛 Troubleshooting Común

### Servicio no puede conectarse a base de datos
```bash
# Verificar variables:
railway variables

# Verificar logs:
railway logs {service-name}

# Solución: Verificar que DATABASE_URL/MONGODB_URI/REDIS_URL estén configuradas
```

### Error "MODULE_NOT_FOUND @flores-victoria/shared"
```bash
# Ya resuelto en Dockerfiles actuales (copian shared DESPUÉS de npm install)
# Si persiste, verificar que Dockerfile tenga:
COPY microservices/shared node_modules/@flores-victoria/shared
```

### Rate limiter errors
```bash
# Ya resuelto: código ahora usa REDIS_URL automáticamente
# Verificar que REDIS_URL esté configurada
```

### API Gateway no puede encontrar servicios
```bash
# Verificar variables AUTH_SERVICE_URL, USER_SERVICE_URL, etc.
# Usar formato: http://{service-name}.railway.internal:{port}
```

---

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Pricing](https://railway.app/pricing)
- [Railway Discord](https://discord.gg/railway)

---

**Siguiente paso**: Crear railway.toml para cada servicio
