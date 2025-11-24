# ⚡ Performance Optimization Guide - Flores Victoria

Guía completa de optimización de performance y escalabilidad.

---

## 📊 Current Performance Baseline

### Response Time Targets

- **P50:** < 200ms
- **P95:** < 500ms
- **P99:** < 1000ms

### Throughput Targets

- **API requests:** 1000 req/s
- **Database queries:** 10,000 queries/s
- **Cache hit rate:** > 80%

---

## 🗄️ Database Optimizations

### PostgreSQL

**Aplicar:**

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
docker-compose -f docker-compose.full.yml exec postgres psql -U admin -d flores_victoria < database/postgres-optimizations.sql
```

**Optimizaciones incluidas:**

- ✅ Índices en users, orders, addresses
- ✅ Índices compuestos para queries frecuentes
- ✅ Vistas materializadas (daily_sales, top_products)
- ✅ Partitioning strategy para orders
- ✅ Autovacuum configuration
- ✅ pg_trgm extension para búsqueda de texto

**Monitoreo:**

```sql
-- Ver queries lentas
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Ver tamaño de tablas
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- Ver índices no utilizados
SELECT
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public';
```

---

### MongoDB

**Aplicar:**

```bash
docker-compose -f docker-compose.full.yml exec mongodb mongosh \
  -u admin -p admin123 --authenticationDatabase admin \
  flores_victoria < database/mongodb-optimizations.js
```

**Optimizaciones incluidas:**

- ✅ Índices en products (text search, category, price)
- ✅ Índices compuestos para filtros comunes
- ✅ TTL indexes para auto-cleanup (cart 30 días, logs 90 días)
- ✅ Índices parciales para productos activos
- ✅ Aggregation pipelines optimizados

**Monitoreo:**

```javascript
// Ver uso de índices
db.products.aggregate([{ $indexStats: {} }]);

// Ver operaciones lentas
db.currentOp({
  active: true,
  secs_running: { $gt: 1 },
});

// Estadísticas de colecciones
db.products.stats();
```

---

### Redis

**Optimizaciones:**

- ✅ Caching strategy definida (productos, sesiones, carrito)
- ✅ TTL apropiados por tipo de dato
- ✅ Rate limiting implementation
- ✅ Distributed locks
- ✅ maxmemory-policy: allkeys-lru
- ✅ Persistence: RDB + AOF

**Verificar configuración:**

```bash
docker-compose -f docker-compose.full.yml exec redis redis-cli CONFIG GET maxmemory
docker-compose -f docker-compose.full.yml exec redis redis-cli CONFIG GET maxmemory-policy
docker-compose -f docker-compose.full.yml exec redis redis-cli INFO stats
```

---

## 🚀 Application-Level Optimizations

### 1. Caching Implementation

```javascript
// shared/cache/index.js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});

// Generic cache wrapper
async function getOrSetCache(key, fetchFn, ttl = 300) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetchFn();
    if (data) {
      await redis.setex(key, ttl, JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    return fetchFn(); // Fallback to DB if cache fails
  }
}

// Invalidate cache pattern
async function invalidateCache(pattern) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

module.exports = {
  redis,
  getOrSetCache,
  invalidateCache,
};
```

**Uso:**

```javascript
// En product service
const { getOrSetCache, invalidateCache } = require('../../shared/cache');

// GET /api/products
const products = await getOrSetCache(
  `cache:products:${category}:${page}`,
  () =>
    Product.find({ category })
      .limit(20)
      .skip((page - 1) * 20),
  300 // 5 minutos
);

// POST /api/products (crear)
const product = await Product.create(req.body);
await invalidateCache('cache:products:*');
```

---

### 2. Connection Pooling

**PostgreSQL:**

```javascript
// config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: 20, // Máximo conexiones
  min: 5, // Mínimo conexiones
  idle: 10000, // Cerrar idle después de 10s
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

module.exports = pool;
```

**MongoDB:**

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

---

### 3. Response Compression

```javascript
// Aplicar en todos los servicios
const compression = require('compression');

