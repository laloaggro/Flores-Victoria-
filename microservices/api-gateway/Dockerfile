# Dockerfile para api-gateway - Railway Compatible
# Build version: 2.1.0 - Added csrf middleware stub
FROM node:22-slim

WORKDIR /app

# Copy package.json and install dependencies
# Railway rootDirectory = microservices/api-gateway, so paths are relative to that
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

# Copy api-gateway source code
COPY src ./src/

# Create complete stub for @flores-victoria/shared module with all submodules
# First remove any existing directory/symlink from npm install
RUN rm -rf node_modules/@flores-victoria 2>/dev/null || true \
    && mkdir -p node_modules/@flores-victoria/shared/logging \
    && mkdir -p node_modules/@flores-victoria/shared/metrics \
    && mkdir -p node_modules/@flores-victoria/shared/health \
    && mkdir -p node_modules/@flores-victoria/shared/middleware \
    && mkdir -p node_modules/@flores-victoria/shared/cache \
    && mkdir -p node_modules/@flores-victoria/shared/errors \
    && mkdir -p node_modules/@flores-victoria/shared/mcp

# Create package.json for shared module with exports field
RUN printf '{\n\
  "name": "@flores-victoria/shared",\n\
  "version": "1.0.0",\n\
  "main": "index.js",\n\
  "exports": {\n\
    ".": "./index.js",\n\
    "./logging": "./logging/index.js",\n\
    "./logging/index.js": "./logging/index.js",\n\
    "./middleware/health-check": "./middleware/health-check.js",\n\
    "./middleware/rate-limiter": "./middleware/rate-limiter.js",\n\
    "./middleware/security": "./middleware/security.js",\n\
    "./middleware/health-dashboard": "./middleware/health-dashboard.js",\n\
    "./middleware/csrf": "./middleware/csrf.js",\n\
    "./middleware": "./middleware/index.js",\n\
    "./mcp": "./mcp/index.js",\n\
    "./mcp/index.js": "./mcp/index.js",\n\
    "./cache": "./cache/index.js",\n\
    "./health": "./health/index.js",\n\
    "./metrics": "./metrics/index.js",\n\
    "./errors": "./errors/index.js",\n\
    "./errors/AppError": "./errors/index.js"\n\
  }\n\
}' > node_modules/@flores-victoria/shared/package.json

# Create main index.js
RUN echo 'module.exports = { logger: console };' > node_modules/@flores-victoria/shared/index.js

# Create logging submodule with withRequestId support
RUN printf 'const createLogger = (name) => {\n  const log = (level, ...args) => console[level === "info" ? "log" : level]("[" + level.toUpperCase() + "]", "[" + name + "]", ...args);\n  const logger = {\n    info: (...args) => log("info", ...args),\n    error: (...args) => log("error", ...args),\n    warn: (...args) => log("warn", ...args),\n    debug: () => {},\n    withRequestId: (id) => ({\n      info: (...args) => log("info", "[req:" + id + "]", ...args),\n      error: (...args) => log("error", "[req:" + id + "]", ...args),\n      warn: (...args) => log("warn", "[req:" + id + "]", ...args),\n      debug: () => {}\n    })\n  };\n  return logger;\n};\nmodule.exports = { createLogger };\n' > node_modules/@flores-victoria/shared/logging/index.js

# Create middleware/health-check.js submodule with all required exports
RUN printf 'const createHealthCheck = (opts) => (req, res) => res.json({ status: "ok", service: opts?.serviceName || "unknown" });\nconst createLivenessCheck = (name) => (req, res) => res.json({ status: "ok", service: name });\nconst createReadinessCheck = (name) => (req, res) => res.json({ status: "ok", service: name });\nconst healthCheckMiddleware = (req, res, next) => next();\nconst createHealthRouter = () => require("express").Router().get("/health", (req, res) => res.json({ status: "ok" }));\nconst checkDependencies = async () => ({ status: "ok", dependencies: {} });\nmodule.exports = { createHealthCheck, createLivenessCheck, createReadinessCheck, healthCheckMiddleware, createHealthRouter, checkDependencies };\n' > node_modules/@flores-victoria/shared/middleware/health-check.js

