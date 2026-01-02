module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/__tests__/**',
    // Excluir archivos legacy/no utilizados
    '!src/server.js',
    '!src/server.simple.js',
    '!src/app.js',
    '!src/config/sentry.js',
    '!src/data/seed.js',
    '!src/data/update-images.js',
    '!src/data/initial-products.js',
    '!src/middlewares/audit.js',
    '!src/controllers/productController.simple.js',
    '!src/routes/products.simple.js',
    '!src/routes/admin.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  // Configuración de resolución de módulos
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    // Mapear las diferentes variantes de rutas relativas a shared
    '^../../../shared/(.*)$': '<rootDir>/../shared/$1',
    '^../../shared/(.*)$': '<rootDir>/../shared/$1',
    '^../shared/(.*)$': '<rootDir>/../shared/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  verbose: true,
};
