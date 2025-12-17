/* eslint-disable no-console */
/**
 * Circuit Breaker Implementation
 * Prevents cascading failures in microservices architecture
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.timeout = options.timeout || 5000; // Request timeout in ms
    this.errorThresholdPercentage = options.errorThresholdPercentage || 50;
    this.resetTimeout = options.resetTimeout || 30000; // Time before trying again
    this.volumeThreshold = options.volumeThreshold || 5; // Min requests before tripping
    this.halfOpenRequests = options.halfOpenRequests || 1; // Requests allowed in half-open

    // State
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.requests = 0;
    this.lastFailureTime = null;
    this.halfOpenSuccesses = 0;

    // Stats
    this.stats = {
      totalRequests: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      totalTimeouts: 0,
      lastStateChange: new Date().toISOString(),
    };
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Async function to execute
   * @param {any} fallback - Fallback value if circuit is open
   * @returns {Promise<any>}
   */
  async execute(fn, fallback = null) {
    this.stats.totalRequests++;

    // Check if circuit should remain open
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.transitionTo('HALF_OPEN');
      } else {
        console.log(`[CircuitBreaker:${this.name}] Circuit OPEN, returning fallback`);
        return this.handleFallback(fallback);
      }
    }

    // In HALF_OPEN, limit requests
    if (this.state === 'HALF_OPEN' && this.halfOpenSuccesses >= this.halfOpenRequests) {
      return this.handleFallback(fallback);
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn, this.timeout);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);

      if (this.state === 'OPEN') {
        return this.handleFallback(fallback);
      }

      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  async executeWithTimeout(fn, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.stats.totalTimeouts++;
        reject(new Error(`Circuit breaker timeout after ${timeout}ms`));
      }, timeout);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Handle successful request
   */
  onSuccess() {
    this.successes++;
    this.requests++;
    this.stats.totalSuccesses++;

    if (this.state === 'HALF_OPEN') {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.halfOpenRequests) {
        this.transitionTo('CLOSED');
      }
    }
  }

  /**
   * Handle failed request
   */
  onFailure(error) {
    this.failures++;
    this.requests++;
    this.stats.totalFailures++;
    this.lastFailureTime = Date.now();

    console.log(`[CircuitBreaker:${this.name}] Request failed:`, error.message);

    if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN');
      return;
    }

    // Check if we should trip the circuit
    if (this.requests >= this.volumeThreshold) {
      const errorPercentage = (this.failures / this.requests) * 100;
      if (errorPercentage >= this.errorThresholdPercentage) {
        this.transitionTo('OPEN');
      }
    }
  }

  /**
   * Transition to a new state
   */
  transitionTo(newState) {
    console.log(`[CircuitBreaker:${this.name}] State change: ${this.state} -> ${newState}`);
    this.state = newState;
    this.stats.lastStateChange = new Date().toISOString();

    if (newState === 'CLOSED') {
      this.reset();
    } else if (newState === 'HALF_OPEN') {
      this.halfOpenSuccesses = 0;
    }
  }

  /**
   * Reset counters
   */
  reset() {
    this.failures = 0;
    this.successes = 0;
    this.requests = 0;
    this.halfOpenSuccesses = 0;
  }

  /**
   * Handle fallback
   */
  handleFallback(fallback) {
    if (typeof fallback === 'function') {
      return fallback();
    }
    return fallback;
  }

  /**
   * Get current state and stats
   */
  getState() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      requests: this.requests,
      errorRate:
        this.requests > 0 ? `${((this.failures / this.requests) * 100).toFixed(2)}%` : '0%',
      stats: this.stats,
    };
  }

  /**
   * Force open the circuit (for maintenance)
   */
  forceOpen() {
    this.transitionTo('OPEN');
    this.lastFailureTime = Date.now();
  }

  /**
   * Force close the circuit
   */
  forceClose() {
    this.transitionTo('CLOSED');
  }
}

/**
 * Circuit Breaker Registry
 * Manages multiple circuit breakers for different services
 */
class CircuitBreakerRegistry {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Get or create a circuit breaker for a service
   */
  get(serviceName, options = {}) {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(
        serviceName,
        new CircuitBreaker({
          name: serviceName,
          ...options,
        })
      );
    }
    return this.breakers.get(serviceName);
  }

  /**
   * Get all circuit breaker states
   */
  getAllStates() {
    const states = {};
    for (const [name, breaker] of this.breakers) {
      states[name] = breaker.getState();
    }
    return states;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    for (const breaker of this.breakers.values()) {
      breaker.forceClose();
    }
  }
}

// Export singleton registry
const registry = new CircuitBreakerRegistry();

module.exports = {
  CircuitBreaker,
  CircuitBreakerRegistry,
  registry,
};
