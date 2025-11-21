/**
 * Sentry Configuration for Product Service
 *
 * Provides error tracking and performance monitoring
 *
 * Setup:
 * 1. Create account at https://sentry.io
 * 2. Create Node.js project
 * 3. Copy DSN to .env: SENTRY_DSN=https://...
 * 4. Restart service
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry for the product service
 * @param {object} app - Express app instance
 */
function initializeSentry(app) {
  const logger = require('../logger');
  
  // Skip if DSN not configured
  if (!process.env.SENTRY_DSN) {
    logger.warn({ service: 'product-service' }, '⚠️  Sentry DSN not configured - Error tracking disabled');
    logger.info({ service: 'product-service' }, 'To enable: Create project at https://sentry.io and add SENTRY_DSN to .env');
    return {
      requestHandler: (req, res, next) => next(),
      errorHandler: (err, req, res, next) => next(err),
      tracingHandler: (req, res, next) => next(),
    };
  }

  // Initialize Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: `product-service@${process.env.npm_package_version || '1.0.0'}`,

    // Performance Monitoring (10% of transactions)
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),

    // Service metadata
    serverName: 'product-service',
    tags: {
      service: 'product-service',
      component: 'backend',
    },

    // Integrations
    integrations: [
      // HTTP requests tracing
      new Sentry.Integrations.Http({ tracing: true }),

      // Express middleware
      new Sentry.Integrations.Express({
        app,
        tracing: true,
      }),

      // Performance profiling
      new ProfilingIntegration(),

      // MongoDB integration (if available)
      ...(Sentry.Integrations.Mongo ? [new Sentry.Integrations.Mongo()] : []),
    ],

    // Ignore common/expected errors
    ignoreErrors: [
      // Network errors
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'NetworkError',

      // Common client errors
      'Not Found',
      'Unauthorized',

      // Cancelled requests
      'AbortError',
      'Request aborted',
    ],

    // Filter before sending
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request && event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete event.request.headers['x-api-key'];
      }

      // Remove sensitive query params
      if (event.request && event.request.query_string) {
        const params = new URLSearchParams(event.request.query_string);
        params.delete('token');
        params.delete('apiKey');
        params.delete('password');
        event.request.query_string = params.toString();
      }

      // Add custom context
      event.contexts = event.contexts || {};
      event.contexts.service = {
        name: 'product-service',
        version: process.env.npm_package_version || '1.0.0',
      };

      return event;
    },

    // Breadcrumbs filter
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy console logs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null;
      }
      return breadcrumb;
    },
  });

  console.log('✅ Sentry initialized for product-service');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `   Traces Sample Rate: ${parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1') * 100}%`
  );

  // Return middleware
  return {
    // Request handler - must be first middleware
    requestHandler: Sentry.Handlers.requestHandler(),

    // Tracing handler - for performance monitoring
    tracingHandler: Sentry.Handlers.tracingHandler(),

    // Error handler - must be before other error handlers
    errorHandler: Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture 4xx and 5xx errors
        return error.status >= 400;
      },
    }),
  };
}

/**
 * Capture custom exception
 * @param {Error} error - Error object
 * @param {object} context - Additional context
 */
function captureException(error, context = {}) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: context.tags,
      extra: context.extra,
      user: context.user,
      level: context.level || 'error',
    });
  } else {
    console.error('Sentry error (not sent - DSN not configured):', error);
  }
}

/**
 * Capture custom message
 * @param {string} message - Message to log
 * @param {string} level - Severity level
 * @param {object} context - Additional context
 */
function captureMessage(message, level = 'info', context = {}) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      tags: context.tags,
      extra: context.extra,
      user: context.user,
    });
  }
}

/**
 * Start a transaction for performance monitoring
 * @param {object} options - Transaction options
 * @returns {object} Transaction object
 */
function startTransaction(options) {
  if (process.env.SENTRY_DSN) {
    return Sentry.startTransaction(options);
  }
  // Return mock transaction if Sentry not configured
  return {
    finish: () => {},
    setStatus: () => {},
    setTag: () => {},
    setData: () => {},
    startChild: (opts) => startTransaction(opts),
  };
}

/**
 * Set user context
 * @param {object} user - User object
 */
function setUser(user) {
  if (process.env.SENTRY_DSN && user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

/**
 * Add breadcrumb
 * @param {object} breadcrumb - Breadcrumb data
 */
function addBreadcrumb(breadcrumb) {
  if (process.env.SENTRY_DSN) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

/**
 * Flush events and wait for them to be sent
 * Useful for serverless environments
 * @param {number} timeout - Timeout in milliseconds
 */
async function flush(timeout = 2000) {
  if (process.env.SENTRY_DSN) {
    await Sentry.flush(timeout);
  }
}

module.exports = {
  initializeSentry,
  captureException,
  captureMessage,
  startTransaction,
  setUser,
  addBreadcrumb,
  flush,
  Sentry, // Export Sentry instance for advanced usage
};
