# Validation Middleware - Flores Victoria

## Descripción

Sistema unificado de validación de entrada usando **Joi** para todos los microservicios. Proporciona validación consistente, mensajes de error estandarizados y sanitización automática de datos.

## Instalación

Joi ya está instalado en todos los servicios. Si necesitas agregarlo a un nuevo servicio:

```bash
npm install joi@^17.11.0
```

## Uso Básico

### 1. Importar el Middleware

```javascript
const { validateBody, validateQuery, validateParams } = require('../../shared/middleware/validation');
const { createOrderSchema } = require('./validators/orderSchemas');
```

### 2. Aplicar en Rutas

```javascript
const express = require('express');
const router = express.Router();

// Validar body en POST
router.post('/orders', validateBody(createOrderSchema), orderController.create);

// Validar query params en GET
router.get('/orders', validateQuery(orderFiltersSchema), orderController.list);

// Validar path params
router.get('/orders/:id', validateParams(orderIdSchema), orderController.getById);
```

## Schemas por Servicio

### Auth Service

Ubicación: `microservices/auth-service/src/validators/authSchemas.js`

**Schemas disponibles:**
- `registerSchema` - Registro de usuario
- `loginSchema` - Login
- `googleAuthSchema` - Login con Google
- `changePasswordSchema` - Cambio de contraseña
- `updateProfileSchema` - Actualizar perfil

**Ejemplo:**
```javascript
const { validateBody } = require('../../shared/middleware/validation');
const { registerSchema, loginSchema } = require('./validators/authSchemas');

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
```

### Product Service

Ubicación: `microservices/product-service/src/middleware/validation.js`

**Schemas disponibles:**
- `productSchema` - Crear/actualizar producto
- `filterSchema` - Filtros de búsqueda
- `validateProductId` - Validar ID

**Ejemplo:**
```javascript
const { validateProduct, validateFilters } = require('./middleware/validation');

router.post('/products', validateProduct, productController.create);
router.get('/products', validateFilters, productController.list);
```

### Order Service

Ubicación: `microservices/order-service/src/validators/orderSchemas.js`

**Schemas disponibles:**
- `createOrderSchema` - Crear orden
- `updateOrderSchema` - Actualizar orden
- `orderFiltersSchema` - Filtros de búsqueda
- `rateOrderSchema` - Calificar orden

**Ejemplo:**
```javascript
const { validateBody, validateQuery } = require('../../shared/middleware/validation');
const { createOrderSchema, updateOrderSchema } = require('./validators/orderSchemas');

router.post('/orders', validateBody(createOrderSchema), orderController.create);
router.put('/orders/:id', validateBody(updateOrderSchema), orderController.update);
```

### Cart Service

Ubicación: `microservices/cart-service/src/validators/cartSchemas.js`

**Schemas disponibles:**
- `addItemSchema` - Agregar item al carrito
- `updateQuantitySchema` - Actualizar cantidad
- `applyCouponSchema` - Aplicar cupón

### Contact Service

Ubicación: `microservices/contact-service/src/validators/contactSchemas.js`

**Schemas disponibles:**
- `createContactSchema` - Crear contacto
- `updateContactSchema` - Actualizar contacto
- `contactFiltersSchema` - Filtros de búsqueda

### Review Service

Ubicación: `microservices/review-service/src/validators/reviewSchemas.js`

**Schemas disponibles:**
- `createReviewSchema` - Crear reseña
- `updateReviewSchema` - Actualizar reseña
- `reviewFiltersSchema` - Filtros de búsqueda
- `respondToReviewSchema` - Responder a reseña

### User Service

Ubicación: `microservices/user-service/src/validators/userSchemas.js`

**Schemas disponibles:**
- `createUserSchema` - Crear usuario
- `updateUserSchema` - Actualizar usuario
- `userFiltersSchema` - Filtros de búsqueda
- `addAddressSchema` - Agregar dirección

### Wishlist Service

Ubicación: `microservices/wishlist-service/src/validators/wishlistSchemas.js`

**Schemas disponibles:**
- `addItemSchema` - Agregar item
- `shareWishlistSchema` - Compartir wishlist

## Schemas Comunes Reutilizables

El módulo compartido incluye schemas comunes que puedes usar:

```javascript
const { commonSchemas } = require('../../shared/middleware/validation');

// Ejemplos de schemas comunes
commonSchemas.id           // ID genérico
commonSchemas.mongoId      // MongoDB ObjectId
commonSchemas.uuid         // UUID
commonSchemas.email        // Email válido
commonSchemas.password     // Password seguro (min 8, uppercase, lowercase, number)
commonSchemas.phone        // Teléfono internacional
commonSchemas.url          // URL válida
commonSchemas.price        // Precio en centavos
commonSchemas.quantity     // Cantidad (1-999)
commonSchemas.address      // Dirección completa
commonSchemas.pagination   // Paginación (page, limit, sort, order)
```

**Ejemplo de uso:**
```javascript
const { Joi, commonSchemas } = require('../../shared/middleware/validation');

const userSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  phone: commonSchemas.phone.optional(),
  addresses: Joi.array().items(commonSchemas.address).max(5),
});
```

## Validadores Comunes

Middleware pre-configurado para validaciones frecuentes:

