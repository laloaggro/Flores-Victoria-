# Variables de Entorno Necesarias para Railway - Flores Victoria

## 🎯 Variables Críticas por Servicio

### 1. AUTH-SERVICE (Puerto 3001)

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@postgres.railway.internal:5432/flores_auth
PGHOST=postgres.railway.internal
PGPORT=5432
PGDATABASE=flores_auth
PGUSER=postgres
PGPASSWORD=<railway-generated-password>

# JWT
JWT_SECRET=160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Ambiente
NODE_ENV=production
PORT=3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# URLs de servicios
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
```

### 2. USER-SERVICE (Puerto 3003)

```bash
# Base de datos (Sequelize con PostgreSQL)
DATABASE_URL=postgresql://user:password@postgres.railway.internal:5432/flores_users
DB_HOST=postgres.railway.internal
DB_PORT=5432
DB_NAME=flores_users
DB_USER=postgres
DB_PASSWORD=<railway-generated-password>
DB_DIALECT=postgres

# Ambiente
NODE_ENV=production
PORT=3003

# Jaeger (opcional)
JAEGER_AGENT_HOST=jaeger
JAEGER_AGENT_PORT=6831
```

### 3. PRODUCT-SERVICE (Puerto 3009)

```bash
# MongoDB
MONGODB_URI=mongodb://<user>:<password>@mongodb.railway.internal:27017/flores_products
PRODUCT_SERVICE_MONGODB_URI=mongodb://<user>:<password>@mongodb.railway.internal:27017/flores_products

# Ambiente
NODE_ENV=production
PORT=3009

# Sentry (opcional)
SENTRY_DSN=<your-sentry-dsn>
```

### 4. ORDER-SERVICE (Puerto 3004)

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@postgres.railway.internal:5432/flores_orders
PGHOST=postgres.railway.internal
PGPORT=5432
PGDATABASE=flores_orders

# Ambiente
NODE_ENV=production
PORT=3004

# URLs de servicios
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
PAYMENT_SERVICE_URL=${{PAYMENT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
```

### 5. CART-SERVICE (Puerto 3005)

```bash
# Redis (opcional - usa memoria si no está disponible)
REDIS_URL=redis://:password@redis.railway.internal:6379
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=<railway-generated-password>

# Ambiente
NODE_ENV=production
PORT=3005

# URLs de servicios
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
```

### 6. WISHLIST-SERVICE (Puerto 3006)

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@postgres.railway.internal:5432/flores_wishlist

# Ambiente
NODE_ENV=production
PORT=3006

# URLs de servicios
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
```

### 7. REVIEW-SERVICE (Puerto 3007)

```bash
# MongoDB
MONGODB_URI=mongodb://<user>:<password>@mongodb.railway.internal:27017/flores_reviews

# Ambiente
NODE_ENV=production
PORT=3007

# URLs de servicios
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
```

### 8. CONTACT-SERVICE (Puerto 3008)

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@postgres.railway.internal:5432/flores_contacts

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-password>
EMAIL_FROM=noreply@floresvictoria.com

# Ambiente
NODE_ENV=production
PORT=3008
```

### 9. PAYMENT-SERVICE (Puerto 3018)

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@postgres.railway.internal:5432/flores_payments

# Stripe (para producción)
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

# Ambiente
NODE_ENV=production
PORT=3018

