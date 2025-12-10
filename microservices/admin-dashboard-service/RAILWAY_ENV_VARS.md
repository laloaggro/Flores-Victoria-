# Variables de Entorno para Admin Dashboard Service en Railway

## Configuración Requerida

Copia y pega estas variables en la sección **Variables** del servicio `admin-dashboard-service` en Railway:

### Variables Básicas

```bash
NODE_ENV=production
SERVICE_NAME=admin-dashboard-service
LOG_LEVEL=info
```

### Variables de Servicios a Monitorear

**IMPORTANTE**: Railway usa sintaxis especial `${{SERVICE_NAME.VARIABLE}}` para referenciar otros servicios.

```bash
# API Gateway
API_GATEWAY_URL=${{API-GATEWAY.RAILWAY_PUBLIC_DOMAIN}}

# Auth Service
AUTH_SERVICE_URL=${{AUTH-SERVICE.RAILWAY_PUBLIC_DOMAIN}}

# User Service
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PUBLIC_DOMAIN}}

# Cart Service
CART_SERVICE_URL=${{CART-SERVICE.RAILWAY_PUBLIC_DOMAIN}}

# Order Service
ORDER_SERVICE_URL=${{ORDER-SERVICE.RAILWAY_PUBLIC_DOMAIN}}

# Wishlist Service
WISHLIST_SERVICE_URL=${{WISHLIST-SERVICE.RAILWAY_PUBLIC_DOMAIN}}

# Review Service
REVIEW_SERVICE_URL=${{REVIEW-SERVICE.RAILWAY_PUBLIC_DOMAIN}}

# Contact Service
CONTACT_SERVICE_URL=${{CONTACT-SERVICE.RAILWAY_PUBLIC_DOMAIN}}

# Product Service
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PUBLIC_DOMAIN}}
```

### Variables de Bases de Datos (Opcionales para Admin Dashboard)

Si necesitas que el admin dashboard tenga acceso directo a las bases de datos:

```bash
# PostgreSQL
DATABASE_URL=${{Postgres.DATABASE_URL}}

# MongoDB
MONGODB_URI=${{MongoDB.MONGO_URL}}

# Redis
REDIS_URL=${{Redis.REDIS_URL}}
```

### JWT Secret (Para autenticación futura)

```bash
JWT_SECRET=${{AUTH-SERVICE.JWT_SECRET}}
```

## Pasos para Configurar en Railway

1. **Abre tu proyecto en Railway Dashboard**
   - Ve a: https://railway.app/project/[tu-proyecto-id]

2. **Selecciona el servicio `admin-dashboard-service`**
   - Haz clic en la tarjeta del servicio

3. **Ve a la pestaña "Variables"**
   - En el menú lateral, selecciona "Variables"

4. **Agrega las variables una por una:**
   - Haz clic en "New Variable"
   - **Nombre**: Copia el nombre exacto (ej: `API_GATEWAY_URL`)
   - **Valor**: Copia el valor exacto (ej: `${{API-GATEWAY.RAILWAY_PUBLIC_DOMAIN}}`)
   - Railway convertirá automáticamente las referencias `${{...}}` a URLs reales

5. **Guarda los cambios**
   - Railway automáticamente redesplegará el servicio con las nuevas variables

## Verificación Post-Configuración

Una vez configuradas las variables, verifica que el servicio funcione:

### 1. Health Check
```bash
curl https://[tu-dominio-admin-dashboard]/health
```

### 2. Overview de Servicios
```bash
curl https://[tu-dominio-admin-dashboard]/api/dashboard/overview
```

### 3. Estado de Todos los Servicios
```bash
curl https://[tu-dominio-admin-dashboard]/api/dashboard/services
```

### 4. Estado de un Servicio Específico
```bash
curl https://[tu-dominio-admin-dashboard]/api/dashboard/services/Auth%20Service
```

## Nombres Exactos de Servicios en Railway

Asegúrate de que los nombres de los servicios en Railway coincidan con estos:
- `API-GATEWAY` (para API Gateway)
- `AUTH-SERVICE` (para Auth Service)
- `USER-SERVICE` (para User Service)
- `CART-SERVICE` (para Cart Service)
- `ORDER-SERVICE` (para Order Service)
- `WISHLIST-SERVICE` (para Wishlist Service)
- `REVIEW-SERVICE` (para Review Service)
- `CONTACT-SERVICE` (para Contact Service)
- `PRODUCT-SERVICE` (para Product Service)

**Si los nombres son diferentes**, ajusta las variables. Por ejemplo:
- Si tu servicio se llama `auth` en lugar de `AUTH-SERVICE`, usa: `${{auth.RAILWAY_PUBLIC_DOMAIN}}`

## Troubleshooting

### Variables no se resuelven
- Verifica que los nombres de servicios sean exactos (case-sensitive)
- Asegúrate de que los servicios referenciados estén desplegados
- Railway necesita que los servicios estén "online" para resolver las referencias

### Servicios aparecen como "unhealthy"
1. Verifica que cada servicio tenga un endpoint `/health`
2. Comprueba que los servicios estén desplegados y online en Railway
3. Revisa los logs del admin-dashboard para ver errores de conexión

### Timeout en health checks
- Los health checks tienen timeout de 5 segundos
- Si un servicio es lento, aparecerá como "unhealthy"
- Considera aumentar el timeout en `serviceMonitor.js` si es necesario

## Próximos Pasos

Después de configurar las variables:

1. ✅ Verifica que el servicio se redespliegue automáticamente
2. ✅ Confirma que el health check funcione
3. ✅ Prueba el endpoint `/api/dashboard/overview`
4. ✅ Verifica que todos los servicios sean monitoreados correctamente
5. 🔜 Configura alertas si algún servicio crítico falla
6. 🔜 Integra con frontend para visualización

## Contacto

Si tienes problemas, revisa:
- Logs del servicio en Railway
- Documentación completa en `docs/ADMIN_DASHBOARD_SERVICE.md`
- Código fuente en `microservices/admin-dashboard-service/`
