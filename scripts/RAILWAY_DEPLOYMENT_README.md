# Railway Deployment Scripts

Scripts para automatizar el deployment de todos los microservicios en Railway.

## Requisitos

1. **Railway CLI instalado:**

```bash
npm install -g @railway/cli
```

2. **Autenticación en Railway:**

```bash
railway login
```

3. **Linkear con el proyecto:**

```bash
railway link
```

## Estructura de Scripts

### Script Principal

- `railway-deploy-all-services.sh` - Deploy todos los servicios (en desarrollo)

### Scripts Individuales (RECOMENDADO)

- `railway-deploy-api-gateway.sh` - API Gateway (puerto 3000)
- `railway-deploy-user-service.sh` - User Service (puerto 3002)
- `railway-deploy-cart-service.sh` - Cart Service (puerto 3003)
- `railway-deploy-order-service.sh` - Order Service (puerto 3004)
- `railway-deploy-wishlist-service.sh` - Wishlist Service (puerto 3005)
- `railway-deploy-review-service.sh` - Review Service (puerto 3006)
- `railway-deploy-contact-service.sh` - Contact Service (puerto 3007)

## Uso Rápido

### 1. Dar permisos de ejecución

```bash
chmod +x scripts/railway-deploy-*.sh
```

### 2. Ejecutar script de un servicio

```bash
# Ejemplo: API Gateway
./scripts/railway-deploy-api-gateway.sh

# Ejemplo: User Service
./scripts/railway-deploy-user-service.sh
```

### 3. Configuración Manual en Railway Dashboard

Cada script te indicará los pasos manuales necesarios. **IMPORTANTE:**

Para CADA servicio:

1. **Ir a Railway Dashboard** → Tu Proyecto → Servicio

2. **Settings → Root Directory:**
   - ⚠️ **DEJAR VACÍO** (no poner nada)

3. **Settings → Custom Build Command:**

   ```bash
   cd microservices/shared && npm install --production && cd ../[SERVICE-NAME] && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
   ```

   Reemplazar `[SERVICE-NAME]` con:
   - `api-gateway`
   - `user-service`
   - `cart-service`
   - `order-service`
   - `wishlist-service`
   - `review-service`
   - `contact-service`

4. **Variables → Verificar/Agregar:**

   **Todos los servicios:**
   - `PORT` - Ya configurado por script
   - `NODE_ENV=production` - Ya configurado por script
   - `SERVICE_NAME` - Ya configurado por script

   **API Gateway específicamente:**
   - `JWT_SECRET` - Mismo valor que auth-service
   - `CORS_ORIGIN` - URL de tu frontend
   - Service URLs ya configuradas por script

   **Services con base de datos:**
   - `DATABASE_URL` - PostgreSQL (user-service) o MongoDB (cart, order, wishlist, review, contact)

   **Services con Redis:**
   - `REDIS_URL` - URL de Redis (user, cart, order, wishlist, review)

### 4. Hacer Deploy

Después de configurar en Dashboard:

```bash
# Opción 1: Deploy desde CLI
railway service [SERVICE-NAME]
railway up

# Opción 2: Deploy desde Dashboard
# Dashboard → Service → Deploy → Trigger Deploy
```

## Orden Recomendado de Deployment

1. ✅ **auth-service** (ya deployado)
2. ✅ **product-service** (ya deployado)
3. 🔄 **api-gateway** (CRÍTICO - ruteo de todo el tráfico)
4. 🔄 **user-service**
5. 🔄 **cart-service**
6. 🔄 **order-service**
7. 🔄 **wishlist-service**
8. 🔄 **review-service**
9. 🔄 **contact-service**

## Configuración de Patrón Validado

**Patrón que funciona** (validado con product-service y auth-service):

```
Root Directory: EMPTY
Custom Build Command: cd microservices/shared && npm install --production && cd ../[SERVICE] && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
Custom Start Command: cd microservices/[SERVICE] && node src/server.js
```

## Verificación Post-Deployment

### Ver logs de un servicio:

```bash
railway logs --service [SERVICE-NAME]
```

### Verificar health endpoint:

```bash
curl https://[service-url].up.railway.app/health
```

### Ejemplo de respuesta esperada:

```json
{
  "status": "healthy",
  "service": "api-gateway",
  "uptime": 123,
  "timestamp": "2025-12-06T11:35:03.000Z",
  "checks": {
    "database": "up",
    "redis": "up"
  }
}
```

## Troubleshooting

### Error: "Cannot find module '@flores-victoria/shared/logging/logger'"

**Solución:** Verificar que Custom Build Command copió shared module correctamente

### Error: "cd: ../auth-service: No such file or directory"

**Solución:**

1. Root Directory debe estar VACÍO
2. Usar rutas absolutas desde /app/: `cd microservices/auth-service`

### Error: Railway usa Dockerfile en lugar de nixpacks

**Solución:** Renombrar `Dockerfile` a `Dockerfile.old` en el directorio del servicio

### Servicio con nombre incorrecto

**Solución:** Verificar que `SERVICE_NAME` esté configurado en variables de entorno

### Build cache desactualizado

**Solución:**

1. Railway Dashboard → Service → Settings → Clear Build Cache
2. O hacer un cambio mínimo en el código (agregar comentario) para forzar rebuild

## Variables de Entorno Críticas

### JWT_SECRET (api-gateway, user-service)

```bash
# Debe ser el MISMO valor en auth-service, api-gateway, user-service
railway variables set JWT_SECRET="tu-secret-aqui"
```

### DATABASE_URL

```bash
# PostgreSQL (user-service)
railway variables set DATABASE_URL="postgresql://user:pass@host:port/db"

# MongoDB (cart, order, wishlist, review, contact)
railway variables set DATABASE_URL="mongodb://user:pass@host:port/db"
```

### REDIS_URL

```bash
railway variables set REDIS_URL="redis://default:pass@host:port"
```

## Service URLs para API Gateway

Las referencias a otros servicios usan la sintaxis de Railway:

```bash
AUTH_SERVICE_URL=${{AUTH-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
...etc
```

Estas se resuelven automáticamente a las URLs privadas internas de Railway.

## Monitoreo

### Dashboard de servicios:

```bash
railway status
```

### Logs en tiempo real:

```bash
railway logs --follow --service [SERVICE-NAME]
```

### Healthcheck de todos los servicios:

```bash
# Crear script personalizado en scripts/verify-all-services.sh
# Ver ejemplo en documentación principal
```

## Recursos Adicionales

- [Railway Docs](https://docs.railway.app/)
- [Nixpacks Docs](https://nixpacks.com/)
- [Monorepo Best Practices](https://turbo.build/repo/docs)

## Notas Importantes

1. **Railway CLI no puede configurar Custom Build Command** - Debe hacerse manualmente en Dashboard
2. **Root Directory VACÍO es crítico** - Permite acceso completo al monorepo
3. **nixpacks.toml en la raíz** - Actualmente configurado para auth-service, otros servicios usan
   Custom Build Command
4. **Healthcheck timeout** - Configurado a 300s (5 minutos) para dar tiempo a builds lentos
5. **Service discovery** - Usar `RAILWAY_PRIVATE_DOMAIN` references para comunicación
   inter-servicios
