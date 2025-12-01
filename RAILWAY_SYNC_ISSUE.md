# Railway Sync Issue - Product Service

## Problema
Railway NO está sincronizando el código actualizado desde GitHub, a pesar de 10 deploys exitosos.

## Evidencia
- **Versión local**: 2.1.0 (commit 47a7e5f)
- **Versión desplegada**: 2.0.0 (código antiguo)
- **Commits pushed**: 10 commits exitosos
- **Deploys ejecutados**: 10 railway up + múltiples redeploys

## Código Correcto en GitHub
```javascript
// microservices/product-service/src/app.js línea 98
app.use('/api/products', productRoutes);  // ✅ CORRECTO
```

## Código Desplegado en Railway
```javascript
// Código desplegado (viejo)
app.use('/products', productRoutes);  // ❌ ANTIGUO
```

## Acción Requerida
Acceder a Railway Dashboard y verificar:

1. **Settings → Source**
   - Branch: debe ser `main` ✓
   - Root Directory: `microservices/product-service` 
   - Verificar que no haya un commit hash fijo seleccionado

2. **Settings → Build**
   - Builder: NIXPACKS
   - Verificar que no haya cache habilitado permanentemente

3. **Solución Drástica (si todo falla)**
   - Eliminar el servicio `PRODUCT-SERVICE`
   - Crear nuevo servicio desde cero
   - Vincular al repositorio: `laloaggro/Flores-Victoria-`
   - Branch: `main`
   - Root: `microservices/product-service`
   - Reconfigurar variables de entorno

## Variables de Entorno a Configurar
```bash
NODE_ENV=production
PORT=3009
MONGODB_URI=mongodb://mongo:HoFFbonUYMSFQnyLHsPfrpciKyLWvClr@mongodb.railway.internal:27017
DISABLE_CACHE=true
```

## Verificación Post-Fix
```bash
# Debe mostrar versión 2.1.0 y apiPrefix
curl https://product-service-production-089c.up.railway.app/ | jq

# Debe devolver array de productos
curl https://product-service-production-089c.up.railway.app/api/products
```

## Commits Realizados
47a7e5f feat: Bump version to 2.1.0 and add apiPrefix info
5dfe8eb debug: Add /debug/routes endpoint to inspect registered routes
fb6e06b fix: Switch back to NIXPACKS builder for product-service
fe8e692 fix: Simplify product-service Dockerfile for Railway context
471cd04 feat: Add railway.json to force Dockerfile build
c8f0068 fix: Force rebuild of product-service with updated routes
b710729 fix: Remove nixpacks.toml to use Dockerfile for product-service
1ddb3d6 fix: Product Service routes use /api/products prefix
9f2614c fix: API Gateway product route path rewrite
cbd1bd9 feat: Agregar Dockerfile para auth-service

---
Fecha: dom 30 nov 2025 21:24:53 -03
