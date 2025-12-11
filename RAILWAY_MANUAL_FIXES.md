# Fixes Manuales para Railway Dashboard

## 🔴 URGENTE: Realizar estos cambios AHORA

Railway ha recibido el push y redeplegará automáticamente. Sin embargo, necesitas realizar estos cambios manuales en el Dashboard:

---

## 1. Frontend Service - Remover Start Command

### Servicio: `frontend-v2`
**URL**: https://frontend-v2-production-7508.up.railway.app

### Problema Detectado
Tu screenshot muestra que el servicio tiene configurado:
```
Start Command: nginx -g 'daemon off;'
```

### ❌ Este comando está sobreescribiendo el CMD del Dockerfile

### ✅ SOLUCIÓN:
1. Ve a: Railway Dashboard → frontend-v2 → Settings tab
2. Busca la sección: **"Start Command"**
3. **ELIMINA** el contenido (déjalo vacío)
4. Click en **"Save"** o el ícono de guardar
5. El servicio se redeplegará automáticamente

### ¿Por qué?
El `Dockerfile.railway` ya tiene el comando correcto:
```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

Cuando defines un Start Command manualmente, Railway lo sobrescribe, causando conflictos.

---

## 2. Order Service - Verificar Redeploy

### Servicio: `ORDER-SERVICE`
**URL**: https://order-service-production-29eb.up.railway.app

### Cambio Aplicado
Simplificamos `nixpacks.toml` para que el start command sea:
```toml
[start]
cmd = 'node src/server.js'
```

### ✅ VERIFICACIÓN:
1. Ve a: Railway Dashboard → ORDER-SERVICE → Deployments tab
2. Espera a que el nuevo deploy termine (2-3 minutos)
3. Verifica que el build pase la fase de `npm ci` sin errores
4. Check que el servicio inicie correctamente

### ¿Qué arreglamos?
- **ANTES**: `cd microservices/order-service && node src/server.js` (path duplicado)
- **AHORA**: `node src/server.js` (correcto, ya que Root Directory está configurado)

---

## 3. Monitoreo Post-Cambios

### Esperar 5 minutos para que ambos servicios redesplieguen

Luego ejecutar:
```bash
./scripts/monitor-all-services.sh
```

### Meta
- **Frontend**: Debe responder HTTP 200 (no más 502)
- **Order Service**: Debe responder HTTP 200 (no más build failures)
- **Total**: 8/8 servicios HEALTHY (100%)

---

## 📝 Checklist Rápido

- [ ] Frontend: Remover Start Command del Dashboard
- [ ] Order Service: Esperar redeploy automático (commit ya pushed)
- [ ] Esperar 5 minutos
- [ ] Ejecutar: `./scripts/monitor-all-services.sh`
- [ ] Verificar: 8/8 servicios HEALTHY

---

## 🎯 Una vez que ambos funcionen

Ejecutar el script para deploy de los 6 servicios restantes:
```bash
./scripts/deploy-missing-services.sh
```

Esto desplegará:
- wishlist-service
- review-service
- contact-service
- notification-service
- payment-service
- promotion-service

**Total esperado**: 12/12 servicios en producción ✅

---

## Notas Técnicas

### Root Directory Configuration (CORRECTO ✅)
- Frontend: `frontend/`
- Order Service: `microservices/order-service/`

Ambos están correctamente configurados según tus screenshots.

### Builder Configuration (CORRECTO ✅)
- Frontend: DOCKERFILE → `Dockerfile.railway`
- Order Service: NIXPACKS → `nixpacks.toml`

### ¿Por qué falló antes?

1. **Order Service**: nixpacks tenía `cd microservices/order-service` en el start command, pero Railway YA estaba en ese directorio por el Root Directory. Resultado: buscaba en `microservices/order-service/microservices/order-service/`.

2. **Frontend**: El Start Command manual estaba sobreescribiendo el CMD del Dockerfile, causando conflictos en cómo nginx arrancaba.

---

## Próximos Pasos

1. ✅ Hacer los cambios manuales (Frontend Start Command)
2. ⏳ Esperar redesploy (Order Service automático)
3. 🔍 Verificar con monitor script
4. 🚀 Desplegar 6 servicios restantes
5. 🎉 Celebrar con 12/12 servicios corriendo

---

**Commit aplicado**: `9108ba1` - "fix(order-service): simplificar nixpacks - Root Directory ya configurado"
**Fecha**: 2025-12-11 02:47:00
