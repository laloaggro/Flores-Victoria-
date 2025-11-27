# ⚡ Railway Deployment - Guía Rápida

## 🚀 Inicio Rápido (15 minutos)

### 1. Generar Secretos
```bash
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 48  # SESSION_SECRET
```

### 2. Crear Proyecto Railway
- https://railway.app → "New Project" → "Empty Project"
- Nombre: `Flores-Victoria-Production`

### 3. Agregar Bases de Datos
```
+ New → Database → PostgreSQL
+ New → Database → MongoDB  
+ New → Database → Redis
```

### 4. Configurar Variables Compartidas
```env
NODE_ENV=production
JWT_SECRET=<generado en paso 1>
SESSION_SECRET=<generado en paso 1>
```

### 5. Desplegar Servicios (uno por uno)

**Orden crítico**:
1. Bases de datos (ya hechas)
2. auth-service, user-service, product-service
3. order, cart, wishlist, review, contact, payment, promotion
4. api-gateway (último microservicio)
5. frontend, admin-panel

**Para cada servicio**:
```
+ New → GitHub Repo → Flores-Victoria-
Root Directory: microservices/{service-name}
Deploy
```

### 6. Configurar API Gateway

**Variables env**:
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

**Generar dominio público**:
- Settings → Generate Domain
- Copiar URL: `https://api-gateway-production.up.railway.app`

### 7. Configurar Frontend

**Variables**:
```env
VITE_API_URL=https://api-gateway-production.up.railway.app
```

**Generar dominio público**:
- Settings → Generate Domain

### 8. Verificar

```bash
# Health checks
curl https://api-gateway-production.up.railway.app/health

# Ver logs
Railway Dashboard → Cada servicio → Logs
```

---

## 📝 Variables por Servicio

### Auth Service (Puerto 3001)
```env
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

### User Service (Puerto 3003)
```env
PORT=3003
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

### Product Service (Puerto 3009)
```env
PORT=3009
MONGODB_URI=${{MongoDB.MONGODB_URI}}/products_db
REDIS_URL=${{Redis.REDIS_URL}}
```

### Order Service (Puerto 3004)
```env
PORT=3004
DATABASE_URL=${{Postgres.DATABASE_URL}}
MONGODB_URI=${{MongoDB.MONGODB_URI}}/orders_db
REDIS_URL=${{Redis.REDIS_URL}}
```

### Cart Service (Puerto 3005)
```env
PORT=3005
REDIS_URL=${{Redis.REDIS_URL}}
```

### Wishlist Service (Puerto 3006)
```env
PORT=3006
REDIS_URL=${{Redis.REDIS_URL}}
```

### Review Service (Puerto 3007)
```env
PORT=3007
MONGODB_URI=${{MongoDB.MONGODB_URI}}/reviews_db
```

### Contact Service (Puerto 3008)
```env
PORT=3008
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Payment Service (Puerto 3018)
```env
PORT=3018
```

### Promotion Service (Puerto 3019)
```env
PORT=3019
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

---

## 🐛 Problemas Comunes

### Servicio no inicia
```bash
# Ver logs
Railway Dashboard → Servicio → Logs

# Verificar variables
Railway Dashboard → Servicio → Variables
```

### No puede conectarse a DB
```bash
# Verificar que existan:
DATABASE_URL
MONGODB_URI
REDIS_URL

# Formato correcto:
${{Postgres.DATABASE_URL}}
${{MongoDB.MONGODB_URI}}
${{Redis.REDIS_URL}}
```

### API Gateway no encuentra servicios
```bash
# Verificar URLs internas:
http://auth-service.railway.internal:3001
http://user-service.railway.internal:3003
# etc.
```

### Frontend no se conecta a API
```bash
# Verificar VITE_API_URL apunta a dominio público:
https://api-gateway-production.up.railway.app
```

---

## 💰 Costos Estimados

**Plan Hobby ($5/mes)**:
- 14 servicios × 730 horas/mes = ~$50-60/mes
- **Recomendación**: Empieza con servicios críticos (8-10 servicios)

**Servicios críticos**:
- PostgreSQL, MongoDB, Redis (bases)
- auth-service, user-service, product-service
- api-gateway
- frontend

**Opcionales para MVP**:
- payment-service (agregar cuando necesites pagos)
- promotion-service (agregar después)
- admin-panel (bajo tráfico, puede auto-sleep)

---

## ✅ Checklist Rápido

- [ ] Proyecto Railway creado
- [ ] PostgreSQL agregado
- [ ] MongoDB agregado
- [ ] Redis agregado
- [ ] JWT_SECRET configurado
- [ ] SESSION_SECRET configurado
- [ ] auth-service desplegado
- [ ] user-service desplegado
- [ ] product-service desplegado
- [ ] api-gateway desplegado
- [ ] Dominio público en api-gateway
- [ ] frontend desplegado
- [ ] Health check OK: /health

---

## 🔗 Enlaces Útiles

- [Railway Dashboard](https://railway.app/dashboard)
- [Railway Docs](https://docs.railway.app)
- [Documentación Completa](./RAILWAY_FULLSTACK_SETUP.md)

---

**Tiempo estimado**: 30-45 minutos para deployment completo
