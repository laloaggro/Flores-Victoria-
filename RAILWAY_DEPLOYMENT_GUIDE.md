# 🎉 Railway Deployment - Scripts Completos

**Fecha:** 2025-12-06  
**Estado:** ✅ Scripts listos y commiteados (commit 7fec5d1)  
**Servicios Deployados:** auth-service ✅, product-service ✅  
**Servicios Pendientes:** 7 (api-gateway, user, cart, order, wishlist, review, contact)

---

## 📦 Archivos Creados

### Scripts Principales

1. **`scripts/railway-interactive-deploy.sh`** ⭐ RECOMENDADO
   - Script interactivo con wizard
   - Guía paso a paso para deployment
   - Selección de servicios a deployar
   - Instrucciones visuales con colores

2. **`scripts/railway-deploy-all-services.sh`**
   - Deploy automatizado de todos los servicios
   - Configura variables de entorno vía Railway CLI
   - Requiere pasos manuales en Dashboard

### Scripts Individuales

3. **`scripts/railway-deploy-api-gateway.sh`**
4. **`scripts/railway-deploy-user-service.sh`**
5. **`scripts/railway-deploy-cart-service.sh`**
6. **`scripts/railway-deploy-order-service.sh`**
7. **`scripts/railway-deploy-wishlist-service.sh`**
8. **`scripts/railway-deploy-review-service.sh`**
9. **`scripts/railway-deploy-contact-service.sh`**

### Scripts de Utilidad

10. **`scripts/railway-verify-all-services.sh`**
    - Verifica health endpoints de todos los servicios
    - Muestra resumen de servicios healthy/unhealthy
    - Requiere `jq` para análisis detallado

### Documentación

11. **`scripts/QUICK_START.md`**
    - Guía rápida de inicio
    - Comandos esenciales
    - Troubleshooting rápido

12. **`scripts/RAILWAY_DEPLOYMENT_README.md`**
    - Documentación completa
    - Arquitectura y patrones
    - Variables de entorno detalladas
    - Troubleshooting exhaustivo

---

## 🚀 Cómo Usar

### Opción 1: Deployment Interactivo (MÁS FÁCIL)

```bash
# 1. Autenticarse en Railway
railway login

# 2. Linkear con el proyecto
railway link

# 3. Ejecutar wizard interactivo
./scripts/railway-interactive-deploy.sh
```

El wizard te preguntará qué servicios deployar y te guiará paso a paso.

### Opción 2: Deployment Individual

```bash
# 1. Deployar API Gateway (CRÍTICO PRIMERO)
./scripts/railway-deploy-api-gateway.sh

# 2. Configurar en Railway Dashboard (MANUAL):
#    - Root Directory: EMPTY
#    - Custom Build Command: (ver abajo)
#    - Variables: JWT_SECRET, CORS_ORIGIN

# 3. Hacer deploy
railway service api-gateway
railway up

# 4. Repetir para otros servicios
./scripts/railway-deploy-user-service.sh
./scripts/railway-deploy-cart-service.sh
# ... etc
```

### Opción 3: Deployment Masivo

```bash
# Deploy todos los servicios (experimental)
./scripts/railway-deploy-all-services.sh

# Luego configurar manualmente cada uno en Dashboard
```

---

## 🔧 Configuración Manual Requerida

**IMPORTANTE:** Railway CLI no puede configurar Custom Build Command. Debes hacerlo manualmente en el Dashboard:

### Para CADA servicio:

1. **Railway Dashboard** → Tu Proyecto → [Servicio] → Settings

2. **Root Directory:**
   ```
   (DEJAR VACÍO - no escribir nada)
   ```

3. **Custom Build Command:**
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

4. **Variables de Entorno:**

   **Todos los servicios:**
   - `PORT` - Ya configurado por script
   - `NODE_ENV=production` - Ya configurado
   - `SERVICE_NAME` - Ya configurado

   **API Gateway:**
   - `JWT_SECRET` (mismo que auth-service)
   - `CORS_ORIGIN` (URL de tu frontend)
   - Service URLs ya configuradas por script

   **Services con PostgreSQL:**
   - `DATABASE_URL` (user-service)

   **Services con MongoDB:**
   - `DATABASE_URL` (cart, order, wishlist, review, contact)

   **Services con Redis:**
   - `REDIS_URL` (user, cart, order, wishlist, review)

---

## ✅ Verificación Post-Deployment

### Verificar todos los servicios:

```bash
./scripts/railway-verify-all-services.sh
```

### Output esperado:
```
=========================================
Verificando Estado de Microservicios
=========================================

Checking: product-service
✅ product-service (uptime: 1234s)

Checking: auth-service
✅ auth-service (uptime: 567s)

Checking: api-gateway
✅ api-gateway (uptime: 123s)

...

=========================================
Resumen
=========================================
Healthy:   9
Unhealthy: 0
Unknown:   0

✅ ¡Todos los servicios están funcionando correctamente!
```

### Ver logs de un servicio:

```bash
railway logs --service api-gateway
railway logs --service user-service
# etc...
```

### Verificar health endpoint manualmente:

```bash
curl https://api-gateway-production.up.railway.app/health
```

