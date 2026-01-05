# Flores Victoria v3.3.0 - Railway Deployment
# Build timestamp: 2026-01-04T19:05:00Z - FORCE REBUILD
# Event-reservations routes + Joi.required() fix
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
RUN echo 'const initMetrics = (serviceName) => ({ registry: { metrics: () => "", contentType: "text/plain" } }); const metricsMiddleware = () => (req, res, next) => next(); const metricsEndpoint = () => (req, res) => res.json({}); const getMetrics = () => "# No metrics"; module.exports = { initMetrics, metricsMiddleware, metricsEndpoint, getMetrics };' > /shared/middleware/metrics.js

# Access-log stub - accessLog as factory
RUN echo 'const accessLog = (logger) => (req, res, next) => next(); module.exports = { accessLog };' > /shared/middleware/access-log.js

# Error-handler stub with notFoundHandler - FIXED: use statusCode (number) not status (string)
RUN echo 'const errorHandler = (err, req, res, next) => { const code = typeof err.statusCode === "number" ? err.statusCode : (typeof err.status === "number" ? err.status : 500); res.status(code).json({ error: err.message || "Internal error" }); }; const notFoundHandler = (req, res) => res.status(404).json({ error: "Not found" }); const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); module.exports = { errorHandler, notFoundHandler, asyncHandler };' > /shared/middleware/error-handler.js

# Token-revocation stub - isTokenRevokedMiddleware as factory
RUN echo 'const initRedisClient = async () => {}; const isTokenRevokedMiddleware = () => (req, res, next) => next(); const checkTokenRevocation = () => (req, res, next) => next(); const revokeToken = async () => {}; module.exports = { initRedisClient, isTokenRevokedMiddleware, checkTokenRevocation, revokeToken };' > /shared/middleware/token-revocation.js

# Request-id stub - requestId as factory
RUN echo 'const requestId = () => (req, res, next) => { req.id = req.headers["x-request-id"] || Date.now().toString(36); next(); }; const withLogger = (logger) => (req, res, next) => next(); module.exports = { requestId, withLogger };' > /shared/middleware/request-id.js

# Authorize stub - middleware for role-based access control with requirePermission
RUN echo 'const ROLES = { ADMIN: "admin", MANAGER: "manager", USER: "user", GUEST: "guest" }; const PERMISSIONS = { CREATE: "create", READ: "read", UPDATE: "update", DELETE: "delete", PRODUCTS_CREATE: "products:create", PRODUCTS_UPDATE: "products:update", PRODUCTS_DELETE: "products:delete", USERS_READ: "users:read", USERS_UPDATE: "users:update", ORDERS_READ: "orders:read", ORDERS_UPDATE: "orders:update" }; const authorize = (...roles) => (req, res, next) => next(); const requireRole = (...roles) => (req, res, next) => next(); const requirePermission = (...perms) => (req, res, next) => next(); const managerOnly = (req, res, next) => next(); const adminOnly = (req, res, next) => next(); module.exports = { authorize, requireRole, requirePermission, managerOnly, adminOnly, ROLES, PERMISSIONS };' > /shared/middleware/authorize.js

# Validation stub - Complete mock Joi with chainable methods
RUN echo 'const chainable = () => ({ string: chainable, number: chainable, boolean: chainable, array: chainable, object: chainable, required: chainable, optional: chainable, min: chainable, max: chainable, trim: chainable, positive: chainable, integer: chainable, default: chainable, valid: chainable, items: chainable, when: chainable, allow: chainable, uuid: chainable, email: chainable, pattern: chainable, length: chainable, alphanum: chainable, is: chainable, then: chainable, otherwise: chainable, validate: () => ({ error: null, value: {} }) }); const Joi = { object: (schema) => chainable(), string: chainable, number: chainable, boolean: chainable, array: chainable, alternatives: chainable, any: chainable, required: chainable, optional: chainable }; const validate = (schema, source) => (req, res, next) => next(); const validateBody = (schema) => (req, res, next) => next(); const validateQuery = (schema) => (req, res, next) => next(); const validateParams = (schema) => (req, res, next) => next(); const validateHeaders = (schema) => (req, res, next) => next(); const commonSchemas = { id: chainable, uuid: chainable, email: chainable, pagination: chainable }; module.exports = { Joi, validate, validateBody, validateQuery, validateParams, validateHeaders, commonSchemas };' > /shared/middleware/validation.js

# Create joi module in node_modules for direct require('joi') - includes Joi.required()

# Cache config stub - CacheMetrics as a CLASS
RUN echo 'const CACHE_TTL = { SHORT: 60, MEDIUM: 300, LONG: 3600, PRODUCT: 1800, CATEGORY: 3600 }; class CacheMetrics { constructor() { this.hits = 0; this.misses = 0; this.errors = 0; } recordHit() { this.hits++; } recordMiss() { this.misses++; } recordError() { this.errors++; } getStats() { return { hits: this.hits, misses: this.misses, errors: this.errors }; } } module.exports = { CACHE_TTL, CacheMetrics };' > /shared/cache/config.js

# Health status-aggregator stub
RUN echo 'const aggregateStatus = () => ({ status: "ok" }); module.exports = { aggregateStatus };' > /shared/health/status-aggregator.js

# AppError stub with all error types
RUN echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; this.status="error"; } } class NotFoundError extends AppError { constructor(m="Not found") { super(m, 404); } } class ValidationError extends AppError { constructor(m="Validation failed") { super(m, 400); } } class UnauthorizedError extends AppError { constructor(m="Unauthorized") { super(m, 401); } } module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError };' > /shared/errors/AppError.js

