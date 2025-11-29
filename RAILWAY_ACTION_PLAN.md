# 🚀 Plan de Acción - Configuración Completa Railway

## Estado Actual
- ✅ API Gateway desplegado y funcionando
- ✅ JWT_SECRET configurado correctamente
- ✅ 12/12 servicios creados en Railway
- ⚠️ Microservicios retornan HTTP 502 (no están disponibles)
- ⚠️ Bases de datos no configuradas

## 🎯 Objetivo
Configurar todos los microservicios con sus bases de datos y variables de entorno necesarias.

---

## 📋 Plan de Acción (Paso a Paso)

### FASE 1: Configurar Servicios de Base de Datos (20-30 min)

#### 1.1 Agregar PostgreSQL
```bash
# En Railway Dashboard:
1. Click en "New" → "Database" → "Add PostgreSQL"
2. Railway generará automáticamente:
   - DATABASE_URL
   - PGHOST
   - PGPORT
   - PGDATABASE
   - PGUSER
   - PGPASSWORD

3. Copiar el DATABASE_URL generado (formato):
   postgresql://postgres:password@containers-us-west-xxx.railway.app:7890/railway
```

**Bases de datos necesarias:**
- `flores_auth` - Para auth-service
- `flores_users` - Para user-service
- `flores_orders` - Para order-service
- `flores_wishlist` - Para wishlist-service
- `flores_contacts` - Para contact-service
- `flores_payments` - Para payment-service
- `flores_promotions` - Para promotion-service
- `flores_notifications` - Para notification-service

**Crear las bases de datos adicionales:**
```sql
-- Conectarse al PostgreSQL via Railway CLI o psql
railway connect PostgreSQL

-- Crear todas las bases de datos
CREATE DATABASE flores_auth;
CREATE DATABASE flores_users;
CREATE DATABASE flores_orders;
CREATE DATABASE flores_wishlist;
CREATE DATABASE flores_contacts;
CREATE DATABASE flores_payments;
CREATE DATABASE flores_promotions;
CREATE DATABASE flores_notifications;

-- Verificar
\l
```

#### 1.2 Agregar MongoDB
```bash
# En Railway Dashboard:
1. Click en "New" → "Database" → "Add MongoDB"
2. Railway generará:
   - MONGOHOST
   - MONGOPORT
   - MONGOUSER
   - MONGOPASSWORD
   - MONGO_URL

3. Formato del MONGODB_URI:
   mongodb://mongo:password@containers-us-west-xxx.railway.app:7891
```

#### 1.3 Agregar Redis (Opcional pero Recomendado)
```bash
# En Railway Dashboard:
1. Click en "New" → "Database" → "Add Redis"
2. Railway generará:
   - REDISHOST
   - REDISPORT
   - REDISPASSWORD
   - REDIS_URL
```

---

### FASE 2: Configurar AUTH-SERVICE (Servicio Base - 5 min)

```bash
# Variables a configurar en Railway:
railway service --select AUTH-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3001

# Base de datos
railway variables set DATABASE_URL="postgresql://user:pass@host:port/flores_auth"
railway variables set PGDATABASE=flores_auth

# JWT (ya configurado pero verificar)
railway variables set JWT_SECRET="160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb"
railway variables set JWT_EXPIRES_IN=7d
railway variables set JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX=100
```

**Probar:**
```bash
# Esperar 2-3 minutos para redespliegue
railway logs -s AUTH-SERVICE

# Verificar health endpoint
curl https://api-gateway-production-949b.up.railway.app/auth/health
```

---

### FASE 3: Configurar USER-SERVICE (5 min)

```bash
railway service --select USER-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3003

# Base de datos
railway variables set DATABASE_URL="postgresql://user:pass@host:port/flores_users"
railway variables set DB_HOST="<PGHOST>"
railway variables set DB_PORT=5432
railway variables set DB_NAME=flores_users
railway variables set DB_USER=postgres
railway variables set DB_PASSWORD="<PGPASSWORD>"
railway variables set DB_DIALECT=postgres
```

**Probar:**
```bash
curl https://api-gateway-production-949b.up.railway.app/api/users/health
```

---

### FASE 4: Configurar PRODUCT-SERVICE (5 min)

```bash
railway service --select PRODUCT-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3009

# MongoDB
railway variables set MONGODB_URI="mongodb://user:pass@host:port/flores_products"
railway variables set PRODUCT_SERVICE_MONGODB_URI="mongodb://user:pass@host:port/flores_products"
```

**Probar:**
```bash
curl https://api-gateway-production-949b.up.railway.app/api/products/health
```

---

### FASE 5: Configurar ORDER-SERVICE (5 min)

```bash
railway service --select ORDER-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3004

# Base de datos
railway variables set DATABASE_URL="postgresql://user:pass@host:port/flores_orders"
railway variables set PGDATABASE=flores_orders

# URLs de servicios (Railway references)
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set PAYMENT_SERVICE_URL='${{PAYMENT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
```

---

### FASE 6: Configurar CART-SERVICE (5 min)

```bash
railway service --select CART-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3005

# Redis (opcional)
railway variables set REDIS_URL="redis://:password@host:port"

# URLs de servicios
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
```

---

### FASE 7: Configurar WISHLIST-SERVICE (5 min)

```bash
railway service --select WISHLIST-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3006

# Base de datos
railway variables set DATABASE_URL="postgresql://user:pass@host:port/flores_wishlist"
railway variables set PGDATABASE=flores_wishlist

# URLs de servicios
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
```

---

### FASE 8: Configurar REVIEW-SERVICE (5 min)

