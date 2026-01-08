# Guía de Implementación - Fase 3: Mejoras de Arquitectura

Esta guía describe los componentes de arquitectura implementados en la Fase 3 del plan de mejoras.

## 📋 Índice

1. [Resilient HTTP Client](#1-resilient-http-client)
2. [Database Indexes](#2-database-indexes)
3. [Connection Pool Configuration](#3-connection-pool-configuration)
4. [Integración y Uso](#4-integración-y-uso)
5. [Monitoreo y Métricas](#5-monitoreo-y-métricas)

---

## 1. Resilient HTTP Client

### Ubicación
`microservices/shared/utils/resilient-http.js`

### Características

- **Circuit Breaker**: Previene cascadas de fallos
- **Retry con Backoff Exponencial**: Reintentos inteligentes con jitter
- **Timeout configurable**: Evita conexiones colgadas
- **Métricas de latencia**: Estadísticas por servicio

### Uso Básico

```javascript
const { createServiceClient, serviceClients } = require('@flores-victoria/shared/utils');

// Usar cliente pre-configurado
const authClient = serviceClients.auth;
const response = await authClient.get('/api/auth/verify');

// O crear cliente personalizado
const customClient = createServiceClient('custom-service', {
  baseUrl: 'http://custom-service:3000',
  timeout: 5000,
  retries: 2,
});
```

### Clientes Pre-configurados

| Cliente | Servicio | Puerto |
|---------|----------|--------|
| `serviceClients.auth` | auth-service | 3001 |
| `serviceClients.user` | user-service | 3002 |
| `serviceClients.product` | product-service | 3009 |
| `serviceClients.order` | order-service | 3003 |
| `serviceClients.cart` | cart-service | 3004 |
| `serviceClients.wishlist` | wishlist-service | 3005 |
| `serviceClients.review` | review-service | 3006 |
| `serviceClients.notification` | notification-service | 3007 |
| `serviceClients.payment` | payment-service | 3008 |

### Configuración del Circuit Breaker

```javascript
// Configuración por defecto
{
  failureThreshold: 5,      // Fallos antes de abrir
  successThreshold: 2,      // Éxitos para cerrar
  timeout: 30000,           // Tiempo en estado abierto (ms)
}

// Personalizado
const client = new ResilientHttpClient({
  circuitBreakerOptions: {
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 60000,
  },
});
```

### Estados del Circuit Breaker

```
CLOSED → OPEN → HALF_OPEN → CLOSED
   ↑                           │
   └───────────────────────────┘
```

- **CLOSED**: Funcionamiento normal
- **OPEN**: Rechaza requests (fail fast)
- **HALF_OPEN**: Permite un request de prueba

### Ejemplo de Uso Avanzado

```javascript
const { ResilientHttpClient } = require('@flores-victoria/shared/utils');

const client = new ResilientHttpClient({
  baseUrl: 'http://api-gateway:3000',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'X-Service-Name': 'my-service',
  },
});

// POST con retry automático
try {
  const result = await client.post('/api/orders', {
    userId: '123',
    items: [{ productId: 'abc', quantity: 2 }],
  });
  console.log('Order created:', result);
} catch (error) {
  if (error.circuitOpen) {
    console.log('Service unavailable, circuit open');
  }
}

// Obtener estadísticas
const stats = client.getStats();
console.log(stats);
// {
//   requests: 100,
//   successes: 95,
//   failures: 5,
//   avgLatency: 123.45,
//   circuitState: 'CLOSED'
// }
```

---

## 2. Database Indexes

### Ubicación
`scripts/create-db-indexes.js`

### Ejecución

```bash
# Crear todos los índices
node scripts/create-db-indexes.js

# Solo MongoDB
node scripts/create-db-indexes.js --mongodb

# Solo PostgreSQL
node scripts/create-db-indexes.js --postgres

# Modo simulación (no crea nada)
node scripts/create-db-indexes.js --dry-run
```

### Variables de Entorno

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=flores_victoria

# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### Índices de MongoDB

#### Colección: products
| Índice | Campos | Propósito |
|--------|--------|-----------|
| `idx_category_active` | category, isActive | Filtro por categoría |
| `idx_product_search` | name (text), description (text) | Búsqueda de texto |
| `idx_price` | price | Ordenamiento/filtro |
| `idx_slug` | slug (unique) | URLs amigables |
| `idx_featured` | featured, isActive | Productos destacados |

#### Colección: orders
| Índice | Campos | Propósito |
|--------|--------|-----------|
| `idx_user_orders` | userId, createdAt (desc) | Historial de usuario |
| `idx_status_created` | status, createdAt | Gestión de pedidos |
| `idx_order_number` | orderNumber (unique) | Búsqueda por número |
| `idx_orders_ttl` | createdAt (TTL 1 año) | Limpieza automática |

#### Colección: reviews
| Índice | Campos | Propósito |
|--------|--------|-----------|
| `idx_product_reviews` | productId, createdAt | Reviews de producto |
| `idx_user_product_review` | userId, productId (unique) | Una review por usuario |

### Índices de PostgreSQL

#### Tabla: auth_users
| Índice | Columna | Propósito |
|--------|---------|-----------|
| `idx_auth_users_email` | email | Login rápido |
| `idx_auth_users_role` | role | Filtro por rol |
| `idx_auth_users_provider` | provider (partial) | Usuarios OAuth |

#### Tabla: users
| Índice | Columna | Propósito |
|--------|---------|-----------|
| `idx_users_email` | email (unique) | Email único |
| `idx_users_active` | is_active (partial) | Usuarios activos |

---

## 3. Connection Pool Configuration

### Ubicación
`microservices/shared/config/database-pool.js`

### PostgreSQL Pool

```javascript
const { postgresPoolConfig } = require('@flores-victoria/shared/config');
const { Pool } = require('pg');

const config = postgresPoolConfig.getConfig({ 
  serviceName: 'my-service' 
});

const pool = new Pool(config);

// Attach event listeners
postgresPoolConfig.attachEventListeners(pool, logger, 'my-service');
```

#### Configuración por Entorno

| Variable | Production | Development | Test |
|----------|------------|-------------|------|
| max | 20 | 10 | 5 |
| min | 5 | 2 | 1 |
| idleTimeoutMillis | 30000 | 30000 | 30000 |
| connectionTimeoutMillis | 60000 | 10000 | 10000 |

### MongoDB Pool

```javascript
const { mongoPoolConfig } = require('@flores-victoria/shared/config');
const { MongoClient } = require('mongodb');

const uri = mongoPoolConfig.getUri();
const options = mongoPoolConfig.getConfig({ serviceName: 'my-service' });
const dbName = mongoPoolConfig.getDbName();

const client = new MongoClient(uri, options);
await client.connect();
const db = client.db(dbName);
```

### Redis/Valkey Pool

```javascript
const { redisPoolConfig } = require('@flores-victoria/shared/config');
const { createClient } = require('redis');

const config = redisPoolConfig.getConfig({ serviceName: 'my-service' });
const client = createClient(config);
await client.connect();
```

### Health Checks

```javascript
const { dbHealthChecks } = require('@flores-victoria/shared/config');

// En endpoint de health
app.get('/health', async (req, res) => {
  const [pg, mongo, redis] = await Promise.all([
    dbHealthChecks.postgres(pgPool),
    dbHealthChecks.mongo(mongoClient),
    dbHealthChecks.redis(redisClient),
  ]);
  
  res.json({
    status: 'ok',
    databases: { postgres: pg, mongo, redis },
  });
});
```

---

## 4. Integración y Uso

### En un Microservicio Existente

```javascript
// server.js o app.js
const { 
  createServiceClient, 
  postgresPoolConfig,
  dbHealthChecks 
} = require('@flores-victoria/shared');

// Crear cliente para comunicación inter-servicio
const productClient = createServiceClient('product');
const authClient = createServiceClient('auth');

// En un controller
async function getOrderWithProducts(orderId) {
  const order = await Order.findById(orderId);
  
  // Llamada resiliente a product-service
  const products = await productClient.post('/api/products/batch', {
    ids: order.items.map(i => i.productId),
  });
  
  return { ...order, products };
}
```

### Migración Gradual

1. **Fase 1**: Importar módulos compartidos
2. **Fase 2**: Reemplazar `fetch/axios` con `serviceClients`
3. **Fase 3**: Añadir health checks a `/health`
4. **Fase 4**: Configurar alertas en circuit breaker

---

## 5. Monitoreo y Métricas

### Métricas del Circuit Breaker

```javascript
// Exponer métricas en endpoint
app.get('/metrics/circuit-breaker', (req, res) => {
  const metrics = {};
  
  for (const [name, client] of Object.entries(serviceClients)) {
    metrics[name] = client.getStats();
  }
  
  res.json(metrics);
});
```

### Formato de Métricas

```json
{
  "auth": {
    "requests": 1500,
    "successes": 1480,
    "failures": 20,
    "avgLatency": 45.2,
    "circuitState": "CLOSED"
  },
  "product": {
    "requests": 5000,
    "successes": 4950,
    "failures": 50,
    "avgLatency": 120.5,
    "circuitState": "CLOSED"
  }
}
```

### Integración con Prometheus

```javascript
// Ejemplo de métricas Prometheus
const promClient = require('prom-client');

const circuitStateGauge = new promClient.Gauge({
  name: 'circuit_breaker_state',
  help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
  labelNames: ['service'],
});

const requestLatencyHistogram = new promClient.Histogram({
  name: 'service_request_duration_seconds',
  help: 'Duration of inter-service requests',
  labelNames: ['service', 'method', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});
```

---

## 📚 Referencias

- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [MongoDB Connection Pool](https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connection-options/)

---

## ✅ Checklist de Implementación

- [x] Crear `resilient-http.js` con circuit breaker
- [x] Crear script de índices de base de datos
- [x] Crear configuración centralizada de pools
- [x] Actualizar exports de shared modules
- [x] Documentación de uso
- [ ] Migrar servicios existentes a usar `serviceClients`
- [ ] Ejecutar script de índices en producción
- [ ] Configurar alertas de circuit breaker

---

*Fase 3 completada - Flores Victoria Team*
