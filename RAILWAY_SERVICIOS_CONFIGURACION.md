# 📋 Configuración Rápida de Servicios en Railway

## ⚙️ Patrón de Configuración (Todos los Servicios)

**Root Directory:** `/microservices` (SIEMPRE el mismo)
**Dockerfile Path:** `{nombre-del-servicio}/Dockerfile` (cambia según el servicio)

---

## 🗄️ SERVICIOS POSTGRESQL

### 1️⃣ order-service
```
Root Directory:    /microservices
Dockerfile Path:   order-service/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3004
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 2️⃣ payment-service
```
Root Directory:    /microservices
Dockerfile Path:   payment-service/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3005
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 3️⃣ promotion-service
```
Root Directory:    /microservices
Dockerfile Path:   promotion-service/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3006
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

---

## 🍃 SERVICIOS MONGODB

### 4️⃣ product-service
```
Root Directory:    /microservices
Dockerfile Path:   product-service/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3009
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

### 5️⃣ review-service
```
Root Directory:    /microservices
Dockerfile Path:   review-service/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3007
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

### 6️⃣ contact-service
```
Root Directory:    /microservices
Dockerfile Path:   contact-service/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3008
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

---

## ⚡ SERVICIOS REDIS

### 7️⃣ cart-service
```
Root Directory:    /microservices
Dockerfile Path:   cart-service/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3010
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
REDIS_URL=${{Redis-4SDP.REDIS_URL}}
```

### 8️⃣ wishlist-service
```
Root Directory:    /microservices
Dockerfile Path:   wishlist-service/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3011
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
REDIS_URL=${{Redis-4SDP.REDIS_URL}}
```

### 9️⃣ notification-service
```
Root Directory:    /microservices
Dockerfile Path:   notification-service/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3012
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
REDIS_URL=${{Redis-4SDP.REDIS_URL}}
```

---

## 🌐 API GATEWAY (Desplegar al FINAL)

### 🔟 api-gateway
```
Root Directory:    /microservices
Dockerfile Path:   api-gateway/Dockerfile

Variables de Entorno:
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
JWT_SECRET=tu_secreto_aqui
AUTH_SERVICE_URL=http://auth-service.railway.internal:3001
USER_SERVICE_URL=http://user-service.railway.internal:3003
ORDER_SERVICE_URL=http://order-service.railway.internal:3004
PAYMENT_SERVICE_URL=http://payment-service.railway.internal:3005
PROMOTION_SERVICE_URL=http://promotion-service.railway.internal:3006
REVIEW_SERVICE_URL=http://review-service.railway.internal:3007
CONTACT_SERVICE_URL=http://contact-service.railway.internal:3008
PRODUCT_SERVICE_URL=http://product-service.railway.internal:3009
CART_SERVICE_URL=http://cart-service.railway.internal:3010
WISHLIST_SERVICE_URL=http://wishlist-service.railway.internal:3011
NOTIFICATION_SERVICE_URL=http://notification-service.railway.internal:3012
```

---

## 📝 NOTAS IMPORTANTES

### ✅ Al configurar Root Directory:
- SIEMPRE empieza con `/` (barra diagonal)
- Sin espacios al inicio o al final
- Exactamente: `/microservices`

### ✅ Al configurar Dockerfile Path:
- NO empieza con `/` (sin barra diagonal)
- Formato: `nombre-del-servicio/Dockerfile`
- Ejemplo: `order-service/Dockerfile`

### ✅ Variables de Entorno:
- Referencias a otros servicios: `${{NombreServicio.VARIABLE}}`
- PostgreSQL: `${{Postgres.DATABASE_URL}}`
- MongoDB: `${{MongoDB.MONGO_URL}}`
- Redis: `${{Redis-4SDP.REDIS_URL}}`

### ✅ JWT_SECRET:
- Usa el MISMO secreto para todos los servicios
- Debe ser seguro (mínimo 32 caracteres)
- Puedes generarlo con: `openssl rand -hex 32`

---

## 🚀 FLUJO DE TRABAJO RECOMENDADO

1. **Crear servicio** en Railway (CLI o Dashboard)
2. **Configurar** Root Directory y Dockerfile Path en Dashboard
3. **Agregar** variables de entorno
4. **Esperar** que el despliegue complete (2-3 min)
5. **Verificar** logs para confirmar éxito
6. **Continuar** con el siguiente servicio

---

## 🔍 VERIFICACIÓN RÁPIDA

Después de configurar cada servicio, verifica los logs:

```bash
railway logs --service "NombreDelServicio" --tail 30
```

Busca mensajes como:
- ✅ Conexión a base de datos establecida
- ✅ Servidor corriendo en puerto XXXX
- ✅ Sin errores de inicio

---

## ⏱️ TIEMPO ESTIMADO

- **Por servicio:** ~5 minutos
- **Total (10 servicios):** ~50 minutos
- **Con API Gateway:** ~60 minutos

---

## 💡 TIP FINAL

Puedes trabajar en múltiples pestañas del navegador para configurar
varios servicios en paralelo y acelerar el proceso.
