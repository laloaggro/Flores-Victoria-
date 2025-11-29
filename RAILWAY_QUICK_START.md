# 🚀 Railway Deployment Guide - Quick Start

## ✅ Archivos Preparados

- ✅ **10 configuraciones TOML** en `/railway-configs/`
- ✅ **12 Dockerfiles** en `/docker/`
- ✅ **Script automatizado** `railway-deploy-all.sh`
- ✅ **2 servicios operativos** (auth-service, user-service)

## 🎯 Deployment Rápido

### Opción A: Script Guiado (Recomendado)

```bash
chmod +x railway-deploy-all.sh
./railway-deploy-all.sh
```

Este script te guiará paso a paso por cada servicio.

### Opción B: Deployment Manual Rápido

**Para cada servicio (order, product, cart, wishlist, payment, review, contact, notification, promotion, api-gateway):**

1. **Railway Dashboard** → `+ New` → `GitHub Repo`
2. **Selecciona:** `laloaggro/Flores-Victoria-`
3. **Nombre:** `[nombre-del-servicio]`
4. **⚠️ NO configurar Root Directory**
5. **Settings → Build:**
   - Dockerfile Path: `docker/Dockerfile.[nombre-del-servicio]`
6. **Settings → Variables:** (según base de datos)
   - PostgreSQL: `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - MongoDB: `MONGODB_URI=${{MongoDB.MONGO_URL}}`
   - Redis: `REDIS_URL=${{Redis.REDIS_URL}}`
   - Todos: `JWT_SECRET=[mismo-para-todos]`, `NODE_ENV=production`

## 📊 Variables de Entorno por Servicio

### Services con PostgreSQL
- order-service, payment-service, promotion-service

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=[compartido]
NODE_ENV=production
```

### Services con MongoDB
- product-service, review-service, contact-service

```bash
MONGODB_URI=${{MongoDB.MONGO_URL}}
JWT_SECRET=[compartido]
NODE_ENV=production
```

### Services con Redis
- cart-service, wishlist-service, notification-service

```bash
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=[compartido]
NODE_ENV=production
```

### API Gateway (Último)

```bash
JWT_SECRET=[compartido]
NODE_ENV=production
AUTH_SERVICE_URL=${{auth-service.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{user-service.RAILWAY_PRIVATE_DOMAIN}}
ORDER_SERVICE_URL=${{order-service.RAILWAY_PRIVATE_DOMAIN}}
PRODUCT_SERVICE_URL=${{product-service.RAILWAY_PRIVATE_DOMAIN}}
CART_SERVICE_URL=${{cart-service.RAILWAY_PRIVATE_DOMAIN}}
WISHLIST_SERVICE_URL=${{wishlist-service.RAILWAY_PRIVATE_DOMAIN}}
PAYMENT_SERVICE_URL=${{payment-service.RAILWAY_PRIVATE_DOMAIN}}
REVIEW_SERVICE_URL=${{review-service.RAILWAY_PRIVATE_DOMAIN}}
CONTACT_SERVICE_URL=${{contact-service.RAILWAY_PRIVATE_DOMAIN}}
NOTIFICATION_SERVICE_URL=${{notification-service.RAILWAY_PRIVATE_DOMAIN}}
PROMOTION_SERVICE_URL=${{promotion-service.RAILWAY_PRIVATE_DOMAIN}}
```

## 🔍 Verificación Rápida

```bash
curl https://[service-name]-production.railway.app/health
```

## ⏱️ Tiempo Estimado

- **Por servicio:** 3-5 minutos
- **10 servicios:** 30-50 minutos
- **Total:** < 1 hora

## 📋 Orden Recomendado

1. order-service
2. product-service
3. cart-service
4. wishlist-service
5. payment-service
6. review-service
7. contact-service
8. notification-service
9. promotion-service
10. **api-gateway** (ÚLTIMO)

¡Listo para deployment! 🚀
