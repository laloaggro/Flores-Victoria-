module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/__tests__/**', '!src/server.js'],
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
