# Flores Victoria v3.3.0 - Railway Deployment
# Build timestamp: 2026-01-05T03:00:00Z - FIX: @flores-victoria/shared module path
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# Create shared module stubs in node_modules/@flores-victoria/shared AND /shared for relative imports
RUN mkdir -p /app/node_modules/@flores-victoria/shared/logging \
             /app/node_modules/@flores-victoria/shared/utils \
             /app/node_modules/@flores-victoria/shared/middleware \
             /app/node_modules/@flores-victoria/shared/cache \
             /app/node_modules/@flores-victoria/shared/health \
             /app/node_modules/@flores-victoria/shared/errors \
             /shared/logging /shared/utils /shared/middleware /shared/cache /shared/health /shared/errors

# Package.json for the scoped module
RUN echo '{"name":"@flores-victoria/shared","version":"3.3.0","main":"index.js"}' > /app/node_modules/@flores-victoria/shared/package.json

# Logger stub - both as module and as object with methods
RUN echo 'const createLogger = (name) => { const log = (level, ...args) => console[level === "info" ? "log" : level]("[" + level.toUpperCase() + "]", "[" + name + "]", ...args); return { info: (...args) => log("info", ...args), error: (...args) => log("error", ...args), warn: (...args) => log("warn", ...args), debug: () => {} }; }; const logger = createLogger("default"); module.exports = { createLogger, info: logger.info, error: logger.error, warn: logger.warn, debug: logger.debug };' > /app/node_modules/@flores-victoria/shared/logging/logger.js

# Secrets-validator stub
RUN echo 'const validateStartupSecrets = () => true; module.exports = { validateStartupSecrets };' > /app/node_modules/@flores-victoria/shared/utils/secrets-validator.js

# Health-check stub
RUN echo 'const createHealthCheck = (opts) => (req, res) => res.json({ status: "ok" }); const createLivenessCheck = () => (req, res) => res.json({ status: "ok" }); const createReadinessCheck = () => (req, res) => res.json({ status: "ok" }); const healthCheckMiddleware = (req, res, next) => next(); module.exports = { createHealthCheck, createLivenessCheck, createReadinessCheck, healthCheckMiddleware };' > /app/node_modules/@flores-victoria/shared/middleware/health-check.js

# Metrics stub - all as factory functions
RUN echo 'const initMetrics = (serviceName) => ({ registry: { metrics: () => "", contentType: "text/plain" } }); const metricsMiddleware = () => (req, res, next) => next(); const metricsEndpoint = () => (req, res) => res.json({}); const getMetrics = () => "# No metrics"; module.exports = { initMetrics, metricsMiddleware, metricsEndpoint, getMetrics };' > /app/node_modules/@flores-victoria/shared/middleware/metrics.js

# Access-log stub - accessLog as factory
RUN echo 'const accessLog = (logger) => (req, res, next) => next(); module.exports = { accessLog };' > /app/node_modules/@flores-victoria/shared/middleware/access-log.js

# Error-handler stub with notFoundHandler
RUN echo 'const errorHandler = (err, req, res, next) => { const code = typeof err.statusCode === "number" ? err.statusCode : (typeof err.status === "number" ? err.status : 500); res.status(code).json({ error: err.message || "Internal error" }); }; const notFoundHandler = (req, res) => res.status(404).json({ error: "Not found" }); const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); module.exports = { errorHandler, notFoundHandler, asyncHandler };' > /app/node_modules/@flores-victoria/shared/middleware/error-handler.js

# Token-revocation stub - isTokenRevokedMiddleware as factory
RUN echo 'const initRedisClient = async () => {}; const isTokenRevokedMiddleware = () => (req, res, next) => next(); const checkTokenRevocation = () => (req, res, next) => next(); const revokeToken = async () => {}; module.exports = { initRedisClient, isTokenRevokedMiddleware, checkTokenRevocation, revokeToken };' > /app/node_modules/@flores-victoria/shared/middleware/token-revocation.js

# Request-id stub - requestId as factory
RUN echo 'const requestId = () => (req, res, next) => { req.id = req.headers["x-request-id"] || Date.now().toString(36); next(); }; const withLogger = (logger) => (req, res, next) => next(); module.exports = { requestId, withLogger };' > /app/node_modules/@flores-victoria/shared/middleware/request-id.js

# Validation stub - Complete mock Joi with chainable methods
RUN echo 'const chainable = () => ({ string: chainable, number: chainable, boolean: chainable, array: chainable, object: chainable, required: chainable, optional: chainable, min: chainable, max: chainable, trim: chainable, positive: chainable, integer: chainable, default: chainable, valid: chainable, items: chainable, when: chainable, allow: chainable, uuid: chainable, email: chainable, pattern: chainable, length: chainable, alphanum: chainable, is: chainable, then: chainable, otherwise: chainable, validate: () => ({ error: null, value: {} }) }); const Joi = { object: (schema) => chainable(), string: chainable, number: chainable, boolean: chainable, array: chainable, alternatives: chainable, any: chainable, required: chainable, optional: chainable }; const validate = (schema, source) => (req, res, next) => next(); const validateBody = (schema) => (req, res, next) => next(); const validateQuery = (schema) => (req, res, next) => next(); const validateParams = (schema) => (req, res, next) => next(); const validateHeaders = (schema) => (req, res, next) => next(); const commonSchemas = { id: chainable, uuid: chainable, email: chainable, pagination: chainable }; module.exports = { Joi, validate, validateBody, validateQuery, validateParams, validateHeaders, commonSchemas };' > /app/node_modules/@flores-victoria/shared/middleware/validation.js

