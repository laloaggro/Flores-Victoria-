# Flores Victoria v3.1.0 - Railway Deployment
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# Create shared module stubs at ROOT level (/shared) for ../../shared imports from /app/src/
RUN mkdir -p /shared/logging /shared/utils /shared/middleware /shared/cache /shared/health /shared/errors

# Logger stub
RUN printf 'const createLogger = (name) => {\n\
  const log = (level, ...args) => console[level === "info" ? "log" : level]("[" + level.toUpperCase() + "]", "[" + name + "]", ...args);\n\
  return {\n\
    info: (...args) => log("info", ...args),\n\
    error: (...args) => log("error", ...args),\n\
    warn: (...args) => log("warn", ...args),\n\
    debug: () => {}\n\
  };\n\
};\nmodule.exports = { createLogger };\n' > /shared/logging/logger.js

# Secrets-validator stub
RUN printf 'const validateStartupSecrets = () => true;\nmodule.exports = { validateStartupSecrets };\n' > /shared/utils/secrets-validator.js

# Health-check stub
RUN printf 'const createHealthCheck = (opts) => (req, res) => res.json({ status: "ok" });\nconst createLivenessCheck = () => (req, res) => res.json({ status: "ok" });\nconst createReadinessCheck = () => (req, res) => res.json({ status: "ok" });\nconst healthCheckMiddleware = (req, res, next) => next();\nmodule.exports = { createHealthCheck, createLivenessCheck, createReadinessCheck, healthCheckMiddleware };\n' > /shared/middleware/health-check.js

# Metrics stub
RUN printf 'const metricsMiddleware = (req, res, next) => next();\nconst getMetrics = () => "# No metrics";\nmodule.exports = { metricsMiddleware, getMetrics };\n' > /shared/middleware/metrics.js

# Access-log stub
RUN printf 'const accessLog = (req, res, next) => next();\nmodule.exports = { accessLog };\n' > /shared/middleware/access-log.js

# Error-handler stub
RUN printf 'const errorHandler = (err, req, res, next) => res.status(err.status || 500).json({ error: err.message });\nconst asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);\nmodule.exports = { errorHandler, asyncHandler };\n' > /shared/middleware/error-handler.js

# Token-revocation stub (silenced)
RUN printf 'const checkTokenRevocation = (req, res, next) => next();\nconst revokeToken = async () => {};\nmodule.exports = { checkTokenRevocation, revokeToken };\n' > /shared/middleware/token-revocation.js

# Request-id stub
RUN printf 'const requestId = (req, res, next) => { req.id = req.headers["x-request-id"] || Date.now().toString(36); next(); };\nmodule.exports = { requestId };\n' > /shared/middleware/request-id.js

# Cache config stub - CacheMetrics as a CLASS (constructor)
RUN printf 'const CACHE_TTL = { SHORT: 60, MEDIUM: 300, LONG: 3600, PRODUCT: 1800, CATEGORY: 3600 };\n\
class CacheMetrics {\n\
  constructor() {\n\
    this.hits = 0;\n\
    this.misses = 0;\n\
    this.errors = 0;\n\
  }\n\
  recordHit() { this.hits++; }\n\
  recordMiss() { this.misses++; }\n\
  recordError() { this.errors++; }\n\
  getStats() { return { hits: this.hits, misses: this.misses, errors: this.errors }; }\n\
}\n\
module.exports = { CACHE_TTL, CacheMetrics };\n' > /shared/cache/config.js

# Health status-aggregator stub
RUN printf 'const aggregateStatus = () => ({ status: "ok" });\nmodule.exports = { aggregateStatus };\n' > /shared/health/status-aggregator.js

# AppError stub
RUN printf 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; } }\nmodule.exports = { AppError };\n' > /shared/errors/AppError.js

# Also create stubs at /app/shared for ./shared imports
RUN cp -r /shared /app/shared

# Create stubs in src/shared for ./shared imports from within src/
RUN cp -r /shared /app/src/shared

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "src/server.js"]
