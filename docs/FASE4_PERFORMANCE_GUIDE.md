# Guía de Implementación - Fase 4: Rendimiento y Escalabilidad

Esta guía describe las optimizaciones de rendimiento implementadas en la Fase 4.

## 📋 Índice

1. [Advanced Product Cache](#1-advanced-product-cache)
2. [Cursor Pagination](#2-cursor-pagination)
3. [Response Optimization](#3-response-optimization)
4. [Frontend Performance](#4-frontend-performance)
5. [Métricas y Monitoreo](#5-métricas-y-monitoreo)

---

## 1. Advanced Product Cache

### Ubicación
`microservices/product-service/src/services/advancedCacheService.js`

### Características

- **Productos Populares**: Ranking en tiempo real con Redis Sorted Sets
- **Batch Loading**: MGET para múltiples productos
- **Cache Warming**: Precarga de datos frecuentes al iniciar
- **Invalidación Inteligente**: Por producto, por lista, o total
- **Métricas**: Hit rate, latencia, errores

### Uso Básico

```javascript
const { advancedProductCache } = require('./services/advancedCacheService');

// Conectar al iniciar el servicio
await advancedProductCache.connect();

// Cachear producto individual
await advancedProductCache.cacheProduct(productId, productData);

// Obtener producto cacheado
const product = await advancedProductCache.getCachedProduct(productId);

// Batch loading (varios productos)
const { products, missingIds } = await advancedProductCache.getCachedProducts([id1, id2, id3]);
```

### Productos Populares

```javascript
// Incrementar vistas (en endpoint de producto)
await advancedProductCache.incrementProductView(productId);

// Obtener IDs más vistos (últimos 7 días)
const popular = await advancedProductCache.getPopularProductIds(10, 7);
// [{ productId: '123', views: 150 }, { productId: '456', views: 120 }, ...]
```

### Cache Warming

```javascript
// Al iniciar el servicio
await advancedProductCache.warmCache({
  getCategories: () => Category.find({ active: true }),
  getOccasions: () => Occasion.find({ active: true }),
  getFeaturedProducts: () => Product.find({ featured: true }),
  getPopularProducts: (limit) => Product.find().sort({ views: -1 }).limit(limit),
});
```

### Invalidación

```javascript
// Invalidar producto específico (después de update)
await advancedProductCache.invalidateProduct(productId);

// Invalidar todas las listas (después de crear producto)
await advancedProductCache.invalidateProductLists();

// Invalidar todo (después de import masivo)
await advancedProductCache.invalidateAll();
```

### TTL Configurables

| Cache | TTL | Descripción |
|-------|-----|-------------|
| `PRODUCT_DETAIL` | 10 min | Producto individual |
| `PRODUCT_LIST` | 5 min | Listas filtradas |
| `POPULAR_PRODUCTS` | 15 min | Productos más vistos |
| `CATEGORIES` | 1 hora | Categorías |
| `SEARCH_RESULTS` | 3 min | Resultados de búsqueda |

---

## 2. Cursor Pagination

### Ubicación
`microservices/shared/utils/cursor-pagination.js`

### Ventajas sobre Offset Pagination

| Aspecto | Offset | Cursor |
|---------|--------|--------|
| Complejidad | O(n) | O(1) |
| Datos duplicados | Sí | No |
| Datos faltantes | Sí | No |
| Infinite scroll | Malo | Excelente |

### Uso con MongoDB

```javascript
const { paginateMongo } = require('@flores-victoria/shared/utils');

// En el controller
const result = await paginateMongo(Order, {
  cursor: req.query.cursor,
  limit: 20,
  sortField: 'createdAt',
  sortOrder: -1,
  baseQuery: { userId: user.id, status: 'completed' },
  populate: ['items.product'],
  select: '-__v',
});

res.json({
  data: result.items,
  pagination: result.pagination,
});
```

### Uso con PostgreSQL

```javascript
const { paginatePostgres } = require('@flores-victoria/shared/utils');

const result = await paginatePostgres(pool, {
  table: 'orders',
  cursor: req.query.cursor,
  limit: 20,
  sortField: 'created_at',
  sortOrder: 'DESC',
  where: { user_id: userId },
});
```

### Formato de Respuesta

```json
{
  "data": [...],
  "pagination": {
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextCursor": "eyJ2YWx1ZSI6IjIwMjQtMDEtMTVUMTA6MzA6MDAuMDAwWiIsImlkIjoiNjVhNGY4YjEyYzM0NTY3ODkwMTIzNDU2In0",
    "count": 20
  }
}
```

### Middleware de Paginación

```javascript
const { parsePaginationParams } = require('@flores-victoria/shared/utils');

// En las rutas
router.get('/orders', 
  parsePaginationParams({ defaultLimit: 20, maxLimit: 100 }),
  async (req, res) => {
    // req.pagination = { cursor, limit, sortField, sortOrder }
    const result = await paginateMongo(Order, {
      ...req.pagination,
      baseQuery: { userId: req.user.id },
    });
    res.json(result);
  }
);
```

---

## 3. Response Optimization

### Ubicación
`microservices/shared/middleware/compression.js`

### Middleware de Compresión

```javascript
const { createCompressionMiddleware } = require('@flores-victoria/shared/middleware/compression');

// En app.js
app.use(createCompressionMiddleware({
  level: 6,        // 1-9 (mayor = más compresión)
  threshold: 1024, // Mínimo 1KB para comprimir
}));
```

### Cache-Control Headers

```javascript
const { cacheControlMiddleware } = require('@flores-victoria/shared/middleware/compression');

app.use(cacheControlMiddleware({
  maxAge: 86400,  // 1 día
  staleWhileRevalidate: 3600,
  publicEndpoints: ['/api/products', '/api/categories'],
}));
```

### ETag Automático

```javascript
const { etagMiddleware } = require('@flores-victoria/shared/middleware/compression');

// Añadir ETag a respuestas JSON
app.use(etagMiddleware());

// El cliente puede hacer:
// GET /api/products
// If-None-Match: "abc123"
// 
// Si no cambió: 304 Not Modified
```

### Keep-Alive

```javascript
const { keepAliveMiddleware } = require('@flores-victoria/shared/middleware/compression');

app.use(keepAliveMiddleware({
  timeout: 65000,  // 65 segundos
  max: 100,        // Máximo requests por conexión
}));
```

### Bundle Completo

```javascript
const { createResponseOptimizationMiddleware } = require('@flores-victoria/shared/middleware/compression');

// Aplica compresión + cache-control + etag
app.use(createResponseOptimizationMiddleware({
  compression: { level: 6 },
  cache: { maxAge: 3600 },
  etag: true,
}));
```

---

## 4. Frontend Performance

### Ubicación
`frontend/js/performance-optimizations.js`

### Incluir en HTML

```html
<!-- Cargar temprano, antes de otros scripts -->
<script src="/js/performance-optimizations.js" defer></script>
```

### Características

#### Preconnect Dinámico
```javascript
// Automático para API Gateway
// También disponible manualmente:
window.floresVictoria.performance.addPreconnect('https://cdn.example.com');
```

#### Core Web Vitals Tracking
```javascript
// Obtener métricas
const vitals = window.floresVictoria.performance.getWebVitals();
console.log(vitals);
// { LCP: 1234, FID: 50, CLS: 0.05, FCP: 800, TTFB: 150 }
```

#### Connection-Aware Loading
```javascript
// Detectar conexión lenta
if (window.floresVictoria.performance.isSlowConnection()) {
  // Cargar imágenes de baja calidad
  // Deshabilitar animaciones
}
```

#### Prefetch on Hover
```javascript
// Automático para links internos
// También manual:
window.floresVictoria.performance.prefetchUrl('/pages/products.html');
```

### CSS para Conexiones Lentas

```css
/* Estilos para conexiones lentas */
.slow-connection img {
  filter: blur(5px);
  transition: filter 0.3s;
}

.slow-connection img.loaded {
  filter: none;
}

.slow-connection .animation {
  animation: none !important;
}
```

---

## 5. Métricas y Monitoreo

### Métricas de Cache

```javascript
// Endpoint de métricas
app.get('/metrics/cache', (req, res) => {
  res.json(advancedProductCache.getStats());
});

// Respuesta:
// {
//   "hits": 15000,
//   "misses": 2000,
//   "errors": 5,
//   "hitRate": "88.24%",
//   "avgLatencyMs": "2.5",
//   "totalRequests": 17000,
//   "isConnected": true
// }
```

### Métricas de Compresión

```javascript
const { compressionStats } = require('@flores-victoria/shared/middleware/compression');

app.get('/metrics/compression', (req, res) => {
  res.json(compressionStats.getStats());
});

// Respuesta:
// {
//   "totalRequests": 10000,
//   "compressedRequests": 8500,
//   "compressionRatio": "65.5%",
//   "avgOriginalSize": 15000,
//   "avgCompressedSize": 5175
// }
```

### Core Web Vitals Goals

| Métrica | Bueno | Mejorar | Malo |
|---------|-------|---------|------|
| LCP | < 2.5s | < 4s | ≥ 4s |
| FID | < 100ms | < 300ms | ≥ 300ms |
| CLS | < 0.1 | < 0.25 | ≥ 0.25 |

---

## 📊 Impacto Esperado

| Optimización | Métrica | Mejora Esperada |
|--------------|---------|-----------------|
| Product Cache | DB queries | -80% |
| Cursor Pagination | Query time | -50% en páginas grandes |
| Compression | Bandwidth | -60% |
| Keep-Alive | Latency | -30% |
| Preconnect | TTFB | -100ms |
| Prefetch | Navigation | -200ms |

---

## ✅ Checklist de Implementación

- [x] Advanced Product Cache con productos populares
- [x] Cursor pagination para MongoDB y PostgreSQL
- [x] Middleware de compresión optimizado
- [x] Cache-Control y ETag automáticos
- [x] Keep-Alive headers
- [x] Frontend performance script
- [x] Core Web Vitals tracking
- [ ] Integrar advancedCacheService en product-service
- [ ] Migrar endpoints a cursor pagination
- [ ] Añadir script de performance a index.html

---

*Fase 4 completada - Flores Victoria Team*
