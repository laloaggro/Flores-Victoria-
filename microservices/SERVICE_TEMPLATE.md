# Plantilla de Servicio - Flores Victoria

Esta guía proporciona la estructura estándar para crear un nuevo microservicio compatible con Railway.

## 📁 Estructura de Archivos Requerida

```
microservices/
└── tu-servicio/
    ├── src/
    │   ├── server.js          # Punto de entrada principal
    │   ├── config/
    │   │   └── index.js       # Configuración (PORT priority)
    │   ├── routes/
    │   ├── controllers/
    │   └── models/
    ├── package.json           # Dependencias del servicio
    ├── nixpacks.toml         # Configuración de build para Railway
    ├── railway.toml          # Configuración de deployment
    └── railway.json          # Configuración de servicio Railway
```

## 📋 Archivos de Configuración

### 1. `nixpacks.toml` (Build Configuration)

```toml
# Nixpacks configuration for [SERVICE-NAME]
[phases.setup]
nixPkgs = ['nodejs']

[phases.install]
cmds = [
  'cd /app/microservices/shared && npm install --production',
  'cd /app/microservices/[SERVICE-NAME] && npm ci',
  'cd /app/microservices/[SERVICE-NAME] && mkdir -p node_modules/@flores-victoria',
  'cd /app/microservices/[SERVICE-NAME] && cp -r ../shared node_modules/@flores-victoria/'
]

[start]
cmd = 'cd /app/microservices/[SERVICE-NAME] && node src/server.js'
```

**Reemplaza:** `[SERVICE-NAME]` con el nombre de tu servicio (ej: `order-service`)

---

### 2. `railway.toml` (Deployment Configuration)

```toml
[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/health"
healthcheckTimeout = 100
startCommand = "cd microservices/[SERVICE-NAME] && node src/server.js"
```

**Reemplaza:** `[SERVICE-NAME]` con el nombre de tu servicio

---

### 3. `railway.json` (Service Metadata)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "microservices/[SERVICE-NAME]/nixpacks.toml"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Reemplaza:** `[SERVICE-NAME]` con el nombre de tu servicio

---

### 4. `src/config/index.js` (Service Configuration)

```javascript
require('dotenv').config();

module.exports = {
  // CRITICAL: PORT debe ser la primera prioridad para Railway
  port: process.env.PORT || process.env.[SERVICE_NAME]_PORT || [DEFAULT_PORT],
  
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration (ajustar según tipo de DB)
  database: {
    url: process.env.DATABASE_URL,
    // Para PostgreSQL
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || '[service]_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    
    // Para MongoDB
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/[service]_db',
    
    // Para Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  // Service URLs (para comunicación entre servicios)
  services: {
    authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    // Agregar otros servicios según necesidad
  },
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};
```

**Reemplaza:**
- `[SERVICE_NAME]`: Nombre en UPPER_SNAKE_CASE (ej: `ORDER_SERVICE`)
- `[DEFAULT_PORT]`: Puerto único del servicio (ver tabla de puertos abajo)
- `[service]`: Nombre en lowercase (ej: `order`)

---

### 5. `src/server.js` (Entry Point)

```javascript
const express = require('express');
const config = require('./config');
const logger = require('@flores-victoria/shared/utils/logger');

const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (REQUERIDO para Railway)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: '[service-name]',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas del servicio
// app.use('/api/[resource]', require('./routes/[resource]Routes'));

// Manejo de errores
app.use((err, req, res, next) => {
  logger.error('Error no manejado', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: true,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de [nombre] ejecutándose en el puerto ${PORT}`, {
    environment: config.nodeEnv,
    port: PORT
  });
});