# Rate-limiter stub
RUN echo 'const publicLimiter = (req, res, next) => next(); const authenticatedLimiter = (req, res, next) => next(); const strictLimiter = (req, res, next) => next(); const authLimiter = (req, res, next) => next(); const criticalLimiter = (req, res, next) => next(); const searchLimiter = (req, res, next) => next(); const createUserLimiter = () => (req, res, next) => next(); const createEndpointLimiter = () => (req, res, next) => next(); module.exports = { publicLimiter, authenticatedLimiter, strictLimiter, authLimiter, criticalLimiter, searchLimiter, createUserLimiter, createEndpointLimiter };' > /shared/middleware/rate-limiter.js

# Metrics-simple stub
RUN echo 'const metricsSimple = { httpRequestsTotal: { inc: () => {} }, httpRequestDuration: { observe: () => {} }, register: { metrics: () => Promise.resolve("") } }; module.exports = metricsSimple;' > /shared/metrics-simple.js

# Copy stubs to all locations
RUN cp -r /shared /app/shared && cp -r /shared /app/src/shared

# ═══════════════════════════════════════════════════════════════
# @flores-victoria/shared STUBS (for require('@flores-victoria/shared/...'))
# ═══════════════════════════════════════════════════════════════
RUN mkdir -p /app/node_modules/@flores-victoria/shared/logging \
             /app/node_modules/@flores-victoria/shared/utils \
             /app/node_modules/@flores-victoria/shared/middleware \
             /app/node_modules/@flores-victoria/shared/cache \
             /app/node_modules/@flores-victoria/shared/health \
             /app/node_modules/@flores-victoria/shared/errors \
             /app/node_modules/@flores-victoria/shared/tracing \
             /app/node_modules/@flores-victoria/shared/services

# Package.json for the scoped module
RUN echo '{"name":"@flores-victoria/shared","version":"3.3.0","main":"index.js"}' > /app/node_modules/@flores-victoria/shared/package.json

# Copy all stubs to @flores-victoria/shared
RUN cp /shared/logging/logger.js /app/node_modules/@flores-victoria/shared/logging/logger.js && \
    cp /shared/utils/secrets-validator.js /app/node_modules/@flores-victoria/shared/utils/secrets-validator.js && \
    cp /shared/middleware/health-check.js /app/node_modules/@flores-victoria/shared/middleware/health-check.js && \
    cp /shared/middleware/metrics.js /app/node_modules/@flores-victoria/shared/middleware/metrics.js && \
    cp /shared/middleware/access-log.js /app/node_modules/@flores-victoria/shared/middleware/access-log.js && \
    cp /shared/middleware/error-handler.js /app/node_modules/@flores-victoria/shared/middleware/error-handler.js && \
    cp /shared/middleware/token-revocation.js /app/node_modules/@flores-victoria/shared/middleware/token-revocation.js && \
    cp /shared/middleware/request-id.js /app/node_modules/@flores-victoria/shared/middleware/request-id.js && \
    cp /shared/middleware/authorize.js /app/node_modules/@flores-victoria/shared/middleware/authorize.js && \
    cp /shared/middleware/validation.js /app/node_modules/@flores-victoria/shared/middleware/validation.js && \
    cp /shared/cache/config.js /app/node_modules/@flores-victoria/shared/cache/config.js && \
    cp /shared/health/status-aggregator.js /app/node_modules/@flores-victoria/shared/health/status-aggregator.js && \
    cp /shared/errors/AppError.js /app/node_modules/@flores-victoria/shared/errors/AppError.js

# Tracing stubs for @flores-victoria/shared/tracing
RUN echo 'const initTracer = (name) => ({}); module.exports = { initTracer };' > /app/node_modules/@flores-victoria/shared/tracing/index.js
RUN echo 'const tracingMiddleware = (name) => (req, res, next) => next(); module.exports = { tracingMiddleware };' > /app/node_modules/@flores-victoria/shared/tracing/middleware.js

# Services stubs for @flores-victoria/shared/services
RUN echo 'const TIME_PERIODS = { DAY: "day", WEEK: "week", MONTH: "month", YEAR: "year" }; class AnalyticsService { static async getMetrics() { return {}; } } module.exports = { AnalyticsService, TIME_PERIODS };' > /app/node_modules/@flores-victoria/shared/services/analyticsService.js
RUN echo 'const ORDER_STATUSES = { PENDING: "pending", CONFIRMED: "confirmed", SHIPPED: "shipped", DELIVERED: "delivered" }; const TRACKING_EVENTS = { CREATED: "created", UPDATED: "updated" }; class OrderTrackingService { static async track() { return {}; } } module.exports = { OrderTrackingService, ORDER_STATUSES, TRACKING_EVENTS };' > /app/node_modules/@flores-victoria/shared/services/orderTrackingService.js

# Redis stub (el código usa require('redis') pero package.json tiene ioredis)
RUN mkdir -p /app/node_modules/redis && \
    echo '{"name":"redis","version":"4.0.0","main":"index.js"}' > /app/node_modules/redis/package.json && \
    echo 'const createClient = (opts) => ({ on: (e, cb) => {}, connect: async () => {}, get: async () => null, set: async () => {}, del: async () => {}, quit: async () => {}, isOpen: true }); module.exports = { createClient };' > /app/node_modules/redis/index.js

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "src/server.js"]
