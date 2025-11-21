# Health Checks - Flores Victoria

## Descripción

Sistema unificado de health checks para todos los microservicios de Flores Victoria. Proporciona
endpoints estandarizados para monitoreo, orquestación (Kubernetes) y balanceo de carga.

## Endpoints Disponibles

Todos los microservicios exponen los siguientes endpoints:

### 1. `/health` - Health Check Completo

**Propósito**: Verificación completa del estado del servicio incluyendo dependencias, recursos y
métricas.

**Características**:

- Verifica conexiones a bases de datos (PostgreSQL, MongoDB)
- Verifica conexiones a cache (Redis)
- Reporta métricas de memoria (heap used, heap total, RSS)
- Reporta uso de CPU
- Reporta uptime del proceso
- Soporta verificaciones personalizadas

**Respuesta exitosa** (HTTP 200):

```json
{
  "status": "healthy",
  "service": "product-service",
  "timestamp": "2025-01-11T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "up",
      "latency": 15
    },
    "cache": {
      "status": "up",
      "latency": 5
    }
  },
  "memory": {
    "heapUsed": 45,
    "heapTotal": 128,
    "rss": 180
  },
  "cpu": {
    "usage": 12.5
  }
}
```

**Respuesta con problemas** (HTTP 503):

```json
{
  "status": "unhealthy",
  "service": "product-service",
  "timestamp": "2025-01-11T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "down",
      "error": "Connection timeout"
    }
  }
}
```

### 2. `/ready` - Readiness Check

**Propósito**: Determinar si el servicio puede recibir tráfico. Usado por load balancers y
Kubernetes readiness probes.

**Características**:

- Verifica dependencias críticas (DB, cache)
- Retorna 200 si está listo, 503 si no está listo
- Incluye latencias de verificación

**Respuesta** (HTTP 200 o 503):

```json
{
  "status": "ready",
  "service": "auth-service",
  "timestamp": "2025-01-11T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "up",
      "latency": 12
    }
  }
}
```

### 3. `/live` - Liveness Check

**Propósito**: Verificar que el proceso está vivo. Usado por Kubernetes liveness probes para
reiniciar contenedores bloqueados.

**Características**:

- Verificación ultra-rápida (sin I/O)
- Siempre retorna 200 si el proceso responde
- Incluye uptime

**Respuesta** (HTTP 200):

```json
{
  "status": "alive",
  "service": "order-service",
  "timestamp": "2025-01-11T10:30:00.000Z",
  "uptime": 7200
}
```

## Uso en Código

### Importar el módulo

```javascript
const {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
} = require('../../shared/middleware/health-check');
```

### Ejemplo 1: Servicio con PostgreSQL

```javascript
const { pool } = require('./config/database');

// Función para verificar PostgreSQL
const dbCheck = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
};

// Configurar endpoints
app.get(
  '/health',
  createHealthCheck({
    serviceName: 'order-service',
    dbCheck,
  })
);

app.get(
  '/ready',
  createReadinessCheck({
    serviceName: 'order-service',
    dbCheck,
  })
);

app.get('/live', createLivenessCheck('order-service'));
```

### Ejemplo 2: Servicio con MongoDB

```javascript
const mongoose = require('mongoose');

const dbCheck = async () => {
  try {
    return mongoose.connection.readyState === 1; // 1 = connected
  } catch (error) {
    return false;
  }
};

app.get(
  '/health',
  createHealthCheck({
    serviceName: 'product-service',
    dbCheck,
  })
);
```

### Ejemplo 3: Servicio con Redis

```javascript
const redisClient = require('./config/redis');

const cacheCheck = async () => {
  try {
    return redisClient && redisClient.status === 'ready';
  } catch (error) {
    return false;
  }
};

app.get(
  '/health',
  createHealthCheck({
    serviceName: 'cart-service',
    cacheCheck,
  })
);
```

### Ejemplo 4: Servicio con verificaciones personalizadas

```javascript
app.get(
  '/health',
  createHealthCheck({
    serviceName: 'api-gateway',
    customChecks: [
      {
        name: 'auth-service',
        check: async () => {
          try {
            const response = await fetch('http://auth-service:3001/health');
            return response.ok;
          } catch {
            return false;
          }
        },
      },
      {
        name: 'product-service',
        check: async () => {
          try {
            const response = await fetch('http://product-service:3009/health');
            return response.ok;
          } catch {
            return false;
          }
        },
      },
    ],
  })
);
```

