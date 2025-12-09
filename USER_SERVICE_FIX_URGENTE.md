# 🚨 FIX URGENTE - USER-SERVICE

**Fecha**: 9 diciembre 2025
**Deploy fallido**: Healthcheck timeout después de 5 minutos
**Problema confirmado**: Logs muestran ejecución de auth-service en lugar de user-service

---

## 🔍 DIAGNÓSTICO DE LOS LOGS

### Problema 1: Start Command Incorrecto
```
║ start      │ cd microservices/auth-service && node src/server.js             ║
```
❌ Ejecuta: `auth-service`
✅ Debe ejecutar: `user-service`

### Problema 2: DATABASE_URL con Placeholder
```
Error: getaddrinfo ENOTFOUND ... (debe existir)
```
❌ Contiene texto: `"... (debe existir)"`
✅ Debe contener: `postgresql://postgres:GnpChUscOAzadwBbRWTgGueejprKeVUf@postgres.railway.internal:5432/railway`

### Problema 3: Logs Confirman Servicio Equivocado
```
[info] [auth-service]: JWT_SECRET validado correctamente en auth-service
[info] [auth-service]: 💾 Iniciando connectToDatabase()...
Stack: /app/microservices/auth-service/src/config/database.js:51:20
```
❌ Todos los logs y stack traces apuntan a `auth-service/`

---

## ✅ PASOS PARA CORREGIR (Railway Dashboard)

### 1️⃣ Ir a Railway Dashboard
```
https://railway.app → Arreglos Victoria → USER-SERVICE
```

### 2️⃣ Settings → Deploy

**Custom Start Command** - CAMBIAR A:
```bash
cd microservices/user-service && node src/server.js
```

**Root Directory** - VERIFICAR que esté:
```
(vacío - no escribir nada)
```

### 3️⃣ Variables Tab

**Cambiar estas 3 variables críticas:**

```bash
# Variable 1: DATABASE_URL
# ACTUAL (INCORRECTO):
DATABASE_URL=postgresql://... (debe existir)

# CAMBIAR A:
DATABASE_URL=postgresql://postgres:GnpChUscOAzadwBbRWTgGueejprKeVUf@postgres.railway.internal:5432/railway
```

```bash
# Variable 2: REDIS_URL
# ACTUAL (puede tener placeholder):
REDIS_URL=redis://... (debe existir)

# CAMBIAR A:
REDIS_URL=redis://default:rLfTSWwWzVGWLmSwSjXPGMmrdWZagqrM@redis-4sdp.railway.internal:6379
```

```bash
# Variable 3: JWT_SECRET
# ACTUAL (puede tener placeholder):
JWT_SECRET=... (debe existir)

# CAMBIAR A:
JWT_SECRET=160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb
```

**Otras variables - VERIFICAR que tengan estos valores:**
```bash
PORT=3002
NODE_ENV=production
SERVICE_NAME=USER-SERVICE
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

### 4️⃣ Trigger Redeploy

- Click en "Deployments" tab
- Click botón "Deploy" o "Redeploy"
- Esperar 2-3 minutos

### 5️⃣ Verificar Logs

Después del deploy, los logs CORRECTOS deben mostrar:

```bash
✅ [user-service]: User Service running on port 3002
✅ [user-service]: Connected to PostgreSQL
✅ [user-service]: Connected to Redis
```

**NO deben aparecer:**
```bash
❌ [auth-service]: ...
❌ Error: getaddrify ENOTFOUND ... (debe existir)
❌ Stack: /app/microservices/auth-service/...
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de hacer Deploy, confirma:

- [ ] Custom Start Command dice `user-service` (NO `auth-service`)
- [ ] DATABASE_URL contiene `postgresql://postgres:Gnp...` (NO "debe existir")
- [ ] REDIS_URL contiene `redis://default:rLf...` (NO "debe existir")
- [ ] JWT_SECRET contiene hash largo (NO "debe existir")
- [ ] PORT=3002 (NO 3003)
- [ ] SERVICE_NAME=USER-SERVICE
- [ ] Root Directory está vacío

---

## 🎯 OBTENER VALORES CORRECTOS DESDE AUTH-SERVICE

Si no tienes los valores a mano, cópialos desde AUTH-SERVICE:

```bash
# Desde terminal local:
cd /home/impala/Documentos/Proyectos/flores-victoria
railway service AUTH-SERVICE
railway variables | grep -E "(DATABASE_URL|REDIS_URL|JWT_SECRET)"
```

Copia los valores mostrados y pégalos exactamente en USER-SERVICE.

---

## 🚀 RESULTADO ESPERADO

Una vez corregido:

- ✅ Healthcheck pasará en ~30 segundos
- ✅ Servicio en estado "Running"
- ✅ Logs mostrarán `[user-service]` en todos los mensajes
- ✅ Puerto 3002 escuchando correctamente
- ✅ Conexiones a PostgreSQL y Redis exitosas

---

## 📞 SI PERSISTE EL PROBLEMA

1. Verificar que guardaste los cambios en Railway (botón "Save")
2. Confirmar que el redeploy se ejecutó (ver nuevo deployment ID)
3. Revisar logs completos del nuevo deployment
4. Verificar que AUTH-SERVICE tenga valores correctos para copiar

---

**Tiempo estimado de fix**: 5-7 minutos
**Siguiente paso**: Una vez USER-SERVICE funcional, configurar CART-SERVICE
