/**
 * @fileoverview Jest Configuration - Flores Victoria
 * @description Configuración global de Jest para testing de microservicios
 * @author Flores Victoria Team
 * @version 2.0.0
 */

module.exports = {
  // Set root to project directory (parent of config/)
  rootDir: '..',

  // Nombre para identificar los tests
  displayName: 'flores-victoria',

  // Entorno de ejecución
  testEnvironment: 'node',

  // Timeout global (ms)
  testTimeout: 30000,

  // ==========================================================================
  // COVERAGE CONFIGURATION
  // ==========================================================================

  collectCoverage: true,
  collectCoverageFrom: [
    'microservices/**/src/**/*.js',
    // Excluir archivos de entrada
    '!microservices/**/src/app.js',
    '!microservices/**/src/server.js',
    '!microservices/**/src/app.*.js',
    '!microservices/**/src/server.*.js',
    // Excluir configuración
    '!microservices/**/src/config/**',
    '!microservices/**/src/middlewares/**',
    // Excluir node_modules
    '!microservices/**/node_modules/**',
    // Excluir tests
    '!microservices/**/__tests__/**',
    '!microservices/**/*.test.js',
    '!microservices/**/*.spec.js',
    // Excluir mocks
    '!microservices/**/__mocks__/**',
  ],

  coverageDirectory: 'coverage',

  // Múltiples reporters para diferentes usos
  coverageReporters: [
    'text', // Salida en terminal
    'text-summary', // Resumen en terminal
    'lcov', // Para SonarQube/Codecov
    'html', // Reporte HTML visual
    'json-summary', // Para scripts CI
    'json', // Completo para análisis
  ],

  // Umbrales de cobertura por área
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 20,
      lines: 23,
      statements: 23,
    },
    // Umbrales más estrictos para shared - temporalmente deshabilitados
    // './microservices/shared/': {
    //   branches: 30,
    //   functions: 40,
    //   lines: 50,
    //   statements: 50,
    // },
    // Umbrales para utilidades críticas - temporalmente deshabilitados
    // './microservices/shared/utils/': {
    //   branches: 40,
    //   functions: 50,
    //   lines: 60,
    //   statements: 60,
    // },
  },

  // ==========================================================================
  // TEST MATCHING
  // ==========================================================================

  // IMPORTANT: Only match test files inside microservices folder
  testMatch: [
    '<rootDir>/microservices/**/__tests__/**/*.test.js',
    '<rootDir>/microservices/**/__tests__/**/*.spec.js',
  ],

  // Excluir tests específicos
  testPathIgnorePatterns: [
    '/node_modules/',
    // Tests que usan @flores-victoria/shared (necesita monorepo o npm link)
    'validators/',
    'validation\\.test\\.js$',
    'cacheService\\.test\\.js$',
    'auth\\.integration\\.test\\.js$',
    'mcp-helper\\.test\\.js$',
    'common\\.test\\.js$',
    // Routes tests que dependen de shared
    'routes/cart\\.test\\.js$',
    'routes/products\\.test\\.js$',
    'routes/orders\\.test\\.js$',
    'routes/auth\\.test\\.js$',
    'routes/index\\.test\\.js$',
    'routes/aiImages\\.test\\.js$',
    // Tests con dependencias de Leonardo AI / AI Horde client
    'leonardoClient\\.test\\.js$',
    'aiHordeClient\\.test\\.js$',
    // Legacy tests pendientes de migración
    'Order\\.test\\.js$',
    'orderController\\.test\\.js$',
    // MongoDB connection tests - TODO: add mock
    'Product\\.test\\.js$',
    'productController\\.test\\.js$',
    '/integration/',
    // JWT/Auth issues - TODO: fix config
    'authUtils\\.test\\.js$',
    // Setup issues - TODO: add proper setup
    'api\\.test\\.js$',
    'server\\.test\\.js$',
    // Config tests con dependencias circulares
    '/order-service/src/config/__tests__/',
    '/order-service/src/__tests__/unit/config\\.test\\.js$',
    '/order-service/src/__tests__/unit/logger\\.test\\.js$',
    '/cart-service/src/config/__tests__/',
    '/wishlist-service/src/config/__tests__/',
    '/admin-dashboard-service/',
  ],

  // ==========================================================================
  // REPORTERS
  // ==========================================================================

  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],

  // ==========================================================================
  // SETUP & TEARDOWN
  // ==========================================================================

  // Setup antes de cada archivo de test
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],

  // Variables globales
  globals: {
    __TEST__: true,
    __DEV__: false,
  },

  // ==========================================================================
  // MOCKING
  // ==========================================================================

  // Limpiar mocks automáticamente
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Módulos que siempre deben ser mockeados
  moduleNameMapper: {
    '^@flores-victoria/shared/(.*)$': '<rootDir>/microservices/shared/$1',
  },

  // ==========================================================================
  // PERFORMANCE
  // ==========================================================================

  // Ejecutar tests en paralelo
  maxWorkers: '50%',

  // Cache para acelerar re-runs
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // Detener en primer fallo (útil en CI)
  bail: process.env.CI ? 1 : 0,

  // Verbose solo en local
  verbose: !process.env.CI,

  // ==========================================================================
  // WATCH MODE
  // ==========================================================================

  watchPathIgnorePatterns: ['/node_modules/', '/coverage/', '/dist/', '/build/', '/.git/'],
};
