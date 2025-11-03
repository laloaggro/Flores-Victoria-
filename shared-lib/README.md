# @flores-victoria/shared

Biblioteca compartida para los microservicios de Flores Victoria. Centraliza lógica común y elimina duplicación de código.

## 📦 Instalación

Desde el directorio del microservicio:

```bash
npm install ../shared-lib
```

O añade al `package.json`:

```json
{
  "dependencies": {
    "@flores-victoria/shared": "file:../shared-lib"
  }
}
```

## 🚀 Uso

### Autenticación

```javascript
const { auth } = require('@flores-victoria/shared');

// Generar token
const token = auth.generateToken({
  userId: user._id,
  email: user.email,
  role: user.role
});

// Verificar token
try {
  const decoded = auth.verifyToken(token);
  console.log(decoded); // { userId, email, role, iat, exp }
} catch (error) {
  console.error('Token inválido:', error.message);
}

// Hash de contraseña
const hash = await auth.hashPassword('contraseña123');

// Verificar contraseña
const isValid = await auth.comparePassword('contraseña123', hash);
```

### Logging

```javascript
const { logger } = require('@flores-victoria/shared');

// Usar logger por defecto
logger.info('Servidor iniciado', { port: 3000 });
logger.warn('Alto uso de memoria', { usage: '85%' });
logger.error('Error en conexión', { error: err.message });

// Crear logger personalizado
const { createLogger } = require('@flores-victoria/shared');
const customLogger = createLogger({
  service: 'product-service',
  level: 'debug',
  enableFile: true,
  filename: 'logs/products.log'
});
```

### Middleware de Logging

```javascript
const express = require('express');
const { logger } = require('@flores-victoria/shared');

const app = express();

// Log de todas las requests
app.use(logger.requestLogger());
```

### Validaciones

```javascript
const { validators, validate } = require('@flores-victoria/shared');

// En routes
router.post('/products',
  validate(validators.productSchemas.create), // Valida req.body
  createProduct
);

router.get('/products',
  validate(validators.productSchemas.query, 'query'), // Valida req.query
  getProducts
);

// Validar ObjectId
router.get('/products/:id',
  validators.validateObjectId(), // Valida req.params.id
  getProduct
);

// Validación custom con Joi
const customSchema = validators.Joi.object({
  name: validators.Joi.string().required(),
  age: validators.Joi.number().min(18)
});

router.post('/custom',
  validate(customSchema),
  handler
);
```

### Manejo de Errores

```javascript
const { errors } = require('@flores-victoria/shared');

// En route handlers
router.get('/products/:id', async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new errors.NotFoundError('Producto');
  }
  
  res.json(product);
});

// Usar asyncHandler para auto-catch
router.get('/products/:id',
  errors.asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new errors.NotFoundError('Producto');
    res.json(product);
  })
);

// Error handler global (al final de middleware)
app.use(errors.errorHandler(logger));

// 404 handler
app.use(errors.notFoundHandler());
```

### Middleware de Autenticación

```javascript
const express = require('express');
const { middleware, auth } = require('@flores-victoria/shared');

const app = express();

// Rutas protegidas
router.get('/profile',
  middleware.authenticate(auth), // Requiere token válido
  getProfile
);

// Autenticación opcional
router.get('/products',
  middleware.optionalAuth(auth), // Token opcional
  getProducts // req.user existe si hay token
);

// Autorización por roles
router.delete('/products/:id',
  middleware.authenticate(auth),
  middleware.authorize('admin', 'manager'), // Solo admin o manager
  deleteProduct
);

// Verificar ownership
router.put('/orders/:id',
  middleware.authenticate(auth),
  middleware.requireOwnership(async (req) => {
    const order = await Order.findById(req.params.id);
    return order.userId; // Retorna el ownerId
  }),
  updateOrder
);
```

### Rate Limiting

```javascript
const { middleware } = require('@flores-victoria/shared');

// Rate limit global
app.use(middleware.rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: 'Demasiadas solicitudes'
}));

// Rate limit específico
router.post('/login',
  middleware.rateLimit({ max: 5, windowMs: 5 * 60 * 1000 }), // 5 intentos / 5 min
  login
);
```

