# Test Quick Start Guide

## Running Tests

### Test All Services

```bash
./scripts/test-all.sh
```

### Test Individual Service

```bash
cd microservices/[service-name]
npm test
```

### Test with Watch Mode

```bash
cd microservices/[service-name]
npm run test:watch
```

## Services with 100% Passing Tests ✅

- **order-service** (130 tests)
- **wishlist-service** (105 tests)
- **contact-service** (105 tests)
- **review-service** (90 tests)

## Test Coverage by Service

| Service           | Tests | Status                 |
| ----------------- | ----- | ---------------------- |
| order-service     | 130   | ✅ 100% passing        |
| wishlist-service  | 105   | ✅ 100% passing        |
| contact-service   | 105   | ✅ 100% passing        |
| review-service    | 90    | ✅ 100% passing        |
| cart-service      | 166   | ⚠️ 165 passing (99.4%) |
| api-gateway       | 242   | ⚠️ 206 passing (85.1%) |
| product-service   | 222   | ⚠️ 162 passing (73.0%) |
| auth-service      | 125   | ⚠️ 108 passing (86.4%) |
| user-service      | 118   | ⚠️ 103 passing (87.3%) |
| promotion-service | -     | ❌ Needs work          |

## Quick Commands

```bash
# Test everything
./scripts/test-all.sh

# Test specific service
cd microservices/wishlist-service && npm test

# Test with coverage details
npm test -- --coverage

# Watch mode for TDD
npm run test:watch

# Run specific test file
npm test -- src/__tests__/unit/jwt.test.js

# Verbose output
npm test -- --verbose
```

## Recently Added Test Configurations

- ✨ **wishlist-service** - Full test suite (105 tests, 100% passing)
- ✨ **contact-service** - Full test suite (105 tests, 100% passing)
- ✨ **review-service** - Full test suite (90 tests, 100% passing)
- ✨ **api-gateway** - Test infrastructure added (242 tests, 85% passing)

## Files Added/Modified

### Each Service Now Has:

1. `jest.setup.js` - Test environment configuration
2. `package.json` - Updated with test scripts and Jest config
3. Test dependencies installed (jest, supertest, @types/jest)

### Example Test Commands Per Service:

```bash
# Wishlist Service
cd microservices/wishlist-service
npm test                    # 105 tests, all passing ✅
npm run test:watch          # Watch mode

# Contact Service
cd microservices/contact-service
npm test                    # 105 tests, all passing ✅

# Review Service
cd microservices/review-service
npm test                    # 90 tests, all passing ✅

# API Gateway
cd microservices/api-gateway
npm test                    # 242 tests, 206 passing ⚠️
```

## Total Test Coverage

- **Total Services**: 10 microservices
- **Total Tests**: 1,103+ tests
- **Overall Pass Rate**: ~88%
- **Services with 100% Pass**: 4 services

## Next Steps

1. Fix remaining test failures in api-gateway
2. Fix test failures in product-service
3. Implement tests for promotion-service
4. Increase coverage in services below 70%

## Documentation

See `TEST_CONFIGURATION_COMPLETE.md` for full details.
