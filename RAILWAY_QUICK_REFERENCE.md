# 📖 Referencia Rápida - Railway Deployment

## 🚀 Inicio Rápido

### Opción 1: Configuración Automática (Recomendada)
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria

# Ejecutar script de configuración automática
./scripts/railway-configure.sh

# Esperar 3-5 minutos para redespliegue

# Verificar estado de todos los servicios
./scripts/railway-health-check.sh
```

### Opción 2: Configuración Manual
Seguir el documento: `RAILWAY_ACTION_PLAN.md`

---

## 📋 Comandos Esenciales Railway CLI

### Información del Proyecto
```bash
# Ver servicios del proyecto
railway status

# Seleccionar un servicio
railway service --select <SERVICE-NAME>

# Ver variables de un servicio
railway variables --service <SERVICE-NAME>
```

### Configurar Variables
```bash
# Configurar una variable
railway variables set KEY=value --service <SERVICE-NAME>

# Configurar múltiples variables
railway variables set KEY1=value1 KEY2=value2 --service <SERVICE-NAME>

# Eliminar una variable
railway variables delete KEY --service <SERVICE-NAME>
```

### Logs y Debugging
```bash
# Ver logs en tiempo real
railway logs --service <SERVICE-NAME>

# Ver logs con límite
railway logs --service <SERVICE-NAME> --lines 100

# Ver logs de todos los servicios
railway logs
```

### Bases de Datos
```bash
# Conectar a PostgreSQL
railway connect PostgreSQL

# Conectar a MongoDB
railway connect MongoDB

# Conectar a Redis
railway connect Redis
```

### Deployment
```bash
# Redesplegar servicio (manual)
railway up --service <SERVICE-NAME>

# Ver estado del despliegue
railway status --service <SERVICE-NAME>
```

---

## 🎯 Tareas Comunes

### 1. Verificar Estado de Todos los Servicios
```bash
./scripts/railway-health-check.sh
```

### 2. Configurar un Nuevo Servicio
```bash
# Ejemplo: Auth Service
railway variables set NODE_ENV=production --service AUTH-SERVICE
railway variables set PORT=3001 --service AUTH-SERVICE
railway variables set DATABASE_URL="postgresql://..." --service AUTH-SERVICE
railway variables set JWT_SECRET="..." --service AUTH-SERVICE
```

### 3. Crear Bases de Datos en PostgreSQL
```bash
# Conectar
railway connect PostgreSQL

# En psql:
CREATE DATABASE flores_auth;
CREATE DATABASE flores_users;
CREATE DATABASE flores_orders;
CREATE DATABASE flores_wishlist;
CREATE DATABASE flores_contacts;
CREATE DATABASE flores_payments;
CREATE DATABASE flores_promotions;
CREATE DATABASE flores_notifications;

# Verificar
\l

# Salir
\q
```

### 4. Probar un Endpoint Específico
```bash
# Health check de un servicio
curl https://api-gateway-production-949b.up.railway.app/auth/health

# Producto específico
curl https://api-gateway-production-949b.up.railway.app/api/products/123

# Con autenticación
curl -H "Authorization: Bearer <token>" \
     https://api-gateway-production-949b.up.railway.app/api/users/me
```

### 5. Ver Logs de un Servicio con Errores
```bash
# Ver últimas 50 líneas
railway logs --service <SERVICE-NAME> --lines 50

# En tiempo real
railway logs --service <SERVICE-NAME> --follow
```

---

## 🔗 URLs y Endpoints

### API Gateway Público
```
https://api-gateway-production-949b.up.railway.app
```

### Endpoints Principales
```
GET  /health                      # Health del Gateway
GET  /auth/health                 # Health Auth Service
POST /auth/register               # Registro de usuario
POST /auth/login                  # Login de usuario
GET  /api/users                   # Lista de usuarios
GET  /api/products                # Lista de productos
GET  /api/products/:id            # Producto específico
POST /api/cart                    # Agregar al carrito
GET  /api/orders                  # Órdenes del usuario
POST /payments/create-intent      # Crear intento de pago
GET  /api/promotions              # Promociones activas
```

---

## 🗄️ Información de Bases de Datos

### PostgreSQL
**Bases de datos necesarias:**
- `flores_auth` → AUTH-SERVICE
- `flores_users` → USER-SERVICE
- `flores_orders` → ORDER-SERVICE
- `flores_wishlist` → WISHLIST-SERVICE
- `flores_contacts` → CONTACT-SERVICE
- `flores_payments` → PAYMENT-SERVICE
- `flores_promotions` → PROMOTION-SERVICE
- `flores_notifications` → NOTIFICATION-SERVICE

### MongoDB
**Colecciones necesarias:**
- `flores_products` → PRODUCT-SERVICE
- `flores_reviews` → REVIEW-SERVICE

### Redis (Opcional)
**Usos:**
- Cache general
- Rate limiting en API Gateway
- Sesiones en CART-SERVICE

---

## 🔐 Variables Críticas

### Todos los Servicios
```bash
NODE_ENV=production
PORT=<service-port>
```

### Auth Service
```bash
JWT_SECRET=160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Servicios con PostgreSQL
```bash
DATABASE_URL=postgresql://user:pass@host:port/database_name
PGHOST=<host>
PGPORT=5432
PGDATABASE=<database_name>
PGUSER=postgres
PGPASSWORD=<password>
```

