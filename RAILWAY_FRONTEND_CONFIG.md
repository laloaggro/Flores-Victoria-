# 🔧 Configuración Final del Frontend en Railway

## ❌ Problema Actual

El frontend en Railway da error 404 porque no encuentra el Dockerfile correcto.

## ✅ Solución: Configuración en Railway Dashboard

Ve a: https://railway.app/project/d751ae6b-0067-4745-bc61-87b41f3cc2c4

### OPCIÓN 1: Eliminar Root Directory (RECOMENDADO)

**Settings → Build:**
```
Builder: DOCKERFILE
Root Directory: (DEJAR VACÍO - eliminar "frontend")
Dockerfile Path: frontend/Dockerfile.railway
```

Después en `frontend/railway.toml` el archivo debe tener:
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "frontend/Dockerfile.railway"
```

### OPCIÓN 2: Mantener Root Directory

**Settings → Build:**
```
Builder: DOCKERFILE
Root Directory: frontend
Dockerfile Path: Dockerfile.railway
```

Y en `frontend/railway.toml`:
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.railway"
```

### OPCIÓN 3: Usar Nixpacks (Más Simple)

**Settings → Build:**
```
Builder: NIXPACKS
Root Directory: frontend
```

Y cambiar `frontend/railway.toml` a:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npx vite preview --host 0.0.0.0 --port ${PORT:-80}"
```

## 📋 Checklist de Verificación

- [ ] Root Directory configurado correctamente
- [ ] Dockerfile Path coincide con Root Directory
- [ ] Variable VITE_API_URL = https://api-gateway-production-949b.up.railway.app
- [ ] Redeploy después de cambios

## 🎯 Configuración Actual de Archivos

### frontend/railway.toml (ACTUAL)
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.railway"

[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5
healthcheckPath = "/"
healthcheckTimeout = 60
```

### frontend/Dockerfile.railway (EXISTE)
- ✅ Ubicación: `/frontend/Dockerfile.railway`
- ✅ Puerto: 80
- ✅ Nginx configurado

## 🚀 Pasos para Aplicar

1. **Ve a Railway Dashboard**
2. **Click en servicio "Frontend"**
3. **Settings → Build**
4. **Elige una de las 3 opciones**
5. **Guarda cambios**
6. **Click "Redeploy" en la pestaña Deployments**

## 📞 Si Nada Funciona

Puedes eliminar el servicio Frontend y crear uno nuevo:
1. Railway Dashboard → Frontend → Settings
2. Scroll abajo → "Delete Service"
3. Crea nuevo servicio desde GitHub
4. Selecciona "frontend" como Root Directory
5. Railway detectará automáticamente package.json

