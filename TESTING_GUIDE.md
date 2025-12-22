# 🧪 TESTING GUIDE - Flores Victoria

**Last Updated**: December 20, 2025  
**Status**: ✅ Production Ready  
**Tests**: 1,103 passing | **Coverage**: 25.63%

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Coverage Goals](#coverage-goals)
6. [Best Practices](#best-practices)
7. [CI/CD Integration](#cicd-integration)

---

## Overview

Flores Victoria uses a comprehensive testing strategy covering unit, integration, and end-to-end tests. Our current baseline is **25.63% code coverage** with a target of **30%+**.

### Test Stack

- **Framework**: Jest 29.x
- **API Testing**: Supertest
- **E2E**: Playwright
- **Load Testing**: k6
- **Coverage Reporter**: Istanbul/nyc

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \ E2E Tests (5%)
      /    \
     /______\
    /        \
   / Integration Tests (20%)
  /____________\
 /              \
/ Unit Tests (75%)
/_________________\
```

### Test Categories

| Type | Coverage | Duration | Tools |
|------|----------|----------|-------|
| **Unit** | 75% | <1s | Jest |
| **Integration** | 20% | 5-30s | Jest + Supertest |
| **E2E** | 5% | 30-60s | Playwright |
| **Load** | On-demand | 2-5m | k6 |

---

## Running Tests

### Quick Start

```bash
# Run all tests with coverage
npm run test:coverage

# View coverage report
bash scripts/test-coverage-summary.sh

# Run specific service tests
cd microservices/auth-service && npm test

# Run tests in watch mode
npm test -- --watch

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Test Commands

```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# E2E debug
npm run test:e2e:debug

# Coverage report HTML
open coverage/index.html

# Continuous integration
npm run test:ci
```

---

## Test Structure

### Microservices Test Layout

```
microservices/
├── auth-service/
│   ├── __tests__/
│   │   ├── routes/
│   │   │   └── auth.test.js
│   │   ├── controllers/
│   │   │   └── authController.test.js
│   │   ├── middleware/
│   │   │   └── auth.test.js
│   │   └── services/
│   │       └── tokenService.test.js
│   ├── src/
│   └── package.json
```

### Test File Naming

- **Unit Tests**: `*.test.js` or `*.spec.js`
- **Integration Tests**: `*.integration.test.js`
- **E2E Tests**: `*.e2e.test.js` or in `tests/e2e/`

### Test Template

```javascript
describe('Auth Service', () => {
  let app;
  let request;

  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('POST /auth/login', () => {
    it('should return 200 with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'correct' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });
});
```

---

## Coverage Goals

### Current Status (December 2024)

| Metric | Current | Target |
|--------|---------|--------|
| Statements | 25.63% | 30% |
| Lines | 25.91% | 30% |
| Functions | 21.36% | 25% |
| Branches | 23.89% | 25% |

### High-Coverage Services

The following services have >70% coverage:

- Promotion Service: 98.21%
- Admin Dashboard Service: 97.82%
- Review Service: 96.29%
- Order Service: 91.66%
- Cart Service: 90.24%

### Low-Coverage Services

Priority areas for improvement:

- Contact Service: <30%
- Payment Service: <30%
- Notification Service: <30%
- Frontend Components: <20%

---

## Best Practices

### 1. Mocking External Dependencies

```javascript
// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  })),
}));

// Mock Database
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  model: jest.fn(() => ({
    findById: jest.fn(),
    save: jest.fn(),
  })),
}));
```

### 2. Test Isolation

```javascript
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  // Reset modules
  jest.resetModules();
});
```

### 3. Async/Await

```javascript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### 4. Error Testing

```javascript
it('should throw on invalid input', async () => {
  await expect(
    authService.validateToken(null)
  ).rejects.toThrow('Invalid token');
});
```

### 5. Integration Testing

```javascript
describe('Auth Integration', () => {
  let server;

  beforeAll(async () => {
    server = await app.listen(3001);
  });

  it('should complete full auth flow', async () => {
    // Register
    const register = await supertest(app)
      .post('/auth/register')
      .send(validUser);

    // Login
    const login = await supertest(app)
      .post('/auth/login')
      .send(validCredentials);

    expect(login.body).toHaveProperty('token');
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test with Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true
```

### Coverage Gates

Tests must meet these minimum thresholds:

- **Statements**: 18%
- **Lines**: 18%
- **Functions**: 18%
- **Branches**: 15%

---

## Troubleshooting

### Common Issues

**1. Module not found in tests**

```bash
# Solution: Check jest.config.js moduleNameMapper
"^@flores-victoria/(.*)$": "<rootDir>/microservices/$1"
```

**2. Database connection timeouts**

```bash
# Solution: Increase timeout
jest.setTimeout(10000); // 10 seconds
```

**3. Async test failures**

```bash
# Solution: Always return promises or use async/await
it('should work', async () => {
  await asyncFunction();
});
```

**4. Mock not working**

```bash
# Solution: Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## Performance Targets

### Test Execution Time

- **Unit Tests**: <5 seconds
- **Integration Tests**: <15 seconds
- **All Tests**: <60 seconds
- **Coverage Report**: <120 seconds

### Coverage Improvement Timeline

- **Current**: 25.63% (December 2024)
- **Target Q1 2025**: 35%
- **Target Q2 2025**: 45%
- **Long-term**: 70%+

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Playwright Testing](https://playwright.dev/)
- [k6 Load Testing](https://k6.io/)

---

## Support

For testing questions:
1. Check this guide
2. Review existing test examples
3. Consult jest.config.js
4. Check TESTING_GUIDE_ADVANCED.md for edge cases