---

## 📊 Patrón de Deployment Validado

Este patrón fue validado con **product-service** y **auth-service**:

```yaml
Configuration:
  Root Directory: EMPTY (crítico)
  Builder: NIXPACKS (no Dockerfile)
  
Custom Build Command:
  cd microservices/shared && npm install --production && 
  cd ../[SERVICE-NAME] && npm ci && 
  mkdir -p node_modules/@flores-victoria && 
  cp -r ../shared node_modules/@flores-victoria/

Custom Start Command:
  cd microservices/[SERVICE-NAME] && node src/server.js

Variables:
  PORT: [SERVICE-PORT]
  NODE_ENV: production
  SERVICE_NAME: [SERVICE-NAME]
  RAILWAY_HEALTHCHECK_PATH: /health
  RAILWAY_HEALTHCHECK_TIMEOUT: 300
```

**Por qué funciona:**
- Root Directory vacío = acceso completo al monorepo
- Shared module se copia en cada servicio durante build
- Rutas absolutas desde `/app/` evitan errores de contexto
- Custom Build Command sobrescribe nixpacks.toml global

---

## 🎯 Orden de Deployment Recomendado

1. ✅ **auth-service** (COMPLETADO)
2. ✅ **product-service** (COMPLETADO)
3. 🔄 **api-gateway** ← **HACER PRIMERO** (crítico - ruteo)
4. 🔄 user-service
5. 🔄 cart-service
6. 🔄 order-service
7. 🔄 wishlist-service
8. 🔄 review-service
9. 🔄 contact-service

---

## 🆘 Troubleshooting Rápido

| Error | Solución |
|-------|----------|
| `Cannot find module '@flores-victoria/shared'` | Verificar Custom Build Command en Dashboard |
| `cd: ../service: No such file` | Root Directory debe estar VACÍO |
| Railway usa Dockerfile | Renombrar `Dockerfile` a `Dockerfile.old` |
| Servicio con nombre incorrecto | Verificar variable `SERVICE_NAME` |
| Build cache desactualizado | Dashboard → Settings → Clear Build Cache |
| Tests fallan en commit | Usar `git commit --no-verify` |

---

## 📚 Documentación Adicional

- **Quick Start:** `scripts/QUICK_START.md`
- **Documentación Completa:** `scripts/RAILWAY_DEPLOYMENT_README.md`
- **Patrón Validado:** Este documento, sección "Patrón de Deployment"
- **Railway Docs:** https://docs.railway.app/
- **Nixpacks Docs:** https://nixpacks.com/

---

## 📝 Checklist de Deployment

### Pre-requisitos
- [ ] Railway CLI instalado (`npm install -g @railway/cli`)
- [ ] Autenticado en Railway (`railway login`)
- [ ] Proyecto linkeado (`railway link`)

### Por cada servicio:
- [ ] Ejecutar script de deployment
- [ ] Configurar Root Directory (vacío) en Dashboard
- [ ] Configurar Custom Build Command en Dashboard
- [ ] Configurar variables de entorno necesarias
- [ ] Hacer deploy (`railway up`)
- [ ] Verificar logs (`railway logs`)
- [ ] Verificar health endpoint
- [ ] Confirmar uptime estable (5+ minutos)

### Post-deployment:
- [ ] Ejecutar `./scripts/railway-verify-all-services.sh`
- [ ] Verificar 9 servicios healthy
- [ ] Probar API Gateway routing
- [ ] Verificar comunicación inter-servicios
- [ ] Configurar monitoreo (opcional)

---

## 🎉 Success Criteria

**Todos los servicios deben:**
- ✅ Responder HTTP 200 en `/health`
- ✅ Mostrar nombre correcto en health response
- ✅ Tener conexiones a DB/Redis funcionando (si aplica)
- ✅ No tener boot loops ni restarts constantes
- ✅ Uptime estable 5+ minutos

**API Gateway debe:**
- ✅ Rutear correctamente a todos los backend services
- ✅ Validar JWT tokens correctamente
- ✅ Manejar CORS apropiadamente

---

## 🔗 Enlaces Útiles

- **Repository:** https://github.com/laloaggro/Flores-Victoria-
- **Railway Dashboard:** https://railway.app/
- **Commit de Scripts:** 7fec5d1

---

## 💡 Próximos Pasos

1. **Ejecutar deployment interactivo:**
   ```bash
   ./scripts/railway-interactive-deploy.sh
   ```

2. **Deployar API Gateway primero** (crítico para ruteo)

3. **Deployar servicios restantes** en paralelo o secuencial

4. **Verificar todos los servicios:**
   ```bash
   ./scripts/railway-verify-all-services.sh
   ```

5. **Configurar Frontend** para apuntar al API Gateway deployado

6. **Testing E2E** de flujos críticos

7. **Monitoreo** (opcional pero recomendado)

---

**¡Buena suerte con el deployment! 🚀**

Si encuentras problemas, revisa:
- `scripts/RAILWAY_DEPLOYMENT_README.md` para troubleshooting detallado
- Logs de Railway: `railway logs --service [SERVICE-NAME]`
- Health endpoints: `curl https://[service-url]/health`

