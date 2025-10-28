# 🔌 Guía de Conectividad - Flores Victoria

> **Última actualización**: 28 de octubre de 2025  
> **Versión**: 3.0.1  
> **Estado**: ✅ Implementado y Probado

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Conectividad](#arquitectura-de-conectividad)
3. [API Gateway](#api-gateway)
4. [Servicios Conectados](#servicios-conectados)
5. [Endpoints Disponibles](#endpoints-disponibles)
6. [Troubleshooting](#troubleshooting)

---

## Resumen Ejecutivo

Todos los microservicios están centralizados a través del **API Gateway** en el puerto **3000**. Los servicios internos no necesitan ser accedidos directamente desde el frontend o admin panel.

### ✅ Estado de Conectividad

| Servicio | Puerto Interno | Ruta Gateway | Estado |
|----------|----------------|--------------|--------|
| **Recommendations** | 3002 | `/api/ai/*` | ✅ Activo |
| **WASM Processor** | 3003 | `/api/wasm/*` | ✅ Activo |
| **Payment Service** | 3018 | `/api/payments/*` | ✅ Activo |
| **Products** | 3009 | `/api/products/*` | ✅ Activo |
| **Auth** | 3001 | `/api/auth/*` | ✅ Activo |

---

## Arquitectura de Conectividad

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES                                  │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   Frontend   │              │  Admin Panel │            │
│  │  Port: 5173  │              │  Port: 3010  │            │
│  └──────┬───────┘              └──────┬───────┘            │
│         │                              │                     │
│         └──────────────┬───────────────┘                     │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   API GATEWAY                                 │
│                   Port: 3000                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Routes:                                               │  │
│  │  • /api/products/*    → product-service:3009          │  │
│  │  • /api/auth/*        → auth-service:3001             │  │
│  │  • /api/ai/*          → recommendations:3002          │  │
│  │  • /api/wasm/*        → wasm-processor:3003           │  │
│  │  • /api/payments/*    → payment-service:3018          │  │
│  │  • /api/ai-images/*   → Hugging Face / AI Horde       │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌───────▼────────┐
│ Recommendations│  │     WASM     │  │    Payments    │
│   Port: 3002   │  │  Port: 3003  │  │  Port: 3018    │
└────────────────┘  └──────────────┘  └────────────────┘
```

---

## API Gateway

### Configuración

**Archivo**: `microservices/api-gateway/src/config/index.js`

```javascript
services: {
  authService: 'http://auth-service:3001',
  productService: 'http://product-service:3009',
  aiRecommendationsService: 'http://recommendations:3002',
  wasmService: 'http://wasm-processor:3003',
  paymentService: 'http://payment-service:3018',
}
```

### Rutas

**Archivo**: `microservices/api-gateway/src/routes/index.js`

```javascript
// AI Recommendations - Sin prefijo adicional
router.use('/ai', (req, res) => {
  // Gateway: /api/ai/health → Service: /health
  ServiceProxy.routeToService(config.services.aiRecommendationsService, req, res);
});

// WASM Processor - Passthr passthrough directo
router.use('/wasm', (req, res) => {
  ServiceProxy.routeToService(config.services.wasmService, req, res);
});

// Payments - Manejo especial para /payments/*
router.use('/payments', (req, res) => {
  const passthroughPaths = ['/health', '/metrics', '/stats'];
  if (!passthroughPaths.includes(req.url.split('?')[0])) {
    req.url = `/payments${req.url}`;
  }
  ServiceProxy.routeToService(config.services.paymentService, req, res);
});
```

---

## Servicios Conectados

### 1. 🤖 AI Recommendations Service

**Puerto Interno**: 3002  
**Ruta Gateway**: `/api/ai/*`  
**Contenedor**: `flores-victoria-recommendations`

#### Endpoints

```bash
# Health Check
GET http://localhost:3000/api/ai/health

# Recomendaciones personalizadas
GET http://localhost:3000/api/ai/recommendations/:userId?limit=10

# Productos similares
GET http://localhost:3000/api/ai/similar/:productId

# Productos en tendencia
GET http://localhost:3000/api/ai/trending

# Por ocasión
GET http://localhost:3000/api/ai/occasion/:occasion
```

#### Variables de Entorno

```yaml
environment:
  - NODE_ENV=production
  - MONGODB_URI=mongodb://root:rootpassword@mongodb:27017/flores_victoria?authSource=admin
  - REDIS_URL=redis://redis:6379
  - PORT=3002
  - RECOMMENDATIONS_PORT=3002  # ⚠️ Importante: el servicio usa esta variable
```

---

### 2. 🖼️ WASM Image Processor

**Puerto Interno**: 3003  
**Ruta Gateway**: `/api/wasm/*`  
**Contenedor**: `flores-victoria-wasm`  
**Puerto Host**: 3012 (evita conflicto con Grafana en 3011)

#### Endpoints

```bash
# Health Check
GET http://localhost:3000/api/wasm/health

# Información del servicio
GET http://localhost:3000/api/wasm/info

# Procesar imagen
POST http://localhost:3000/api/wasm/process
Content-Type: multipart/form-data
{
  "image": <file>,
  "operations": [
    { "type": "resize", "width": 800, "height": 600 },
    { "type": "filters", "filters": { "brightness": 1.1 } }
  ]
}

# Optimizar para web
POST http://localhost:3000/api/wasm/optimize
Content-Type: multipart/form-data
{
  "image": <file>,
  "maxWidth": 1920,
  "quality": 0.85
}

# Generar thumbnail
POST http://localhost:3000/api/wasm/thumbnail
Content-Type: multipart/form-data
{
  "image": <file>,
  "size": 300
}
```

#### Configuración Docker

```yaml
ports:
  - "3012:3003"  # Host:Container
environment:
  - NODE_ENV=production
  - PORT=3003
  - MAX_IMAGE_SIZE=67108864  # 64MB
networks:
  - app-network
# ⚠️ Sin volume mounts que sobrescriban node_modules
```

---

### 3. 💳 Payment Service

**Puerto Interno**: 3018  
**Ruta Gateway**: `/api/payments/*`  
**Contenedor**: `flores-victoria-payment-service`  
**Puerto Host**: 3014

#### Endpoints

```bash
# Health Check
GET http://localhost:3000/api/payments/health

# Crear pago
POST http://localhost:3000/api/payments/payments
Content-Type: application/json
{
  "amount": 50000,
  "currency": "CLP",
  "method": "credit_card",
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}

# Obtener pago
GET http://localhost:3000/api/payments/payments/:transactionId

# Listar pagos
GET http://localhost:3000/api/payments/payments?status=completed&limit=10

# Procesar reembolso
POST http://localhost:3000/api/payments/payments/:transactionId/refund
Content-Type: application/json
{
  "amount": 50000,
  "reason": "Solicitud del cliente"
}

# Estadísticas
GET http://localhost:3000/api/payments/stats

# Métricas Prometheus
GET http://localhost:3000/api/payments/metrics
```

#### Monedas y Métodos Soportados

```javascript
Monedas: ['USD', 'EUR', 'MXN', 'CLP']
Métodos: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer']
```

#### Configuración Docker

```yaml
environment:
  - NODE_ENV=production
  - PORT=3018
  - PAYMENT_SERVICE_PORT=3018
```

**⚠️ Importante**: El Dockerfile NO copia `scripts/port-manager.js` para forzar el uso de variables de entorno.

---

## Endpoints Disponibles

### Resumen por Categoría

#### 🛍️ E-commerce Core
```
GET    /api/products              # Listar productos
GET    /api/products/:id          # Detalle de producto
POST   /api/auth/register         # Registro de usuario
POST   /api/auth/login            # Login
GET    /api/auth/profile          # Perfil del usuario
```

#### 🤖 Inteligencia Artificial
```
GET    /api/ai/recommendations/:userId    # Recomendaciones personalizadas
GET    /api/ai/trending                   # Productos en tendencia
GET    /api/ai/similar/:productId         # Productos similares
POST   /api/ai-images/generate            # Generar imagen con IA
```

#### 🖼️ Procesamiento de Imágenes
```
POST   /api/wasm/process         # Procesar imagen
POST   /api/wasm/optimize        # Optimizar para web
POST   /api/wasm/thumbnail       # Generar miniatura
POST   /api/wasm/enhance         # Mejorar calidad
```

#### 💰 Pagos
```
POST   /api/payments/payments              # Crear pago
GET    /api/payments/payments/:id          # Consultar pago
POST   /api/payments/payments/:id/refund   # Reembolso
GET    /api/payments/stats                 # Estadísticas
```

---

## Troubleshooting

### Problema: "Servicio temporalmente no disponible"

**Causa**: El servicio no está corriendo o no es accesible desde el gateway.

**Solución**:
```bash
# 1. Verificar que el servicio esté corriendo
docker ps --filter "name=flores-victoria"

# 2. Ver logs del servicio
docker logs flores-victoria-<servicio>

# 3. Verificar conectividad desde el gateway
docker exec flores-victoria-api-gateway curl http://<servicio>:<puerto>/health
```

### Problema: "Ruta no encontrada" (404)

**Causa**: El path del endpoint no existe en el servicio destino.

**Solución**:
```bash
# 1. Ver logs del gateway
docker logs flores-victoria-api-gateway --tail 50

# 2. Verificar rutas del servicio
curl http://localhost:<puerto-host>/health
```

### Problema: Puerto ya en uso

**Causa**: Otro proceso está usando el puerto.

**Solución**:
```bash
# Encontrar proceso usando el puerto
lsof -i :3012
# o
ss -tlnp | grep 3012

# Matar proceso
kill <PID>
```

### Problema: Servicio crasheando continuamente

**Solución específica por servicio**:

#### WASM Processor
- ✅ Verificar que no haya volume mounts sobrescribiendo `node_modules`
- ✅ Dockerfile debe usar `npm install` no `npm ci`

#### Payment Service
- ✅ PortManager debe ser opcional (wrapped en try-catch)
- ✅ No copiar `scripts/port-manager.js` en Dockerfile

#### Recommendations
- ✅ Usar variable `RECOMMENDATIONS_PORT` no solo `PORT`

---

## Testing de Conectividad

### Script de Prueba Rápida

```bash
#!/bin/bash
echo "🧪 Testing Connectivity..."

# AI Recommendations
curl -sf http://localhost:3000/api/ai/health && echo "✅ AI OK" || echo "❌ AI FAIL"

# WASM Processor
curl -sf http://localhost:3000/api/wasm/health && echo "✅ WASM OK" || echo "❌ WASM FAIL"

# Payments
curl -sf http://localhost:3000/api/payments/health && echo "✅ Payments OK" || echo "❌ Payments FAIL"
```

### Prueba Funcional Completa

```bash
# 1. Recomendaciones
curl -s "http://localhost:3000/api/ai/recommendations/guest?limit=3"

# 2. Info WASM
curl -s http://localhost:3000/api/wasm/info | jq .

# 3. Estadísticas de pagos
curl -s http://localhost:3000/api/payments/stats | jq .
```

---

## Checklist de Implementación

- [x] Gateway configurado con todas las rutas
- [x] Servicios corriendo y accesibles
- [x] Docker Compose actualizado
- [x] Variables de entorno correctas
- [x] Pruebas de conectividad exitosas
- [x] Frontend actualizado para usar gateway
- [x] Admin panel actualizado para usar gateway
- [x] Documentación completa

---

## Contacto y Soporte

Para problemas o preguntas sobre la conectividad:
- **Logs**: `docker logs flores-victoria-<servicio>`
- **Health Checks**: Todos los servicios tienen endpoint `/health`
- **Métricas**: `/metrics` disponible en payment-service

---

**Última revisión**: 28 de octubre de 2025  
**Versión del documento**: 1.0