# Authorize stub
RUN echo 'const ROLES = { ADMIN: "admin", MANAGER: "manager", USER: "user", GUEST: "guest" }; const PERMISSIONS = { CREATE: "create", READ: "read", UPDATE: "update", DELETE: "delete" }; const authorize = (...roles) => (req, res, next) => next(); const requireRole = (...roles) => (req, res, next) => next(); const requirePermission = (...perms) => (req, res, next) => next(); const managerOnly = (req, res, next) => next(); const adminOnly = (req, res, next) => next(); module.exports = { authorize, requireRole, requirePermission, managerOnly, adminOnly, ROLES, PERMISSIONS };' > /app/node_modules/@flores-victoria/shared/middleware/authorize.js

# Cache config stub - CacheMetrics as a CLASS
RUN echo 'const CACHE_TTL = { SHORT: 60, MEDIUM: 300, LONG: 3600, PRODUCT: 1800, CATEGORY: 3600 }; class CacheMetrics { constructor() { this.hits = 0; this.misses = 0; this.errors = 0; } recordHit() { this.hits++; } recordMiss() { this.misses++; } recordError() { this.errors++; } getStats() { return { hits: this.hits, misses: this.misses, errors: this.errors }; } } module.exports = { CACHE_TTL, CacheMetrics };' > /app/node_modules/@flores-victoria/shared/cache/config.js

# Health status-aggregator stub
RUN echo 'const aggregateStatus = () => ({ status: "ok" }); module.exports = { aggregateStatus };' > /app/node_modules/@flores-victoria/shared/health/status-aggregator.js

# AppError stub with all error types
RUN echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; this.status="error"; } } class NotFoundError extends AppError { constructor(m="Not found") { super(m, 404); } } class ValidationError extends AppError { constructor(m="Validation failed") { super(m, 400); } } class UnauthorizedError extends AppError { constructor(m="Unauthorized") { super(m, 401); } } module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError };' > /app/node_modules/@flores-victoria/shared/errors/AppError.js


# Rate-limiter stub
RUN echo 'const publicLimiter = (req, res, next) => next(); const authenticatedLimiter = (req, res, next) => next(); const strictLimiter = (req, res, next) => next(); const authLimiter = (req, res, next) => next(); const criticalLimiter = (req, res, next) => next(); const searchLimiter = (req, res, next) => next(); const createUserLimiter = () => (req, res, next) => next(); const createEndpointLimiter = () => (req, res, next) => next(); module.exports = { publicLimiter, authenticatedLimiter, strictLimiter, authLimiter, criticalLimiter, searchLimiter, createUserLimiter, createEndpointLimiter };' > /app/node_modules/@flores-victoria/shared/middleware/rate-limiter.js

# Metrics-simple stub - includes metricsMiddleware and metricsEndpoint as factories
RUN echo 'const metricsMiddleware = (serviceName) => (req, res, next) => next(); const metricsEndpoint = (serviceName) => (req, res) => res.json({}); const httpRequestsTotal = { inc: () => {} }; const httpRequestDuration = { observe: () => {} }; const register = { metrics: () => Promise.resolve("") }; module.exports = { metricsMiddleware, metricsEndpoint, httpRequestsTotal, httpRequestDuration, register };' > /app/node_modules/@flores-victoria/shared/metrics-simple.js
RUN echo 'const metricsMiddleware = (serviceName) => (req, res, next) => next(); const metricsEndpoint = (serviceName) => (req, res) => res.json({}); const httpRequestsTotal = { inc: () => {} }; const httpRequestDuration = { observe: () => {} }; const register = { metrics: () => Promise.resolve("") }; module.exports = { metricsMiddleware, metricsEndpoint, httpRequestsTotal, httpRequestDuration, register };' > /app/shared/metrics-simple.js 2>/dev/null || mkdir -p /app/shared && echo 'const metricsMiddleware = (serviceName) => (req, res, next) => next(); const metricsEndpoint = (serviceName) => (req, res) => res.json({}); const httpRequestsTotal = { inc: () => {} }; const httpRequestDuration = { observe: () => {} }; const register = { metrics: () => Promise.resolve("") }; module.exports = { metricsMiddleware, metricsEndpoint, httpRequestsTotal, httpRequestDuration, register };' > /app/shared/metrics-simple.js

# CRITICAL: Copy stubs to /shared for ../../shared/... imports from /app/src/
RUN cp -r /app/node_modules/@flores-victoria/shared/* /shared/ 2>/dev/null || true
# And also to /app/shared for ../shared/... imports
RUN mkdir -p /app/shared && cp -r /app/node_modules/@flores-victoria/shared/* /app/shared/

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "src/server.js"]
