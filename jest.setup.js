/**
 * 🧪 Jest Setup File
 * Configuración global para todos los tests
 */

// Configurar timeout para tests de integración
jest.setTimeout(30000);

// Mock de variables de entorno
process.env.NODE_ENV = 'test';
process.env.MONGODB_TEST_URI =
  process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/flores-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.API_GATEWAY_URL = 'http://localhost:3000';

// Mock de console para tests más limpios (opcional)
global.console = {
  ...console,
  // Mantener funciones útiles para debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Mantener warnings y errors visibles
  warn: console.warn,
  error: console.error,
};

// Cleanup después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

// Custom matchers (opcional)
expect.extend({
  toBeValidPromotion(received) {
    const pass = received && received.code && received.type && received.value !== undefined;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid promotion`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid promotion with code, type, and value`,
        pass: false,
      };
    }
  },
});

console.log('🧪 Jest configurado correctamente');
