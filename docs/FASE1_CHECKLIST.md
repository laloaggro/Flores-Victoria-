# ✅ Checklist Fase 1 - Correcciones Urgentes

**Fecha:** 7 de enero de 2026  
**Estado:** En progreso

---

## 🔧 Correcciones de Código (Completado)

- [x] Añadir rutas de stats a `user-service/src/server.js`
- [x] Crear script `scripts/verify-services.sh`
- [x] Documentar variables en `docs/RAILWAY_ENV_VARS.md`
- [x] Push cambios a GitHub
- [x] Verificar auto-deploy funcionó

---

## 🔐 Sincronizar JWT_SECRET en Railway

### Variables a configurar en TODOS los servicios:

```env
JWT_SECRET=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=
SERVICE_TOKEN=y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=
```

### Checklist por servicio:

- [ ] **api-gateway**
  - [ ] Ir a Variables
  - [ ] Actualizar/Añadir `JWT_SECRET`
  - [ ] Actualizar/Añadir `SERVICE_TOKEN`
  - [ ] Verificar redeploy

- [ ] **user-service**
  - [ ] Ir a Variables
  - [ ] Actualizar/Añadir `JWT_SECRET`
  - [ ] Actualizar/Añadir `SERVICE_TOKEN`
  - [ ] Verificar redeploy

- [ ] **order-service**
  - [ ] Ir a Variables
  - [ ] Actualizar/Añadir `JWT_SECRET`
  - [ ] Actualizar/Añadir `SERVICE_TOKEN`
  - [ ] Verificar redeploy

- [ ] **admin-dashboard-service**
  - [ ] Ir a Variables
  - [ ] Actualizar/Añadir `JWT_SECRET`
  - [ ] Actualizar/Añadir `SERVICE_TOKEN`
  - [ ] Verificar redeploy

- [ ] **review-service**
  - [ ] Ir a Variables
  - [ ] Actualizar/Añadir `JWT_SECRET`
  - [ ] Actualizar/Añadir `SERVICE_TOKEN`
  - [ ] Verificar redeploy

- [ ] **cart-service** (si está desplegado)
  - [ ] Ir a Variables
  - [ ] Actualizar/Añadir `JWT_SECRET`
  - [ ] Actualizar/Añadir `SERVICE_TOKEN`
  - [ ] Verificar redeploy

---

## ⚙️ Verificar Auto-Deploy en Railway

### Por cada servicio, ir a Settings → Source:

- [ ] **user-service**
  - [ ] Root Directory: `microservices/user-service`
  - [ ] Branch: `main`
  - [ ] Auto Deploy: ✅ Enabled

- [ ] **order-service**
  - [ ] Root Directory: `microservices/order-service`
  - [ ] Branch: `main`
  - [ ] Auto Deploy: ✅ Enabled

- [ ] **admin-dashboard-service**
  - [ ] Root Directory: `microservices/admin-dashboard-service`
  - [ ] Branch: `main`
  - [ ] Auto Deploy: ✅ Enabled

---

## 🧪 Verificación Final

Después de completar todo, ejecutar:

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/verify-services.sh
```

### Resultado esperado:

```
✓ Todos los servicios funcionando correctamente
```

### Tests adicionales:

```bash
# Test de autenticación inter-servicio
curl -s "https://user-service-production-9ff7.up.railway.app/internal/users/stats" \
  -H "Authorization: Bearer y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=" \
  -H "x-internal-request: true" \
  -H "x-service-name: test" | jq .

# Test de orden stats
curl -s "https://order-service-production-29eb.up.railway.app/api/orders/stats" \
  -H "Authorization: Bearer y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA=" \
  -H "x-internal-request: true" \
  -H "x-service-name: test" | jq .
```

---

## 📋 Issues Relacionados

- [x] Issue #52: Endpoint /internal/users/stats - **CERRADO** ✅
- [ ] Issue #53: Sincronizar JWT_SECRET - Pendiente acción manual
- [ ] Issue #54: Configurar Auto-Deploy - Pendiente verificación

---

## ✅ Criterios de Aceptación Fase 1

- [ ] Todos los health checks responden 200
- [ ] `/internal/users/stats` retorna datos
- [ ] `/api/orders/stats` retorna datos  
- [ ] JWT_SECRET unificado en todos los servicios
- [ ] Auto-deploy funcionando para servicios críticos
- [ ] Script de verificación pasa sin errores

---

**Cuando completes todo, marca esta casilla:**

- [ ] **FASE 1 COMPLETADA** 🎉