```bash
railway service --select REVIEW-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3007

# MongoDB
railway variables set MONGODB_URI="mongodb://user:pass@host:port/flores_reviews"

# URLs de servicios
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
```

---

### FASE 9: Configurar CONTACT-SERVICE (5 min)

```bash
railway service --select CONTACT-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3008

# Base de datos
railway variables set DATABASE_URL="postgresql://user:pass@host:port/flores_contacts"
railway variables set PGDATABASE=flores_contacts

# SMTP (opcional para envío de emails)
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-app-password"
railway variables set EMAIL_FROM="noreply@floresvictoria.com"
```

---

### FASE 10: Configurar PAYMENT-SERVICE (5 min)

```bash
railway service --select PAYMENT-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3018

# Base de datos
railway variables set DATABASE_URL="postgresql://user:pass@host:port/flores_payments"
railway variables set PGDATABASE=flores_payments

# Stripe (para pagos reales)
railway variables set STRIPE_SECRET_KEY="sk_test_..."
railway variables set STRIPE_PUBLISHABLE_KEY="pk_test_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."

# URLs de servicios
railway variables set ORDER_SERVICE_URL='${{ORDER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
```

---

### FASE 11: Configurar PROMOTION-SERVICE (5 min)

```bash
railway service --select PROMOTION-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3019

# Base de datos
railway variables set DATABASE_URL="postgresql://user:pass@host:port/flores_promotions"
railway variables set PGDATABASE=flores_promotions

# URLs de servicios
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
```

---

### FASE 12: Configurar NOTIFICATION-SERVICE (5 min)

```bash
railway service --select NOTIFICATION-SERVICE
railway variables set NODE_ENV=production
railway variables set PORT=3020

# Base de datos
railway variables set DATABASE_URL="postgresql://user:pass@host:port/flores_notifications"
railway variables set PGDATABASE=flores_notifications

# Email (mismo que contact-service)
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-app-password"
```

---

## 🧪 Verificación Final

### Ejecutar Health Check Completo
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/railway-health-check.sh
```

**Resultado esperado:**
```
✓ API Gateway Health: OK
✓ Auth Health: OK
✓ Auth Ready: OK
✓ Auth Live: OK
✓ Users Health: OK
✓ Products Health: OK
✓ Orders Health: OK
✓ Cart Health: OK
✓ Wishlist Health: OK
✓ Reviews Health: OK
✓ Contacts Health: OK
✓ Payments Health: OK
✓ Promotions Health: OK

Total: 18/18 checks passed (100%)
```

---

## 📊 Resumen de Configuración

### Variables Críticas (DEBEN configurarse):
- ✅ `NODE_ENV=production` (todos los servicios)
- ✅ `PORT=<service-port>` (todos los servicios)
- ✅ `DATABASE_URL` (servicios con PostgreSQL)
- ✅ `MONGODB_URI` (servicios con MongoDB)
- ✅ `JWT_SECRET` (auth-service y api-gateway)

### Variables Opcionales pero Recomendadas:
- `REDIS_URL` (mejor rendimiento para cart-service y api-gateway)
- `SMTP_*` (envío de emails en contact y notification)
- `SENTRY_DSN` (monitoreo de errores)

### Variables Solo para Producción Real:
- `STRIPE_SECRET_KEY` (pagos reales)
- `TWILIO_*` (notificaciones SMS)
- `FIREBASE_*` (push notifications)

---

## ⏱️ Tiempo Total Estimado

- **Configuración de bases de datos:** 20-30 min
- **Configuración de servicios (12 servicios):** 60-75 min
- **Verificación y ajustes:** 15-20 min
- **TOTAL:** ~2 horas

---

## 🎯 Orden de Prioridad

### Alta Prioridad (Sistema funcional mínimo):
1. PostgreSQL + MongoDB
2. AUTH-SERVICE
3. USER-SERVICE
4. PRODUCT-SERVICE
5. API Gateway (ya configurado)

### Media Prioridad (Funcionalidad completa):
6. CART-SERVICE
7. ORDER-SERVICE
8. WISHLIST-SERVICE
9. REVIEW-SERVICE

### Baja Prioridad (Características adicionales):
10. PAYMENT-SERVICE (puede usar mock temporalmente)
11. CONTACT-SERVICE
12. PROMOTION-SERVICE
13. NOTIFICATION-SERVICE

---

## 🔧 Comandos Útiles

### Ver logs en tiempo real
```bash
railway logs -s <SERVICE-NAME> --follow
```

### Verificar variables configuradas
```bash
railway variables --service <SERVICE-NAME>
```

### Conectar a base de datos
```bash
railway connect PostgreSQL
railway connect MongoDB
railway connect Redis
```

### Redesplegar un servicio
```bash
railway up --service <SERVICE-NAME>
```

---

## 📞 Soporte

Si encuentras errores durante la configuración:

1. **Revisar logs del servicio:**
   ```bash
   railway logs -s <SERVICE-NAME>
   ```

2. **Verificar variables:**
   ```bash
   railway variables --service <SERVICE-NAME>
   ```

3. **Probar conexión a BD:**
   ```bash
   railway connect PostgreSQL
   # Luego en psql:
   \l  # Listar bases de datos
   \c flores_auth  # Conectar a base específica
   ```

4. **Consultar documentos:**
   - `RAILWAY_ENVIRONMENT_VARS_COMPLETE.md`
   - `DEPLOYMENT_EXITOSO_RAILWAY.md`

---

**Última actualización:** 29 de noviembre de 2025  
**Estado:** En configuración  
**Próximo paso:** Configurar PostgreSQL y MongoDB
