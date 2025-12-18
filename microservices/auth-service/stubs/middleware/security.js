/**
 * Security Middleware Stub for Railway Deployment
 */

const sanitizeInput =
  (options = {}) =>
  (req, res, next) =>
    next();
const sqlInjectionProtection =
  (options = {}) =>
  (req, res, next) =>
    next();
const xssProtection =
  (options = {}) =>
  (req, res, next) =>
    next();
const csrfProtection =
  (options = {}) =>
  (req, res, next) =>
    next();

module.exports = {
  sanitizeInput,
  sqlInjectionProtection,
  xssProtection,
  csrfProtection,
};
