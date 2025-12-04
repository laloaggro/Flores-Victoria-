# Arreglo de Product Service - Cache habilitado

## Problema Detectado

Product Service tiene el cache deshabilitado (`DISABLE_CACHE=true`) y no tiene configurada la URL de
Redis, lo que afecta el rendimiento.

## Solución

### Opción 1: Vía Railway CLI (Recomendado)

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria/microservices/product-service

# Vincular al Product Service (si no lo has hecho)
railway link

# Agregar variable REDIS_URL referenciando al servicio Redis
railway variables --set REDIS_URL='${{Redis-4SDP.REDIS_URL}}'

# Eliminar DISABLE_CACHE o cambiarlo a false
railway variables --set DISABLE_CACHE=false

# Redeploy del servicio para aplicar cambios
railway up --detach
```

### Opción 2: Vía Railway Dashboard

1. Ve a https://railway.app/dashboard
2. Selecciona proyecto "Arreglos Victoria"
3. Click en servicio **PRODUCT-SERVICE**
4. Ve a **Variables** (en el menú lateral)
5. Agrega o modifica:
   - `REDIS_URL` = `${{Redis-4SDP.REDIS_URL}}`
   - `DISABLE_CACHE` = `false` (o elimina la variable)
6. El servicio se redeployará automáticamente

## Verificación Post-Fix

Después de aplicar los cambios, verifica:

```bash
# Ver logs para confirmar conexión a Redis
railway logs --tail 50

# Deberías ver:
# ✅ "Conectado a Redis"
# Y NO ver: "Cache disabled - DISABLE_CACHE=true"

# Probar healthcheck
curl https://product-service-production-089c.up.railway.app/health

# Probar endpoint de productos
curl https://product-service-production-089c.up.railway.app/api/products | jq
```

## Mejoras Adicionales Opcionales

### 1. Habilitar Sentry (Monitoreo de errores)

```bash
# Crear proyecto en https://sentry.io
# Agregar variable:
railway variables --set SENTRY_DSN='tu-sentry-dsn-aqui'
```

### 2. Optimizar NODE_ENV

El servicio ya tiene `NODE_ENV=production` ✅

### 3. Configurar Rate Limiting (si aún no está)

Si quieres agregar rate limiting adicional:

```bash
railway variables --set RATE_LIMIT_WINDOW=900000  # 15 minutos
railway variables --set RATE_LIMIT_MAX=100        # 100 requests por ventana
```

## Resultado Esperado

Después del fix:

- ✅ Cache habilitado y funcionando con Redis
- ✅ Mejor rendimiento en consultas repetidas
- ✅ Healthcheck respondiendo más rápido
- ✅ Logs mostrando "Conectado a Redis"

## Rollback (si algo sale mal)

Si necesitas volver atrás:

```bash
railway variables --set DISABLE_CACHE=true
railway up --detach
```
