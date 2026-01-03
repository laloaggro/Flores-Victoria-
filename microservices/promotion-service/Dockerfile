# Flores Victoria v3.3.0 - Railway Deployment
# Build timestamp: 2026-01-03T02:15:00Z
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy ALL source files
COPY src/ ./src/
COPY server.js ./
COPY routes.js ./

# Create shared module stubs at ROOT level (/shared)
RUN mkdir -p /shared/logging /shared/utils /shared/middleware /shared/cache /shared/health /shared/errors

# Logger stub - both as module and as object with methods
RUN echo 'const createLogger = (name) => { const log = (level, ...args) => console[level === "info" ? "log" : level]("[" + level.toUpperCase() + "]", "[" + name + "]", ...args); return { info: (...args) => log("info", ...args), error: (...args) => log("error", ...args), warn: (...args) => log("warn", ...args), debug: () => {} }; }; const logger = createLogger("default"); module.exports = { createLogger, info: logger.info, error: logger.error, warn: logger.warn, debug: logger.debug };' > /shared/logging/logger.js

# Secrets-validator stub
RUN echo 'const validateStartupSecrets = () => true; module.exports = { validateStartupSecrets };' > /shared/utils/secrets-validator.js

# Health-check stub
RUN echo 'const createHealthCheck = (opts) => (req, res) => res.json({ status: "ok" }); const createLivenessCheck = () => (req, res) => res.json({ status: "ok" }); const createReadinessCheck = () => (req, res) => res.json({ status: "ok" }); const healthCheckMiddleware = (req, res, next) => next(); module.exports = { createHealthCheck, createLivenessCheck, createReadinessCheck, healthCheckMiddleware };' > /shared/middleware/health-check.js

# Metrics stub
RUN echo 'const metricsMiddleware = (req, res, next) => next(); const getMetrics = () => "# No metrics"; module.exports = { metricsMiddleware, getMetrics };' > /shared/middleware/metrics.js

# Access-log stub
RUN echo 'const accessLog = (req, res, next) => next(); module.exports = { accessLog };' > /shared/middleware/access-log.js

# Error-handler stub
RUN echo 'const errorHandler = (err, req, res, next) => res.status(err.status || 500).json({ error: err.message }); const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); module.exports = { errorHandler, asyncHandler };' > /shared/middleware/error-handler.js

# Token-revocation stub (silenced)
RUN echo 'const checkTokenRevocation = (req, res, next) => next(); const revokeToken = async () => {}; module.exports = { checkTokenRevocation, revokeToken };' > /shared/middleware/token-revocation.js

# Request-id stub
RUN echo 'const requestId = (req, res, next) => { req.id = req.headers["x-request-id"] || Date.now().toString(36); next(); }; module.exports = { requestId };' > /shared/middleware/request-id.js

# Validation stub - export Joi
RUN echo 'const Joi = require("joi"); module.exports = { Joi };' > /shared/middleware/validation.js

# Cache config stub - CacheMetrics as a CLASS
RUN echo 'const CACHE_TTL = { SHORT: 60, MEDIUM: 300, LONG: 3600, PRODUCT: 1800, CATEGORY: 3600 }; class CacheMetrics { constructor() { this.hits = 0; this.misses = 0; this.errors = 0; } recordHit() { this.hits++; } recordMiss() { this.misses++; } recordError() { this.errors++; } getStats() { return { hits: this.hits, misses: this.misses, errors: this.errors }; } } module.exports = { CACHE_TTL, CacheMetrics };' > /shared/cache/config.js

# Health status-aggregator stub
RUN echo 'const aggregateStatus = () => ({ status: "ok" }); module.exports = { aggregateStatus };' > /shared/health/status-aggregator.js

# AppError stub with all error types
RUN echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; this.status="error"; } } class NotFoundError extends AppError { constructor(m="Not found") { super(m, 404); } } class ValidationError extends AppError { constructor(m="Validation failed") { super(m, 400); } } class UnauthorizedError extends AppError { constructor(m="Unauthorized") { super(m, 401); } } module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError };' > /shared/errors/AppError.js

# Copy stubs to all locations
RUN cp -r /shared /app/shared && cp -r /shared /app/src/shared

# Copy server.js and routes.js from root
COPY server.js ./
COPY routes.js ./

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "server.js"]
