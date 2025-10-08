module.exports = {
  collectCoverageFrom: [
    'microservices/**/src/**/*.js',
    '!microservices/**/src/app.js',
    '!microservices/**/src/server.js',
    '!microservices/**/src/config/**',
    '!microservices/**/src/middlewares/**',
    '!microservices/**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'node',
  testMatch: [
    '**/tests/unit-tests/**/*.test.js'
  ]
};