# URLs de servicios
ORDER_SERVICE_URL=${{ORDER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
```

### 10. PROMOTION-SERVICE (Puerto 3019)

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@postgres.railway.internal:5432/flores_promotions

# Ambiente
NODE_ENV=production
PORT=3019

# URLs de servicios
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
```

### 11. NOTIFICATION-SERVICE

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@postgres.railway.internal:5432/flores_notifications

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-password>

# SMS (opcional - Twilio)
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone>

# Push Notifications (opcional - Firebase)
FIREBASE_PROJECT_ID=<your-firebase-project>
FIREBASE_PRIVATE_KEY=<your-firebase-key>
FIREBASE_CLIENT_EMAIL=<your-firebase-email>

# Ambiente
NODE_ENV=production
PORT=3020
```

### 12. API-GATEWAY (Puerto 8080)

```bash
# JWT
JWT_SECRET=160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb

# Ambiente
NODE_ENV=production
PORT=8080

# URLs de todos los servicios
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

# Rate Limiting (opcional - Redis)
REDIS_URL=redis://:password@redis.railway.internal:6379

# Leonardo.ai (opcional - desarrollo)
LEONARDO_API_KEY=<optional>

# Hugging Face (opcional - desarrollo)
HUGGINGFACE_API_KEY=<optional>
```

---

## 📊 Servicios de Base de Datos Necesarios

### PostgreSQL
Crear las siguientes bases de datos:
- `flores_auth` - Para auth-service
- `flores_users` - Para user-service
- `flores_orders` - Para order-service
- `flores_wishlist` - Para wishlist-service
- `flores_contacts` - Para contact-service
- `flores_payments` - Para payment-service
- `flores_promotions` - Para promotion-service
- `flores_notifications` - Para notification-service

### MongoDB
Crear las siguientes colecciones:
- `flores_products` - Para product-service
- `flores_reviews` - Para review-service

### Redis (Opcional)
- Para rate limiting en API Gateway
- Para caché en cart-service

---

## 🚀 Orden de Configuración Recomendado

1. **Configurar PostgreSQL** (Agregar servicio en Railway)
   - Crear base de datos principal
   - Obtener `DATABASE_URL`
   - Crear múltiples bases de datos si es necesario

2. **Configurar MongoDB** (Agregar servicio en Railway)
   - Obtener `MONGODB_URI`
   - Configurar autenticación

3. **Configurar Redis** (Opcional)
   - Agregar servicio Redis
   - Obtener `REDIS_URL`

4. **Configurar servicios base primero:**
   - AUTH-SERVICE (requiere PostgreSQL + JWT_SECRET)
   - USER-SERVICE (requiere PostgreSQL)
   - PRODUCT-SERVICE (requiere MongoDB)

5. **Configurar servicios dependientes:**
   - ORDER-SERVICE (requiere PostgreSQL + URLs de servicios)
   - CART-SERVICE (requiere URLs de servicios + Redis opcional)
   - WISHLIST-SERVICE (requiere PostgreSQL + URLs de servicios)
   - REVIEW-SERVICE (requiere MongoDB + URLs de servicios)
   - PAYMENT-SERVICE (requiere PostgreSQL + Stripe)
   - PROMOTION-SERVICE (requiere PostgreSQL)
   - CONTACT-SERVICE (requiere PostgreSQL + SMTP opcional)
   - NOTIFICATION-SERVICE (requiere PostgreSQL + SMTP/Twilio/Firebase opcionales)

6. **Configurar API Gateway** (requiere URLs de todos los servicios + JWT_SECRET)

---

## 🔍 Verificación de Variables

Para verificar que todas las variables están configuradas correctamente:

```bash
# 1. En Railway Dashboard
railway service -> Variables tab -> Verificar que todas estén presentes

# 2. Probar health checks
curl https://api-gateway-production-949b.up.railway.app/health
curl https://api-gateway-production-949b.up.railway.app/auth/health
curl https://api-gateway-production-949b.up.railway.app/api/products/health
curl https://api-gateway-production-949b.up.railway.app/api/users/health

# 3. Ver logs de servicios
railway logs -s AUTH-SERVICE
railway logs -s PRODUCT-SERVICE
railway logs -s USER-SERVICE
```

---

## ⚠️ Variables Críticas para Producción

**DEBEN estar configuradas:**
- ✅ `JWT_SECRET` (auth-service y api-gateway)
- ✅ `DATABASE_URL` o variables de PostgreSQL
- ✅ `MONGODB_URI` para servicios que usan MongoDB
- ✅ `NODE_ENV=production`

**Opcionales pero recomendadas:**
- `REDIS_URL` (para mejor rendimiento)
- `SENTRY_DSN` (para monitoreo de errores)
- `SMTP_*` (para envío de emails)
- `STRIPE_*` (para pagos reales)

**Solo para desarrollo:**
- `LEONARDO_API_KEY`
- `HUGGINGFACE_API_KEY`
- `JAEGER_AGENT_HOST`

---

## 🔗 Referencias

- Documento principal: `DEPLOYMENT_EXITOSO_RAILWAY.md`
- Variables del API Gateway: `API_GATEWAY_ENV_VARS.txt`
- Railway Docs: https://docs.railway.app/
