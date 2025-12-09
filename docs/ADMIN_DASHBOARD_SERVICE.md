# Admin Dashboard Service

## 📊 Descripción General

El **Admin Dashboard Service** es un servicio de monitoreo centralizado para la plataforma Flores Victoria. Proporciona una interfaz RESTful para monitorear el estado de salud de todos los microservicios en tiempo real.

## 🚀 Características Principales

### Monitoreo Centralizado
- **9 Microservicios Monitoreados**:
  - API Gateway (puerto 8080) - CRÍTICO
  - Auth Service (puerto 3001) - CRÍTICO
  - User Service (puerto 3002) - CRÍTICO
  - Cart Service (puerto 3003)
  - Order Service (puerto 3004) - CRÍTICO
  - Wishlist Service (puerto 3005)
  - Review Service (puerto 3006)
  - Contact Service (puerto 3007)
  - Product Service (puerto 3009) - CRÍTICO

### Health Checks Paralelos
- Utiliza `Promise.all()` para verificar todos los servicios simultáneamente
- Timeout de 5 segundos por servicio
- Identificación de servicios críticos vs no-críticos
- Medición de tiempo de respuesta (response time)

### Detección de Fallos
- Estados: `healthy` (200 OK) / `unhealthy` (error)
- Códigos de error: `ECONNREFUSED`, `ETIMEDOUT`, etc.
- Contador de servicios caídos críticos (`criticalDown`)
- Timestamp de cada verificación

## 🔗 Endpoints REST API

### 1. Dashboard Completo
```http
GET /api/dashboard
```

Retorna dashboard completo con información de la plataforma, resumen de salud y estado de todos los servicios.

**Respuesta:**
```json
{
  "platform": {
    "name": "Flores Victoria",
    "environment": "development|production",
    "version": "3.0.0"
  },
  "summary": {
    "total": 9,
    "healthy": 5,
    "unhealthy": 4,
    "criticalDown": 2,
    "timestamp": "2025-12-09T21:00:14.724Z"
  },
  "services": [
    {
      "name": "API Gateway",
      "status": "healthy|unhealthy",
      "url": "http://localhost:8080",
      "port": 8080,
      "critical": true,
      "responseTime": 43,
      "timestamp": "2025-12-09T21:00:14.697Z"
    }
    // ... otros servicios
  ],
  "timestamp": "2025-12-09T21:00:14.724Z"
}
```

### 2. Resumen de Salud
```http
GET /api/dashboard/summary
```

Retorna únicamente el resumen de salud del sistema.

**Respuesta:**
```json
{
  "total": 9,
  "healthy": 5,
  "unhealthy": 4,
  "criticalDown": 2,
  "timestamp": "2025-12-09T21:00:14.724Z"
}
```

### 3. Listar Servicios
```http
GET /api/dashboard/services
```

Retorna la lista de todos los servicios configurados.

**Respuesta:**
```json
{
  "total": 9,
  "services": [
    {
      "name": "API Gateway",
      "url": "http://localhost:8080",
      "port": 8080,
      "critical": true
    }
    // ... otros servicios
  ]
}
```

### 4. Estado de Servicio Específico
```http
GET /api/dashboard/services/:serviceName
```

Obtiene métricas detalladas de un servicio específico.

**Parámetros:**
- `serviceName`: Nombre del servicio (ej: "API Gateway", "Auth Service")

**Respuesta (servicio saludable):**
```json
{
  "name": "Auth Service",
  "status": "healthy",
  "url": "http://localhost:3001",
  "port": 3001,
  "critical": true,
  "health": {
    "status": "healthy",
    "timestamp": "2025-12-09T21:00:14.701Z"
  },
  "metrics": {
    "service": "auth-service",
    "uptime": 123456
  },
  "lastCheck": "2025-12-09T21:00:14.701Z"
}
```

**Respuesta (servicio no encontrado):**
```json
{
  "error": true,
  "message": "Servicio Auth Service no encontrado"
}
```

### 5. Ejecutar Health Check
```http
POST /api/dashboard/healthcheck
```

Ejecuta health checks en todos los servicios y retorna resultados completos.

**Respuesta:**
```json
{
  "summary": {
    "total": 9,
    "healthy": 0,
    "unhealthy": 9,
    "criticalDown": 5,
    "timestamp": "2025-12-09T21:00:14.724Z"
  },
  "services": [
    {
      "name": "API Gateway",
      "status": "unhealthy",
      "url": "http://localhost:8080",
      "port": 8080,
      "critical": true,
      "responseTime": 43,
      "error": "connect ECONNREFUSED 127.0.0.1:8080",
      "code": "ECONNREFUSED",
      "timestamp": "2025-12-09T21:00:14.697Z"
    }
    // ... otros servicios
  ]
}
```

### 6. Health Check del Dashboard
```http
GET /health
```

Verifica el estado de salud del propio dashboard.

