# 🛡️ RESILIENCE GUIDE - Flores Victoria

**Last Updated**: December 20, 2025  
**Status**: ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Circuit Breaker Pattern](#circuit-breaker-pattern)
3. [Retry Mechanisms](#retry-mechanisms)
4. [Graceful Degradation](#graceful-degradation)
5. [Health Checks](#health-checks)
6. [Error Handling](#error-handling)

---

## Overview

Flores Victoria implements comprehensive resilience patterns to ensure system reliability even when dependencies fail.

### Key Patterns

1. **Circuit Breaker**: Prevent cascading failures
2. **Retry with Backoff**: Handle transient errors
3. **Fallback**: Graceful degradation
4. **Health Checks**: Proactive monitoring
5. **Timeouts**: Prevent indefinite hangs

---

## Circuit Breaker Pattern

### Implementation

```javascript
// microservices/shared/middleware/circuit-breaker.js
const circuitBreaker = require('opossum');

const options = {
  timeout: 3000, // 3 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30 seconds
};

const breaker = new circuitBreaker(asyncFunction, options);

breaker.on('open', () => {
  logger.warn('Circuit breaker opened');
});

breaker.on('halfOpen', () => {
  logger.info('Circuit breaker half-open');
});

module.exports = breaker;
```

### Usage

```javascript
try {
  const result = await breaker.fire(params);
} catch (error) {
  // Fallback logic
  return defaultResponse;
}
```

---

## Retry Mechanisms

### Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await sleep(delay);
    }
  }
}

// Usage
const result = await retryWithBackoff(() => apiCall());
```

---

## Graceful Degradation

### Fallback Strategies

```javascript
// Primary: Database
// Fallback 1: Cache
// Fallback 2: Static data

async function getProducts() {
  try {
    return await database.getProducts();
  } catch (error) {
    logger.warn('Database unavailable, using cache');

    try {
      return await cache.getProducts();
    } catch (cacheError) {
      logger.error('Cache unavailable, using static data');
      return STATIC_PRODUCTS;
    }
  }
}
```

---

## Health Checks

### Endpoint Implementation

```javascript
app.get('/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'UP',
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      memory: checkMemory(),
    },
  };

  const isHealthy = Object.values(checks.checks).every((c) => c.status === 'UP');

  res.status(isHealthy ? 200 : 503).json(checks);
});
```

### Liveness & Readiness

```javascript
// Liveness: Is the service alive?
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness: Can the service accept traffic?
app.get('/health/ready', async (req, res) => {
  const ready = await checkDependencies();
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not ready' });
});
```

---

## Error Handling

### Standardized Error Response

```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

// Error handler middleware
function errorHandler(err, req, res, next) {
  const { statusCode = 500, message, code } = err;

  logger.error({
    error: message,
    code,
    stack: err.stack,
    correlation_id: req.correlationId,
  });

  res.status(statusCode).json({
    error: true,
    message: err.isOperational ? message : 'Internal server error',
    code,
  });
}
```

---

## Best Practices

1. **Always Set Timeouts**: Prevent indefinite waits
2. **Implement Circuit Breakers**: For external services
3. **Use Retry with Backoff**: For transient errors
4. **Provide Fallbacks**: Graceful degradation
5. **Monitor Health**: Proactive alerts
6. **Handle Errors Gracefully**: User-friendly messages
7. **Log Extensively**: For troubleshooting

---

## Checklist

- [ ] Circuit breakers configured for external services
- [ ] Retry logic with exponential backoff
- [ ] Fallback strategies defined
- [ ] Health check endpoints implemented
- [ ] Error handling standardized
- [ ] Timeouts configured
- [ ] Graceful shutdown implemented
- [ ] Connection pools configured
- [ ] Rate limiting enabled
- [ ] Monitoring alerts setup

