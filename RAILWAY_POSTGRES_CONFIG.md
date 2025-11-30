# 🔧 Railway PostgreSQL - DATABASE_URL Correcto

## ✅ URL Correcta para Servicios Railway

```
postgresql://postgres:GnpChUscOAzadwBBRWTgGueejprKeVUf@postgres.railway.internal:5432/railway
```

## 📋 Configuración en Railway Dashboard

### Para USER-SERVICE:
1. Click en "USER-SERVICE"
2. Tab "Variables"
3. Agregar/Actualizar variable:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:GnpChUscOAzadwBbRWTgGueejprKeVUf@postgres.railway.internal:5432/railway`

### Para PAYMENT-SERVICE:
1. Click en "PAYMENT-SERVICE"
2. Tab "Variables"
3. Agregar/Actualizar variable:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:GnpChUscOAzadwBbRWTgGueejprKeVUf@postgres.railway.internal:5432/railway`

### Para ORDER-SERVICE:
1. Click en "ORDER-SERVICE"
2. Tab "Variables"
3. Verificar variable `DATABASE_URL` tiene el valor correcto (arriba)

## ⚠️ Notas Importantes

- **Usuario:** `postgres` (NO "flores_user")
- **Base de datos:** `railway` (NO "flores_db")
- **Host interno:** `postgres.railway.internal` (correcto para servicios en Railway)
- **Puerto:** `5432` (estándar PostgreSQL)

## 🔍 Cómo Verificar si está Correcto

El DATABASE_URL debe contener:
- ✅ `postgres@` (usuario correcto)
- ✅ `postgres.railway.internal` (host interno)
- ✅ `/railway` (base de datos correcta)

Si contiene:
- ❌ `flores_user@` → INCORRECTO
- ❌ `/flores_db` → INCORRECTO

## 📝 Después de Configurar

1. Los servicios se redesplegan automáticamente (1-2 min)
2. Los errores "Role flores_user does not exist" desaparecerán
3. Los servicios cambiarán de "Failed" a "Active ✅"

## 🚀 Siguiente Paso: Inicializar Schema

Una vez que los servicios estén conectados correctamente, necesitarás:

1. Abrir Railway Dashboard → Servicio "Postgres" → Tab "Data"
2. Ejecutar el schema SQL para crear las tablas

El archivo está en: `database/init.sql`
