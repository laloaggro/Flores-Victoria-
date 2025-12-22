/**
 * Retry Utility with Exponential Backoff
 * Provides robust retry logic for network operations, database connections, etc.
 */

/**
 * Default configuration for retry operations
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  factor: 2, // Exponential factor
  jitter: true, // Add randomness to prevent thundering herd
  retryCondition: () => true, // Retry on any error by default
};

/**
 * Calculate delay with exponential backoff and optional jitter
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {Object} config - Retry configuration
 * @returns {number} Delay in milliseconds
 */
function calculateDelay(attempt, config) {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.factor, attempt),
    config.maxDelay
  );

  if (config.jitter) {
    // Add +/- 25% jitter to prevent synchronized retries
    const jitterFactor = 0.75 + Math.random() * 0.5;
    return Math.floor(delay * jitterFactor);
  }

  return delay;
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Duration in milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry configuration options
 * @returns {Promise<any>} Result of the function
 * @throws {Error} Last error if all retries fail
 */
async function retry(fn, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      const shouldRetry = config.retryCondition(error, attempt);

      if (attempt >= config.maxRetries || !shouldRetry) {
        throw error;
      }

      const delay = calculateDelay(attempt, config);

      if (config.onRetry) {
        config.onRetry({
          attempt: attempt + 1,
          error,
          delay,
          maxRetries: config.maxRetries,
        });
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Create a retryable version of an async function
 * @param {Function} fn - Async function to make retryable
 * @param {Object} options - Retry configuration options
 * @returns {Function} Retryable function
 */
function createRetryable(fn, options = {}) {
  return async (...args) => {
    return retry(() => fn(...args), options);
  };
}

/**
 * Retry with specific conditions for common scenarios
 */
const retryStrategies = {
  /**
   * Retry on network errors (ECONNREFUSED, ETIMEDOUT, etc.)
   */
  networkError: (error) => {
    const networkErrorCodes = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ECONNRESET',
      'ENOTFOUND',
      'EHOSTUNREACH',
      'EAI_AGAIN',
    ];
    return networkErrorCodes.includes(error.code);
  },

  /**
   * Retry on HTTP 5xx errors
   */
  serverError: (error) => {
    const status = error.status || error.statusCode || error.response?.status;
    return status >= 500 && status < 600;
  },

  /**
   * Retry on HTTP 429 (Rate Limited)
   */
  rateLimited: (error) => {
    const status = error.status || error.statusCode || error.response?.status;
    return status === 429;
  },

  /**
   * Retry on database connection errors
   */
  databaseError: (error) => {
    const dbErrorMessages = [
      'connection refused',
      'connection timeout',
      'connection lost',
      'too many connections',
      'pool exhausted',
    ];
    const errorMessage = error.message?.toLowerCase() || '';
    return dbErrorMessages.some((msg) => errorMessage.includes(msg));
  },

  /**
   * Combined strategy for transient errors
   */
  transientError: (error) => {
    return (
      retryStrategies.networkError(error) ||
      retryStrategies.serverError(error) ||
      retryStrategies.rateLimited(error) ||
      retryStrategies.databaseError(error)
    );
  },
};

/**
 * Preset configurations for common use cases
 */
const retryPresets = {
  /**
   * Quick retry for fast operations (3 retries, short delays)
   */
  quick: {
    maxRetries: 3,
    initialDelay: 100,
    maxDelay: 1000,
    factor: 2,
    jitter: true,
  },

  /**
   * Standard retry for API calls (3 retries, moderate delays)
   */
  standard: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    factor: 2,
    jitter: true,
  },

  /**
   * Patient retry for critical operations (5 retries, longer delays)
   */
  patient: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 30000,
    factor: 2,
    jitter: true,
  },

  /**
   * Aggressive retry for database connections (10 retries, progressive delays)
   */
  database: {
    maxRetries: 10,
    initialDelay: 500,
    maxDelay: 60000,
    factor: 1.5,
    jitter: true,
    retryCondition: retryStrategies.databaseError,
  },
};

module.exports = {
  retry,
  createRetryable,
  retryStrategies,
  retryPresets,
  calculateDelay,
  DEFAULT_CONFIG,
};
