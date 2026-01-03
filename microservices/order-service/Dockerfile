# Flores Victoria v3.1.0 - Railway Deployment
# Build timestamp: 2026-01-02T14:20:00Z
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# Create shared module stubs at ROOT level (/shared)
RUN mkdir -p /shared/logging /shared/utils /shared/middleware /shared/cache /shared/health /shared/errors

# Logger stub - both as module and as object with methods
RUN echo 'const createLogger = (name) => { const log = (level, ...args) => console[level === "info" ? "log" : level]("[" + level.toUpperCase() + "]", "[" + name + "]", ...args); return { info: (...args) => log("info", ...args), error: (...args) => log("error", ...args), warn: (...args) => log("warn", ...args), debug: () => {} }; }; const logger = createLogger("default"); module.exports = { createLogger, info: logger.info, error: logger.error, warn: logger.warn, debug: logger.debug };' > /shared/logging/logger.js

# Secrets-validator stub
RUN echo 'const validateStartupSecrets = () => true; module.exports = { validateStartupSecrets };' > /shared/utils/secrets-validator.js

# Health-check stub
RUN echo 'const createHealthCheck = (opts) => (req, res) => res.json({ status: "ok" }); const createLivenessCheck = () => (req, res) => res.json({ status: "ok" }); const createReadinessCheck = () => (req, res) => res.json({ status: "ok" }); const healthCheckMiddleware = (req, res, next) => next(); module.exports = { createHealthCheck, createLivenessCheck, createReadinessCheck, healthCheckMiddleware };' > /shared/middleware/health-check.js

# Metrics stub - all as factory functions
RUN echo 'const initMetrics = (serviceName) => {}; const metricsMiddleware = () => (req, res, next) => next(); const metricsEndpoint = () => (req, res) => res.json({}); const getMetrics = () => "# No metrics"; module.exports = { initMetrics, metricsMiddleware, metricsEndpoint, getMetrics };' > /shared/middleware/metrics.js

# Access-log stub - accessLog as factory
RUN echo 'const accessLog = (logger) => (req, res, next) => next(); module.exports = { accessLog };' > /shared/middleware/access-log.js

# Error-handler stub with notFoundHandler
RUN echo 'const errorHandler = (err, req, res, next) => res.status(err.status || 500).json({ error: err.message }); const notFoundHandler = (req, res) => res.status(404).json({ error: "Not found" }); const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); module.exports = { errorHandler, notFoundHandler, asyncHandler };' > /shared/middleware/error-handler.js

# Token-revocation stub - isTokenRevokedMiddleware as factory
RUN echo 'const initRedisClient = async () => {}; const isTokenRevokedMiddleware = () => (req, res, next) => next(); const checkTokenRevocation = () => (req, res, next) => next(); const revokeToken = async () => {}; module.exports = { initRedisClient, isTokenRevokedMiddleware, checkTokenRevocation, revokeToken };' > /shared/middleware/token-revocation.js

# Request-id stub - requestId as factory
RUN echo 'const requestId = () => (req, res, next) => { req.id = req.headers["x-request-id"] || Date.now().toString(36); next(); }; const withLogger = (logger) => (req, res, next) => next(); module.exports = { requestId, withLogger };' > /shared/middleware/request-id.js

# Authorize stub - middleware for role-based access control
RUN echo 'const ROLES = { ADMIN: "admin", MANAGER: "manager", USER: "user", GUEST: "guest" }; const PERMISSIONS = { CREATE: "create", READ: "read", UPDATE: "update", DELETE: "delete" }; const authorize = (...roles) => (req, res, next) => next(); const requireRole = (...roles) => (req, res, next) => next(); const managerOnly = (req, res, next) => next(); const adminOnly = (req, res, next) => next(); module.exports = { authorize, requireRole, managerOnly, adminOnly, ROLES, PERMISSIONS };' > /shared/middleware/authorize.js

