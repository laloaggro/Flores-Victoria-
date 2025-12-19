/**
 * Circuit Breaker Stub for Railway Deployment
 * This is a minimal implementation that passes through all requests
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.resetTimeout = options.resetTimeout || 30000;
    this.timeout = options.timeout || 10000;
    this.options = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 10000,
      ...options,
    };
  }

  async fire(fn) {
    return await fn();
  }

  getState() {
    return this.state;
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
  }

  onFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    // Stub: don't actually open circuit, just track
  }

  onSuccess() {
    this.successCount++;
    // Stub: don't change state, just track
  }

  isOpen() {
    return this.state === 'OPEN';
  }

  isClosed() {
    return this.state === 'CLOSED';
  }
}

const breakers = new Map();

const registry = {
  get: (name, config) => {
    if (!breakers.has(name)) {
      breakers.set(name, new CircuitBreaker(config));
    }
    return breakers.get(name);
  },
  getAll: () => breakers,
  reset: (name) => {
    if (breakers.has(name)) {
      breakers.get(name).reset();
    }
  },
};

const createCircuitBreaker = (opts) => new CircuitBreaker(opts);

module.exports = {
  CircuitBreaker,
  createCircuitBreaker,
  registry,
};
