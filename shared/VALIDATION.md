# Validación de Requests con Joi

Sistema centralizado de validación de entradas (body, query, params, headers) con Joi y manejo de
errores integrado.

## Características

✅ Validación de body, query params, URL params, headers  
✅ Schemas reutilizables y componibles  
✅ Integración con error handling (ValidationError 422)  
✅ Logging automático de errores  
✅ Sanitización automática (stripUnknown)  
✅ Opciones flexibles por validación

## Uso Básico

### Validar Body

```javascript
const { validateBody, Joi } = require('../../../shared/middleware/validator');

const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
});

router.post('/products', validateBody(createProductSchema), async (req, res) => {
  // req.body ya está validado y sanitizado
  const product = await Product.create(req.body);
  res.status(201).json({ data: product });
});
```

### Validar Query Params

```javascript
const { validateQuery, commonSchemas } = require('../../../shared/middleware/validator');

const filterSchema = Joi.object({
  category: Joi.string().optional(),
  minPrice: commonSchemas.price.optional(),
  ...commonSchemas.pagination, // page, limit, sort, order
});

router.get('/products', validateQuery(filterSchema), async (req, res) => {
  // req.query.page, req.query.limit tienen valores por defecto
  const products = await Product.find().skip((req.query.page - 1) * req.query.limit);
  res.json({ data: products });
});
```

### Validar URL Params

```javascript
const { validateParams, schemas } = require('../../../shared/middleware/validator');

router.get(
  '/products/:id',
  validateParams(schemas.idParam), // Valida que 'id' existe
  async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.json({ data: product });
  }
);
```

## Schemas Comunes Reutilizables

### commonSchemas

```javascript
const { commonSchemas, Joi } = require('../../../shared/middleware/validator');

// IDs
commonSchemas.id; // String genérico (1-100 chars)
commonSchemas.uuid; // UUID válido
commonSchemas.mongoId; // ObjectId de MongoDB

// Strings
commonSchemas.email; // Email lowercase trimmed
commonSchemas.password; // Min 8, max 128 chars
commonSchemas.url; // URI válida
commonSchemas.phone; // Formato internacional

// Números
commonSchemas.positiveInt; // Entero positivo
commonSchemas.nonNegativeInt; // Entero >= 0
commonSchemas.price; // Entero positivo (centavos)
commonSchemas.rating; // 0-5

// Paginación
commonSchemas.pagination; // { page, limit, sort, order }

// Fechas
commonSchemas.date; // ISO 8601
commonSchemas.dateRange; // { from, to }

// Booleanos
commonSchemas.boolean; // Acepta bool o 'true'/'false'

// Arrays
commonSchemas.stringArray;
commonSchemas.numberArray;
```

### schemas (Predefinidos)

```javascript
const { schemas } = require('../../../shared/middleware/validator');

schemas.createUser; // email, password, name, phone
schemas.updateUser; // name, phone (opcional)
schemas.login; // email, password
schemas.search; // q, page, limit, sort, order
schemas.productFilters; // category, minPrice, maxPrice, featured, pagination
schemas.idParam; // { id: string }
schemas.uuidParam; // { id: uuid }
```

## Ejemplos Completos

### CRUD de Productos

```javascript
const {
  validateBody,
  validateQuery,
  validateParams,
  schemas,
  commonSchemas,
  Joi,
} = require('../../../shared/middleware/validator');

// CREATE
const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: commonSchemas.price.required(),
  category: Joi.string().required(),
  stock: commonSchemas.nonNegativeInt.default(0),
  images: commonSchemas.stringArray.optional(),
});

router.post('/products', validateBody(createProductSchema), async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ status: 'success', data: { product } });
});

// READ (List with filters)
router.get('/products', validateQuery(schemas.productFilters), async (req, res) => {
  const { page, limit, category, minPrice, maxPrice } = req.query;

  const query = {};
  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  const products = await Product.find(query)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ status: 'success', data: { products, page, limit } });
});

// READ (Single)
router.get('/products/:id', validateParams(schemas.idParam), async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new NotFoundError('Product', { id: req.params.id });

  res.json({ status: 'success', data: { product } });
});

// UPDATE
const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  price: commonSchemas.price.optional(),
  stock: commonSchemas.nonNegativeInt.optional(),
});

router.patch(
  '/products/:id',
  validateParams(schemas.idParam),
  validateBody(updateProductSchema),
  async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) throw new NotFoundError('Product', { id: req.params.id });

    res.json({ status: 'success', data: { product } });
  }
);

// DELETE
router.delete('/products/:id', validateParams(schemas.idParam), async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new NotFoundError('Product', { id: req.params.id });

  res.status(204).send();
});
```

### Auth Endpoints

```javascript
const { validateBody, schemas } = require('../../../shared/middleware/validator');

// Login
router.post('/auth/login', validateBody(schemas.login), async (req, res) => {
  const { email, password } = req.body;
  // ... lógica de autenticación
});

// Register
router.post('/auth/register', validateBody(schemas.createUser), async (req, res) => {
  const { email, password, name } = req.body;
  // ... lógica de registro
});
```

## Crear Schemas Personalizados

### Schema Simple

```javascript
const { Joi } = require('../../../shared/middleware/validator');

const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: commonSchemas.email.required(),
  message: Joi.string().min(10).max(1000).required(),
  phone: commonSchemas.phone.optional(),
});
```

### Schema con Validación Condicional

```javascript
const orderSchema = Joi.object({
  userId: commonSchemas.id.required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: commonSchemas.id.required(),
        quantity: commonSchemas.positiveInt.required(),
      })
    )
    .min(1)
    .required(),

  // Delivery address solo si deliveryMethod === 'delivery'
  deliveryMethod: Joi.string().valid('pickup', 'delivery').required(),
  deliveryAddress: Joi.when('deliveryMethod', {
    is: 'delivery',
    then: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zipCode: Joi.string().required(),
    }).required(),
    otherwise: Joi.optional(),
  }),
});
```

