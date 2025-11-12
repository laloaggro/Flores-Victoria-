# Manejo Estandarizado de Errores

Sistema centralizado de manejo de errores con clases personalizadas y middleware global para
respuestas consistentes.

## 📋 Índice

1. [Clases de Error Personalizadas](#clases-de-error-personalizadas)
2. [Middleware de Manejo de Errores](#middleware-de-manejo-de-errores)
3. [Patrones de Uso](#patrones-de-uso)
4. [Integración en Servicios](#integración-en-servicios)
5. [Ejemplos Completos](#ejemplos-completos)
6. [Mejores Prácticas](#mejores-prácticas)

## Clases de Error Personalizadas

Ubicación: `shared/errors/AppError.js`

### Clase Base: `AppError`

```javascript
class AppError extends Error {
  constructor(message, statusCode, metadata = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Errores esperados vs bugs
    this.metadata = metadata;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Clases de Error Disponibles

| Clase                  | Código HTTP | Uso                                         |
| ---------------------- | ----------- | ------------------------------------------- |
| `BadRequestError`      | 400         | Parámetros inválidos, formato incorrecto    |
| `UnauthorizedError`    | 401         | Falta autenticación o token inválido        |
| `ForbiddenError`       | 403         | Usuario autenticado pero sin permisos       |
| `NotFoundError`        | 404         | Recurso no existe                           |
| `ConflictError`        | 409         | Conflicto de estado (duplicados, versiones) |
| `ValidationError`      | 422         | Errores de validación (Joi/Zod)             |
| `TooManyRequestsError` | 429         | Rate limiting excedido                      |
| `InternalServerError`  | 500         | Errores inesperados del servidor            |

## Middleware de Manejo de Errores

Ubicación: `shared/middleware/error-handler.js`

### 1. `asyncHandler(fn)`

Envuelve funciones async para capturar errores de Promises automáticamente.

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

**¿Por qué usarlo?**

- Elimina bloques `try-catch` repetitivos
- Garantiza que los errores lleguen al error handler
- Código más limpio y legible

### 2. `notFoundHandler(req, res)`

Maneja rutas no encontradas (404).

```javascript
app.use(notFoundHandler);
```

### 3. `errorHandler(err, req, res, next)`

Middleware global de errores. Normaliza respuestas y maneja casos especiales.

**Errores normalizados automáticamente:**

- Mongoose `CastError` → 400 Bad Request
- MongoDB duplicate key (E11000) → 409 Conflict
- JWT errors (JsonWebTokenError, TokenExpiredError) → 401 Unauthorized
- Multer errors → 400 Bad Request

```javascript
app.use(errorHandler);
```

## Patrones de Uso

### ❌ Patrón Antiguo (No Usar)

```javascript
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

**Problemas:**

- Boilerplate repetitivo
- Inconsistencia en formato de respuestas
- Logging manual propenso a errores
- No aprovecha metadata de errores

### ✅ Patrón Nuevo (Recomendado)

```javascript
const { asyncHandler } = require('../../../shared/middleware/error-handler');
const { NotFoundError } = require('../../../shared/errors/AppError');

router.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError('Product', { id: req.params.id });
    }

    req.log.info('Product retrieved', { productId: product.id });
    res.json(product);
  })
);
```

**Beneficios:**

- Sin `try-catch` explícito
- Errores con metadata estructurada
- Logging automático en error handler
- Respuestas consistentes

## Integración en Servicios

### Paso 1: Importar en `app.js`

```javascript
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/error-handler');
```

### Paso 2: Agregar al Final del Pipeline

**IMPORTANTE:** El orden es crítico. Los error handlers deben ir después de todas las rutas.

```javascript
// ... tus rutas aquí ...

// 404 handler - después de todas las rutas
app.use(notFoundHandler);

// Error handler - debe ir al final
app.use(errorHandler);

module.exports = app;
```

### Paso 3: Convertir Rutas

#### Ejemplo: Creación de Recurso

```javascript
const { asyncHandler } = require('../../../shared/middleware/error-handler');
const { BadRequestError, ConflictError } = require('../../../shared/errors/AppError');

router.post(
  '/users',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validación manual (antes de Joi/Zod)
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    // Verificar duplicados
    const existing = await User.findOne({ email });
    if (existing) {
      throw new ConflictError('User', { email, field: 'email' });
    }

    const user = await User.create({ email, password });
    req.log.info('User created', { userId: user.id, email });

    res.status(201).json({
      status: 'success',
      data: { user: user.toPublicJSON() },
    });
  })
);
```

#### Ejemplo: Actualización con Autorización

```javascript
const { ForbiddenError } = require('../../../shared/errors/AppError');

router.patch(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
      throw new NotFoundError('Post', { id: req.params.id });
    }

    // Verificar propiedad
    if (post.authorId !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenError('You can only edit your own posts');
    }

    Object.assign(post, req.body);
    await post.save();

    res.json({ status: 'success', data: { post } });
  })
);
```

#### Ejemplo: Rate Limiting

```javascript
const { TooManyRequestsError } = require('../../../shared/errors/AppError');

async function checkRateLimit(userId) {
  const count = await redis.incr(`rate:${userId}`);
  if (count === 1) await redis.expire(`rate:${userId}`, 60);

  if (count > 100) {
    throw new TooManyRequestsError('API rate limit exceeded', {
      limit: 100,
      window: '1 minute',
      retryAfter: await redis.ttl(`rate:${userId}`),
    });
  }
}
```

## Ejemplos Completos

### Servicio CRUD Completo

```javascript
const express = require('express');
const { asyncHandler } = require('../../../shared/middleware/error-handler');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../../../shared/errors/AppError');

const router = express.Router();

// CREATE
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, price } = req.body;

    if (!name || !price) {
      throw new BadRequestError('Name and price are required');
    }

    const existing = await Product.findOne({ name });
    if (existing) {
      throw new ConflictError('Product', { name, field: 'name' });
    }

    const product = await Product.create({ name, price });
    req.log.info('Product created', { productId: product.id });

    res.status(201).json({ status: 'success', data: { product } });
  })
);

// READ
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError('Product', { id: req.params.id });
    }

    res.json({ status: 'success', data: { product } });
  })
);

// UPDATE
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError('Product', { id: req.params.id });
    }

    Object.assign(product, req.body);
    await product.save();

    req.log.info('Product updated', { productId: product.id });
    res.json({ status: 'success', data: { product } });
  })
);

// DELETE
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError('Product', { id: req.params.id });
    }

    await product.remove();
    req.log.info('Product deleted', { productId: product.id });

    res.status(204).send();
  })
);

module.exports = router;
```

## Mejores Prácticas

### ✅ Hacer

1. **Usar `asyncHandler` siempre con funciones async**

   ```javascript
   router.get('/', asyncHandler(async (req, res) => { ... }));
   ```

2. **Incluir metadata relevante en errores**

   ```javascript
   throw new NotFoundError('Product', { id, category });
   ```

3. **Usar la clase de error apropiada**

   ```javascript
   // ❌ Genérico
   throw new Error('Not found');

   // ✅ Específico
   throw new NotFoundError('Product', { id });
   ```

4. **Logear operaciones exitosas**

   ```javascript
   req.log.info('Product created', { productId: product.id });
   ```

5. **Dejar que el error handler maneje Mongoose/MongoDB errors**

   ```javascript
   // ❌ No necesario
   try {
     await Product.findById(invalidId);
   } catch (err) {
     if (err.name === 'CastError') { ... }
   }

   // ✅ El error handler lo convierte automáticamente
   const product = await Product.findById(invalidId);
   ```

### ❌ Evitar

1. **No mezclar patrones antiguos y nuevos**

   ```javascript
   // ❌ Inconsistente
   try {
     if (!product) throw new NotFoundError(...);
   } catch (err) {
     res.status(500).json({ error: err.message });
   }
   ```

2. **No usar `res.status().json()` para errores**

   ```javascript
   // ❌ Bypass del error handler
   if (!product) {
     return res.status(404).json({ error: 'Not found' });
   }

   // ✅ Usar throw
   if (!product) throw new NotFoundError('Product', { id });
   ```

3. **No crear errores genéricos**

   ```javascript
   // ❌ Poco informativo
   throw new Error('Something went wrong');

   // ✅ Descriptivo con metadata
   throw new InternalServerError('Failed to process payment', {
     provider: 'stripe',
     transactionId,
   });
   ```

## Formato de Respuesta

### Respuesta de Error Estándar

```json
{
  "status": "error",
  "message": "Product not found",
  "metadata": {
    "id": "prod_123"
  },
  "requestId": "req_abc123xyz"
}
```

### Respuesta en Desarrollo (con stack trace)

```json
{
  "status": "error",
  "message": "Product not found",
  "metadata": {
    "id": "prod_123"
  },
  "requestId": "req_abc123xyz",
  "stack": "NotFoundError: Product not found\n    at ..."
}
```

## Debugging

### Ver Logs de Errores

```bash
# JSON logs
tail -f logs/app.log | grep '"level":"error"'

# Pretty logs (desarrollo)
LOG_FORMAT=pretty npm run dev
```

### Errores Comunes

| Error                                    | Causa                          | Solución                                                |
| ---------------------------------------- | ------------------------------ | ------------------------------------------------------- |
| "Cannot set headers after they are sent" | `res.json()` antes del `throw` | Usar solo `throw`, sin `return res.json()`              |
| Error no capturado                       | Falta `asyncHandler`           | Envolver con `asyncHandler(async (req, res) => ...)`    |
| Stack trace vacío                        | Error re-lanzado               | No hacer `catch (err) { throw new Error(err.message) }` |

## Migración Gradual

No es necesario convertir todo de una vez. Migrar ruta por ruta:

1. **Fase 1:** Instalar error handlers en `app.js`
2. **Fase 2:** Convertir rutas críticas (create, update, delete)
3. **Fase 3:** Convertir rutas de lectura
4. **Fase 4:** Remover `try-catch` legacy

```javascript
// Convivencia temporal OK
router.get('/old', async (req, res) => {
  try { ... } catch (err) { ... }
});

router.get('/new', asyncHandler(async (req, res) => {
  ...
}));
```

## Referencias

- Clases de error: `shared/errors/AppError.js`
- Middleware: `shared/middleware/error-handler.js`
- Logging: `shared/LOGGING_GUIDE.md`
- Health checks: `shared/HEALTH_CHECKS.md`
