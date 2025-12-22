# ⚡ PERFORMANCE GUIDE - Flores Victoria

**Last Updated**: December 20, 2025  
**Status**: ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Performance Targets](#performance-targets)
3. [Caching Strategy](#caching-strategy)
4. [Database Optimization](#database-optimization)
5. [Load Testing](#load-testing)
6. [Performance Monitoring](#performance-monitoring)

---

## Overview

Flores Victoria aims for **sub-500ms p95 response times** with **99.9% uptime**.

---

## Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| P50 Latency | <150ms | >200ms |
| P95 Latency | <500ms | >750ms |
| P99 Latency | <1000ms | >1500ms |
| Error Rate | <0.1% | >0.5% |
| Uptime | >99.9% | <99.5% |
| Database Query | <50ms | >100ms |
| Cache Hit Ratio | >80% | <70% |

---

## Caching Strategy

### Redis Cache Layers

```javascript
const cacheConfig = {
  // Layer 1: Hot data (frequently accessed)
  HOT: {
    ttl: 60,    // 1 minute
    db: 0,
  },
  // Layer 2: Warm data (moderately accessed)
  WARM: {
    ttl: 300,   // 5 minutes
    db: 1,
  },
  // Layer 3: Cold data (rarely accessed)
  COLD: {
    ttl: 3600,  // 1 hour
    db: 2,
  },
};
```

### Cache Patterns

```javascript
// Read-through cache
async function getCachedProduct(id) {
  const cached = await redis.get(`product:${id}`);
  if (cached) return JSON.parse(cached);

  const product = await database.getProduct(id);
  await redis.setex(`product:${id}`, 300, JSON.stringify(product));

  return product;
}

// Cache aside
async function updateProduct(id, data) {
  await database.updateProduct(id, data);
  await redis.del(`product:${id}`);
}
```

---

## Database Optimization

### Indexing Strategy

```sql
-- Products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created ON products(created_at);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
```

### Connection Pooling

```javascript
const pool = {
  max: 20,           // Maximum connections
  min: 5,            // Minimum connections
  idle: 10000,       // Max idle time (ms)
  acquire: 30000,    // Max acquire time (ms)
  evict: 1000,       // Eviction interval (ms)
};
```

### Query Optimization

```javascript
// Bad: N+1 query problem
for (const order of orders) {
  order.user = await User.findById(order.user_id);
}

// Good: Eager loading
const orders = await Order.find().populate('user');
```

---

## Load Testing

### k6 Test Scripts

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up
    { duration: '5m', target: 10 },   // Stay at 10 VUs
    { duration: '2m', target: 50 },   // Ramp to 50
    { duration: '5m', target: 50 },   // Stay at 50
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const response = http.get('http://localhost:3000/api/products');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### Running Load Tests

```bash
# Run basic test
k6 run scripts/load-test.js

# Specify duration and VUs
k6 run --duration 2m --vus 10 scripts/load-test.js

# Cloud testing
k6 cloud scripts/load-test.js
```

---

## Performance Monitoring

### APM Metrics

```javascript
const apm = require('elastic-apm-node').start({
  serviceName: process.env.SERVICE_NAME,
  serverUrl: process.env.APM_SERVER_URL,
  environment: process.env.NODE_ENV,
});
```

### Custom Metrics

```javascript
const histogram = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000],
});
```

---

## Optimization Checklist

- [ ] Redis caching implemented
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Query optimization done
- [ ] API response compression enabled
- [ ] CDN configured for static assets
- [ ] Load testing performed
- [ ] Performance baselines established
- [ ] Monitoring dashboards created
- [ ] Alerts configured

---

## Best Practices

1. **Cache Frequently Accessed Data**: Use Redis strategically
2. **Optimize Database Queries**: Add indexes, avoid N+1
3. **Use Connection Pooling**: Reuse connections
4. **Compress Responses**: Enable gzip/brotli
5. **Lazy Load Resources**: Load on demand
6. **Batch Operations**: Reduce round trips
7. **Monitor Continuously**: Track performance metrics

