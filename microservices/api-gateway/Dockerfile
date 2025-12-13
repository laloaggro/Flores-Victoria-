# Dockerfile para api-gateway - Railway Compatible
# Build version: 1.0.14 - Fix security stubs as factory functions
FROM node:22-slim

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

# Copy api-gateway source code
COPY src ./src/

# Create complete stub for @flores-victoria/shared module with all submodules
RUN mkdir -p node_modules/@flores-victoria/shared/logging \
    && mkdir -p node_modules/@flores-victoria/shared/metrics \
    && mkdir -p node_modules/@flores-victoria/shared/health \
    && mkdir -p node_modules/@flores-victoria/shared/middleware \
    && mkdir -p node_modules/@flores-victoria/shared/cache \
    && mkdir -p node_modules/@flores-victoria/shared/errors \
    && mkdir -p node_modules/@flores-victoria/shared/mcp

# Create package.json for shared module
RUN echo '{"name":"@flores-victoria/shared","version":"1.0.0","main":"index.js"}' > node_modules/@flores-victoria/shared/package.json

# Create main index.js
RUN echo 'module.exports = { logger: console };' > node_modules/@flores-victoria/shared/index.js

# Create logging submodule
RUN printf 'const createLogger = (name) => ({\n  info: (...args) => console.log("[INFO]", "[" + name + "]", ...args),\n  error: (...args) => console.error("[ERROR]", "[" + name + "]", ...args),\n  warn: (...args) => console.warn("[WARN]", "[" + name + "]", ...args),\n  debug: (...args) => {}\n});\nmodule.exports = { createLogger };\n' > node_modules/@flores-victoria/shared/logging/index.js

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

EXPOSE 3000

CMD ["node", "src/server.js"]
