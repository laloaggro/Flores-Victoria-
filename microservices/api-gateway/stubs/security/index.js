/**
 * Security Middleware Stub for Railway Deployment
 * Provides no-op security middleware (passes all requests through)
 */

// Sanitize input middleware factory
const sanitizeInput = (options = {}) => {
  return (req, res, next) => next();
};

// SQL injection protection middleware factory
const sqlInjectionProtection = (options = {}) => {
  return (req, res, next) => next();
};

// XSS protection middleware factory
const xssProtection = (options = {}) => {
  return (req, res, next) => next();
};

// CSRF protection middleware factory
const csrfProtection = (options = {}) => {
  return (req, res, next) => next();
};

module.exports = {
  sanitizeInput,
  sqlInjectionProtection,
  xssProtection,
  csrfProtection,
};
