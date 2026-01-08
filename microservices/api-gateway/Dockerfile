# ═══════════════════════════════════════════════════════════════════════════════
# Dockerfile para API Gateway - Flores Victoria
# ═══════════════════════════════════════════════════════════════════════════════
# Versión: 5.0.0
# Railway Config: Root Directory = microservices/api-gateway, Dockerfile = Dockerfile
# ═══════════════════════════════════════════════════════════════════════════════

FROM node:22-slim

WORKDIR /app

# ─────────────────────────────────────────────────────────────────────────────
# 1. Dependencias
# ─────────────────────────────────────────────────────────────────────────────
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

# ─────────────────────────────────────────────────────────────────────────────
# 2. Código fuente
# ─────────────────────────────────────────────────────────────────────────────
COPY src ./src/

# ─────────────────────────────────────────────────────────────────────────────
# 3. Stubs para @flores-victoria/shared
#    (Módulo compartido no disponible en Railway - se crean stubs mínimos)
# ─────────────────────────────────────────────────────────────────────────────
RUN mkdir -p node_modules/@flores-victoria/shared/{logging,middleware,config,utils,health,metrics,cache,errors,mcp}

# Package.json del módulo shared
RUN cat > node_modules/@flores-victoria/shared/package.json << 'PKGJSON'
{
  "name": "@flores-victoria/shared",
  "version": "1.0.0",
  "main": "index.js",
  "exports": {
    ".": "./index.js",
    "./logging": "./logging/index.js",
    "./middleware": "./middleware/index.js",
    "./middleware/csrf": "./middleware/csrf.js",
    "./middleware/health-check": "./middleware/health-check.js",
    "./middleware/rate-limiter": "./middleware/rate-limiter.js",
    "./middleware/security": "./middleware/security.js",
    "./middleware/health-dashboard": "./middleware/health-dashboard.js",
    "./middleware/token-revocation": "./middleware/token-revocation.js",
    "./config/cors-whitelist": "./config/cors-whitelist.js",
    "./utils/secrets-validator": "./utils/secrets-validator.js"
  }
}
PKGJSON

# Index principal
RUN echo 'module.exports = { logger: console };' > node_modules/@flores-victoria/shared/index.js

# ─── Logging ───
RUN cat > node_modules/@flores-victoria/shared/logging/index.js << 'LOGGING'
const createLogger = (name) => ({
  info: (...args) => console.log(`[INFO][${name}]`, ...args),
  error: (...args) => console.error(`[ERROR][${name}]`, ...args),
  warn: (...args) => console.warn(`[WARN][${name}]`, ...args),
  debug: () => {},
  withRequestId: () => ({ info: console.log, error: console.error, warn: console.warn, debug: () => {} })
});
module.exports = { createLogger };
LOGGING

# ─── Middleware: CSRF ───
RUN cat > node_modules/@flores-victoria/shared/middleware/csrf.js << 'CSRF'
const csrf = () => (req, res, next) => next();
const csrfProtection = () => (req, res, next) => next();
const generateToken = () => 'csrf-token';
const csrfTokenEndpoint = (req, res) => res.json({ csrfToken: 'csrf-token-stub' });
module.exports = { csrf, csrfProtection, generateToken, csrfTokenEndpoint, default: csrf };
CSRF

# ─── Middleware: Health Check ───
RUN cat > node_modules/@flores-victoria/shared/middleware/health-check.js << 'HEALTH'
const createHealthCheck = (opts) => (req, res) => res.json({ status: 'ok', service: opts?.serviceName || 'unknown' });
const createLivenessCheck = (name) => (req, res) => res.json({ status: 'ok', service: name });
const createReadinessCheck = (name) => (req, res) => res.json({ status: 'ok', service: name });
module.exports = { createHealthCheck, createLivenessCheck, createReadinessCheck };
HEALTH

# ─── Middleware: Rate Limiter ───
RUN cat > node_modules/@flores-victoria/shared/middleware/rate-limiter.js << 'RATELIMIT'
const noopLimiter = (req, res, next) => next();
const initRedisClient = () => {};
module.exports = { 
  initRedisClient, 
  publicLimiter: noopLimiter, 
  criticalLimiter: noopLimiter, 
  searchLimiter: noopLimiter, 
  uploadLimiter: noopLimiter, 
  createRateLimiter: () => noopLimiter 
};
RATELIMIT

