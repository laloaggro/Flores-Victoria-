# 🚀 Quick Start - Railway Deployment

Guía rápida para deployar todos los microservicios en Railway.

## 📋 Pre-requisitos

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login en Railway
railway login

# 3. Link con tu proyecto
railway link
```

## ⚡ Deployment Rápido

### Opción A: Deploy Individual (RECOMENDADO)

```bash
# 1. API Gateway (CRÍTICO PRIMERO)
./scripts/railway-deploy-api-gateway.sh

# 2. Resto de servicios (orden no crítico)
./scripts/railway-deploy-user-service.sh
./scripts/railway-deploy-cart-service.sh
./scripts/railway-deploy-order-service.sh
./scripts/railway-deploy-wishlist-service.sh
./scripts/railway-deploy-review-service.sh
./scripts/railway-deploy-contact-service.sh
```

### Opción B: Deploy Todos (experimental)

```bash
./scripts/railway-deploy-all-services.sh
```

## 🔧 Configuración Manual en Railway Dashboard

**IMPORTANTE:** Para CADA servicio después de ejecutar el script:

1. **Railway Dashboard** → Tu Proyecto → [Servicio]

2. **Settings → Root Directory:**

   ```
   (DEJAR VACÍO - no escribir nada)
   ```

3. **Settings → Custom Build Command:**

   ```bash
   cd microservices/shared && npm install --production && cd ../[SERVICE-NAME] && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
   ```

   Reemplazar `[SERVICE-NAME]`:
   - `api-gateway`
   - `user-service`
   - `cart-service`
   - `order-service`
   - `wishlist-service`
   - `review-service`
   - `contact-service`

4. **Variables → Agregar/Verificar:**

   **API Gateway:**
   - `JWT_SECRET` (mismo que auth-service)
   - `CORS_ORIGIN` (URL de tu frontend)

   **Services con PostgreSQL:**
   - `DATABASE_URL` (user-service)

   **Services con MongoDB:**
   - `DATABASE_URL` (cart, order, wishlist, review, contact)

   **Services con Redis:**
   - `REDIS_URL` (user, cart, order, wishlist, review)

## 🚀 Hacer Deploy

Después de configurar en Dashboard:

```bash
# Para cada servicio:
railway service [SERVICE-NAME]
railway up

# O desde Railway Dashboard:
# Service → Deployments → Trigger Deploy
```

## ✅ Verificar Deployments

```bash
# Verificar todos los servicios
./scripts/railway-verify-all-services.sh

# Ver logs de un servicio específico
railway logs --service api-gateway
railway logs --service user-service
# etc...
```

## 📊 Orden de Deployment Recomendado

1. ✅ **auth-service** (YA DEPLOYADO)
2. ✅ **product-service** (YA DEPLOYADO)
3. 🔄 **api-gateway** ← **HACER PRIMERO**
4. 🔄 user-service
5. 🔄 cart-service
6. 🔄 order-service
7. 🔄 wishlist-service
8. 🔄 review-service
9. 🔄 contact-service

## 🎯 Resumen de Comandos

```bash
# Deploy un servicio
./scripts/railway-deploy-[SERVICE-NAME].sh

# Configurar en Dashboard (manual)
# → Root Directory: EMPTY
# → Custom Build Command: (ver arriba)
# → Variables: DATABASE_URL, REDIS_URL, JWT_SECRET (según servicio)

# Hacer deploy
railway service [SERVICE-NAME]
railway up

# Verificar
railway logs --service [SERVICE-NAME]
curl https://[service-url].up.railway.app/health
```

## 🆘 Troubleshooting Rápido

| Error                                          | Solución                                    |
| ---------------------------------------------- | ------------------------------------------- |
| `Cannot find module '@flores-victoria/shared'` | Verificar Custom Build Command en Dashboard |
| `cd: ../service: No such file`                 | Root Directory debe estar VACÍO             |
| Railway usa Dockerfile                         | Renombrar `Dockerfile` a `Dockerfile.old`   |
| Servicio con nombre incorrecto                 | Verificar variable `SERVICE_NAME`           |
| Build cache desactualizado                     | Dashboard → Settings → Clear Build Cache    |

## 📚 Documentación Completa

Ver `RAILWAY_DEPLOYMENT_README.md` para documentación detallada.

## 🎉 Success Criteria

Todos los servicios deben:

- ✅ Responder HTTP 200 en `/health`
- ✅ Mostrar nombre correcto en health response
- ✅ Tener conexiones a DB/Redis funcionando
- ✅ No tener boot loops ni restarts constantes

Verificar con: `./scripts/railway-verify-all-services.sh`