```javascript
const { commonValidators } = require('../../shared/middleware/validation');

// Validar ID en params
router.get('/products/:id', commonValidators.id, controller.getById);

// Validar MongoDB ObjectId
router.get('/orders/:id', commonValidators.mongoId, controller.getById);

// Validar paginación
router.get('/products', commonValidators.pagination, controller.list);
```

## Crear Schemas Personalizados

### Schema Simple

```javascript
const { Joi } = require('../../shared/middleware/validation');

const mySchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  age: Joi.number().integer().min(18).max(120).required(),
  email: Joi.string().email().required(),
  status: Joi.string().valid('active', 'inactive').default('active'),
});
```

### Schema con Validaciones Condicionales

```javascript
const orderSchema = Joi.object({
  paymentMethod: Joi.string().valid('card', 'cash').required(),
  cardNumber: Joi.string().when('paymentMethod', {
    is: 'card',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  cardCVV: Joi.string().when('paymentMethod', {
    is: 'card',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});
```

### Schema con Referencias

```javascript
const passwordChangeSchema = Joi.object({
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords must match',
  }),
});
```

### Schema con Validación Personalizada

```javascript
const customSchema = Joi.object({
  email: Joi.string().email().required(),
  domain: Joi.string().custom((value, helpers) => {
    if (!value.endsWith('.com')) {
      return helpers.error('any.invalid');
    }
    return value;
  }).messages({
    'any.invalid': 'Domain must end with .com',
  }),
});
```

## Respuestas de Error

### Formato de Error Estándar

```json
{
  "status": "fail",
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email",
      "type": "string.email"
    },
    {
      "field": "password",
      "message": "Password must contain at least 8 characters, one uppercase, one lowercase, and one number",
      "type": "string.pattern.base"
    }
  ],
  "receivedFields": ["email", "password", "name"]
}
```

## Opciones de Validación

Puedes pasar opciones adicionales al middleware:

```javascript
validateBody(schema, {
  abortEarly: true,    // Detener en el primer error
  stripUnknown: false, // No eliminar campos desconocidos
  convert: false,      // No convertir tipos automáticamente
})
```

## Mejores Prácticas

### 1. Siempre Validar Entrada de Usuario

```javascript
// ✅ BIEN
router.post('/users', validateBody(createUserSchema), controller.create);

// ❌ MAL - Sin validación
router.post('/users', controller.create);
```

### 2. Usar Schemas Comunes Cuando Sea Posible

```javascript
// ✅ BIEN - Reutilizar
const { commonSchemas } = require('../../shared/middleware/validation');
const schema = Joi.object({
  email: commonSchemas.email,
  phone: commonSchemas.phone,
});

// ❌ MAL - Duplicar lógica
const schema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
});
```

### 3. Validar Todos los Orígenes de Datos

```javascript
// Body, Query y Params
router.put(
  '/orders/:id',
  validateParams(orderIdSchema),      // Path params
  validateQuery(orderQuerySchema),    // Query string
  validateBody(updateOrderSchema),    // Request body
  controller.update
);
```

### 4. Mensajes de Error Claros

```javascript
const schema = Joi.object({
  age: Joi.number().min(18).required().messages({
    'number.min': 'You must be at least 18 years old',
    'any.required': 'Age is required',
  }),
});
```

### 5. Sanitización Automática

```javascript
// El middleware automáticamente:
// - Elimina espacios: "  email@test.com  " → "email@test.com"
// - Convierte tipos: "123" → 123
// - Normaliza: "EMAIL@TEST.COM" → "email@test.com"
```

## Testing de Validación

### Test de Schema

```javascript
const { createUserSchema } = require('./validators/userSchemas');

describe('User Schema Validation', () => {
  it('should accept valid user data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'SecurePass123',
      name: 'John Doe',
    };
    
    const { error } = createUserSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'SecurePass123',
      name: 'John Doe',
    };
    
    const { error } = createUserSchema.validate(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain('email');
  });
});
```

### Test de Endpoint con Validación

```javascript
const request = require('supertest');
const app = require('../app');

describe('POST /api/users', () => {
  it('should return 400 for invalid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'invalid', password: '123' });
    
    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.errors).toBeDefined();
  });
});
```

## Troubleshooting

### Error: "Cannot find module 'joi'"

```bash
# Instalar Joi en el servicio
cd microservices/your-service
npm install joi@^17.11.0
```

### Error: "Cannot find module '../../shared/middleware/validation'"

```bash
# Verificar que la ruta sea correcta según la estructura del servicio
# Servicios en /microservices/service-name/src:
const { validateBody } = require('../../shared/middleware/validation');

# Servicios en /microservices/service-name/src/routes:
const { validateBody } = require('../../../shared/middleware/validation');
```

### Validación No Se Ejecuta

```javascript
// Asegurarte de que el middleware esté ANTES del controller
router.post('/users',
  validateBody(schema),  // ← Debe ir primero
  controller.create      // ← Después
);
```

## Referencias

- Joi Documentation: https://joi.dev/api/
- Schemas compartidos: `microservices/shared/middleware/validation.js`
- Ejemplos por servicio: `microservices/*/src/validators/`

## Changelog

- **v1.0.0** (2025-01-11): Sistema inicial de validación con Joi
  - Middleware compartido en `shared/middleware/validation.js`
  - Schemas comunes reutilizables
  - Validadores pre-configurados
  - Schemas para 8 microservicios
  - Documentación completa
