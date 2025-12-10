# 🚨 PROBLEMA CRÍTICO: Frontend sirviendo proyecto incorrecto

## Estado actual

El servicio **Frontend-v2** en Railway está sirviendo un proyecto completamente diferente:

- **Proyecto actual:** Bonmatter - AI Settlement Autopilot
- **Proyecto esperado:** Flores Victoria - Tienda de Arreglos Florales

URL afectada: https://frontend-v2-production.up.railway.app

## Causa raíz

Railway está desplegando desde un directorio incorrecto o desde un repositorio diferente.

## Solución URGENTE

### Opción 1: Verificar y corregir Root Directory

1. Abre [Railway Dashboard](https://railway.app)
2. Selecciona el proyecto **Arreglos Victoria**
3. Entra al servicio **Frontend-v2**
4. Ve a **Settings**
5. Busca **Root Directory** y verifica que esté configurado como:
   ```
   /frontend
   ```
6. Si está vacío o incorrecto, configúralo correctamente
7. Guarda los cambios
8. **Redeploy** el servicio

### Opción 2: Verificar repositorio GitHub

1. En Settings del servicio Frontend-v2
2. Busca la sección **Source**
3. Verifica que el repositorio conectado sea:
   ```
   laloaggro/Flores-Victoria-
   ```
4. Si es un repositorio diferente, desconecta y reconecta el correcto
5. Configura Root Directory: `/frontend`
6. Redeploy

### Opción 3: Recrear el servicio (si las anteriores fallan)

1. **Elimina** el servicio Frontend-v2 actual
2. Crea un **New Service** desde GitHub
3. Selecciona el repositorio: **laloaggro/Flores-Victoria-**
4. Configura:
   - **Name:** Frontend-v2
   - **Root Directory:** `/frontend`
   - **Builder:** Dockerfile
   - **Dockerfile Path:** `Dockerfile.railway`
5. Deploy

## Verificación

Después de aplicar la solución, verifica que el sitio muestre:

```bash
curl -s https://frontend-v2-production.up.railway.app | grep -i "flores\|victoria\|arreglos"
```

Si funciona correctamente, deberías ver referencias a "Flores Victoria" en el HTML.

## Estado de servicios actualizado

**✅ Servicios funcionando (4/12):**

- API Gateway: https://api-gateway-production-949b.up.railway.app
- Auth Service: https://auth-service-production-ab8c.up.railway.app
- Cart Service: https://cart-service-production-73f6.up.railway.app
- Product Service: https://product-service-production-089c.up.railway.app

**⏳ Servicios en proceso de despliegue (8/12):**

- User Service
- Order Service
- Wishlist Service
- Review Service
- Contact Service
- Notification Service
- Payment Service
- Promotion Service

**❌ Servicios con problemas (1/12):**

- Frontend-v2 (sirviendo proyecto incorrecto)

## Dashboard actualizado

El admin-dashboard ahora incluye monitoreo de los 3 nuevos servicios:

- Notification Service (puerto 3010)
- Payment Service (puerto 3011)
- Promotion Service (puerto 3013)

URL: https://admin-dashboard-service-production.up.railway.app

## Próximos pasos

1. ✅ **URGENTE:** Arreglar Frontend-v2 (ver soluciones arriba)
2. ⏳ Esperar que los 8 servicios restantes terminen de desplegar
3. 🔄 Actualizar variables del dashboard con las URLs públicas nuevas
4. ✅ Verificar que todos los servicios respondan correctamente

---

**Generado:** 2025-12-10 **Script de diagnóstico:** `./scripts/diagnose-and-update-services.sh`
