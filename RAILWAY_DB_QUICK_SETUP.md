# 🔧 Railway Configuration Quick Guide

## 🎯 Base de Datos PostgreSQL

### Servicios que necesitan PostgreSQL:
- AUTH-SERVICE
- USER-SERVICE  
- ORDER-SERVICE

### Variable requerida:
```bash
DATABASE_URL=postgresql://usuario:password@host:puerto/database
```

### Cómo obtener el DATABASE_URL:

1. **En Railway Dashboard:**
   - Ve a tu proyecto
   - Busca el servicio `PostgreSQL` (o créalo si no existe)
   - Pestaña "Variables"
   - Copia el valor de `DATABASE_URL`

2. **O crea uno nuevo:**
   ```bash
   railway service create postgres-db --template postgres
   ```

3. **Configurar en cada servicio:**
   ```bash
   railway service select AUTH-SERVICE
   railway variables set DATABASE_URL="<tu-database-url>"
   
   railway service select USER-SERVICE
   railway variables set DATABASE_URL="<tu-database-url>"
   
   railway service select ORDER-SERVICE
   railway variables set DATABASE_URL="<tu-database-url>"
   ```

---

## 🍃 Base de Datos MongoDB

### Servicios que necesitan MongoDB:
- PRODUCT-SERVICE
- REVIEW-SERVICE
- CART-SERVICE (opcional)
- WISHLIST-SERVICE (opcional)

### Variable requerida:
```bash
MONGODB_URI=mongodb://usuario:password@host:puerto/database
```

### Cómo obtener el MONGODB_URI:

1. **En Railway Dashboard:**
   - Ve a tu proyecto
   - Busca el servicio `MongoDB` (o créalo si no existe)
   - Pestaña "Variables"
   - Copia el valor de `MONGO_URL` o `MONGODB_URI`

2. **O crea uno nuevo:**
   ```bash
   railway service create mongodb --template mongodb
   ```

3. **Configurar en cada servicio:**
   ```bash
   railway service select PRODUCT-SERVICE
   railway variables set MONGODB_URI="<tu-mongodb-uri>"
   railway variables set PRODUCT_SERVICE_MONGODB_URI="<tu-mongodb-uri>"
   
   railway service select REVIEW-SERVICE
   railway variables set MONGODB_URI="<tu-mongodb-uri>"
   
   railway service select CART-SERVICE
   railway variables set MONGODB_URI="<tu-mongodb-uri>"
   
   railway service select WISHLIST-SERVICE
   railway variables set MONGODB_URI="<tu-mongodb-uri>"
   ```

---

## 🔐 JWT Secret (Ya configurado)

El API Gateway y AUTH-SERVICE ya tienen configurado:
```bash
JWT_SECRET=160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb
```

✅ **No requiere acción adicional**

---

## 🚀 Configuración Rápida (30 minutos)

### Opción 1: Script Automático
```bash
./scripts/railway-database-setup.sh
```
Sigue las instrucciones interactivas.

### Opción 2: Manual Rápido

1. **Crear bases de datos:**
   ```bash
   railway service create postgres-db --template postgres
   railway service create mongodb --template mongodb
   ```

2. **Obtener URLs:**
   ```bash
   # PostgreSQL
   railway service select postgres-db
   railway variables get DATABASE_URL
   
   # MongoDB
   railway service select mongodb
   railway variables get MONGO_URL
   ```

3. **Configurar servicios PostgreSQL:**
   ```bash
   for service in AUTH-SERVICE USER-SERVICE ORDER-SERVICE; do
     railway service select $service
     railway variables set DATABASE_URL="<postgresql-url>"
   done
   ```

4. **Configurar servicios MongoDB:**
   ```bash
   for service in PRODUCT-SERVICE REVIEW-SERVICE CART-SERVICE WISHLIST-SERVICE; do
     railway service select $service
     railway variables set MONGODB_URI="<mongodb-url>"
   done
   ```

5. **Verificar todo:**
   ```bash
   ./scripts/railway-service-validator.sh
   ```

---

## 📊 Verificación de Estado

### Comando rápido:
```bash
curl https://api-gateway-production-949b.up.railway.app/health | jq .
```

### Script completo:
```bash
./scripts/railway-service-validator.sh
```

---

## 🗄️ Inicializar Schemas

### PostgreSQL:
El archivo `database/init.sql` contiene todo el schema necesario.

**Ejecutarlo:**
1. Ve a Railway Dashboard → PostgreSQL service
2. Pestaña "Data" o "Query"
3. Copia y pega el contenido de `database/init.sql`
4. Ejecuta

### MongoDB:
MongoDB no requiere schema previo. Los modelos se crean automáticamente.

---

## 🐛 Troubleshooting

### Servicio retorna HTTP 502:
```
Causa: No puede conectar a la base de datos
Solución: Verificar que DATABASE_URL o MONGODB_URI estén configurados
```

### Servicio retorna HTTP 404:
```
Causa: Ruta no existe
Solución: Verificar que el endpoint sea correcto (/api/products, /auth/login, etc.)
```

### Servicio retorna HTTP 500:
```
Causa: Error interno del servicio
Solución: Revisar logs en Railway Dashboard
```

### "Connection timeout" en PostgreSQL:
```
Causa: URL incorrecta o servicio no accesible
Solución: 
1. Verificar que DATABASE_URL sea correcto
2. Verificar que PostgreSQL service esté activo
3. Revisar logs del servicio PostgreSQL
```

### "Authentication failed" en MongoDB:
```
Causa: Credenciales incorrectas en MONGODB_URI
Solución:
1. Verificar usuario y password en MONGODB_URI
2. Formato correcto: mongodb://user:pass@host:port/db
3. Revisar logs del servicio MongoDB
```

---

## 📝 Checklist de Configuración

- [ ] PostgreSQL service creado
- [ ] MongoDB service creado
- [ ] DATABASE_URL obtenido
- [ ] MONGODB_URI obtenido
- [ ] AUTH-SERVICE configurado con DATABASE_URL
- [ ] USER-SERVICE configurado con DATABASE_URL
- [ ] ORDER-SERVICE configurado con DATABASE_URL
- [ ] PRODUCT-SERVICE configurado con MONGODB_URI
- [ ] REVIEW-SERVICE configurado con MONGODB_URI
- [ ] Schema PostgreSQL ejecutado (init.sql)
- [ ] Todos los servicios redesplegados
- [ ] Health checks pasando
- [ ] Endpoints funcionales probados

---

## 🔗 Enlaces Útiles

- **API Gateway:** https://api-gateway-production-949b.up.railway.app
- **Health Check:** https://api-gateway-production-949b.up.railway.app/health
- **Railway Dashboard:** https://railway.app
- **Documentación completa:** `RAILWAY_ACTION_PLAN.md`
- **Variables completas:** `RAILWAY_ENVIRONMENT_VARS_COMPLETE.md`

---

## ⏱️ Tiempo Estimado

| Tarea | Tiempo |
|-------|--------|
| Crear PostgreSQL | 2 min |
| Crear MongoDB | 2 min |
| Configurar servicios PostgreSQL | 5 min |
| Configurar servicios MongoDB | 5 min |
| Inicializar schemas | 3 min |
| Verificar servicios | 5 min |
| Pruebas funcionales | 8 min |
| **TOTAL** | **~30 min** |

---

**✅ Con estos pasos tu sistema estará 100% operativo en Railway**
