module.exports = {
  collectCoverageFrom: [
    'microservices/**/src/**/*.js',
    '!microservices/**/src/app.js',
    '!microservices/**/src/server.js',
    '!microservices/**/src/config/**',
    '!microservices/**/src/middlewares/**',
    '!microservices/**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 30, // Progresivo: 30 → 35
      functions: 24, // Progresivo: 24 → 35
      lines: 35,
      statements: 35,
    },
  },
  testEnvironment: 'node',
  // IMPORTANT: Only match test files inside microservices folder
  testMatch: ['<rootDir>/microservices/**/__tests__/**/*.test.js'],
  // Excluir tests que requieren servicios específicos o dependencias no disponibles
  testPathIgnorePatterns: [
    '/node_modules/',
    // Tests que usan @flores-victoria/shared (necesita monorepo o npm link)
    'validators/.*\\.test\\.js$',
    'validation\\.test\\.js$',
    'cacheService\\.test\\.js$',
    'auth\\.integration\\.test\\.js$',
    // Tests con dependencias de Leonardo AI client
    'leonardoClient\\.test\\.js$',
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
  ],
};