module.exports = app;
```

**Reemplaza:**
- `[service-name]`: Nombre del servicio (ej: `order-service`)
- `[resource]`: Recurso principal (ej: `orders`)
- `[nombre]`: Nombre descriptivo (ej: `órdenes`)

---

### 6. `package.json` (Dependencies)

```json
{
  "name": "@flores-victoria/[service-name]",
  "version": "1.0.0",
  "description": "[Service description]",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "@flores-victoria/shared": "file:../shared"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

---

## 🎯 Tabla de Puertos Asignados

| Servicio | Puerto | Estado |
|----------|--------|--------|
| auth-service | 3001 | ✅ Asignado |
| user-service | 3002 | ✅ Asignado |
| cart-service | 3003 | ✅ Asignado |
| order-service | 3004 | ✅ Asignado |
| wishlist-service | 3005 | ✅ Asignado |
| review-service | 3006 | ✅ Asignado |
| contact-service | 3007 | ✅ Asignado |
| notification-service | 3008 | 🔄 Reservado |
| product-service | 3009 | ✅ Asignado |
| payment-service | 3010 | 🔄 Reservado |
| promotion-service | 3011 | 🔄 Reservado |
| analytics-service | 3012 | 🔄 Reservado |
| api-gateway | 8080 | ✅ Asignado |

**Para nuevo servicio:** Usa el siguiente puerto libre (3012+)

---

## 🚀 Pasos para Desplegar en Railway

### 1. Configuración Inicial en Railway Dashboard

1. **Crear nuevo servicio** en Railway Dashboard
2. **Conectar repositorio** GitHub: `laloaggro/Flores-Victoria-`
3. **NO configurar Root Directory** (dejar vacío)
4. **Builder:** Nixpacks (auto-detectado)

### 2. Variables de Entorno en Railway

Variables **REQUERIDAS** para cada servicio:

```bash
# Puerto (Railway lo asigna automáticamente)
PORT=3000  # Railway lo sobrescribe con su valor

# Base de datos (según el tipo que use el servicio)
DATABASE_URL=postgresql://user:pass@host:5432/db
# O
MONGODB_URI=mongodb://user:pass@host:27017/db
# O
REDIS_URL=redis://host:6379

# JWT Secret (compartido entre servicios)
JWT_SECRET=tu-secreto-super-seguro

# URLs de otros servicios (usar Railway Internal URLs)
AUTH_SERVICE_URL=${{AUTH-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
# ... otros servicios según necesidad

# Ambiente
NODE_ENV=production
```

### 3. Watch Paths (Opcional pero Recomendado)

Configura en Railway para que solo redespliegue cuando cambie tu servicio:

```
microservices/[SERVICE-NAME]/**
microservices/shared/**
```

### 4. Verificación del Despliegue

1. **Ver logs:** Railway Dashboard → Service → Logs
2. **Verificar healthcheck:** Debe mostrar `[1/1] Healthcheck succeeded!`
3. **Verificar puerto:** Log debe mostrar `Servicio de [nombre] ejecutándose en el puerto [PORT]`
4. **Test manual:** `curl https://[service-url]/health`

---

## ✅ Checklist de Nuevo Servicio

Antes de desplegar, verifica:

- [ ] `nixpacks.toml` creado con rutas correctas
- [ ] `railway.toml` con `startCommand` correcto
- [ ] `railway.json` con `nixpacksConfigPath` correcto
- [ ] `src/config/index.js` con `PORT` como primera prioridad
- [ ] Endpoint `/health` implementado
- [ ] Puerto único asignado (ver tabla)
- [ ] `package.json` incluye `@flores-victoria/shared`
- [ ] Variables de entorno documentadas
- [ ] Tests básicos implementados

---

## 🔧 Troubleshooting Común

### Error: "Cannot find module '/app/src/server.js'"
**Causa:** `railway.toml` tiene `startCommand` sin `cd microservices/[SERVICE]`
**Solución:** Actualizar `startCommand = "cd microservices/[SERVICE] && node src/server.js"`

### Error: "Cannot find module '@flores-victoria/shared'"
**Causa:** Módulo shared no copiado en `nixpacks.toml`
**Solución:** Verificar fase `install` incluye comandos de copia del shared

### Healthcheck timeout
**Causa:** Servicio no responde en `/health` o puerto incorrecto
**Solución:** 
1. Verificar `PORT` sea primera prioridad en config
2. Verificar endpoint `/health` existe y responde 200
3. Ver logs: `railway logs --service [SERVICE-NAME]`

### Database connection errors
**Causa:** Variables de entorno no configuradas
**Solución:** Configurar `DATABASE_URL` / `MONGODB_URI` / `REDIS_URL` en Railway

---

## 📚 Recursos Adicionales

- [Documentación completa del proyecto](../README.md)
- [Configuración de puertos](../PORTS_CONFIGURATION.md)
- [Guía de desarrollo](../DEVELOPMENT_GUIDE.md)
- [Railway Documentation](https://docs.railway.app/)
- [Nixpacks Documentation](https://nixpacks.com/)

---

**Última actualización:** 2025-12-09
**Versión de plantilla:** 1.0
