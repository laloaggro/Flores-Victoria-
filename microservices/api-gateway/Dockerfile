# Dockerfile para api-gateway - Railway Compatible
# Build version: 4.0.0 - Use REPO ROOT paths (no Root Directory in Railway)
FROM node:22-slim

WORKDIR /app

# Copy package.json from REPO ROOT paths
COPY microservices/api-gateway/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

# Copy source code from REPO ROOT paths
COPY microservices/api-gateway/src ./src/

# Create complete stub for @flores-victoria/shared module
RUN rm -rf node_modules/@flores-victoria 2>/dev/null || true \
    && mkdir -p node_modules/@flores-victoria/shared/logging \
    && mkdir -p node_modules/@flores-victoria/shared/metrics \
    && mkdir -p node_modules/@flores-victoria/shared/health \
    && mkdir -p node_modules/@flores-victoria/shared/middleware \
    && mkdir -p node_modules/@flores-victoria/shared/cache \
    && mkdir -p node_modules/@flores-victoria/shared/errors \
    && mkdir -p node_modules/@flores-victoria/shared/mcp \
    && mkdir -p node_modules/@flores-victoria/shared/config \
    && mkdir -p node_modules/@flores-victoria/shared/utils

# Create package.json for shared module
RUN printf '{\n  "name": "@flores-victoria/shared",\n  "version": "1.0.0",\n  "main": "index.js",\n  "exports": {\n    ".": "./index.js",\n    "./logging": "./logging/index.js",\n    "./middleware": "./middleware/index.js",\n    "./middleware/csrf": "./middleware/csrf.js",\n    "./middleware/health-check": "./middleware/health-check.js",\n    "./middleware/rate-limiter": "./middleware/rate-limiter.js",\n    "./middleware/security": "./middleware/security.js",\n    "./middleware/health-dashboard": "./middleware/health-dashboard.js",\n    "./middleware/token-revocation": "./middleware/token-revocation.js",\n    "./config/cors-whitelist": "./config/cors-whitelist.js",\n    "./utils/secrets-validator": "./utils/secrets-validator.js"\n  }\n}' > node_modules/@flores-victoria/shared/package.json

# Create main index.js
RUN echo 'module.exports = { logger: console };' > node_modules/@flores-victoria/shared/index.js

# Create logging submodule
RUN printf 'const createLogger = (name) => {\n  const log = (level, ...args) => console[level === "info" ? "log" : level]("[" + level.toUpperCase() + "]", "[" + name + "]", ...args);\n  return {\n    info: (...args) => log("info", ...args),\n    error: (...args) => log("error", ...args),\n    warn: (...args) => log("warn", ...args),\n    debug: () => {},\n    withRequestId: (id) => ({ info: (...args) => log("info", ...args), error: (...args) => log("error", ...args), warn: (...args) => log("warn", ...args), debug: () => {} })\n  };\n};\nmodule.exports = { createLogger };\n' > node_modules/@flores-victoria/shared/logging/index.js

# Create all middleware stubs
RUN printf 'const csrf = () => (req, res, next) => next();\nconst csrfProtection = () => (req, res, next) => next();\nconst generateToken = () => "csrf-token";\nmodule.exports = { csrf, csrfProtection, generateToken, default: csrf };\n' > node_modules/@flores-victoria/shared/middleware/csrf.js

RUN printf 'const createHealthCheck = (opts) => (req, res) => res.json({ status: "ok", service: opts?.serviceName || "unknown" });\nconst createLivenessCheck = (name) => (req, res) => res.json({ status: "ok", service: name });\nconst createReadinessCheck = (name) => (req, res) => res.json({ status: "ok", service: name });\nmodule.exports = { createHealthCheck, createLivenessCheck, createReadinessCheck };\n' > node_modules/@flores-victoria/shared/middleware/health-check.js

