# 🧪 Testing Guide - Flores Victoria

## Tabla de Contenidos

- [Configuración](#configuración)
- [Ejecutar Tests](#ejecutar-tests)
- [Cobertura de Tests](#cobertura-de-tests)
- [Escribir Tests](#escribir-tests)
- [Buenas Prácticas](#buenas-prácticas)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

---

## Configuración

### Stack de Testing

- **Jest** v29.x - Framework de testing
- **Supertest** - API testing
- **@shelf/jest-mongodb** - MongoDB in-memory para tests
- **node-mocks-http** - HTTP mocks
- **Codecov** - Coverage reporting

### Instalación

```bash
# Instalar dependencias
npm install

# Instalar dependencias de testing (si es necesario)
npm install --save-dev jest supertest @shelf/jest-mongodb
```

### Configuración de Jest

El proyecto usa `jest.config.js` en la raíz:

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/microservices/**/__tests__/**/*.test.js'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['microservices/**/src/**/*.js', '!**/node_modules/**', '!**/coverage/**'],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Tests que fallan actualmente (se están arreglando)
    '/microservices/product-service/src/__tests__/Product.test.js',
    '/microservices/product-service/src/__tests__/productController.test.js',
    // ... más archivos
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
```

---

## Ejecutar Tests

### Todos los Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con output detallado
npm test -- --verbose

# Ejecutar en modo watch (desarrollo)
npm test -- --watch
```

### Tests Específicos

```bash
# Tests de un servicio específico
npm test -- microservices/cart-service

# Tests de un archivo específico
npm test -- microservices/cart-service/src/__tests__/unit/Cart.test.js

# Tests que coincidan con un patrón
npm test -- --testNamePattern="should create cart"
```

### Con Cobertura

```bash
# Ejecutar tests con reporte de cobertura
npm test -- --coverage

# Cobertura de un servicio específico
npm test -- --coverage microservices/cart-service

# Cobertura en formato HTML
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

---

## Cobertura de Tests

### Estado Actual (Octubre 2025)

**Cobertura Global**: 23.36%  
**Total Tests**: 365 passing

| Servicio             | Cobertura | Tests | Estado       |
| -------------------- | --------- | ----- | ------------ |
| **cart-service**     | 100%      | 82    | ✅ Completo  |
| **order-service**    | 100%      | 37    | ✅ Completo  |
| **contact-service**  | 74%       | 32    | ✅ Bueno     |
| **review-service**   | 100%      | 22    | ✅ Completo  |
| **wishlist-service** | 100%      | 21    | ✅ Completo  |
| **user-service**     | 84%       | -     | � Bueno      |
| **auth-service**     | 67%       | -     | ⚠️ Mejorable |
| **product-service**  | ~15%      | -     | ❌ Bajo      |
| **api-gateway**      | ~10%      | -     | ❌ Bajo      |

### Objetivo

🎯 **Meta**: 60% de cobertura global

**Próximos pasos**:

1. Completar tests de api-gateway (20% → 60%)
2. Aumentar cobertura de product-service (15% → 60%)
3. Mejorar auth-service (67% → 80%)

---

## Escribir Tests

### Estructura de Tests

```
microservices/
└── cart-service/
    └── src/
        ├── __tests__/
        │   ├── unit/              # Tests unitarios
        │   │   ├── Cart.test.js      # Modelo
        │   │   └── cartController.test.js  # Controlador
        │   └── integration/       # Tests de integración
        │       └── cart.api.test.js
        ├── models/
        │   └── Cart.js
        └── controllers/
            └── cartController.js
```

### Test Unitario - Modelo

```javascript
// microservices/cart-service/src/__tests__/unit/Cart.test.js
const Cart = require('../../models/Cart');

describe('Cart Model', () => {
  describe('Constructor', () => {
    it('should create cart with userId', () => {
      const cart = new Cart('user123');

      expect(cart.userId).toBe('user123');
      expect(cart.items).toEqual([]);
      expect(cart.total).toBe(0);
    });
  });

  describe('addItem', () => {
    it('should add item to cart', () => {
      const cart = new Cart('user123');

      cart.addItem({
        productId: 'prod123',
        name: 'Rosas Rojas',
        price: 299.0,
        quantity: 2,
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe('prod123');
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.total).toBe(598.0);
    });

    it('should increase quantity if item exists', () => {
      const cart = new Cart('user123');

      cart.addItem({ productId: 'prod123', price: 299, quantity: 2 });
      cart.addItem({ productId: 'prod123', price: 299, quantity: 3 });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.total).toBe(1495.0);
    });

    it('should throw error if quantity is invalid', () => {
      const cart = new Cart('user123');

      expect(() => {
        cart.addItem({ productId: 'prod123', price: 299, quantity: 0 });
      }).toThrow('Quantity must be at least 1');
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const cart = new Cart('user123');
      cart.addItem({ productId: 'prod123', price: 299, quantity: 2 });

      cart.removeItem('prod123');

      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
    });

    it('should throw error if item not found', () => {
      const cart = new Cart('user123');

      expect(() => {
        cart.removeItem('nonexistent');
      }).toThrow('Item not found in cart');
    });
  });
});
```

### Test Unitario - Controlador

```javascript
// microservices/cart-service/src/__tests__/unit/cartController.test.js
const httpMocks = require('node-mocks-http');
const cartController = require('../../controllers/cartController');
const Cart = require('../../models/Cart');

// Mock del modelo
jest.mock('../../models/Cart');

describe('Cart Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return cart for user', async () => {
      const mockCart = {
        userId: 'user123',
        items: [{ productId: 'prod123', quantity: 2 }],
        total: 598.0,
      };

      Cart.findByUserId = jest.fn().resolves(mockCart);
      req.user = { id: 'user123' };

      await cartController.getCart(req, res);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.cart).toEqual(mockCart);
    });

    it('should return 404 if cart not found', async () => {
      Cart.findByUserId = jest.fn().resolves(null);
      req.user = { id: 'user123' };

      await cartController.getCart(req, res);

      expect(res.statusCode).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      const mockCart = { userId: 'user123', items: [], total: 0 };
      mockCart.addItem = jest.fn();
      mockCart.save = jest.fn().resolves(mockCart);

      Cart.findByUserId = jest.fn().resolves(mockCart);
      req.user = { id: 'user123' };
      req.body = { productId: 'prod123', quantity: 2 };

      await cartController.addToCart(req, res);

      expect(mockCart.addItem).toHaveBeenCalledWith({
        productId: 'prod123',
        quantity: 2,
      });
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.statusCode).toBe(201);
    });
  });
});
```

### Test de Integración - API

```javascript
// microservices/cart-service/src/__tests__/integration/cart.api.test.js
const request = require('supertest');
const app = require('../../app');

describe('Cart API Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Login para obtener token
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'TestPass123!',
    });

    authToken = response.body.data.token;
  });

  describe('GET /api/cart', () => {
    it('should get user cart', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart).toBeDefined();
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/api/cart');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/cart/items', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'prod_123',
          quantity: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toHaveLength(1);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
```

---

## Buenas Prácticas

### 1. Estructura AAA (Arrange-Act-Assert)

```javascript
it('should calculate total correctly', () => {
  // Arrange - Preparar datos
  const cart = new Cart('user123');
  const item = { productId: 'prod123', price: 299, quantity: 2 };

  // Act - Ejecutar acción
  cart.addItem(item);

  // Assert - Verificar resultado
  expect(cart.total).toBe(598.0);
});
```

### 2. Nombres Descriptivos

✅ **Bueno**:

```javascript
it('should throw error when adding item with negative quantity', () => {
  // ...
});
```

❌ **Malo**:

```javascript
it('test 1', () => {
  // ...
});
```

### 3. Un Assert por Test (idealmente)

✅ **Bueno**:

```javascript
it('should set userId correctly', () => {
  const cart = new Cart('user123');
  expect(cart.userId).toBe('user123');
});

it('should initialize items as empty array', () => {
  const cart = new Cart('user123');
  expect(cart.items).toEqual([]);
});
```

❌ **Malo**:

```javascript
it('should initialize cart', () => {
  const cart = new Cart('user123');
  expect(cart.userId).toBe('user123');
  expect(cart.items).toEqual([]);
  expect(cart.total).toBe(0);
  expect(cart.createdAt).toBeDefined();
  // Too many asserts
});
```

### 4. Mocks y Stubs

```javascript
// Mock de dependencia externa
jest.mock('../../services/emailService', () => ({
  sendEmail: jest.fn().resolves(true),
}));

// Stub de fecha para tests consistentes
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-10-15'));
});

afterAll(() => {
  jest.useRealTimers();
});
```

### 5. Cleanup

```javascript
describe('Cart Tests', () => {
  beforeEach(() => {
    // Setup antes de cada test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup después de cada test
    jest.restoreAllMocks();
  });
});
```

---

## CI/CD

### GitHub Actions

El proyecto usa GitHub Actions para ejecutar tests automáticamente:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
```

### Pre-commit Hooks (Husky)

```bash
# .husky/pre-commit
#!/bin/sh
npm test -- --bail --findRelatedTests
```

---

## Troubleshooting

### Tests Fallan con "Cannot find module"

**Solución**:

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Tests de MongoDB Fallan

**Problema**: `MongoMemoryServer timeout`

**Solución**:

```javascript
// jest.config.js
module.exports = {
  // ...
  testTimeout: 30000, // Aumentar timeout
};
```

### Tests Pasan Localmente pero Fallan en CI

**Posibles causas**:

1. Variables de entorno diferentes
2. Diferencias de timezone
3. Dependencias de versión específica

**Solución**:

```javascript
// Usar UTC en tests
process.env.TZ = 'UTC';

// Mock de Date
jest.useFakeTimers();
jest.setSystemTime(new Date('2025-10-15T00:00:00.000Z'));
```

### Cobertura No Se Genera

**Problema**: `--coverage` no genera reporte

**Solución**:

```bash
# Verificar configuración
npm test -- --coverage --verbose

# Verificar jest.config.js
collectCoverageFrom: [
  'microservices/**/src/**/*.js',
  '!**/node_modules/**',
  '!**/coverage/**',
  '!**/__tests__/**'
]
```

---

## Referencias

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

## Comandos Rápidos

```bash
# Tests
npm test                                    # Todos los tests
npm test -- --watch                         # Modo watch
npm test -- --coverage                      # Con cobertura
npm test -- microservices/cart-service      # Servicio específico

# Coverage
npm test -- --coverage --coverageReporters=html
open coverage/index.html

# CI
npm run test:ci                             # Modo CI (coverage + junit)

# Debugging
npm test -- --detectOpenHandles            # Detectar handles abiertos
npm test -- --runInBand                    # Ejecutar en serie (no paralelo)
```

---

**Última actualización**: Octubre 2025  
**Cobertura actual**: 23.36%  
**Objetivo**: 60%
