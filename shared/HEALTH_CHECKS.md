# Health Checks - Guía de Uso

## Resumen

Cada microservicio expone dos endpoints estándar para verificar su estado:

- **`/health`** (liveness probe): ¿Está vivo el proceso?
- **`/ready`** (readiness probe): ¿Puede recibir tráfico? (dependencias OK)

## Endpoints

### GET /health (Liveness)

Indica si el proceso está vivo. Retorna 200 siempre que el proceso esté respondiendo.

**Respuesta:**
```json
{
  "status": "healthy",
  "service": "product-service",
  "timestamp": "2025-10-29T15:32:42.123Z",
  "uptime": 3600
}
```

**Uso en Kubernetes:**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3
```

### GET /ready (Readiness)

Indica si el servicio puede recibir tráfico. Verifica dependencias (DB, Redis, etc.).

**Respuesta exitosa (200):**
```json
{
  "status": "ready",
  "service": "product-service",
  "timestamp": "2025-10-29T15:32:42.123Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 12
    }
  },
  "memory": {
    "heapUsed": 128,
    "heapTotal": 512,
    "rss": 256,
    "external": 8
  }
}
```

**Respuesta con fallas (503):**
```json
{
  "status": "not_ready",
  "service": "cart-service",
  "timestamp": "2025-10-29T15:32:42.123Z",
  "uptime": 3600,
  "checks": {
    "redis": {
      "status": "unhealthy",
      "error": "Connection refused",
      "latency": 5002
    }
  },
  "memory": {
    "heapUsed": 128,
    "heapTotal": 512,
    "rss": 256,
    "external": 8
  }
}
```

**Uso en Kubernetes:**
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 3
  successThreshold: 1
  failureThreshold: 3
```

## Utilidades Compartidas

### Importar

```javascript
const {
  checkDatabase,
  checkRedis,
  checkHttp,
  createLivenessResponse,
  createReadinessResponse,
} = require('../../../shared/health/checks');
```

### checkDatabase(mongoose)

Verifica conexión a MongoDB usando mongoose.

```javascript
const mongoose = require('mongoose');
const dbCheck = await checkDatabase(mongoose);
// { status: 'healthy', state: 'connected', latency: 12 }
```

### checkRedis(redisClient)

Verifica conexión a Redis con PING.

```javascript
const redisClient = require('./config/redis');
const redisCheck = await checkRedis(redisClient);
// { status: 'healthy', latency: 5 }
```

### checkHttp(url, timeout)

Verifica un servicio HTTP externo.

```javascript
const check = await checkHttp('http://external-api:8080/health', 3000);
// { status: 'healthy', statusCode: 200, latency: 45 }
```

### createLivenessResponse(serviceName, extraData)

Crea respuesta estándar de liveness.

```javascript
const response = createLivenessResponse('my-service', { version: '1.0.0' });
res.status(200).json(response);
```

### createReadinessResponse(serviceName, checks)

Crea respuesta estándar de readiness. Status automático basado en checks.

```javascript
const checks = {
  database: await checkDatabase(mongoose),
  redis: await checkRedis(redisClient),
};

const response = createReadinessResponse('my-service', checks);
const statusCode = response.status === 'ready' ? 200 : 503;
res.status(statusCode).json(response);
```

## Implementación en Servicios

### Con middleware común (recomendado)

Si tu servicio usa `middleware/common.js`:

```javascript
// En middleware/common.js
const {
  checkDatabase,
  createLivenessResponse,
  createReadinessResponse,
} = require('../../../../shared/health/checks');

function setupHealthChecks(app, serviceName, mongoose = null) {
  app.get('/health', (req, res) => {
    const response = createLivenessResponse(serviceName);
    res.status(200).json(response);
  });

  app.get('/ready', async (req, res) => {
    const checks = {};
    
    if (mongoose) {
      checks.database = await checkDatabase(mongoose);
    }

    const response = createReadinessResponse(serviceName, checks);
    const statusCode = response.status === 'ready' ? 200 : 503;
    res.status(statusCode).json(response);
  });
}

// En app.js
setupHealthChecks(app, 'product-service', mongoose);
```

### Implementación manual

