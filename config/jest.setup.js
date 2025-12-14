/**
 * @fileoverview Jest Setup File
 * @description Configuración global que se ejecuta antes de cada archivo de test
 * @author Flores Victoria Team
 * @version 2.0.0
 */

// Timeout extendido para tests de integración
jest.setTimeout(30000);

// Variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.MONGODB_TEST_URI =
  process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/flores-test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.API_GATEWAY_URL = 'http://localhost:3000';
process.env.LOG_LEVEL = 'error';

// Mock de console para tests más limpios
global.console = {
  ...console,
  // Comentar para ver logs durante debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Mantener warnings y errores
  warn: console.warn,
  error: console.error,
};

// Setup global
beforeAll(() => {
  // Silenciar advertencias de deprecación en tests
  process.removeAllListeners('warning');
});

// Cleanup después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

// Cleanup global
afterAll(() => {
  // Cleanup global si es necesario
});

// Custom matchers extendidos
expect.extend({
  /**
   * Verifica que una promoción sea válida
   */
  toBeValidPromotion(received) {
    const pass = received && received.code && received.type && received.value !== undefined;

    return {
      message: () =>
        pass
          ? `expected ${JSON.stringify(received)} not to be a valid promotion`
          : `expected ${JSON.stringify(received)} to be a valid promotion with code, type, and value`,
      pass,
    };
  },

  /**
   * Verifica respuesta de error de API
   */
  toBeApiError(received, statusCode, message) {
    const pass =
      received &&
      received.status === 'error' &&
      (statusCode === undefined || received.statusCode === statusCode) &&
      (message === undefined || received.message?.includes(message));

    return {
      message: () =>
        pass
          ? `expected response not to be API error with status ${statusCode}`
          : `expected API error with status ${statusCode} and message containing "${message}", got: ${JSON.stringify(received)}`,
      pass,
    };
  },

  /**
   * Verifica respuesta exitosa de API
   */
  toBeSuccessResponse(received) {
    const pass = received && (received.status === 'success' || received.success === true);

    return {
      message: () =>
        pass
          ? `expected response not to be a success response`
          : `expected success response, got: ${JSON.stringify(received)}`,
      pass,
    };
  },

  /**
   * Verifica error de validación en campo específico
   */
  toHaveValidationError(received, field) {
    const hasError =
      received &&
      received.errors &&
      Array.isArray(received.errors) &&
      received.errors.some(
        (err) => err.field === field || err.path === field || err.param === field
      );

    return {
      message: () =>
        hasError
          ? `expected response not to have validation error for field "${field}"`
          : `expected validation error for field "${field}", got: ${JSON.stringify(received.errors)}`,
      pass: hasError,
    };
  },
});

// ============================================
// Helpers globales para tests
// ============================================

/**
 * Crear usuario de test
 * @param {Object} overrides - Propiedades a sobrescribir
 * @returns {Object} Usuario de test
 */
global.createTestUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Crear token JWT de test
 * @param {Object} payload - Payload adicional
 * @returns {string} Token JWT
 */
global.createTestToken = (payload = {}) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    {
      userId: 1,
      email: 'test@example.com',
      role: 'user',
      ...payload,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Crear mock de request Express
 * @param {Object} overrides - Propiedades a sobrescribir
 * @returns {Object} Request mock
 */
global.createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ip: '127.0.0.1',
  method: 'GET',
  path: '/',
  user: null,
  ...overrides,
});

/**
 * Crear mock de response Express
 * @returns {Object} Response mock con funciones jest
 */
global.createMockResponse = () => {
  const res = {
    statusCode: 200,
    data: null,
    headers: {},
  };

  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });

  res.json = jest.fn((data) => {
    res.data = data;
    return res;
  });

  res.send = jest.fn((data) => {
    res.data = data;
    return res;
  });

  res.setHeader = jest.fn((key, value) => {
    res.headers[key] = value;
    return res;
  });

  res.cookie = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  res.redirect = jest.fn(() => res);
  res.end = jest.fn(() => res);

  return res;
};

/**
 * Crear producto de test
 * @param {Object} overrides - Propiedades a sobrescribir
 * @returns {Object} Producto de test
 */
global.createTestProduct = (overrides = {}) => ({
  _id: 'test-product-id',
  name: 'Rosa Roja',
  description: 'Hermosa rosa roja',
  price: 25000,
  category: 'rosas',
  stock: 100,
  images: ['rosa-roja.jpg'],
  active: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Crear orden de test
 * @param {Object} overrides - Propiedades a sobrescribir
 * @returns {Object} Orden de test
 */
global.createTestOrder = (overrides = {}) => ({
  _id: 'test-order-id',
  userId: 1,
  items: [
    {
      productId: 'test-product-id',
      name: 'Rosa Roja',
      quantity: 2,
      price: 25000,
    },
  ],
  total: 50000,
  status: 'pending',
  shippingAddress: {
    street: 'Calle Test 123',
    city: 'Santiago',
    region: 'RM',
  },
  createdAt: new Date().toISOString(),
  ...overrides,
});

// ============================================
// Mocks de servicios externos
// ============================================

// Prevenir conexiones reales a bases de datos en tests unitarios
if (!process.env.ALLOW_DB_CONNECTIONS) {
  jest.mock('mongoose', () => ({
    connect: jest.fn().mockResolvedValue({}),
    disconnect: jest.fn().mockResolvedValue({}),
    connection: {
      readyState: 1,
      on: jest.fn(),
      once: jest.fn(),
      close: jest.fn(),
    },
    Schema: jest.fn().mockImplementation(() => ({
      index: jest.fn(),
      virtual: jest.fn().mockReturnThis(),
      get: jest.fn(),
      methods: {},
      statics: {},
      pre: jest.fn(),
      post: jest.fn(),
    })),
    model: jest.fn().mockImplementation(() => ({
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      create: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
    })),
  }));
}

console.log('🧪 Jest configurado correctamente');
