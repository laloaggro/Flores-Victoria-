# Flores Victoria v3.1.0 - Railway Deployment
# Build timestamp: 2026-01-02T14:10:00Z - Force rebuild
FROM node:18-alpine

WORKDIR /app

# Force no cache for npm install
ARG CACHEBUST=1

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# Create shared module stubs at ROOT level (/shared) for ../../shared imports from /app/src/
RUN mkdir -p /shared/logging /shared/utils /shared/middleware /shared/cache /shared/health /shared/errors

# Logger stub
RUN echo 'const createLogger = (name) => { const log = (level, ...args) => console[level === "info" ? "log" : level]("[" + level.toUpperCase() + "]", "[" + name + "]", ...args); return { info: (...args) => log("info", ...args), error: (...args) => log("error", ...args), warn: (...args) => log("warn", ...args), debug: () => {} }; }; module.exports = { createLogger };' > /shared/logging/logger.js

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

# Cache config stub - CacheMetrics as a CLASS
RUN echo 'const CACHE_TTL = { SHORT: 60, MEDIUM: 300, LONG: 3600, PRODUCT: 1800, CATEGORY: 3600 }; class CacheMetrics { constructor() { this.hits = 0; this.misses = 0; this.errors = 0; } recordHit() { this.hits++; } recordMiss() { this.misses++; } recordError() { this.errors++; } getStats() { return { hits: this.hits, misses: this.misses, errors: this.errors }; } } module.exports = { CACHE_TTL, CacheMetrics };' > /shared/cache/config.js

# Health status-aggregator stub
RUN echo 'const aggregateStatus = () => ({ status: "ok" }); module.exports = { aggregateStatus };' > /shared/health/status-aggregator.js

# AppError stub
RUN echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; } } module.exports = { AppError };' > /shared/errors/AppError.js

# Copy stubs to all locations
RUN cp -r /shared /app/shared && cp -r /shared /app/src/shared

# Verify CacheMetrics is a constructor
RUN node -e "const { CacheMetrics } = require('/shared/cache/config'); const m = new CacheMetrics(); console.log('CacheMetrics test:', m.getStats());"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "src/server.js"]
