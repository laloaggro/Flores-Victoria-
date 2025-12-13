# Dockerfile para api-gateway - Railway Compatible
# Build version: 1.0.9 - Complete shared module stubs
FROM node:22-slim

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

# Copy api-gateway source code
COPY src ./src/

# Create complete stub for @flores-victoria/shared module with all submodules
RUN mkdir -p node_modules/@flores-victoria/shared/logging && \
    mkdir -p node_modules/@flores-victoria/shared/metrics && \
    mkdir -p node_modules/@flores-victoria/shared/health && \
    mkdir -p node_modules/@flores-victoria/shared/middleware && \
    mkdir -p node_modules/@flores-victoria/shared/cache && \
    mkdir -p node_modules/@flores-victoria/shared/errors && \
    # Main package.json
    echo '{"name":"@flores-victoria/shared","version":"1.0.0","main":"index.js"}' > node_modules/@flores-victoria/shared/package.json && \
    # Main index.js
    echo 'module.exports = { logger: console, metrics: { register: () => {}, metrics: () => "# No metrics" } };' > node_modules/@flores-victoria/shared/index.js && \
    # Logging submodule - createLogger stub
    echo 'const createLogger = (name) => ({ info: (...args) => console.log("[INFO]", `[${name}]`, ...args), error: (...args) => console.error("[ERROR]", `[${name}]`, ...args), warn: (...args) => console.warn("[WARN]", `[${name}]`, ...args), debug: (...args) => console.debug("[DEBUG]", `[${name}]`, ...args) }); module.exports = { createLogger };' > node_modules/@flores-victoria/shared/logging/index.js && \
    # Health submodule
    echo 'module.exports = { healthCheck: () => ({ status: "ok" }) };' > node_modules/@flores-victoria/shared/health/index.js && \
    # Metrics submodule
    echo 'module.exports = { register: () => {}, metrics: () => "# No metrics", counter: () => ({ inc: () => {} }), histogram: () => ({ observe: () => {} }) };' > node_modules/@flores-victoria/shared/metrics/index.js && \
    # Middleware submodule
    echo 'module.exports = { requestLogger: (req, res, next) => next(), errorHandler: (err, req, res, next) => res.status(500).json({ error: err.message }) };' > node_modules/@flores-victoria/shared/middleware/index.js && \
    # Cache submodule
    echo 'module.exports = { getCache: () => null, setCache: () => {}, deleteCache: () => {} };' > node_modules/@flores-victoria/shared/cache/index.js && \
    # Errors submodule
    echo 'class AppError extends Error { constructor(message, statusCode = 500) { super(message); this.statusCode = statusCode; } } module.exports = { AppError };' > node_modules/@flores-victoria/shared/errors/index.js

EXPOSE 3000

CMD ["node", "src/server.js"]