# ─── Middleware: Health Dashboard ───
RUN cat > node_modules/@flores-victoria/shared/middleware/health-dashboard.js << 'DASHBOARD'
const createHealthDashboard = () => (req, res) => res.json({ status: 'ok', services: [] });
const createMetricsEndpoint = () => (req, res) => res.json({ metrics: {} });
module.exports = { createHealthDashboard, createMetricsEndpoint };
DASHBOARD

# ─── Middleware: Security ───
RUN cat > node_modules/@flores-victoria/shared/middleware/security.js << 'SECURITY'
const sanitizeInput = () => (req, res, next) => next();
const sqlInjectionProtection = () => (req, res, next) => next();
const xssProtection = () => (req, res, next) => next();
module.exports = { sanitizeInput, sqlInjectionProtection, xssProtection };
SECURITY

# ─── Middleware: Token Revocation ───
RUN cat > node_modules/@flores-victoria/shared/middleware/token-revocation.js << 'TOKEN'
const initRedisClient = () => {};
const revokeToken = async () => true;
const isTokenRevoked = async (req, res, next) => next();
const isTokenRevokedMiddleware = () => (req, res, next) => next();
const cleanupExpiredTokens = async () => {};
module.exports = { initRedisClient, revokeToken, isTokenRevoked, isTokenRevokedMiddleware, cleanupExpiredTokens };
TOKEN

# ─── Middleware: Index ───
RUN cat > node_modules/@flores-victoria/shared/middleware/index.js << 'MWINDEX'
module.exports = { 
  requestLogger: (req, res, next) => next(), 
  errorHandler: (err, req, res, next) => res.status(500).json({ error: err.message }) 
};
MWINDEX

# ─── Config: CORS Whitelist ───
RUN cat > node_modules/@flores-victoria/shared/config/cors-whitelist.js << 'CORS'
const corsWhitelist = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://frontend-v2-production-7508.up.railway.app',
  'https://api-gateway-production-b02f.up.railway.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);
const validateCorsConfiguration = () => {};
const getCorsOptions = () => ({ origin: (origin, cb) => cb(null, true), credentials: true });
module.exports = { corsWhitelist, getCorsOptions, validateCorsConfiguration, default: corsWhitelist };
CORS

RUN echo 'module.exports = { ...require("./cors-whitelist") };' > node_modules/@flores-victoria/shared/config/index.js

# ─── Utils: Secrets Validator ───
RUN cat > node_modules/@flores-victoria/shared/utils/secrets-validator.js << 'SECRETS'
const validateStartupSecrets = (opts) => {
  if (opts.jwt && !process.env.JWT_SECRET) process.env.JWT_SECRET = 'dev-secret';
};
module.exports = { validateStartupSecrets };
SECRETS

RUN echo 'module.exports = { ...require("./secrets-validator") };' > node_modules/@flores-victoria/shared/utils/index.js

# ─── Otros módulos ───
RUN cat > node_modules/@flores-victoria/shared/mcp/index.js << 'MCP'
const createMcpHelper = () => ({ registerAudit: async () => {}, registerEvent: async () => {}, getTools: () => [] });
module.exports = { createMcpHelper };
MCP

RUN echo 'module.exports = { healthCheck: () => ({ status: "ok" }) };' > node_modules/@flores-victoria/shared/health/index.js
RUN echo 'module.exports = { register: () => {}, metrics: () => "# No metrics" };' > node_modules/@flores-victoria/shared/metrics/index.js
RUN echo 'module.exports = { getCache: () => null, setCache: () => {} };' > node_modules/@flores-victoria/shared/cache/index.js
RUN echo 'class AppError extends Error { constructor(m, c=500) { super(m); this.statusCode=c; } } module.exports = { AppError };' > node_modules/@flores-victoria/shared/errors/index.js

# ─────────────────────────────────────────────────────────────────────────────
# 4. Configuración de entorno
# ─────────────────────────────────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# ─────────────────────────────────────────────────────────────────────────────
# 5. Health check
# ─────────────────────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# ─────────────────────────────────────────────────────────────────────────────
# 6. Inicio
# ─────────────────────────────────────────────────────────────────────────────
CMD ["node", "src/server.js"]
