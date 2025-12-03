# Guía de Despliegue de Microservicios en Railway

## Estado Actual
✅ **auth-service** - Desplegado y funcionando

## Servicios Pendientes

### Servicios con PostgreSQL (Listos para desplegar)
1. ✅ user-service (Puerto 3003) - Configuración actualizada
2. ✅ order-service (Puerto 3004) - Configuración actualizada  
3. ⬜ payment-service (Puerto 3011) - Necesita configuración
4. ⬜ promotion-service (Puerto 3012) - Necesita configuración

### Servicios con MongoDB (Requieren MongoDB primero)
5. ⬜ product-service (Puerto 3009)
6. ⬜ review-service (Puerto 3007)
7. ⬜ contact-service (Puerto 3008)

### Servicios con Redis (Requieren Redis primero)
8. ⬜ cart-service (Puerto 3005)
9. ⬜ wishlist-service (Puerto 3006)
10. ⬜ notification-service (Puerto 3010)

### API Gateway
11. ⬜ api-gateway (Puerto 3000) - Despegar al final

---

## Paso 1: Desplegar user-service

### En Railway Dashboard:

1. **Crear Nuevo Servicio**
   - Ve a tu proyecto "Arreglos Victoria"
   - Click en "+ New"
   - Selecciona "GitHub Repo"
   - Selecciona "Flores-Victoria-"

2. **Configurar Servicio**
   - Nombre del servicio: `user-service`
   - Root Directory: `/microservices`
   - Builder: `Dockerfile`
   - Dockerfile Path: `user-service/Dockerfile`

3. **Variables de Entorno**
   ```
   NODE_ENV=production
   PORT=3003
   LOG_LEVEL=info
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=${{Postgres.JWT_SECRET}}
   ```

4. **Desplegar**
   - Click en "Deploy"
   - Esperar a que termine el build

5. **Verificar Logs**
   - Deberías ver: "✅ Conexión a PostgreSQL establecida correctamente"
   - Y: "Servicio de usuarios ejecutándose en el puerto 3003"

---

## Paso 2: Desplegar order-service

Repetir el mismo proceso con:

- Nombre del servicio: `order-service`
- Dockerfile Path: `order-service/Dockerfile`
- Variables de entorno:
  ```
  NODE_ENV=production
  PORT=3004
  LOG_LEVEL=info
  DATABASE_URL=${{Postgres.DATABASE_URL}}
  JWT_SECRET=${{Postgres.JWT_SECRET}}
  ```

---

## Paso 3: Crear Bases de Datos Adicionales

### MongoDB

1. En tu proyecto Railway, click "+ New"
2. Selecciona "Database" → "Add MongoDB"
3. Espera a que se aprovisione
4. Railway generará automáticamente `MONGO_URL`

### Redis

1. En tu proyecto Railway, click "+ New"
2. Selecciona "Database" → "Add Redis"
3. Espera a que se aprovisione
4. Railway generará automáticamente `REDIS_URL`

---

## Paso 4: Desplegar Servicios MongoDB

Una vez MongoDB esté listo, desplegar:

### product-service
- Root Directory: `/microservices`
- Dockerfile Path: `product-service/Dockerfile`
- Variables:
  ```
  NODE_ENV=production
  PORT=3009
  LOG_LEVEL=info
  MONGO_URI=${{MongoDB.MONGO_URL}}
  ```

### review-service
- Dockerfile Path: `review-service/Dockerfile`
- PORT=3007
- MONGO_URI=${{MongoDB.MONGO_URL}}

### contact-service
- Dockerfile Path: `contact-service/Dockerfile`
- PORT=3008
- MONGO_URI=${{MongoDB.MONGO_URL}}

---

## Paso 5: Desplegar Servicios Redis

### cart-service
- Dockerfile Path: `cart-service/Dockerfile`
- Variables:
  ```
  NODE_ENV=production
  PORT=3005
  REDIS_URL=${{Redis.REDIS_URL}}
  ```

### wishlist-service
- Dockerfile Path: `wishlist-service/Dockerfile`
- PORT=3006
- REDIS_URL=${{Redis.REDIS_URL}}

### notification-service
- Dockerfile Path: `notification-service/Dockerfile`
- PORT=3010
- REDIS_URL=${{Redis.REDIS_URL}}

---

## Paso 6: API Gateway (Último)

- Dockerfile Path: `api-gateway/Dockerfile`
- Variables:
  ```
  NODE_ENV=production
  PORT=3000
  LOG_LEVEL=info
  
  # URLs internas de los servicios
  AUTH_SERVICE_URL=http://auth-service.railway.internal:3001
  USER_SERVICE_URL=http://user-service.railway.internal:3003
  PRODUCT_SERVICE_URL=http://product-service.railway.internal:3009
  ORDER_SERVICE_URL=http://order-service.railway.internal:3004
  CART_SERVICE_URL=http://cart-service.railway.internal:3005
  WISHLIST_SERVICE_URL=http://wishlist-service.railway.internal:3006
  REVIEW_SERVICE_URL=http://review-service.railway.internal:3007
  CONTACT_SERVICE_URL=http://contact-service.railway.internal:3008
  NOTIFICATION_SERVICE_URL=http://notification-service.railway.internal:3010
  PAYMENT_SERVICE_URL=http://payment-service.railway.internal:3011
  PROMOTION_SERVICE_URL=http://promotion-service.railway.internal:3012
  ```

---

## Verificación

Para cada servicio desplegado, verificar:

1. ✅ Build exitoso
2. ✅ Container iniciado
3. ✅ Logs muestran conexión a base de datos exitosa
4. ✅ Healthcheck pasando (si aplica)

---

## Scripts de Ayuda

### Ver logs de un servicio:
```bash
railway logs --service <nombre-servicio>
```

### Ver estado del proyecto:
```bash
railway status
```

### Redeploy de un servicio:
```bash
cd microservices
railway up --service <nombre-servicio> --detach
```

---

## Notas Importantes

1. **Root Directory SIEMPRE es `/microservices`** para todos los servicios
2. **Dockerfile Path** cambia según el servicio: `<nombre-servicio>/Dockerfile`
3. Las **variables de referencia** usan el formato: `${{Servicio.VARIABLE}}`
4. Los **hostnames internos** en Railway son: `<nombre-servicio>.railway.internal`
5. Cada servicio con PostgreSQL necesita su tabla. Usa el script SQL correspondiente.

---

## Próximos Pasos Después del Despliegue

1. Generar dominios públicos para cada servicio
2. Configurar CORS en API Gateway
3. Probar endpoints de cada servicio
4. Configurar monitoring y alertas
5. Desplegar frontends (admin-panel y frontend)

