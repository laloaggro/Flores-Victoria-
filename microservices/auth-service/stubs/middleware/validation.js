/**
 * Validation Middleware Stub for Railway Deployment
 */

const validate = (schema) => (req, res, next) => {
  // No-op validation in stub - pass through
  next();
};

const validateBody = (schema) => validate(schema);
const validateQuery = (schema) => validate(schema);
const validateParams = (schema) => validate(schema);

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
};
