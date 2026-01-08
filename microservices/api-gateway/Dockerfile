# Dockerfile para api-gateway - Railway Compatible
# Build version: 3.0.0 - Regenerated clean
FROM node:22-slim

WORKDIR /app

# Copy package files (paths relative to Root Directory: microservices/api-gateway)
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

# Copy source code
COPY src ./src/

# Create stub for @flores-victoria/shared module
RUN mkdir -p /app/node_modules/@flores-victoria/shared && \
    mkdir -p /app/node_modules/@flores-victoria/shared/middleware && \
    mkdir -p /app/node_modules/@flores-victoria/shared/services

# Create main index.js
RUN echo 'const logger = { \
  info: (...args) => console.log("[INFO]", ...args), \
  error: (...args) => console.error("[ERROR]", ...args), \
  warn: (...args) => console.warn("[WARN]", ...args), \
  debug: (...args) => console.log("[DEBUG]", ...args) \
}; \
const createLogger = (name) => ({ \
  info: (...args) => console.log(`[INFO][${name}]`, ...args), \
  error: (...args) => console.error(`[ERROR][${name}]`, ...args), \
  warn: (...args) => console.warn(`[WARN][${name}]`, ...args), \
  debug: (...args) => console.log(`[DEBUG][${name}]`, ...args) \
}); \
module.exports = { logger, createLogger };' > /app/node_modules/@flores-victoria/shared/index.js

# Create logging.js
RUN echo 'const logger = { \
  info: (...args) => console.log("[INFO]", ...args), \
  error: (...args) => console.error("[ERROR]", ...args), \
  warn: (...args) => console.warn("[WARN]", ...args), \
  debug: (...args) => console.log("[DEBUG]", ...args) \
}; \
const createLogger = (name) => ({ \
  info: (...args) => console.log(`[INFO][${name}]`, ...args), \
  error: (...args) => console.error(`[ERROR][${name}]`, ...args), \
  warn: (...args) => console.warn(`[WARN][${name}]`, ...args), \
  debug: (...args) => console.log(`[DEBUG][${name}]`, ...args) \
}); \
module.exports = { logger, createLogger };' > /app/node_modules/@flores-victoria/shared/logging.js

# Create middleware/index.js
RUN echo 'const errorHandler = (err, req, res, next) => { \
  console.error("[ERROR]", err.message); \
  res.status(err.status || 500).json({ error: true, message: err.message }); \
}; \
const notFoundHandler = (req, res) => { \
  res.status(404).json({ error: true, message: "Not found" }); \
}; \
const requestLogger = (req, res, next) => { \
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`); \
  next(); \
}; \
const securityHeaders = (req, res, next) => { \
  res.setHeader("X-Content-Type-Options", "nosniff"); \
  res.setHeader("X-Frame-Options", "DENY"); \
  next(); \
}; \
const validateRequest = () => (req, res, next) => next(); \
const rateLimiter = () => (req, res, next) => next(); \
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); \
module.exports = { errorHandler, notFoundHandler, requestLogger, securityHeaders, validateRequest, rateLimiter, asyncHandler };' > /app/node_modules/@flores-victoria/shared/middleware/index.js

# Create csrf.js middleware
RUN echo 'const csrf = () => (req, res, next) => next(); \
const csrfProtection = () => (req, res, next) => next(); \
const generateToken = () => "csrf-token"; \
module.exports = { csrf, csrfProtection, generateToken, default: csrf };' > /app/node_modules/@flores-victoria/shared/middleware/csrf.js

# Create package.json for shared module
RUN echo '{ \
  "name": "@flores-victoria/shared", \
  "version": "1.0.0", \
  "main": "index.js", \
  "exports": { \
    ".": "./index.js", \
    "./logging": "./logging.js", \
    "./middleware": "./middleware/index.js", \
    "./middleware/csrf": "./middleware/csrf.js" \
  } \
}' > /app/node_modules/@flores-victoria/shared/package.json

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "src/server.js"]
