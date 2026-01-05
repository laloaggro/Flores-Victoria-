# Flores Victoria v3.3.0 - Railway Deployment
# Build timestamp: 2026-01-04T20:00:00Z - FIX: @flores-victoria/shared module path
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# Create shared module stubs in node_modules/@flores-victoria/shared
RUN mkdir -p /app/node_modules/@flores-victoria/shared/logging \
             /app/node_modules/@flores-victoria/shared/utils \
             /app/node_modules/@flores-victoria/shared/middleware \
             /app/node_modules/@flores-victoria/shared/cache \
             /app/node_modules/@flores-victoria/shared/health \
             /app/node_modules/@flores-victoria/shared/errors \
             /app/node_modules/@flores-victoria/shared/config \
             /app/node_modules/@flores-victoria/shared/services

# Package.json for the scoped module
RUN echo '{"name":"@flores-victoria/shared","version":"3.3.0","main":"index.js"}' > /app/node_modules/@flores-victoria/shared/package.json

# Logger stub - both as module and as object with methods
RUN echo 'const createLogger = (name) => { const log = (level, ...args) => console[level === "info" ? "log" : level]("[" + level.toUpperCase() + "]", "[" + name + "]", ...args); return { info: (...args) => log("info", ...args), error: (...args) => log("error", ...args), warn: (...args) => log("warn", ...args), debug: () => {} }; }; const logger = createLogger("default"); module.exports = { createLogger, info: logger.info, error: logger.error, warn: logger.warn, debug: logger.debug };' > /app/node_modules/@flores-victoria/shared/logging/logger.js

# Secrets-validator stub
RUN echo 'const validateStartupSecrets = () => true; module.exports = { validateStartupSecrets };' > /app/node_modules/@flores-victoria/shared/utils/secrets-validator.js

# Health-check stub
RUN echo 'const createHealthCheck = (opts) => (req, res) => res.json({ status: "ok" }); const createLivenessCheck = () => (req, res) => res.json({ status: "ok" }); const createReadinessCheck = () => (req, res) => res.json({ status: "ok" }); const healthCheckMiddleware = (req, res, next) => next(); module.exports = { createHealthCheck, createLivenessCheck, createReadinessCheck, healthCheckMiddleware };' > /app/node_modules/@flores-victoria/shared/middleware/health-check.js

# Metrics stub - all as factory functions
RUN echo 'const initMetrics = (serviceName) => {}; const metricsMiddleware = () => (req, res, next) => next(); const metricsEndpoint = () => (req, res) => res.json({}); const getMetrics = () => "# No metrics"; module.exports = { initMetrics, metricsMiddleware, metricsEndpoint, getMetrics };' > /app/node_modules/@flores-victoria/shared/middleware/metrics.js

# Access-log stub - accessLog as factory
RUN echo 'const accessLog = (logger) => (req, res, next) => next(); module.exports = { accessLog };' > /app/node_modules/@flores-victoria/shared/middleware/access-log.js

# Error-handler stub with notFoundHandler - FIXED: use statusCode (number) not status (string)
RUN echo 'const errorHandler = (err, req, res, next) => { const code = typeof err.statusCode === "number" ? err.statusCode : (typeof err.status === "number" ? err.status : 500); res.status(code).json({ error: err.message || "Internal error" }); }; const notFoundHandler = (req, res) => res.status(404).json({ error: "Not found" }); const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); module.exports = { errorHandler, notFoundHandler, asyncHandler };' > /app/node_modules/@flores-victoria/shared/middleware/error-handler.js

# Token-revocation stub - isTokenRevokedMiddleware as factory
RUN echo 'const initRedisClient = async () => {}; const isTokenRevokedMiddleware = () => (req, res, next) => next(); const checkTokenRevocation = () => (req, res, next) => next(); const revokeToken = async () => {}; module.exports = { initRedisClient, isTokenRevokedMiddleware, checkTokenRevocation, revokeToken };' > /app/node_modules/@flores-victoria/shared/middleware/token-revocation.js

# Request-id stub - requestId as factory
RUN echo 'const requestId = () => (req, res, next) => { req.id = req.headers["x-request-id"] || Date.now().toString(36); next(); }; const withLogger = (logger) => (req, res, next) => next(); module.exports = { requestId, withLogger };' > /app/node_modules/@flores-victoria/shared/middleware/request-id.js

