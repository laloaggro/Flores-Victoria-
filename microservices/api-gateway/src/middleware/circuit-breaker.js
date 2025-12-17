/**
 * Circuit Breaker Middleware for API Gateway
 * Wraps service proxies with circuit breaker protection
 */

const { CircuitBreaker, registry } = require('@flores-victoria/shared/circuit-breaker');

// Default configurations per service type
const DEFAULT_CONFIGS = {
  // Critical services - stricter thresholds
  critical: {
    timeout: 10000, // 10 seconds
    errorThresholdPercentage: 50,
    resetTimeout: 30000, // 30 seconds
    volumeThreshold: 5,
    halfOpenRequests: 2,
  },
  // Standard services
  standard: {
    timeout: 15000, // 15 seconds
    errorThresholdPercentage: 60,
    resetTimeout: 45000, // 45 seconds
    volumeThreshold: 10,
    halfOpenRequests: 3,
  },
  // Non-critical services - more lenient
  nonCritical: {
    timeout: 20000, // 20 seconds
    errorThresholdPercentage: 70,
    resetTimeout: 60000, // 60 seconds
    volumeThreshold: 15,
    halfOpenRequests: 5,
  },
};

// Service type mapping
const SERVICE_TYPES = {
  'auth-service': 'critical',
  'user-service': 'critical',
  'product-service': 'standard',
  'order-service': 'standard',
  'cart-service': 'standard',
  'payment-service': 'critical',
  'shipping-service': 'standard',
  'wishlist-service': 'nonCritical',
  'review-service': 'nonCritical',
  'contact-service': 'nonCritical',
  'notification-service': 'nonCritical',
};

/**
 * Get circuit breaker for a service with appropriate configuration
 */
function getServiceBreaker(serviceName) {
  const serviceType = SERVICE_TYPES[serviceName] || 'standard';
  const config = DEFAULT_CONFIGS[serviceType];
  return registry.get(serviceName, config);
}

/**
 * Create circuit breaker middleware for a service
 * @param {string} serviceName - Name of the service
 * @param {Object} options - Override options
 */
function createCircuitBreakerMiddleware(serviceName, _options = {}) {
  const breaker = getServiceBreaker(serviceName);

  return async (req, res, next) => {
    // Attach breaker state to request for logging
    req.circuitBreakerState = breaker.getState();

    // If circuit is open, return fallback immediately
    if (breaker.state === 'OPEN') {
      const timeSinceFailure = Date.now() - breaker.lastFailureTime;
      const timeUntilRetry = Math.max(0, breaker.resetTimeout - timeSinceFailure);

      return res.status(503).json({
        status: 'error',
        message: `Servicio ${serviceName} temporalmente no disponible`,
        error: 'CIRCUIT_OPEN',
        retryAfter: Math.ceil(timeUntilRetry / 1000),
        requestId: req.id,
      });
    }

    // Add response listener to track success/failure
    const originalEnd = res.end;
    let responseSent = false;

    res.end = function (...args) {
      if (!responseSent) {
        responseSent = true;

        // Track based on response status
        if (res.statusCode >= 500) {
          breaker.onFailure(new Error(`HTTP ${res.statusCode}`));
        } else {
          breaker.onSuccess();
        }
      }
      return originalEnd.apply(this, args);
    };

    // Track timeouts
    const timeoutId = setTimeout(() => {
      if (!responseSent) {
        responseSent = true;
        breaker.onFailure(new Error('Request timeout'));
      }
    }, breaker.timeout);

    // Cleanup on finish
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
}

/**
 * Express middleware to expose circuit breaker status endpoint
 */
function circuitBreakerStatusHandler(req, res) {
  const allStates = registry.getAllStates();

  // Calculate overall health
  const services = Object.values(allStates);
  const openCircuits = services.filter((s) => s.state === 'OPEN').length;
  const halfOpenCircuits = services.filter((s) => s.state === 'HALF_OPEN').length;

  let overallHealth = 'healthy';
  if (openCircuits > 0) {
    overallHealth = openCircuits > services.length / 2 ? 'critical' : 'degraded';
  } else if (halfOpenCircuits > 0) {
    overallHealth = 'recovering';
  }

  res.json({
    status: 'success',
    overallHealth,
    summary: {
      total: services.length,
      closed: services.filter((s) => s.state === 'CLOSED').length,
      open: openCircuits,
      halfOpen: halfOpenCircuits,
    },
    services: allStates,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Express middleware to reset a specific circuit breaker
 */
function circuitBreakerResetHandler(req, res) {
  const { serviceName } = req.params;

  if (!serviceName) {
    return res.status(400).json({
      status: 'fail',
      message: 'Service name is required',
    });
  }

  const breaker = registry.breakers.get(serviceName);

  if (!breaker) {
    return res.status(404).json({
      status: 'fail',
      message: `Circuit breaker for ${serviceName} not found`,
    });
  }

  breaker.forceClose();

  res.json({
    status: 'success',
    message: `Circuit breaker for ${serviceName} has been reset`,
    newState: breaker.getState(),
  });
}

/**
 * Express middleware to reset all circuit breakers
 */
function circuitBreakerResetAllHandler(req, res) {
  registry.resetAll();

  res.json({
    status: 'success',
    message: 'All circuit breakers have been reset',
    states: registry.getAllStates(),
  });
}

/**
 * Wrap an async proxy function with circuit breaker
 * @param {string} serviceName - Name of the service
 * @param {Function} proxyFn - Async function that performs the proxy request
 * @param {any} fallback - Fallback response if circuit is open
 */
async function withCircuitBreaker(serviceName, proxyFn, fallback = null) {
  const breaker = getServiceBreaker(serviceName);
  return breaker.execute(proxyFn, fallback);
}

module.exports = {
  CircuitBreaker,
  registry,
  getServiceBreaker,
  createCircuitBreakerMiddleware,
  circuitBreakerStatusHandler,
  circuitBreakerResetHandler,
  circuitBreakerResetAllHandler,
  withCircuitBreaker,
  DEFAULT_CONFIGS,
  SERVICE_TYPES,
};