```javascript
const {
  checkDatabase,
  createLivenessResponse,
  createReadinessResponse,
} = require('../../../shared/health/checks');

app.get('/health', (req, res) => {
  const response = createLivenessResponse('my-service');
  res.status(200).json(response);
});

app.get('/ready', async (req, res) => {
  const checks = {
    database: await checkDatabase(mongoose),
  };

  const response = createReadinessResponse('my-service', checks);
  const statusCode = response.status === 'ready' ? 200 : 503;
  res.status(statusCode).json(response);
});
```

## Servicios por Tipo de Dependencia

### MongoDB (product-service, contact-service)

```javascript
const mongoose = require('mongoose');
setupHealthChecks(app, 'product-service', mongoose);
```

### Redis (cart-service)

```javascript
const redisClient = require('./config/redis');

function setupHealthChecks(app, serviceName, redisClient) {
  app.get('/ready', async (req, res) => {
    const checks = {
      redis: await checkRedis(redisClient),
    };
    const response = createReadinessResponse(serviceName, checks);
    const statusCode = response.status === 'ready' ? 200 : 503;
    res.status(statusCode).json(response);
  });
}
```

### PostgreSQL/MySQL (order-service)

```javascript
const db = require('./config/database');

function setupHealthChecks(app, serviceName, database) {
  app.get('/ready', async (req, res) => {
    const checks = {};
    
    if (database && database.pool) {
      const start = Date.now();
      try {
        await database.pool.query('SELECT 1');
        checks.database = {
          status: 'healthy',
          latency: Date.now() - start,
        };
      } catch (error) {
        checks.database = {
          status: 'unhealthy',
          error: error.message,
        };
      }
    }

    const response = createReadinessResponse(serviceName, checks);
    const statusCode = response.status === 'ready' ? 200 : 503;
    res.status(statusCode).json(response);
  });
}
```

### Sin dependencias (auth-service, user-service)

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks: {},
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});
```

## Docker Compose

```yaml
services:
  product-service:
    image: product-service:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

## Kubernetes Deployment Completo

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: product-service
  template:
    metadata:
      labels:
        app: product-service
    spec:
      containers:
      - name: product-service
        image: product-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: uri
        
        # Liveness: reinicia si el pod está bloqueado
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 5
          failureThreshold: 3
        
        # Readiness: saca del balanceador si no está listo
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        
        # Startup: permite tiempo de inicialización largo
        startupProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 30  # 30 * 5s = 150s máximo para arrancar
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Monitoreo con Prometheus

Puedes agregar métricas personalizadas en readiness:

```javascript
app.get('/ready', async (req, res) => {
  const checks = {
    database: await checkDatabase(mongoose),
  };

  const response = createReadinessResponse('my-service', checks);
  
  // Métrica custom para Prometheus
  if (response.status === 'ready') {
    readinessGauge.set(1);
  } else {
    readinessGauge.set(0);
  }

  const statusCode = response.status === 'ready' ? 200 : 503;
  res.status(statusCode).json(response);
});
```

## Troubleshooting

### Liveness falla pero readiness OK

- El proceso responde pero tiene un problema grave interno
- Verifica logs para excepciones no manejadas
- Considera agregar más checks en liveness si es crítico

### Readiness falla constantemente

- Verifica conectividad a dependencias (DB, Redis, etc.)
- Revisa logs del servicio: `kubectl logs -f <pod-name>`
- Verifica que las credenciales/URIs de conexión sean correctas
- Aumenta `initialDelaySeconds` si el servicio tarda en iniciar

### Pods reiniciándose constantemente

- Liveness probe muy agresivo (reduce `failureThreshold` o aumenta `timeoutSeconds`)
- El servicio tarda mucho en arrancar (usa `startupProbe`)
- Recursos insuficientes (aumenta `limits.memory` o `limits.cpu`)

### 503 en readiness por timeout

- Aumenta `timeoutSeconds` en readinessProbe
- Optimiza queries de health check (evita joins pesados)
- Considera agregar índices en tablas de health check

---

**Servicios actualizados:**
- ✅ product-service (MongoDB)
- ✅ order-service (PostgreSQL/MySQL)
- ✅ cart-service (Redis)
- ✅ auth-service (sin dependencias)
- ✅ user-service (sin dependencias)
- ✅ contact-service (pendiente)

**Utilidades compartidas:**
- `shared/health/checks.js` - Funciones de verificación
- `shared/HEALTH_CHECKS.md` - Esta guía

Para más información sobre logging y correlation ID, consulta `shared/LOGGING_GUIDE.md`.