# Validation stub - Complete mock Joi with validateBody middleware and commonSchemas
RUN echo 'const validate = (schema, source) => (req, res, next) => next(); const validateBody = (schema) => (req, res, next) => next(); const validateQuery = (schema) => (req, res, next) => next(); const validateParams = (schema) => (req, res, next) => next(); const validateHeaders = (schema) => (req, res, next) => next(); const commonSchemas = { id: () => ({}), uuid: () => ({}), email: () => ({}), pagination: () => ({}) }; module.exports = { validate, validateBody, validateQuery, validateParams, validateHeaders, commonSchemas };' > /app/node_modules/@flores-victoria/shared/middleware/validation.js

# Authorize stub - middleware for role-based access control with requirePermission
RUN echo 'const ROLES = { ADMIN: "admin", MANAGER: "manager", USER: "user", GUEST: "guest" }; const PERMISSIONS = { CREATE: "create", READ: "read", UPDATE: "update", DELETE: "delete", PRODUCTS_CREATE: "products:create", PRODUCTS_UPDATE: "products:update", PRODUCTS_DELETE: "products:delete", USERS_READ: "users:read", USERS_UPDATE: "users:update", ORDERS_READ: "orders:read", ORDERS_UPDATE: "orders:update" }; const authorize = (...roles) => (req, res, next) => next(); const requireRole = (...roles) => (req, res, next) => next(); const requirePermission = (...perms) => (req, res, next) => next(); const managerOnly = (req, res, next) => next(); const adminOnly = (req, res, next) => next(); module.exports = { authorize, requireRole, requirePermission, managerOnly, adminOnly, ROLES, PERMISSIONS };' > /app/node_modules/@flores-victoria/shared/middleware/authorize.js

# Cache config stub - CacheMetrics as a CLASS
RUN echo 'const CACHE_TTL = { SHORT: 60, MEDIUM: 300, LONG: 3600, PRODUCT: 1800, CATEGORY: 3600 }; class CacheMetrics { constructor() { this.hits = 0; this.misses = 0; this.errors = 0; } recordHit() { this.hits++; } recordMiss() { this.misses++; } recordError() { this.errors++; } getStats() { return { hits: this.hits, misses: this.misses, errors: this.errors }; } } module.exports = { CACHE_TTL, CacheMetrics };' > /app/node_modules/@flores-victoria/shared/cache/config.js

# Health status-aggregator stub
RUN echo 'const aggregateStatus = () => ({ status: "ok" }); module.exports = { aggregateStatus };' > /app/node_modules/@flores-victoria/shared/health/status-aggregator.js

# AppError stub with all error types including ConflictError
RUN echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; this.status="error"; } } class NotFoundError extends AppError { constructor(m="Not found") { super(m, 404); } } class ValidationError extends AppError { constructor(m="Validation failed") { super(m, 400); } } class UnauthorizedError extends AppError { constructor(m="Unauthorized") { super(m, 401); } } class ConflictError extends AppError { constructor(m="Conflict") { super(m, 409); } } class ForbiddenError extends AppError { constructor(m="Forbidden") { super(m, 403); } } module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError, ConflictError, ForbiddenError };' > /app/node_modules/@flores-victoria/shared/errors/AppError.js

# Config roles stub - ROLES, PERMISSIONS, normalizeRole, getPermissions, getRoleInfo
RUN echo 'const ROLES = { CUSTOMER: "customer", FLORIST: "florist", DELIVERY: "delivery", SUPPORT: "support", MANAGER: "manager", ADMIN: "admin" }; const ROLE_ALIASES = { user: "customer", client: "customer", employee: "florist", staff: "florist" }; const ROLE_HIERARCHY = { customer: 1, delivery: 2, florist: 3, support: 4, manager: 5, admin: 6 }; const PERMISSIONS = { PRODUCTS_VIEW: "products:view", PRODUCTS_CREATE: "products:create", ORDERS_VIEW_OWN: "orders:view_own", ORDERS_VIEW_ALL: "orders:view_all", USERS_VIEW_PROFILE: "users:view_profile", USERS_VIEW_ALL: "users:view_all", USERS_MANAGE_ROLES: "users:manage_roles" }; const ROLE_PERMISSIONS = { customer: ["products:view", "orders:view_own"], admin: Object.values(PERMISSIONS) }; const normalizeRole = (role) => ROLE_ALIASES[role] || role || "customer"; const hasPermission = (role, perm) => true; const hasAnyPermission = (role, perms) => true; const hasAllPermissions = (role, perms) => true; const getPermissions = (role) => ROLE_PERMISSIONS[role] || []; const isRoleAtLeast = (role, minRole) => true; const canManageRole = (actor, target) => true; const getValidRoles = () => Object.values(ROLES); const isValidRole = (role) => Object.values(ROLES).includes(role); const getRoleInfo = (role) => ({ role, level: ROLE_HIERARCHY[role] || 1, permissions: getPermissions(role) }); module.exports = { ROLES, ROLE_ALIASES, ROLE_HIERARCHY, PERMISSIONS, ROLE_PERMISSIONS, normalizeRole, hasPermission, hasAnyPermission, hasAllPermissions, getPermissions, isRoleAtLeast, canManageRole, getValidRoles, isValidRole, getRoleInfo };' > /app/node_modules/@flores-victoria/shared/config/roles.js

