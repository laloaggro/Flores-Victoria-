# 🚀 Configuración de Producción en Railway.app

## Paso 1: Crear proyecto en Railway

1. Ve a https://railway.app
2. **"Start a New Project"** → **"Deploy from GitHub repo"**
3. Autoriza Railway y selecciona **"Flores-Victoria-"**
4. Railway detectará `docker-compose.railway.yml` automáticamente

## Paso 2: Crear bases de datos administradas (CRÍTICO)

Railway ofrece bases de datos administradas con backups automáticos.

### 2.1 Crear PostgreSQL
1. En tu proyecto Railway, clic en **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway generará `DATABASE_URL` automáticamente

### 2.2 Crear MongoDB
1. Clic en **"New"** → **"Database"** → **"Add MongoDB"**
2. Railway generará `MONGODB_URI` automáticamente

### 2.3 Crear Redis
1. Clic en **"New"** → **"Database"** → **"Add Redis"**
2. Railway generará `REDIS_URL` automáticamente

## Paso 3: Configurar variables de entorno

Agrega estas variables manualmente en cada servicio:

```env
NODE_ENV=production
JWT_SECRET=XzxHZzDH7rXw6skl8qRlTydTdYeNk7urRnQxo5LJniOwEBAgkABXtpHGbMva8KAZ
SESSION_SECRET=Hfb8+ExOMQ4aCc9nyBhmDXsN/THNFNt/xfn3zwI7VZY6vyE4lK846QnD+BpuLHNEEHtvKAHPHaak4s+7iixxnQ==
AUTH_SERVICE_URL=http://auth-service:3001
USER_SERVICE_URL=http://user-service:3003
PRODUCT_SERVICE_URL=http://product-service:3009
ORDER_SERVICE_URL=http://order-service:3004
CART_SERVICE_URL=http://cart-service:3005
```

## Paso 4: Conectar bases de datos a servicios

1. Abre cada servicio → **"Settings"** → **"Service Variables"**
2. Clic en **"Reference Variable"**
3. Conecta:
   - auth/user/order-service: PostgreSQL → `DATABASE_URL`
   - product-service: MongoDB → `MONGODB_URI`
   - Todos: Redis → `REDIS_URL`

## 📊 Costos estimados: $9-11 USD/mes

✅ Incluye SSL, backups automáticos y monitoreo

## ✅ Checklist

- [ ] Bases de datos administradas creadas
- [ ] Variables de entorno configuradas
- [ ] Bases de datos conectadas a servicios
- [ ] Dominio público generado
- [ ] Healthchecks verificados