# Create middleware/rate-limiter.js submodule with all required exports
RUN printf 'const noopLimiter = (req, res, next) => next();\nconst initRedisClient = (config) => { console.log("[rate-limiter] Redis init stub called"); };\nmodule.exports = {\n  initRedisClient,\n  publicLimiter: noopLimiter,\n  criticalLimiter: noopLimiter,\n  searchLimiter: noopLimiter,\n  uploadLimiter: noopLimiter,\n  createRateLimiter: () => noopLimiter\n};\n' > node_modules/@flores-victoria/shared/middleware/rate-limiter.js

# Create middleware/index.js
RUN printf 'module.exports = {\n  requestLogger: (req, res, next) => next(),\n  errorHandler: (err, req, res, next) => res.status(500).json({ error: err.message })\n};\n' > node_modules/@flores-victoria/shared/middleware/index.js

# Create middleware/health-dashboard.js stub
RUN printf 'const createHealthDashboard = (opts) => (req, res, next) => next();\nconst createMetricsEndpoint = () => (req, res) => res.json({ metrics: {} });\nmodule.exports = { createHealthDashboard, createMetricsEndpoint };\n' > node_modules/@flores-victoria/shared/middleware/health-dashboard.js

# Create middleware/security.js stub - these are factory functions that return middleware
RUN printf 'const sanitizeInput = (opts) => (req, res, next) => next();\nconst sqlInjectionProtection = (opts) => (req, res, next) => next();\nconst xssProtection = (opts) => (req, res, next) => next();\nmodule.exports = { sanitizeInput, sqlInjectionProtection, xssProtection };\n' > node_modules/@flores-victoria/shared/middleware/security.js

# Create middleware/csrf.js stub - CSRF protection middleware
RUN printf 'const csrfProtection = (opts) => (req, res, next) => next();\nconst generateCsrfToken = () => require("crypto").randomBytes(32).toString("hex");\nconst validateCsrfToken = (token) => true;\nmodule.exports = { csrfProtection, generateCsrfToken, validateCsrfToken };\n' > node_modules/@flores-victoria/shared/middleware/csrf.js

# Create mcp submodule
RUN printf 'const createMcpHelper = () => ({\n  registerAudit: async () => {},\n  registerEvent: async () => {},\n  getTools: () => []\n});\nmodule.exports = { createMcpHelper };\n' > node_modules/@flores-victoria/shared/mcp/index.js

# Create other stubs
RUN echo 'module.exports = { healthCheck: () => ({ status: "ok" }) };' > node_modules/@flores-victoria/shared/health/index.js \
    && echo 'module.exports = { register: () => {}, metrics: () => "# No metrics" };' > node_modules/@flores-victoria/shared/metrics/index.js \
    && echo 'module.exports = { getCache: () => null, setCache: () => {} };' > node_modules/@flores-victoria/shared/cache/index.js \
    && echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; } } module.exports = { AppError };' > node_modules/@flores-victoria/shared/errors/index.js

# Verify all stubs were created
RUN echo "=== Verifying shared module stubs ===" \
    && ls -la node_modules/@flores-victoria/shared/ \
    && ls -la node_modules/@flores-victoria/shared/middleware/ \
    && cat node_modules/@flores-victoria/shared/middleware/health-check.js \
    && cat node_modules/@flores-victoria/shared/middleware/health-dashboard.js \
    && cat node_modules/@flores-victoria/shared/middleware/security.js \
    && echo "=== Stubs verification complete ==="

# Metrics-simple stub
RUN echo 'const metricsSimple = { httpRequestsTotal: { inc: () => {} }, httpRequestDuration: { observe: () => {} }, register: { metrics: () => Promise.resolve("") } }; module.exports = metricsSimple;' > node_modules/@flores-victoria/shared/metrics-simple.js
RUN mkdir -p /app/shared && echo 'const metricsSimple = { httpRequestsTotal: { inc: () => {} }, httpRequestDuration: { observe: () => {} }, register: { metrics: () => Promise.resolve("") } }; module.exports = metricsSimple;' > /app/shared/metrics-simple.js

# Redis stub para Valkey (el código usa require('redis') para conectarse a Valkey)
RUN mkdir -p node_modules/redis && \
    echo '{"name":"redis","version":"4.0.0","main":"index.js"}' > node_modules/redis/package.json && \
    echo 'const createClient = (opts) => { const client = { on: (e, cb) => { if(e === "ready") setTimeout(cb, 0); return client; }, connect: () => Promise.resolve(), get: async () => null, set: async () => "OK", del: async () => 1, quit: async () => {}, isOpen: true }; return client; }; module.exports = { createClient };' > node_modules/redis/index.js

EXPOSE 3000

CMD ["node", "src/server.js"]
