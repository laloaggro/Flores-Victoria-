# 🔧 Configuración Final de Servicios Railway - Opción A

**Commit:** b468bcb - Dockerfiles creados y pusheados  
**Fecha:** 3 de diciembre de 2025

## ✅ Archivos Creados

Los siguientes Dockerfiles fueron creados y commiteados:

- ✅ `microservices/cart-service/Dockerfile.railway`
- ✅ `microservices/wishlist-service/Dockerfile.railway`
- ✅ `microservices/notification-service/Dockerfile.railway`

Los siguientes ya existían:
- ✅ `microservices/api-gateway/Dockerfile.railway`
- ✅ `microservices/product-service/Dockerfile.railway`
- ✅ `microservices/auth-service/Dockerfile.railway`

---

## 📋 Configuración Manual en Railway Dashboard

Para **CADA** servicio, seguir estos pasos:

### Paso 1: Seleccionar Servicio
- Click en el nombre del servicio en el dashboard

### Paso 2: Borrar Root Directory
1. Ir a **Settings** → **Source**
2. Buscar **Root Directory**
3. **BORRAR** el valor (dejar el campo completamente **VACÍO**)

### Paso 3: Configurar Dockerfile Path
1. Ir a **Settings** → **Build**
2. En **Dockerfile Path**, escribir la ruta correspondiente (ver tabla abajo)
3. Click **Save** o **Deploy**

---

## 🎯 Configuración por Servicio

| Servicio | Root Directory | Dockerfile Path |
|----------|----------------|-----------------|
| API-GATEWAY | **[VACÍO]** | `microservices/api-gateway/Dockerfile.railway` |
| PRODUCT-SERVICE | **[VACÍO]** | `microservices/product-service/Dockerfile.railway` |
| AUTH-SERVICE | **[VACÍO]** | `microservices/auth-service/Dockerfile.railway` |
| CART-SERVICE | **[VACÍO]** | `microservices/cart-service/Dockerfile.railway` |
| WISHLIST-SERVICE | **[VACÍO]** | `microservices/wishlist-service/Dockerfile.railway` |
| NOTIFICATION-SERVICE | **[VACÍO]** | `microservices/notification-service/Dockerfile.railway` |

---

## ⚡ Orden Sugerido (Prioridad)

1. **API-GATEWAY** - Punto de entrada para todos los servicios
2. **PRODUCT-SERVICE** - Catálogo principal (con cache Redis)
3. **AUTH-SERVICE** - Autenticación y autorización
4. **CART-SERVICE** - Carrito de compras
5. **WISHLIST-SERVICE** - Lista de deseos
6. **NOTIFICATION-SERVICE** - Notificaciones email/SMS

---

## 🔄 Después de Configurar

1. **Railway redeployará automáticamente** al detectar cambios en la configuración
2. Si no lo hace, hacer click en **"Deploy"** manualmente en cada servicio
3. **Esperar 3-5 minutos** para que todos los deployments completen
4. **Verificar estado** ejecutando:
   ```bash
   ./check-services.sh
   ```

---

## 🎯 Resultado Esperado

Todos los servicios deberían:
- ✅ Construirse exitosamente usando los Dockerfiles correctos
- ✅ Desplegar sin errores
- ✅ Responder a healthchecks en sus respectivos puertos
- ✅ Conectarse correctamente a PostgreSQL, MongoDB y Redis

---

## 📊 Puertos de Servicios

| Servicio | Puerto |
|----------|--------|
| API-GATEWAY | 3000 |
| AUTH-SERVICE | 3001 |
| PRODUCT-SERVICE | 3009 |
| CART-SERVICE | 3005 |
| WISHLIST-SERVICE | 3006 |
| NOTIFICATION-SERVICE | 3007 |

---

## 🐛 Troubleshooting

Si un servicio sigue fallando después de la configuración:

1. **Verificar logs en Railway:**
   ```bash
   railway service NOMBRE_SERVICIO
   railway logs
   ```

2. **Verificar que Root Directory esté VACÍO** (no `null`, no `.`, simplemente vacío)

3. **Verificar que Dockerfile Path sea exacto** (copiar/pegar desde esta guía)

4. **Forzar redeploy manual** desde el dashboard

5. **Verificar variables de entorno** necesarias (DATABASE_URL, REDIS_URL, etc.)

---

## ✅ Checklist de Configuración

Marcar cuando cada servicio esté configurado y desplegado:

- [ ] API-GATEWAY configurado
- [ ] API-GATEWAY desplegado exitosamente
- [ ] PRODUCT-SERVICE configurado
- [ ] PRODUCT-SERVICE desplegado exitosamente
- [ ] AUTH-SERVICE configurado
- [ ] AUTH-SERVICE desplegado exitosamente
- [ ] CART-SERVICE configurado
- [ ] CART-SERVICE desplegado exitosamente
- [ ] WISHLIST-SERVICE configurado
- [ ] WISHLIST-SERVICE desplegado exitosamente
- [ ] NOTIFICATION-SERVICE configurado
- [ ] NOTIFICATION-SERVICE desplegado exitosamente

---

**Última actualización:** 3 de diciembre de 2025, 22:30  
**Commit actual:** b468bcb