**Respuesta:**
```json
{
  "status": "healthy",
  "service": "admin-dashboard-service",
  "timestamp": "2025-12-09T21:00:14.887Z",
  "uptime": 13.251383504,
  "environment": "development"
}
```

### 7. Información del Servicio
```http
GET /api/admin
```

Retorna información general y lista de endpoints disponibles.

**Respuesta:**
```json
{
  "message": "Dashboard de Administración - Flores Victoria",
  "version": "1.0.0",
  "endpoints": [
    "GET /health - Health check del dashboard",
    "GET /api/admin - Información del servicio",
    "GET /api/dashboard - Dashboard completo con todos los servicios",
    "GET /api/dashboard/summary - Resumen de salud del sistema",
    "GET /api/dashboard/services - Lista de servicios configurados",
    "GET /api/dashboard/services/:name - Estado detallado de un servicio",
    "POST /api/dashboard/healthcheck - Ejecutar health check en todos los servicios"
  ]
}
```

## 📦 Arquitectura Interna

### ServiceMonitor Class
**Ubicación:** `src/services/serviceMonitor.js`

Clase singleton responsable del monitoreo de servicios.

**Métodos Principales:**
- `checkServiceHealth(service)`: Verifica salud de un servicio individual
- `checkAllServices()`: Verifica todos los servicios en paralelo
- `getServiceMetrics(serviceName)`: Obtiene métricas detalladas
- `getServicesList()`: Retorna configuración de servicios

**Configuración de Servicios:**
```javascript
this.services = [
  { name: 'API Gateway', url: config.services.apiGateway, port: 8080, critical: true },
  { name: 'Auth Service', url: config.services.authService, port: 3001, critical: true },
  // ... otros servicios
];
```

### DashboardController
**Ubicación:** `src/controllers/dashboardController.js`

Controladores para los endpoints del dashboard.

**Funciones:**
- `getDashboard(req, res)`: Dashboard completo
- `getHealthSummary(req, res)`: Solo resumen
- `getServiceStatus(req, res)`: Servicio específico
- `listServices(req, res)`: Lista de servicios
- `runHealthCheck(req, res)`: Ejecutar checks

### DashboardRoutes
**Ubicación:** `src/routes/dashboardRoutes.js`

Define las rutas REST para el dashboard.

## 🛠️ Configuración

### Variables de Entorno

**Archivo:** `.env` (ver `.env.example`)

```bash
# Configuración del servicio
PORT=3012
NODE_ENV=development
SERVICE_NAME=admin-dashboard-service

# URLs de los microservicios (desarrollo)
API_GATEWAY_URL=http://localhost:8080
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
CART_SERVICE_URL=http://localhost:3003
ORDER_SERVICE_URL=http://localhost:3004
WISHLIST_SERVICE_URL=http://localhost:3005
REVIEW_SERVICE_URL=http://localhost:3006
CONTACT_SERVICE_URL=http://localhost:3007
PRODUCT_SERVICE_URL=http://localhost:3009
```

### Configuración para Railway (Producción)

**Variables de Entorno en Railway:**

```bash
PORT=${{ RAILWAY_PROVIDED_PORT }}
NODE_ENV=production

# Usar dominios internos de Railway
API_GATEWAY_URL=${{API-GATEWAY.RAILWAY_PRIVATE_DOMAIN}}
AUTH_SERVICE_URL=${{AUTH-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
CART_SERVICE_URL=${{CART-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
ORDER_SERVICE_URL=${{ORDER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
WISHLIST_SERVICE_URL=${{WISHLIST-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
REVIEW_SERVICE_URL=${{REVIEW-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
CONTACT_SERVICE_URL=${{CONTACT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}
```

**Nota:** Railway interpola `${{SERVICE-NAME.RAILWAY_PRIVATE_DOMAIN}}` automáticamente con la URL interna del servicio.

## 🚀 Deployment en Railway

### 1. Crear Nuevo Servicio

1. Ir a Railway Dashboard
2. Click en "New" → "GitHub Repo"
3. Seleccionar repositorio `flores-victoria`
4. Configurar servicio:
   - **Name:** admin-dashboard-service
   - **Root Directory:** DEJAR VACÍO (importante para acceso a módulo shared)

### 2. Configurar Variables de Entorno

Copiar las variables mencionadas arriba en la sección "Settings" → "Variables".

### 3. Verificar railway.toml

**Archivo:** `microservices/admin-dashboard-service/railway.toml`

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd microservices/admin-dashboard-service && node src/server.js"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 4. Verificar nixpacks.toml

**Archivo:** `microservices/admin-dashboard-service/nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ['nodejs-22_x']

[phases.install]
cmds = [
  'cd microservices/shared && npm ci',
  'cd microservices/admin-dashboard-service && npm ci --production'
]

[phases.build]
cmds = ['echo "No build phase needed"']

[start]
cmd = 'cd microservices/admin-dashboard-service && node src/server.js'
```

### 5. Deploy

