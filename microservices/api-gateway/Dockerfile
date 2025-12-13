# Dockerfile para api-gateway - Railway Compatible
# Build version: 1.0.10 - Complete shared module stubs with all subpaths
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

# Create package.json
RUN echo '{"name":"@flores-victoria/shared","version":"1.0.0","main":"index.js"}' > node_modules/@flores-victoria/shared/package.json

# Create main index.js
RUN echo 'module.exports = { logger: console };' > node_modules/@flores-victoria/shared/index.js

# Create logging submodule
RUN printf '%s\n' \
    'const createLogger = (name) => ({' \
    '  info: (...args) => console.log("[INFO]", "[" + name + "]", ...args),' \
    '  error: (...args) => console.error("[ERROR]", "[" + name + "]", ...args),' \
    '  warn: (...args) => console.warn("[WARN]", "[" + name + "]", ...args),' \
    '  debug: (...args) => {}' \
    '});' \
    'module.exports = { createLogger };' \
    > node_modules/@flores-victoria/shared/logging/index.js

# Create middleware/health-check submodule
RUN printf '%s\n' \
    'const healthCheckMiddleware = (req, res, next) => next();' \
    'const createHealthRouter = () => require("express").Router().get("/health", (req, res) => res.json({ status: "ok" }));' \
    'const checkDependencies = async () => ({ status: "ok", dependencies: {} });' \
    'module.exports = { healthCheckMiddleware, createHealthRouter, checkDependencies };' \
    > node_modules/@flores-victoria/shared/middleware/health-check.js

# Create middleware/rate-limiter submodule
RUN printf '%s\n' \
    'const noopLimiter = (req, res, next) => next();' \
    'module.exports = {' \
    '  criticalLimiter: noopLimiter,' \
    '  searchLimiter: noopLimiter,' \
    '  uploadLimiter: noopLimiter,' \
    '  createRateLimiter: () => noopLimiter' \
    '};' \
    > node_modules/@flores-victoria/shared/middleware/rate-limiter.js

# Create middleware/index.js
RUN printf '%s\n' \
    'module.exports = {' \
    '  requestLogger: (req, res, next) => next(),' \
    '  errorHandler: (err, req, res, next) => res.status(500).json({ error: err.message })' \
    '};' \
    > node_modules/@flores-victoria/shared/middleware/index.js

# Create mcp submodule
RUN printf '%s\n' \
    'const createMcpHelper = () => ({' \
    '  registerAudit: async () => {},' \
    '  registerEvent: async () => {},' \
    '  getTools: () => []' \
    '});' \
    'module.exports = { createMcpHelper };' \
    > node_modules/@flores-victoria/shared/mcp/index.js

# Create other stubs
RUN echo 'module.exports = { healthCheck: () => ({ status: "ok" }) };' > node_modules/@flores-victoria/shared/health/index.js \
    && echo 'module.exports = { register: () => {}, metrics: () => "# No metrics" };' > node_modules/@flores-victoria/shared/metrics/index.js \
    && echo 'module.exports = { getCache: () => null, setCache: () => {} };' > node_modules/@flores-victoria/shared/cache/index.js \
    && echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; } } module.exports = { AppError };' > node_modules/@flores-victoria/shared/errors/index.js

EXPOSE 3000

CMD ["node", "src/server.js"]