### CORS

```javascript
const { middleware } = require('@flores-victoria/shared');

app.use(middleware.cors({
  origin: ['http://localhost:5173', 'https://floresvictoria.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

### Utilidades

```javascript
const { utils } = require('@flores-victoria/shared');

// Sleep/delay
await utils.sleep(2000); // Espera 2 segundos

// Retry con backoff
const data = await utils.retry(
  async () => await fetchData(),
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2,
    onRetry: (error, attempt, waitTime) => {
      console.log(`Intento ${attempt} falló, reintentando en ${waitTime}ms...`);
    }
  }
);

// Slugify
const slug = utils.slugify('Ramo de Rosas Rojas'); // 'ramo-de-rosas-rojas'

// Paginación
const { skip, limit } = utils.getPagination(2, 20); // page 2, 20 per page
const products = await Product.find().skip(skip).limit(limit);

const response = utils.formatPaginatedResponse(products, total, 2, 20);
// { data, pagination: { total, page, limit, totalPages, hasNext, hasPrev } }

// Formateo
utils.formatCurrency(15000); // "$15.000"
utils.formatDate(new Date()); // "1 de noviembre de 2025"
utils.timeAgo('2025-10-31T10:00:00Z'); // "hace 1 día"

// Código aleatorio
const code = utils.generateCode(6); // "A7B9K2"

// Array utilities
const chunks = utils.chunk([1,2,3,4,5,6], 2); // [[1,2], [3,4], [5,6]]
const uniq = utils.unique([1,2,2,3,3,3]); // [1,2,3]
const shuffled = utils.shuffle([1,2,3,4,5]); // Random order

// Object utilities
const sanitized = utils.omit(user, ['password', 'salt']); // Sin password ni salt
const publicData = utils.pick(user, ['name', 'email']); // Solo name y email

// Debounce/Throttle
const debouncedSearch = utils.debounce(search, 300);
const throttledScroll = utils.throttle(onScroll, 100);
```

### Configuración

```javascript
const { config } = require('@flores-victoria/shared');

// Validar variables de entorno al inicio
config.validateEnv(['PORT', 'MONGODB_URI', 'REDIS_URL']);

// Validar JWT
config.validateJWTConfig(); // Lanza error si JWT_SECRET es inseguro

// Obtener configuración con defaults
const port = config.getConfig('PORT', 3000);

// Configuración completa de microservicio
const cfg = config.getMicroserviceConfig('product-service');
/*
{
  service: { name, port, env },
  database: { mongodb, redis },
  auth: { jwtSecret, jwtExpiresIn, bcryptRounds },
  cors: { origin, credentials },
  logging: { level, file, enableFile },
  rateLimit: { windowMs, max }
}
*/
```

## 🏗️ Ejemplo Completo de Microservicio

```javascript
const express = require('express');
const {
  config,
  logger,
  auth,
  middleware,
  errors,
  validators,
  validate,
} = require('@flores-victoria/shared');

// Validar configuración
config.validateEnv(['PORT', 'MONGODB_URI', 'JWT_SECRET']);
config.validateJWTConfig();

const cfg = config.getMicroserviceConfig('product-service');

const app = express();

// Middlewares globales
app.use(express.json());
app.use(middleware.cors(cfg.cors));
app.use(middleware.sanitizeInputs);
app.use(middleware.requestId);
app.use(logger.requestLogger());
app.use(middleware.rateLimit(cfg.rateLimit));

// Routes
router.get('/products',
  validate(validators.productSchemas.query, 'query'),
  errors.asyncHandler(async (req, res) => {
    const { skip, limit } = utils.getPagination(req.query.page, req.query.limit);
    const products = await Product.find().skip(skip).limit(limit);
    const total = await Product.countDocuments();
    
    res.json(utils.formatPaginatedResponse(products, total, req.query.page, req.query.limit));
  })
);

router.post('/products',
  middleware.authenticate(auth),
  middleware.authorize('admin', 'manager'),
  validate(validators.productSchemas.create),
  errors.asyncHandler(async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    
    logger.logBusinessEvent('product_created', { productId: product._id });
    
    res.status(201).json({ data: product });
  })
);