1. Push código a GitHub
2. Railway detectará los cambios automáticamente
3. Verificar logs en Railway Dashboard
4. Buscar mensaje: `Servicio de admin-dashboard-service ejecutándose en el puerto 3012`

### 6. Verificar Deployment

```bash
# Health check del dashboard
curl https://admin-dashboard-service.railway.app/health

# Verificar todos los servicios
curl https://admin-dashboard-service.railway.app/api/dashboard/summary
```

## 🔍 Uso del Dashboard

### Ejemplo: Monitoreo en Tiempo Real

```bash
# Ver estado completo
curl http://localhost:3012/api/dashboard | jq

# Ver solo servicios críticos caídos
curl http://localhost:3012/api/dashboard | jq '.services[] | select(.critical == true and .status == "unhealthy")'

# Ver resumen cada 30 segundos
watch -n 30 'curl -s http://localhost:3012/api/dashboard/summary | jq'
```

### Ejemplo: Verificar Servicio Específico

```bash
# Ver detalles de Auth Service
curl http://localhost:3012/api/dashboard/services/Auth%20Service | jq

# Ejecutar health check manual
curl -X POST http://localhost:3012/api/dashboard/healthcheck | jq '.summary'
```

## 📊 Casos de Uso

### 1. Monitoreo de Producción
El dashboard permite identificar rápidamente qué servicios están caídos en producción, priorizando los críticos.

### 2. Alertas Automatizadas
Puedes integrar con sistemas de alertas:
```bash
# Script de alerta simple
critical_down=$(curl -s http://localhost:3012/api/dashboard/summary | jq '.criticalDown')
if [ "$critical_down" -gt 0 ]; then
  echo "ALERTA: $critical_down servicios críticos caídos"
  # Enviar notificación
fi
```

### 3. Debugging de Conectividad
Ver tiempos de respuesta para identificar servicios lentos:
```bash
curl -s http://localhost:3012/api/dashboard | jq '.services[] | {name: .name, responseTime: .responseTime}'
```

### 4. Panel de Administración
El dashboard puede alimentar una interfaz web que muestre:
- Gráficos de tiempo real
- Historial de disponibilidad
- Alertas visuales para servicios críticos

## 🧪 Testing Local

### Instalar Dependencias

```bash
cd microservices/admin-dashboard-service
npm install
```

### Ejecutar en Desarrollo

```bash
PORT=3012 npm run dev
```

### Probar Endpoints

```bash
# Health check
curl http://localhost:3012/health

# Dashboard completo
curl http://localhost:3012/api/dashboard

# Resumen
curl http://localhost:3012/api/dashboard/summary

# Servicios
curl http://localhost:3012/api/dashboard/services

# Health check manual
curl -X POST http://localhost:3012/api/dashboard/healthcheck
```

## 📝 Notas Técnicas

### Timeout de Health Checks
Los health checks tienen un timeout de **5 segundos** por servicio. Esto previene que servicios caídos bloqueen el dashboard.

### Parallel Execution
Usa `Promise.all()` para verificar todos los servicios simultáneamente, lo que reduce el tiempo total de verificación de ~45 segundos (9 * 5s) a solo ~5 segundos.

### Critical Services
5 servicios están marcados como críticos:
- API Gateway
- Auth Service
- User Service
- Order Service
- Product Service

Estos servicios tienen prioridad en alertas y monitoreo.

### Error Handling
El dashboard maneja múltiples tipos de errores:
- `ECONNREFUSED`: Servicio no está corriendo
- `ETIMEDOUT`: Servicio no responde a tiempo
- `ENOTFOUND`: DNS no resuelve el hostname
- HTTP 4xx/5xx: Servicio responde pero con error

## 🔐 Seguridad

### Autenticación (Futuro)
Actualmente el dashboard no tiene autenticación. Para producción, considera:
- JWT tokens
- API keys
- OAuth2
- IP whitelisting

### Rate Limiting
En producción, implementar rate limiting para prevenir abuso:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100 // 100 requests por minuto
});

app.use('/api/dashboard', limiter);
```

## 🎯 Próximos Pasos

1. **Frontend Web**: Crear interfaz visual para el dashboard
2. **Historial**: Almacenar histórico de health checks
3. **Alertas**: Sistema de notificaciones (email, Slack, etc.)
4. **Métricas Avanzadas**: CPU, memoria, requests/seg
5. **Logs Centralizados**: Agregar logs de todos los servicios
6. **Autenticación**: Proteger endpoints con JWT

## 📚 Referencias

- [Creación del Servicio](../docs/QUICK_START_SERVICE_CREATION.md)
- [Template de Servicio](../microservices/SERVICE_TEMPLATE.md)
- [Configuración de Puertos](../docs/PORTS_CONFIGURATION.md)
- [Arquitectura General](../docs/ARCHITECTURE_OVERVIEW.md)

---

**Generado por:** create-service.sh script  
**Versión:** 1.0.0  
**Puerto Asignado:** 3012  
**Commit:** b5119d8
