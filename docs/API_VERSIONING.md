# API Versioning Strategy

> Guía de versionado de API para Flores Victoria.

---

## 📋 Tabla de Contenidos

- [Estrategia de Versionado](#estrategia-de-versionado)
- [Versiones Actuales](#versiones-actuales)
- [Cambios Breaking vs Non-Breaking](#cambios-breaking-vs-non-breaking)
- [Deprecación de Endpoints](#deprecación-de-endpoints)
- [Guías de Migración](#guías-de-migración)
- [Compatibilidad](#compatibilidad)

---

## Estrategia de Versionado

### Método: URL Path Versioning

Flores Victoria utiliza **versionado por URL** para mayor claridad y simplicidad:

```
https://api.floresvictoria.cl/v1/products
https://api.floresvictoria.cl/v2/products
```

**Ventajas:**

- ✅ Fácil de entender y documentar
- ✅ Compatible con cache HTTP
- ✅ No requiere headers especiales
- ✅ URLs únicas por versión

---

## Versiones Actuales

### v1 (Actual) - **Estable**

**Estado:** Producción  
**Fecha lanzamiento:** Enero 2025  
**Soporte hasta:** Enero 2027 (2 años)

#### Endpoints Principales

```
# Autenticación
POST   /v1/auth/register
POST   /v1/auth/login
POST   /v1/auth/logout
POST   /v1/auth/refresh

# Productos
GET    /v1/products
GET    /v1/products/:id
POST   /v1/products        # Admin
PUT    /v1/products/:id    # Admin
DELETE /v1/products/:id    # Admin

# Carrito
GET    /v1/cart
POST   /v1/cart/items
PUT    /v1/cart/items/:productId
DELETE /v1/cart/items/:productId
DELETE /v1/cart

# Órdenes
GET    /v1/orders
GET    /v1/orders/:id
POST   /v1/orders

# Usuarios
GET    /v1/users/me
PUT    /v1/users/me
DELETE /v1/users/me

# Wishlist
GET    /v1/wishlist
POST   /v1/wishlist/items
DELETE /v1/wishlist/items/:productId

# Reseñas
GET    /v1/reviews/product/:productId
POST   /v1/reviews
PUT    /v1/reviews/:id
DELETE /v1/reviews/:id

# Contacto
POST   /v1/contact
```

---

### v2 (Planeada) - **En Desarrollo**

**Estado:** Beta privada  
**Fecha estimada:** Q2 2026  
**Cambios principales:**

1. **Paginación mejorada** (cursor-based)
2. **Webhooks** para eventos
3. **GraphQL** como alternativa
4. **Batch requests** (múltiples operaciones)

#### Ejemplo: Paginación v2

```javascript
// v1 (offset-based)
GET /v1/products?page=2&limit=20

// v2 (cursor-based)
GET /v2/products?cursor=eyJpZCI6MTIzfQ&limit=20

Response v2:
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6MTQzfQ",
    "hasMore": true
  }
}
```

---

## Cambios Breaking vs Non-Breaking

### ❌ Breaking Changes (Requieren nueva versión)

1. **Eliminar campos de respuesta**

   ```diff
   - "created": "2025-01-01"
   + // Campo eliminado
   ```

2. **Cambiar tipos de datos**

   ```diff
   - "price": 29.99
   + "price": "29.99"  // String en lugar de Number
   ```

3. **Renombrar campos**

   ```diff
   - "image_url": "..."
   + "imageUrl": "..."
   ```

4. **Modificar códigos de error**

   ```diff
   - 404 Not Found
   + 400 Bad Request  // Para el mismo error
   ```

5. **Cambiar estructura de respuesta**
   ```diff
   - { "id": 1, "name": "Rosa" }
   + { "product": { "id": 1, "name": "Rosa" } }
   ```

---

### ✅ Non-Breaking Changes (Misma versión)

1. **Agregar nuevos campos** (opcionales)

   ```diff
     "name": "Rosa",
     "price": 29.99,
   + "discount": 10
   ```

2. **Agregar nuevos endpoints**

   ```diff
   + GET /v1/products/trending
   ```

3. **Agregar parámetros opcionales**

   ```diff
     GET /v1/products?category=rosas
   + GET /v1/products?category=rosas&sortBy=price
   ```

4. **Mejorar mensajes de error** (más descriptivos)
   ```diff
   - "Invalid input"
   + "Invalid input: price must be a positive number"
   ```

---

## Deprecación de Endpoints

### Proceso de Deprecación (6 meses)

#### Fase 1: Anuncio (Mes 1)

```yaml
# CHANGELOG.md
## [1.5.0] - 2025-06-01
### Deprecated
- `GET /v1/products/list` - Use `GET /v1/products` instead
  Removal date: 2025-12-01
```

#### Fase 2: Headers de Deprecación (Mes 2)

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Wed, 01 Dec 2025 23:59:59 GMT
Link: <https://docs.floresvictoria.cl/migration/v1-products>; rel="deprecation"
```

#### Fase 3: Logs y Alertas (Mes 3)

```javascript
// Middleware de deprecación
app.get(
  '/v1/products/list',
  deprecationWarning({
    message: 'This endpoint is deprecated',
    sunset: '2025-12-01',
    alternative: 'GET /v1/products',
  }),
  handler
);
```

#### Fase 4: Reducción de Rate Limits (Mes 5)

```javascript
// Rate limit más restrictivo para endpoints deprecated
if (req.path === '/v1/products/list') {
  maxRequests = 10; // Normal: 100
}
```

#### Fase 5: Eliminación (Mes 6)

```javascript
// Retornar 410 Gone
app.get('/v1/products/list', (req, res) => {
  res.status(410).json({
    error: 'This endpoint has been removed',
    message: 'Please use GET /v1/products',
    docs: 'https://docs.floresvictoria.cl/api/v1/products',
  });
});
```

---

## Guías de Migración

### Migración v1 → v2

#### Cambios Principales

##### 1. Paginación

**Antes (v1):**

```javascript
// Request
GET /v1/products?page=2&limit=20

// Response
{
  "products": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Después (v2):**

```javascript
// Request
GET /v2/products?cursor=eyJpZCI6NDEsImNyZWF0ZWRBdCI6IjIwMjUtMDEtMTVUMTI6MDA6MDBaIn0&limit=20

// Response
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6NjEsImNyZWF0ZWRBdCI6IjIwMjUtMDEtMTZUMDg6MzA6MDBaIn0",
    "hasMore": true,
    "limit": 20
  }
}
```

**Código de migración:**

```javascript
// Helper para convertir page a cursor
function pageToInitialCursor(page, limit) {
  if (page === 1) return null;
  const offset = (page - 1) * limit;
  // Implementar lógica según tu BD
}

// Wrapper para mantener compatibilidad
async function getProducts(pageOrCursor, limit) {
  if (typeof pageOrCursor === 'number') {
    // v1: page-based
    const cursor = pageToInitialCursor(pageOrCursor, limit);
    return getProductsV2(cursor, limit);
  } else {
    // v2: cursor-based
    return getProductsV2(pageOrCursor, limit);
  }
}
```

---

##### 2. Campos Renombrados

| v1 Campo     | v2 Campo    | Tipo      |
| ------------ | ----------- | --------- |
| `image_url`  | `imageUrl`  | camelCase |
| `created_at` | `createdAt` | camelCase |
| `updated_at` | `updatedAt` | camelCase |
| `user_id`    | `userId`    | camelCase |

**Transformador automático:**

```javascript
// Convertir snake_case a camelCase
function transformV1toV2(v1Object) {
  return Object.keys(v1Object).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    acc[camelKey] = v1Object[key];
    return acc;
  }, {});
}

// Ejemplo
const v1Product = {
  product_id: 123,
  image_url: 'https://...',
  created_at: '2025-01-01',
};

const v2Product = transformV1toV2(v1Product);
// {
//   productId: 123,
//   imageUrl: "https://...",
//   createdAt: "2025-01-01"
// }
```

---

##### 3. Errores Estructurados

**Antes (v1):**

```json
{
  "error": "Product not found"
}
```

**Después (v2):**

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 123 not found",
    "details": {
      "productId": 123
    },
    "timestamp": "2025-11-22T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## Compatibilidad

### Soporte Concurrente de Versiones

```javascript
// routes/index.js
const v1Routes = require('./v1');
const v2Routes = require('./v2');

app.use('/v1', v1Routes); // Endpoints v1
app.use('/v2', v2Routes); // Endpoints v2

// Redirección automática a última versión
app.use('/api', v2Routes); // Sin versión → usar v2
```

### Versionado de Schemas (Joi/Zod)

```javascript
// validators/products/v1.js
const productSchemaV1 = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  image_url: Joi.string().uri(), // snake_case
});

// validators/products/v2.js
const productSchemaV2 = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  imageUrl: Joi.string().uri(), // camelCase
  discount: Joi.number().min(0).max(100), // Nuevo campo
});
```

---

## Semantic Versioning (Backend)

Seguimos **SemVer** para versiones internas:

```
MAJOR.MINOR.PATCH
  |     |     |
  |     |     └─ Bugfixes
  |     └─────── Features (non-breaking)
  └───────────── Breaking changes
```

**Ejemplos:**

- `1.0.0` → `1.0.1`: Fix de bug (no breaking)
- `1.0.1` → `1.1.0`: Nuevo feature (no breaking)
- `1.1.0` → `2.0.0`: Breaking change → Nueva versión API

---

## Changelog API

### Formato

```markdown
# API Changelog

## [v1.3.0] - 2025-11-22

### Added

- `GET /v1/products/trending` - Top 10 productos más vistos
- Parámetro `discount` en `POST /v1/products`

### Changed

- `GET /v1/products` ahora retorna campo `stockStatus`

### Deprecated

- `GET /v1/products/list` será removido en v2

### Fixed

- Corrección en cálculo de descuentos

## [v1.2.0] - 2025-10-15

...
```

---

## Testing de Compatibilidad

### Contract Testing (Pact)

```javascript
// tests/contract/products-v1.spec.js
describe('Products API v1 Contract', () => {
  it('should match expected response structure', async () => {
    const response = await request(app).get('/v1/products/123').expect(200);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      price: expect.any(Number),
      image_url: expect.any(String),
      created_at: expect.any(String),
    });
  });
});
```

### Snapshot Testing

```javascript
// Guardar snapshot de respuesta
expect(response.body).toMatchSnapshot();

// Detecta cambios no intencionales en estructura
```

---

## Mejores Prácticas

### ✅ DO

1. **Versionar desde el inicio**
2. **Documentar todos los cambios**
3. **Mantener 2 versiones simultáneamente** (current + previous)
4. **Comunicar deprecaciones con 6 meses de anticipación**
5. **Usar headers `Sunset` y `Deprecation`**
6. **Proveer guías de migración claras**

### ❌ DON'T

1. **Nunca eliminar endpoints sin aviso**
2. **No cambiar comportamiento sin incrementar versión**
3. **No mantener más de 3 versiones activas**
4. **No deprecar sin alternativa clara**

---

## Referencias

- [RFC 8594 - Sunset HTTP Header](https://datatracker.ietf.org/doc/html/rfc8594)
- [RFC 5988 - Web Linking](https://datatracker.ietf.org/doc/html/rfc5988)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [API Versioning Best Practices (Microsoft)](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design#versioning)

---

**Última actualización:** Noviembre 2025  
**Versión:** 3.0