### Servicios con MongoDB
```bash
MONGODB_URI=mongodb://user:pass@host:port/database_name
```

### API Gateway (Referencias a otros servicios)
```bash
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

## 🐛 Troubleshooting

### Error: "Service not available" (HTTP 502)
**Causa:** El servicio no está corriendo o no puede conectarse a la base de datos.
**Solución:**
```bash
# 1. Ver logs del servicio
railway logs --service <SERVICE-NAME>

# 2. Verificar variables de entorno
railway variables --service <SERVICE-NAME>

# 3. Verificar que DATABASE_URL esté configurado correctamente

# 4. Probar conexión a la base de datos
railway connect PostgreSQL  # o MongoDB
```

### Error: "Ruta no encontrada" (HTTP 404)
**Causa:** El path del endpoint no coincide con la configuración del servicio.
**Solución:**
```bash
# Verificar las rutas en el código:
# - microservices/<service>/src/app.js
# - microservices/<service>/src/routes/

# Verificar configuración del API Gateway:
# - microservices/api-gateway/src/routes/index.js
```

### Error: "JWT_SECRET no configurado"
**Causa:** Falta configurar JWT_SECRET en auth-service o api-gateway.
**Solución:**
```bash
railway variables set JWT_SECRET="160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb" \
  --service AUTH-SERVICE
railway variables set JWT_SECRET="160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb" \
  --service API-GATEWAY
```

### Error: "Cannot connect to database"
**Causa:** Credenciales incorrectas o base de datos no existe.
**Solución:**
```bash
# 1. Conectar a PostgreSQL
railway connect PostgreSQL

# 2. Verificar que exista la base de datos
\l

# 3. Si no existe, crearla
CREATE DATABASE flores_<service_name>;

# 4. Actualizar DATABASE_URL con el nombre correcto
railway variables set DATABASE_URL="postgresql://..." --service <SERVICE-NAME>
```

---

## 📊 Monitoreo

### Health Checks Automáticos
Cada servicio expone estos endpoints:
- `/health` - Health check completo (incluye DB)
- `/ready` - Readiness check (puede recibir tráfico)
- `/live` - Liveness check (proceso vivo)
- `/metrics` - Métricas de Prometheus

### Verificar Todos los Servicios
```bash
./scripts/railway-health-check.sh
```

### Verificar un Servicio Específico
```bash
curl https://api-gateway-production-949b.up.railway.app/<service-path>/health | jq .
```

---

## 📝 Notas Importantes

1. **Railway redesplega automáticamente** cuando cambias variables de entorno (toma 2-3 min)
2. **Las bases de datos deben crearse manualmente** en PostgreSQL/MongoDB
3. **JWT_SECRET debe ser el mismo** en AUTH-SERVICE y API-GATEWAY
4. **Los servicios se comunican** usando RAILWAY_PRIVATE_DOMAIN (red privada)
5. **Solo API Gateway tiene dominio público** (`api-gateway-production-949b.up.railway.app`)

---

## 🔗 Documentos Relacionados

- `RAILWAY_ACTION_PLAN.md` - Plan detallado paso a paso
- `RAILWAY_ENVIRONMENT_VARS_COMPLETE.md` - Variables completas por servicio
- `DEPLOYMENT_EXITOSO_RAILWAY.md` - Resumen del deployment
- `API_GATEWAY_ENV_VARS.txt` - Variables específicas del Gateway

---

## ⚡ Shortcuts

```bash
# Alias útiles (agregar a ~/.bashrc o ~/.zshrc)
alias rw='railway'
alias rwl='railway logs'
alias rws='railway status'
alias rwv='railway variables'
alias rwc='railway connect'
alias health='./scripts/railway-health-check.sh'
```

---

**Última actualización:** 29 de noviembre de 2025  
**Autor:** Sistema de configuración automática  
**Versión:** 1.0