### Schema Reutilizable con Composición

```javascript
const { commonSchemas, createSchema } = require('../../../shared/middleware/validator');

// Base address schema
const addressSchema = Joi.object({
  street: Joi.string().min(5).max(200).required(),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().length(2).uppercase().required(),
  zipCode: Joi.string()
    .regex(/^\d{5}(-\d{4})?$/)
    .required(),
  country: Joi.string().default('MX'),
});

// User con address
const userWithAddressSchema = Joi.object({
  ...schemas.createUser.describe().keys, // Reutilizar campos de createUser
  address: addressSchema.optional(),
});
```

## Respuestas de Error

### Error 422 (Validation Error)

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "status": "error",
  "message": "Datos de entrada inválidos",
  "metadata": {
    "source": "body",
    "errors": [
      {
        "field": "email",
        "message": "\"email\" must be a valid email",
        "type": "string.email"
      },
      {
        "field": "price",
        "message": "\"price\" must be a positive number",
        "type": "number.positive"
      }
    ],
    "received": ["email", "price", "name"]
  },
  "requestId": "req_abc123"
}
```

## Validación sin Middleware

Para validar datos directamente (sin Express):

```javascript
const { validateData } = require('../../../shared/middleware/validator');

const result = validateData(createProductSchema, productData);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // result.errors: [{ field, message, type }, ...]
} else {
  console.log('Valid data:', result.value);
  // result.value: datos sanitizados
}
```

## Opciones Avanzadas

### Opciones Personalizadas

```javascript
const { validateBody } = require('../../../shared/middleware/validator');

router.post(
  '/products',
  validateBody(productSchema, {
    abortEarly: true, // Detener en el primer error
    stripUnknown: false, // No remover campos desconocidos
    allowUnknown: true, // Permitir campos no en el schema
  }),
  handler
);
```

### Context en Validación

```javascript
const productSchema = Joi.object({
  id: Joi.when('$isUpdate', {
    is: true,
    then: Joi.forbidden(),
    otherwise: Joi.required(),
  }),
  name: Joi.string().required(),
});

// En el middleware
router.put(
  '/products/:id',
  (req, res, next) => {
    req.validationContext = { isUpdate: true };
    next();
  },
  validateBody(productSchema),
  handler
);
```

## Integración con Error Handling

El sistema de validación usa `ValidationError` que es capturado automáticamente:

```javascript
// shared/middleware/validator.js lanza:
throw new ValidationError('Datos de entrada inválidos', {
  source: 'body',
  errors: [...],
  received: [...]
});

// shared/middleware/error-handler.js captura y formatea:
{
  status: 'error',
  message: 'Datos de entrada inválidos',
  metadata: { ... },
  requestId: '...'
}
```

## Mejores Prácticas

### ✅ Hacer

1. **Usar schemas reutilizables**

   ```javascript
   const { commonSchemas } = require('../../../shared/middleware/validator');

   const schema = Joi.object({
     email: commonSchemas.email.required(),
     price: commonSchemas.price.required(),
   });
   ```

2. **Validar siempre antes de procesar**

   ```javascript
   router.post(
     '/users',
     validateBody(createUserSchema), // ✅ Primero validar
     authenticate, // Luego otros middleware
     createUserHandler
   );
   ```

3. **Usar defaults para campos opcionales**

   ```javascript
   page: Joi.number().min(1).default(1),
   limit: Joi.number().min(1).max(100).default(20),
   ```

4. **Sanitizar datos automáticamente**

   ```javascript
   email: Joi.string().email().lowercase().trim(),
   ```

5. **Validar params de URL también**
   ```javascript
   router.get('/:id', validateParams(schemas.idParam), ...);
   ```

### ❌ Evitar

1. **No validar dentro del handler**

   ```javascript
   // ❌ Malo
   async (req, res) => {
     if (!req.body.email) return res.status(400).json({ error: 'Email required' });
     // ...
   }

   // ✅ Bueno
   router.post('/', validateBody(schema), async (req, res) => { ... });
   ```

2. **No duplicar validaciones**

   ```javascript
   // ❌ Malo
   const schema1 = Joi.object({ email: Joi.string().email() });
   const schema2 = Joi.object({ email: Joi.string().email() });

   // ✅ Bueno
   const emailField = commonSchemas.email;
   const schema1 = Joi.object({ email: emailField });
   const schema2 = Joi.object({ email: emailField });
   ```

3. **No ignorar errores de validación**

   ```javascript
   // ❌ Malo
   const { error, value } = schema.validate(data);
   // Usar 'value' sin verificar 'error'

   // ✅ Bueno - usar middleware que maneja errores
   validateBody(schema);
   ```

## Testing

```javascript
const { validateData, schemas } = require('../../../shared/middleware/validator');

describe('User validation', () => {
  it('should validate correct user data', () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123',
      name: 'John Doe',
    };

    const result = validateData(schemas.createUser, userData);

    expect(result.valid).toBe(true);
    expect(result.value.email).toBe('test@example.com'); // Lowercase automático
  });

  it('should reject invalid email', () => {
    const userData = {
      email: 'invalid-email',
      password: 'SecurePass123',
      name: 'John Doe',
    };

    const result = validateData(schemas.createUser, userData);

    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('email');
  });
});
```

## Referencias

- Implementación: `shared/middleware/validator.js`
- Joi Documentation: https://joi.dev/api/
- Error Handling: `shared/ERROR_HANDLING.md`
- Logging: `shared/LOGGING_GUIDE.md`