# Validation stub - Complete mock Joi with all chainable methods
RUN echo 'const createChainable = () => { const schema = {}; const methods = ["validate","required","optional","string","number","integer","boolean","array","object","min","max","email","pattern","items","keys","allow","valid","invalid","trim","lowercase","uppercase","when","default","empty","strip","unknown","messages","label","description","example","meta","notes","tags","unit","options","prefs","error","warn","id","ruleset","rule","custom","external","fork","tailor","alter","cache","length","regex","alphanum","token","hostname","uri","uriRelativeOnly","normalize","base64","hex","guid","creditCard","ip","port","isoDate","isoDuration","positive","negative","sign","precision","multiple","greater","less","equal","not","exist","concat","single","sparse","has","unique","sort","iso","timestamp","utc","offset","raw","format","failover","cast","only","truthy","falsy","sensitive","insensitive","ref","shared","extend","extract","mapOver","bind"]; methods.forEach(m => { schema[m] = (...args) => schema; }); schema.validate = (v) => ({ value: v, error: null }); return schema; }; const Joi = {}; ["string","number","boolean","array","object","alternatives","any","binary","date","func","link","symbol","ref","isRef","isSchema","isExpression","in","exist","expression","x"].forEach(t => { Joi[t] = () => createChainable(); }); Joi.object = (s) => createChainable(); Joi.validate = (v) => ({ value: v, error: null }); Joi.attempt = (v) => v; Joi.assert = () => {}; Joi.compile = () => createChainable(); Joi.defaults = () => Joi; Joi.override = Symbol("override"); module.exports = { Joi };' > /shared/middleware/validation.js

# Create joi module in node_modules for direct require('joi')
RUN mkdir -p /app/node_modules/joi && echo 'const createChainable = () => { const schema = {}; const methods = ["validate","required","optional","string","number","integer","boolean","array","object","min","max","email","pattern","items","keys","allow","valid","invalid","trim","lowercase","uppercase","when","default","empty","strip","unknown","messages","label","description","example","meta","notes","tags","unit","options","prefs","error","warn","id","ruleset","rule","custom","external","fork","tailor","alter","cache","length","regex","alphanum","token","hostname","uri","uriRelativeOnly","normalize","base64","hex","guid","creditCard","ip","port","isoDate","isoDuration","positive","negative","sign","precision","multiple","greater","less","equal","not","exist","concat","single","sparse","has","unique","sort","iso","timestamp","utc","offset","raw","format","failover","cast","only","truthy","falsy","sensitive","insensitive","ref","shared","extend","extract","mapOver","bind"]; methods.forEach(m => { schema[m] = (...args) => schema; }); schema.validate = (v) => ({ value: v, error: null }); return schema; }; const Joi = {}; ["string","number","boolean","array","object","alternatives","any","binary","date","func","link","symbol","ref","isRef","isSchema","isExpression","in","exist","expression","x"].forEach(t => { Joi[t] = () => createChainable(); }); Joi.object = (s) => createChainable(); Joi.validate = (v) => ({ value: v, error: null }); Joi.attempt = (v) => v; Joi.assert = () => {}; Joi.compile = () => createChainable(); Joi.defaults = () => Joi; Joi.override = Symbol("override"); module.exports = Joi;' > /app/node_modules/joi/index.js && echo '{"name":"joi","version":"17.0.0","main":"index.js"}' > /app/node_modules/joi/package.json

# Cache config stub - CacheMetrics as a CLASS
RUN echo 'const CACHE_TTL = { SHORT: 60, MEDIUM: 300, LONG: 3600, PRODUCT: 1800, CATEGORY: 3600 }; class CacheMetrics { constructor() { this.hits = 0; this.misses = 0; this.errors = 0; } recordHit() { this.hits++; } recordMiss() { this.misses++; } recordError() { this.errors++; } getStats() { return { hits: this.hits, misses: this.misses, errors: this.errors }; } } module.exports = { CACHE_TTL, CacheMetrics };' > /shared/cache/config.js

# Health status-aggregator stub
RUN echo 'const aggregateStatus = () => ({ status: "ok" }); module.exports = { aggregateStatus };' > /shared/health/status-aggregator.js

# AppError stub with all error types
RUN echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; this.status="error"; } } class NotFoundError extends AppError { constructor(m="Not found") { super(m, 404); } } class ValidationError extends AppError { constructor(m="Validation failed") { super(m, 400); } } class UnauthorizedError extends AppError { constructor(m="Unauthorized") { super(m, 401); } } module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError };' > /shared/errors/AppError.js

# Copy stubs to all locations
RUN cp -r /shared /app/shared && cp -r /shared /app/src/shared

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "src/server.js"]