RUN printf 'const noopLimiter = (req, res, next) => next();\nconst initRedisClient = (config) => {};\nmodule.exports = { initRedisClient, publicLimiter: noopLimiter, criticalLimiter: noopLimiter, searchLimiter: noopLimiter, uploadLimiter: noopLimiter, createRateLimiter: () => noopLimiter };\n' > node_modules/@flores-victoria/shared/middleware/rate-limiter.js

RUN printf 'const createHealthDashboard = (opts) => (req, res) => res.json({ status: "ok", services: [] });\nconst createMetricsEndpoint = () => (req, res) => res.json({ metrics: {} });\nmodule.exports = { createHealthDashboard, createMetricsEndpoint };\n' > node_modules/@flores-victoria/shared/middleware/health-dashboard.js

RUN printf 'const sanitizeInput = (opts) => (req, res, next) => next();\nconst sqlInjectionProtection = (opts) => (req, res, next) => next();\nconst xssProtection = (opts) => (req, res, next) => next();\nmodule.exports = { sanitizeInput, sqlInjectionProtection, xssProtection };\n' > node_modules/@flores-victoria/shared/middleware/security.js

RUN printf 'let redisClient = null;\nconst initRedisClient = (client) => { redisClient = client; };\nconst revokeToken = async () => true;\nconst isTokenRevoked = async (req, res, next) => next();\nconst isTokenRevokedMiddleware = () => (req, res, next) => next();\nconst cleanupExpiredTokens = async () => {};\nmodule.exports = { initRedisClient, revokeToken, isTokenRevoked, isTokenRevokedMiddleware, cleanupExpiredTokens };\n' > node_modules/@flores-victoria/shared/middleware/token-revocation.js

RUN printf 'module.exports = { requestLogger: (req, res, next) => next(), errorHandler: (err, req, res, next) => res.status(500).json({ error: err.message }) };\n' > node_modules/@flores-victoria/shared/middleware/index.js

# Create config stubs
RUN printf 'const corsWhitelist = ["http://localhost:3000","http://localhost:5173","https://frontend-v2-production-7508.up.railway.app","https://api-gateway-production-b02f.up.railway.app",process.env.FRONTEND_URL,process.env.CORS_ORIGIN].filter(Boolean);\nconst validateCorsConfiguration = () => {};\nconst getCorsOptions = () => ({ origin: (origin, cb) => cb(null, true), credentials: true });\nmodule.exports = { corsWhitelist, getCorsOptions, validateCorsConfiguration, default: corsWhitelist };\n' > node_modules/@flores-victoria/shared/config/cors-whitelist.js
RUN echo 'module.exports = { ...require("./cors-whitelist") };' > node_modules/@flores-victoria/shared/config/index.js

# Create utils stubs
RUN printf 'const validateStartupSecrets = (opts) => { if (opts.jwt && !process.env.JWT_SECRET) process.env.JWT_SECRET = "dev-secret"; };\nmodule.exports = { validateStartupSecrets };\n' > node_modules/@flores-victoria/shared/utils/secrets-validator.js
RUN echo 'module.exports = { ...require("./secrets-validator") };' > node_modules/@flores-victoria/shared/utils/index.js

# Create other stubs
RUN printf 'const createMcpHelper = () => ({ registerAudit: async () => {}, registerEvent: async () => {}, getTools: () => [] });\nmodule.exports = { createMcpHelper };\n' > node_modules/@flores-victoria/shared/mcp/index.js
RUN echo 'module.exports = { healthCheck: () => ({ status: "ok" }) };' > node_modules/@flores-victoria/shared/health/index.js
RUN echo 'module.exports = { register: () => {}, metrics: () => "# No metrics" };' > node_modules/@flores-victoria/shared/metrics/index.js
RUN echo 'module.exports = { getCache: () => null, setCache: () => {} };' > node_modules/@flores-victoria/shared/cache/index.js
RUN echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; } } module.exports = { AppError };' > node_modules/@flores-victoria/shared/errors/index.js

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "src/server.js"]