## Estado por Servicio

| Servicio         | /health | /ready | /live | DB Check   | Cache Check |
| ---------------- | ------- | ------ | ----- | ---------- | ----------- |
| api-gateway      | ✅      | ✅     | ✅    | -          | -           |
| auth-service     | ✅      | ✅     | ✅    | PostgreSQL | -           |
| product-service  | ✅      | ✅     | ✅    | MongoDB    | Redis       |
| user-service     | ✅      | ✅     | ✅    | PostgreSQL | -           |
| order-service    | ✅      | ✅     | ✅    | PostgreSQL | -           |
| cart-service     | ✅      | ✅     | ✅    | -          | Redis       |
| wishlist-service | ✅      | ✅     | ✅    | -          | Redis       |
| review-service   | ✅      | ✅     | ✅    | -          | -           |
| contact-service  | ✅      | ✅     | ✅    | -          | -           |

## Integración con Kubernetes

### Ejemplo de configuración en deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
spec:
  template:
    spec:
      containers:
        - name: product-service
          image: flores-victoria/product-service:latest
          ports:
            - containerPort: 3009
          livenessProbe:
            httpGet:
              path: /live
              port: 3009
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3009
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 2
```

## Monitoreo

### Verificar todos los servicios

```bash
#!/bin/bash
# check-all-health.sh

services=(
  "api-gateway:3000"
  "auth-service:3001"
  "product-service:3009"
  "user-service:3002"
  "order-service:3003"
  "cart-service:3004"
  "wishlist-service:3005"
  "review-service:3006"
  "contact-service:3007"
)

for service in "${services[@]}"; do
  name="${service%%:*}"
  port="${service##*:}"

  echo "Checking $name..."
  curl -s "http://localhost:$port/health" | jq -r '.status'
done
```

### Dashboard de Prometheus

Los health checks exponen métricas que pueden ser scrapeadas por Prometheus:

- Uptime del servicio
- Uso de memoria (heap, RSS)
- Uso de CPU
- Latencia de verificaciones de dependencias
- Estado de dependencias (DB, cache)

### Alertas recomendadas

1. **Servicio Unhealthy**: Alerta si `/health` retorna 503
2. **Servicio Not Ready**: Alerta si `/ready` retorna 503 por más de 2 minutos
3. **Alta Memoria**: Alerta si heap used > 80% de heap total
4. **Alta CPU**: Alerta si CPU usage > 80% por más de 5 minutos
5. **DB Latencia Alta**: Alerta si latencia de DB > 100ms

## Mejores Prácticas

1. **Liveness Check**: Debe ser ultra-rápido (< 100ms). No verificar dependencias externas.

2. **Readiness Check**: Puede ser más lento (< 2s). Verificar dependencias críticas.

3. **Health Check**: Puede incluir verificaciones exhaustivas. Timeout recomendado: 5s.

4. **Timeouts**: Configurar timeouts en verificaciones de dependencias para evitar bloqueos.

5. **Caché**: Considerar cachear resultados de health checks por 5-10 segundos para servicios de
   alta carga.

6. **Logging**: Log de fallos en health checks para debugging, pero no log de éxitos (para evitar
   spam).

## Troubleshooting

### El servicio retorna 503 en `/ready`

1. Verificar logs del servicio: `docker logs <service-name>`
2. Verificar conectividad a dependencias (DB, cache)
3. Verificar que las dependencias están levantadas: `docker ps`
4. Probar conexión manual a DB/cache desde el contenedor

### El servicio no responde en `/health`

1. Verificar que el servicio está corriendo: `docker ps | grep <service>`
2. Verificar puerto expuesto: `docker port <service-name>`
3. Verificar logs de inicio: `docker logs <service-name> --tail 50`
4. Probar endpoint directamente: `curl http://localhost:<port>/live`

### Métricas de memoria/CPU incorrectas

- Las métricas son del proceso Node.js, no del contenedor
- Usar `process.memoryUsage()` y `process.cpuUsage()` de Node.js
- Para métricas del contenedor, usar herramientas como cAdvisor o Prometheus node-exporter

## Referencias

- Módulo fuente: `microservices/shared/middleware/health-check.js`
- Kubernetes Health Checks:
  https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- Best Practices:
  https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes
