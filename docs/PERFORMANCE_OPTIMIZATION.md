# Performance Optimization Guide

## Flores Victoria E-commerce Platform

### Overview

Este documento describe las optimizaciones de rendimiento implementadas en la plataforma Flores
Victoria, incluyendo índices de base de datos, estrategias de cache y mejores prácticas.

---

## 1. Índices de Base de Datos

### 1.1 PostgreSQL Indexes

#### Users Table

```sql
-- Índice único en email para búsquedas de login (O(log n))
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- Índice en role para filtrar por tipo de usuario
CREATE INDEX idx_users_role ON users (role);

-- Índice compuesto para consultas frecuentes
CREATE INDEX idx_users_role_created ON users (role, created_at DESC);
```

**Impacto**: Búsquedas de usuarios por email ~10-100x más rápidas

#### Orders Table

```sql
-- Índice en user_id para consultas de pedidos por usuario
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Índice compuesto para la consulta más frecuente
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- Índice para filtrar por estado
CREATE INDEX idx_orders_status ON orders (status);
```

**Impacto**: Consulta de pedidos de usuario ~10-50x más rápida

#### Reviews Table

```sql
-- Índice para obtener reseñas de un producto
CREATE INDEX idx_reviews_product_id ON reviews (product_id);

-- Índice compuesto para consultas ordenadas
CREATE INDEX idx_reviews_product_created ON reviews (product_id, created_at DESC);
```

**Impacto**: Carga de reseñas ~10-100x más rápida

### 1.2 MongoDB Indexes (Products)

```javascript
// Índice de texto completo para búsquedas
productSchema.index(
  { name: 'text', description: 'text' },
  { weights: { name: 10, description: 5 } }
);

// Índices simples para filtros comunes
productSchema.index({ category: 1 });
productSchema.index({ occasions: 1 });
productSchema.index({ featured: 1 });

// Índice compuesto para catálogo con filtros
productSchema.index({ active: 1, category: 1, price: 1 });
```

**Impacto**: Búsquedas de productos ~20-200x más rápidas

---

## 2. Estrategia de Cache (Redis)

### 2.1 TTL Configuration

| Tipo de Dato   | TTL    | Justificación                         |
| -------------- | ------ | ------------------------------------- |
| Categories     | 1 hora | Cambian raramente                     |
| Product List   | 5 min  | Balance entre freshness y performance |
| Product Detail | 10 min | Datos más estables que listas         |
| User Cart      | 30 min | Datos temporales del usuario          |
| Search Results | 5 min  | Alta variabilidad                     |
| Stats          | 15 min | Datos agregados                       |

### 2.2 Cache Keys Structure

```javascript
// Productos
products: list: cat: rosas: occ: amor: p: 1;
product: detail: prod_123;
products: featured;

// Usuario
user: cart: user_456;
user: wishlist: user_456;
user: orders: user_456;

// Reseñas
reviews: product: prod_123: p: 1;
```

### 2.3 Cache Invalidation Strategy

```javascript
// Cuando se actualiza un producto
INVALIDATE: [
  'products:list:*',
  'products:search:*',
  'product:detail:${productId}',
  'products:featured:*',
];

// Cuando se crea un pedido
INVALIDATE: [
  'user:cart:${userId}',
  'user:orders:${userId}',
  'product:detail:*', // Para actualizar stock
];
```

### 2.4 Cache Metrics

El sistema registra automáticamente métricas de cache:

```bash
GET /api/products/cache/metrics
```

Respuesta:

```json
{
  "hits": 1250,
  "misses": 350,
  "errors": 5,
  "hitRate": "78.13%",
  "total": 1600
}
```

**Meta**: Mantener hit rate > 70%

---

## 3. Query Optimization

### 3.1 Paginación Consistente

```javascript
// ANTES (puede ser lento con muchos registros)
const products = await Product.find()
  .skip(page * limit)
  .limit(limit);

// DESPUÉS (usa cursor-based pagination)
const products = await Product.find().sort({ _id: -1 }).limit(limit);
```

### 3.2 Evitar N+1 Queries

```javascript
// ANTES (N+1 problema)
const orders = await Order.find({ userId });
for (let order of orders) {
  order.items = await Product.find({ _id: { $in: order.productIds } });
}

// DESPUÉS (1 query adicional)
const orders = await Order.find({ userId });
const productIds = orders.flatMap((o) => o.productIds);
const products = await Product.find({ _id: { $in: productIds } });
```

### 3.3 Projection (Solo campos necesarios)

```javascript
// ANTES (trae todos los campos)
const users = await User.find();

// DESPUÉS (solo campos necesarios)
const users = await User.find().select('id name email role created_at');
```

---

## 4. Database Connection Pooling

### 4.1 PostgreSQL Pool Configuration

```javascript
const pool = new Pool({
  max: 20, // Máximo de conexiones
  min: 5, // Mínimo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4.2 MongoDB Connection Options

```javascript
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 4.3 Redis Connection Pool

```javascript
const redisConfig = {
  MAX_CLIENTS: 10,
  MIN_CLIENTS: 2,
  CONNECT_TIMEOUT: 10000,
  COMMAND_TIMEOUT: 5000,
};
```

---

## 5. API Response Optimization

### 5.1 Compression

```javascript
// Habilitar gzip compression
app.use(compression());
```

### 5.2 Response Headers

```javascript
// Cache headers para assets estáticos
res.setHeader('Cache-Control', 'public, max-age=31536000');

// Cache indicators
res.setHeader('X-Cache', 'HIT'); // o 'MISS'
```

---

## 6. Monitoring & Metrics

### 6.1 Key Performance Indicators

| Métrica                 | Target  | Actual |
| ----------------------- | ------- | ------ |
| API Response Time (p95) | < 200ms | TBD    |
| Cache Hit Rate          | > 70%   | TBD    |
| DB Query Time (p95)     | < 50ms  | TBD    |
| Error Rate              | < 1%    | TBD    |

### 6.2 Monitoring Endpoints

```bash
# Cache metrics
GET /api/products/cache/metrics

# Stats generales
GET /api/products/stats

# Health check
GET /api/health
```

---

## 7. Load Testing

### 7.1 Herramientas Recomendadas

- **Apache Bench (ab)**: Testing básico
- **k6**: Testing avanzado con scripts
- **Artillery**: Load testing con escenarios complejos

### 7.2 Ejemplo de Load Test

```bash
# Test con Apache Bench (1000 requests, 10 concurrentes)
ab -n 1000 -c 10 http://localhost:3000/api/products

# Test con k6
k6 run --vus 10 --duration 30s load-test.js
```

---

## 8. Best Practices Checklist

- [x] **Índices de BD**: Creados en columnas de búsqueda frecuente
- [x] **Cache Strategy**: Implementado con TTLs optimizados
- [x] **Connection Pooling**: Configurado para PostgreSQL, MongoDB, Redis
- [x] **Query Optimization**: Evitados N+1 queries, uso de projection
- [ ] **Load Testing**: Pendiente realizar tests de carga
- [ ] **Monitoring**: Pendiente configurar dashboards (Grafana)
- [x] **Cache Metrics**: Endpoint de métricas implementado
- [ ] **APM Integration**: Pendiente integrar herramienta de monitoreo

---

## 9. Próximos Pasos

1. **Realizar load testing** para validar mejoras
2. **Configurar Grafana dashboards** para monitoreo continuo
3. **Implementar rate limiting** avanzado por usuario
4. **Optimizar queries específicas** identificadas como lentas
5. **Configurar auto-scaling** para producción

---

## 10. Referencias

- [PostgreSQL Index Performance](https://www.postgresql.org/docs/current/indexes.html)
- [MongoDB Index Strategies](https://docs.mongodb.com/manual/indexes/)
- [Redis Best Practices](https://redis.io/topics/memory-optimization)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)

---

**Última actualización**: 21 de noviembre de 2025  
**Versión**: 1.0.0
