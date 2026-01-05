# admin-dashboard-service - Flores Victoria v3.1.0
# Railway rootDirectory = microservices/admin-dashboard-service
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Ensure node_modules exists before npm ci (fix for mkdir -p issue)
RUN mkdir -p /app/node_modules

RUN npm ci --omit=dev

COPY src/ ./src/

# Remove npm-installed @flores-victoria (if any) and create our stubs
RUN rm -rf /app/node_modules/@flores-victoria && \
    mkdir -p /app/node_modules/@flores-victoria/shared/utils && \
    mkdir -p /app/node_modules/@flores-victoria/shared/middleware && \
    mkdir -p /app/node_modules/@flores-victoria/shared/logging

# All shared module stubs in one RUN to avoid cache issues
RUN printf '{"name":"@flores-victoria/shared","version":"1.0.0","main":"index.js"}\n' > /app/node_modules/@flores-victoria/shared/package.json && \
    printf 'const logger = { info: console.log, error: console.error, warn: console.warn, debug: () => {} };\nmodule.exports = { logger };\n' > /app/node_modules/@flores-victoria/shared/utils/logger.js && \
    printf 'const noopLimiter = (req, res, next) => next();\nmodule.exports = { criticalLimiter: noopLimiter, publicLimiter: noopLimiter, searchLimiter: noopLimiter };\n' > /app/node_modules/@flores-victoria/shared/middleware/rate-limiter.js && \
    printf 'const isTokenRevokedMiddleware = () => (req, res, next) => next();\nconst revokeToken = async () => {};\nconst initRedisClient = () => {};\nmodule.exports = { isTokenRevokedMiddleware, revokeToken, initRedisClient };\n' > /app/node_modules/@flores-victoria/shared/middleware/token-revocation.js && \
    printf 'module.exports = { logger: console };\n' > /app/node_modules/@flores-victoria/shared/index.js && \
    echo 'const metricsSimple = { httpRequestsTotal: { inc: () => {} }, httpRequestDuration: { observe: () => {} }, register: { metrics: () => Promise.resolve("") } }; module.exports = metricsSimple;' > /app/node_modules/@flores-victoria/shared/metrics-simple.js && \
    mkdir -p /app/shared && echo 'const metricsSimple = { httpRequestsTotal: { inc: () => {} }, httpRequestDuration: { observe: () => {} }, register: { metrics: () => Promise.resolve("") } }; module.exports = metricsSimple;' > /app/shared/metrics-simple.js

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "src/server.js"]
