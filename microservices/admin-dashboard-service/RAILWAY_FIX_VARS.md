# 🔧 FIX: Variables de Entorno para Admin Dashboard en Railway

## Problema
Las variables de entorno en Railway están apuntando a `localhost` o a servicios no desplegados, causando que el dashboard muestre servicios como "unhealthy".

## Solución
Actualiza las siguientes variables en Railway > admin-dashboard-service > Variables:

### ✅ Variables a ELIMINAR o LIMPIAR
Elimina estas variables si apuntan a localhost o servicios no desplegados:
```
USER_SERVICE_URL (eliminar)
WISHLIST_SERVICE_URL (eliminar)
REVIEW_SERVICE_URL (eliminar)
CONTACT_SERVICE_URL (eliminar)
NOTIFICATION_SERVICE_URL (eliminar)
```

### ✅ Variables a CONFIGURAR con URLs correctas
```bash
# API Gateway (si está desplegado)
API_GATEWAY_URL=https://api-gateway-production-949b.up.railway.app

# Auth Service
AUTH_SERVICE_URL=https://auth-service-production-ab8c.up.railway.app

# Product Service
PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app

# Order Service
ORDER_SERVICE_URL=https://order-service-production-29eb.up.railway.app

# Cart Service
CART_SERVICE_URL=https://cart-service-production-73f6.up.railway.app

# Payment Service
PAYMENT_SERVICE_URL=https://payment-service-production.up.railway.app

# Promotion Service
PROMOTION_SERVICE_URL=https://promotion-service-production.up.railway.app

# Frontend
FRONTEND_URL=https://frontend-v2-production-7508.up.railway.app

# Admin Dashboard (self-reference)
ADMIN_DASHBOARD_URL=https://admin-dashboard-service-production.up.railway.app

# Solo monitorear servicios desplegados
ENABLED_SERVICES=apiGateway,authService,productService,orderService,cartService,paymentService,promotionService,frontend,adminDashboard
```

### 🚀 Pasos en Railway

1. Ve a tu proyecto en Railway
2. Selecciona el servicio `admin-dashboard-service`
3. Ve a la pestaña **Variables**
4. **Elimina** las variables que apuntan a localhost o servicios no desplegados
5. **Agrega/Actualiza** las variables con las URLs correctas listadas arriba
6. Railway hará un redeploy automático

### 📊 Servicios que deberían verse "Healthy"

Después de la configuración correcta:
- ✅ Auth Service
- ✅ Product Service  
- ✅ Order Service
- ✅ Cart Service
- ✅ Payment Service
- ✅ Promotion Service
- ✅ Frontend
- ✅ Admin Dashboard

### ⚠️ API Gateway
El API Gateway muestra 404 en `/health`. Esto puede ser porque:
- No tiene endpoint `/health` configurado
- Necesita verificación adicional

Para verificar manualmente:
```bash
curl https://api-gateway-production-949b.up.railway.app/api/status
```