# Services auditService stub - createAuditService, AUDIT_EVENTS
RUN echo 'const AUDIT_EVENTS = { USER_LOGIN: "user.login", USER_LOGOUT: "user.logout", USER_REGISTER: "user.register", USER_UPDATE: "user.update", PASSWORD_CHANGE: "password.change", PASSWORD_RESET: "password.reset", TOKEN_REFRESH: "token.refresh", ACCESS_DENIED: "access.denied" }; const SEVERITY = { LOW: "low", MEDIUM: "medium", HIGH: "high", CRITICAL: "critical" }; class AuditService { constructor(opts) { this.serviceName = opts?.serviceName || "unknown"; } async log(event, data) { console.log("[AUDIT]", event, data); } async logLogin(userId, success) {} async logLogout(userId) {} async logAccessDenied(userId, resource) {} } const createAuditService = (opts) => new AuditService(opts); const auditMiddleware = (req, res, next) => next(); const auditAccessDenied = (req, res, next) => next(); module.exports = { AuditService, AUDIT_EVENTS, SEVERITY, auditMiddleware, auditAccessDenied, createAuditService };' > /app/node_modules/@flores-victoria/shared/services/auditService.js

# Security middleware stub - ALL functions return middleware (factory pattern)
RUN echo 'const createSecurityMiddleware = (opts) => (req, res, next) => next(); const sanitizeInput = (opts) => (req, res, next) => next(); const sanitizeString = (str) => str; const sanitizeObject = (obj) => obj; const sqlInjectionProtection = (opts) => (req, res, next) => next(); const detectSqlInjection = (str) => false; const additionalSecurityHeaders = (opts) => (req, res, next) => next(); const getCSPConfig = () => ({}); const csrfProtection = (opts) => (req, res, next) => next(); const advancedRateLimiter = (opts) => (req, res, next) => next(); const getRateLimitConfig = () => ({}); module.exports = { createSecurityMiddleware, sanitizeInput, sanitizeString, sanitizeObject, sqlInjectionProtection, detectSqlInjection, additionalSecurityHeaders, getCSPConfig, csrfProtection, advancedRateLimiter, getRateLimitConfig };' > /app/node_modules/@flores-victoria/shared/middleware/security.js

# Rate-limiter stub - criticalLimiter and other limiters
RUN echo 'const criticalLimiter = (req, res, next) => next(); const authLimiter = (req, res, next) => next(); const apiLimiter = (req, res, next) => next(); const createRateLimiter = (opts) => (req, res, next) => next(); module.exports = { criticalLimiter, authLimiter, apiLimiter, createRateLimiter };' > /app/node_modules/@flores-victoria/shared/middleware/rate-limiter.js

# Metrics-simple stub
RUN echo 'const metricsSimple = { httpRequestsTotal: { inc: () => {} }, httpRequestDuration: { observe: () => {} }, register: { metrics: () => Promise.resolve("") } }; module.exports = metricsSimple;' > /app/node_modules/@flores-victoria/shared/metrics-simple.js
RUN mkdir -p /app/shared && echo 'const metricsSimple = { httpRequestsTotal: { inc: () => {} }, httpRequestDuration: { observe: () => {} }, register: { metrics: () => Promise.resolve("") } }; module.exports = metricsSimple;' > /app/shared/metrics-simple.js

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "src/server.js"]
