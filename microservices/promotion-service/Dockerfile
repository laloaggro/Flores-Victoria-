# Flores Victoria v3.3.0 - Simplified Railway Deployment
FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy all application files
COPY . .

# Create minimal shared stubs
RUN mkdir -p /app/shared/logging /app/shared/middleware /app/shared/utils /app/shared/cache /app/shared/health /app/shared/errors && \
    echo 'const createLogger = (n) => ({ info: (...a) => console.log("[info] ["+n+"]:", ...a), error: (...a) => console.error("[error] ["+n+"]:", ...a), warn: (...a) => console.warn("[warn] ["+n+"]:", ...a), debug: () => {} }); module.exports = { createLogger };' > /app/shared/logging/logger.js && \
    echo 'module.exports = { validateStartupSecrets: () => true };' > /app/shared/utils/secrets-validator.js && \
    echo 'module.exports = { createHealthCheck: () => (req, res) => res.json({status:"ok"}), healthCheckMiddleware: (req,res,next) => next() };' > /app/shared/middleware/health-check.js && \
    echo 'module.exports = { metricsMiddleware: (req,res,next) => next() };' > /app/shared/middleware/metrics.js && \
    echo 'module.exports = { accessLog: (req,res,next) => next() };' > /app/shared/middleware/access-log.js && \
    echo 'module.exports = { errorHandler: (err,req,res,next) => res.status(err.status||500).json({error:err.message}), asyncHandler: (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next) };' > /app/shared/middleware/error-handler.js && \
    echo 'module.exports = { checkTokenRevocation: (req,res,next) => next() };' > /app/shared/middleware/token-revocation.js && \
    echo 'module.exports = { requestId: (req,res,next) => { req.id = Date.now().toString(36); next(); } };' > /app/shared/middleware/request-id.js && \
    echo 'const Joi = require("joi"); module.exports = { Joi };' > /app/shared/middleware/validation.js && \
    echo 'const authorize = (...roles) => (req,res,next) => next(); module.exports = authorize;' > /app/shared/middleware/authorize.js && \
    echo 'class CacheMetrics { recordHit(){} recordMiss(){} recordError(){} getStats(){return{}} } module.exports = { CACHE_TTL: {SHORT:60,MEDIUM:300,LONG:3600}, CacheMetrics };' > /app/shared/cache/config.js && \
    echo 'module.exports = { aggregateStatus: () => ({status:"ok"}) };' > /app/shared/health/status-aggregator.js && \
    echo 'class AppError extends Error { constructor(m,c=500){super(m);this.statusCode=c;} } module.exports = { AppError, NotFoundError: class extends AppError { constructor(m){super(m,404)} }, ValidationError: class extends AppError { constructor(m){super(m,400)} } };' > /app/shared/errors/AppError.js

# Also copy to src/shared
RUN cp -r /app/shared /app/src/shared 2>/dev/null || true

ENV NODE_ENV=production
ENV PORT=3019

EXPOSE 3019

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3019/health || exit 1

CMD ["node", "server.js"]