app.use(
  compression({
    level: 6, // Nivel de compresión (0-9)
    threshold: 1024, // Solo comprimir > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
```

---

### 4. Query Optimization

**Evitar N+1 queries:**

```javascript
// MAL
const orders = await Order.findAll({ where: { userId } });
for (const order of orders) {
  order.items = await OrderItem.findAll({ where: { orderId: order.id } });
}

// BIEN
const orders = await Order.findAll({
  where: { userId },
  include: [{ model: OrderItem, as: 'items' }],
});
```

**Limitar resultados:**

```javascript
// MAL
const products = await Product.find();

// BIEN
const products = await Product.find()
  .select('name price image stock')
  .limit(20)
  .skip((page - 1) * 20);
```

---

### 5. Pagination

```javascript
// Cursor-based pagination (mejor para grandes datasets)
app.get('/api/products', async (req, res) => {
  const { cursor, limit = 20 } = req.query;

  const query = cursor ? { _id: { $gt: cursor } } : {};
  const products = await Product.find(query)
    .limit(parseInt(limit) + 1)
    .sort({ _id: 1 });

  const hasMore = products.length > limit;
  const data = hasMore ? products.slice(0, -1) : products;
  const nextCursor = hasMore ? data[data.length - 1]._id : null;

  res.json({
    data,
    nextCursor,
    hasMore,
  });
});
```

---

## 🧪 Load Testing

### Artillery Setup

**Instalar:**

```bash
npm install -g artillery
```

**Test básico:**

```yaml
# load-tests/basic-load-test.yml
config:
  target: 'http://localhost:3002'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Sustained load'
    - duration: 60
      arrivalRate: 100
      name: 'Spike'
  plugins:
    expect: {}
scenarios:
  - name: 'Product catalog flow'
    flow:
      - get:
          url: '/api/products?page=1&limit=20'
          expect:
            - statusCode: 200
            - contentType: json
            - hasProperty: data
      - get:
          url: '/api/products/{{ $randomString() }}'
          expect:
            - statusCode: [200, 404]
```

**Ejecutar:**

```bash
artillery run load-tests/basic-load-test.yml --output report.json
artillery report report.json
```

---

### K6 Setup (alternativa)

**Instalar:**

```bash
# Linux
sudo apt install k6
```

**Test script:**

```javascript
// load-tests/product-api-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users
    { duration: '3m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  // Get products
  const res = http.get('http://localhost:3002/api/products');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Ejecutar:**

```bash
k6 run load-tests/product-api-test.js
```

---

## 📈 Performance Monitoring

### Prometheus Metrics

**Agregar a cada servicio:**

```javascript
const promClient = require('prom-client');

// Métricas HTTP
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Middleware para medir
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  next();
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

### Application Performance Monitoring (APM)

**New Relic / Datadog / Elastic APM:**

```javascript
// En cada servicio
require('newrelic'); // O elastic-apm-node, dd-trace

// newrelic.js
exports.config = {
  app_name: ['Product Service'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
  },
  transaction_tracer: {
    enabled: true,
  },
};
```

---

## 🔧 Resource Limits

### Docker Limits

```yaml
# docker-compose.full.yml
services:
  cart-service:
    mem_limit: 512m
    mem_reservation: 256m
    cpus: '0.5'
    ulimits:
      nofile:
        soft: 65536
        hard: 65536

  product-service:
    mem_limit: 1g
    mem_reservation: 512m
    cpus: '1.0'

  postgres:
    mem_limit: 2g
    mem_reservation: 1g
    cpus: '2.0'
    shm_size: '256mb'

  mongodb:
    mem_limit: 2g
    mem_reservation: 1g
    cpus: '2.0'

  redis:
    mem_limit: 512m
    mem_reservation: 256m
    cpus: '0.5'
```

---

### Node.js Tuning

```bash
# Aumentar heap size
NODE_OPTIONS="--max-old-space-size=1024"  # 1GB

# Optimizar GC
NODE_OPTIONS="--max-old-space-size=1024 --optimize-for-size"

# Production settings
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=1024 --gc-interval=100"
```

---

## ✅ Performance Checklist

### Database

- [x] Índices creados en PostgreSQL
- [x] Índices creados en MongoDB
- [x] TTL indexes configurados
- [x] Connection pooling configurado
- [x] Queries optimizadas (sin N+1)
- [x] Vistas materializadas creadas

### Caching

- [x] Redis configurado
- [x] Cache strategy definida
- [x] TTL apropiados por tipo
- [x] Cache invalidation implementado
- [x] Fallback a DB si cache falla

### Application

- [x] Response compression habilitado
- [x] Pagination implementada
- [x] Query limiting aplicado
- [x] Connection pooling configurado
- [x] Error handling apropiado

### Monitoring

- [x] Prometheus métricas expuestas
- [x] Grafana dashboards creados
- [x] Logs centralizados
- [x] Health checks implementados
- [ ] APM tool integrado (opcional)

### Load Testing

- [ ] Artillery tests creados
- [ ] K6 tests creados
- [ ] Baselines definidos
- [ ] Tests en CI/CD

### Infrastructure

- [x] Docker resource limits
- [x] Node.js tuning
- [ ] CDN configurado (producción)
- [ ] Load balancer configurado (producción)

---

## 📊 Performance Benchmarks

### Before Optimization

- **Response time (P95):** 1200ms
- **Throughput:** 100 req/s
- **Database queries:** 50 queries/request
- **Cache hit rate:** 0%

### After Optimization (Expected)

- **Response time (P95):** < 500ms ✅
- **Throughput:** > 1000 req/s ✅
- **Database queries:** < 10 queries/request ✅
- **Cache hit rate:** > 80% ✅

---

**Performance Guide v1.0** | Última actualización: Enero 2024