// Error handlers
app.use(errors.notFoundHandler());
app.use(errors.errorHandler(logger));

// Start
app.listen(cfg.service.port, () => {
  logger.info(`${cfg.service.name} started`, { port: cfg.service.port });
});
```

## 📚 API Reference

### auth
- `generateToken(payload, options)` - Genera JWT
- `verifyToken(token, options)` - Verifica JWT
- `decodeToken(token)` - Decodifica sin verificar
- `hashPassword(password)` - Hash con bcrypt
- `comparePassword(password, hash)` - Compara password
- `generateRefreshToken(payload)` - Token de larga duración
- `extractTokenFromHeader(authHeader)` - Extrae token de header
- `isTokenExpiringSoon(token, minutes)` - Verifica expiración
- `generateActivationToken(payload)` - Token corto (1h)

### logger
- `logger.info(message, metadata)` - Log info
- `logger.warn(message, metadata)` - Log warning
- `logger.error(message, metadata)` - Log error
- `createLogger(options)` - Crear logger custom
- `requestLogger(logger)` - Middleware de logging
- `logError(error, context, logger)` - Helper para errores
- `logBusinessEvent(event, data, logger)` - Log de eventos

### errors
- `AppError` - Error base
- `ValidationError` - Error de validación
- `AuthenticationError` - Error de autenticación
- `AuthorizationError` - Error de autorización
- `NotFoundError` - Recurso no encontrado
- `ConflictError` - Conflicto (duplicado)
- `RateLimitError` - Rate limit excedido
- `DatabaseError` - Error de base de datos
- `errorHandler(logger)` - Middleware de errores
- `notFoundHandler()` - Middleware 404
- `asyncHandler(fn)` - Wrapper para async

### validators
- `validate(schema, property)` - Middleware de validación
- `validateObjectId(paramName)` - Valida MongoDB ObjectId
- `productSchemas` - Schemas para productos
- `userSchemas` - Schemas para usuarios
- `orderSchemas` - Schemas para órdenes
- `schemas` - Schemas básicos

### middleware
- `authenticate(authService)` - Requiere autenticación
- `optionalAuth(authService)` - Autenticación opcional
- `authorize(...roles)` - Requiere roles
- `requireOwnership(getOwnerId)` - Verifica ownership
- `rateLimit(options)` - Rate limiting
- `cors(options)` - CORS
- `sanitizeInputs` - Sanitiza inputs
- `requestId` - Añade request ID

### utils
- `sleep(ms)` - Sleep/delay
- `retry(fn, options)` - Retry con backoff
- `slugify(text)` - Genera slug
- `getPagination(page, limit)` - Paginación
- `formatPaginatedResponse(data, total, page, limit)` - Formato
- `generateCode(length, chars)` - Código aleatorio
- `formatCurrency(amount, currency)` - Formato moneda
- `formatDate(date, locale)` - Formato fecha
- `timeAgo(date)` - Tiempo transcurrido
- `deepMerge(target, source)` - Deep merge
- `omit(obj, keys)` - Omit keys
- `pick(obj, keys)` - Pick keys
- `debounce(fn, delay)` - Debounce
- `throttle(fn, limit)` - Throttle
- `chunk(array, size)` - Chunks
- `unique(array)` - Valores únicos
- `shuffle(array)` - Randomiza array

### config
- `validateEnv(required)` - Valida env vars
- `getConfig(key, defaultValue)` - Obtiene config
- `getMicroserviceConfig(serviceName)` - Config completo
- `validateJWTConfig()` - Valida JWT_SECRET

## 🔒 Seguridad

La biblioteca incluye múltiples capas de seguridad:

✅ **Validación de JWT_SECRET** - Detecta y rechaza secretos por defecto  
✅ **Bcrypt** - Hash seguro de contraseñas con rounds configurables  
✅ **Rate Limiting** - Protección contra brute force  
✅ **Input Sanitization** - Prevención básica de XSS  
✅ **Validación robusta** - Joi schemas para todos los inputs  
✅ **Error handling** - No expone detalles en producción  

## 📝 Licencia

MIT
