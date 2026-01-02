# admin-dashboard-service - Flores Victoria v3.1.0
# Railway rootDirectory = microservices/admin-dashboard-service
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# Create @flores-victoria/shared module stubs
RUN mkdir -p node_modules/@flores-victoria/shared/utils \
    && mkdir -p node_modules/@flores-victoria/shared/middleware \
    && mkdir -p node_modules/@flores-victoria/shared/logging

# Package.json for shared module
RUN printf '{"name":"@flores-victoria/shared","version":"1.0.0","main":"index.js"}\n' > node_modules/@flores-victoria/shared/package.json

# Logger stub
RUN printf 'const logger = { info: console.log, error: console.error, warn: console.warn, debug: () => {} };\nmodule.exports = { logger };\n' > node_modules/@flores-victoria/shared/utils/logger.js

# Rate-limiter stub
RUN printf 'const noopLimiter = (req, res, next) => next();\nmodule.exports = { criticalLimiter: noopLimiter, publicLimiter: noopLimiter, searchLimiter: noopLimiter };\n' > node_modules/@flores-victoria/shared/middleware/rate-limiter.js

# Token-revocation stub (silenced)
RUN printf 'const checkTokenRevocation = (req, res, next) => next();\nconst revokeToken = async () => {};\nconst initRedisClient = () => {};\nmodule.exports = { checkTokenRevocation, revokeToken, initRedisClient };\n' > node_modules/@flores-victoria/shared/middleware/token-revocation.js

# Main index
RUN printf 'module.exports = { logger: console };\n' > node_modules/@flores-victoria/shared/index.js

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "src/server.js"]
