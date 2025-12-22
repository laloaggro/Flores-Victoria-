# 🛠️ RECOMENDACIONES TÉCNICAS DETALLADAS - FLORES VICTORIA

**Documento Técnico para Implementación**  
**Fecha:** 19 de diciembre de 2025

---

## 1. SEGURIDAD - ACCIONES INMEDIATAS

### 1.1 Remover .env del Control de Versiones

**Paso 1: Verificar estado actual**
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria

# Verificar si .env está trackeado
git status | grep "\.env"
git ls-files | grep "\.env"

# Ver contenido si existe
ls -la microservices/.env* 2>/dev/null || echo "No .env files found"
```

**Paso 2: Remover del historio de Git**
```bash
# Remover del tracking sin borrar del filesystem
git rm --cached microservices/.env 2>/dev/null
git rm --cached microservices/*/\.env 2>/dev/null

# O si ya no existen en filesystem:
git filter-branch --tree-filter 'rm -f microservices/.env' HEAD 2>/dev/null || echo "N/A"
```

**Paso 3: Actualizar .gitignore**
```bash
# Agregar a .gitignore
cat >> .gitignore << 'EOF'

# ============================================
# Environment Variables - NUNCA trackear
# ============================================
.env
.env.local
.env.*.local
.env.production
.env.development
*.env

# ============================================
# Secrets
# ============================================
secrets/
.secrets/
private/

# ============================================
# Logs & Temp
# ============================================
logs/
*.log
tmp/
EOF

git add .gitignore
git commit -m "Update .gitignore - exclude all .env files"
```

**Paso 4: Crear template correcto**
```bash
# Asegurar que .env.example existe y es completo
cat > microservices/.env.example << 'EOF'
# ============================================
# IMPORTANTE: Este es un EJEMPLO SOLAMENTE
# Copiar a .env y reemplazar con valores reales
# NUNCA commitear .env a Git
# ============================================

# API Gateway
PORT=3000
NODE_ENV=production

# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flores_db
DB_USER=flores_user
DB_PASSWORD=<GENERAR: openssl rand -base64 24>

# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=<GENERAR: openssl rand -base64 24>
MONGODB_URI=mongodb://admin:<PASSWORD>@mongodb:27017/products_db?authSource=admin

# JWT - GENERAR: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<GENERAR: 64+ caracteres aleatorios>
JWT_REFRESH_SECRET=<GENERAR: diferente a JWT_SECRET>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<OPCIONAL>
REDIS_RATELIMIT_DB=2
REDIS_CACHE_DB=1

# CORS - Espaciado separado por comas
CORS_ORIGINS=https://api.ejemplo.com,https://admin.ejemplo.com,http://localhost:3000

# RabbitMQ (futuro)
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=<GENERAR>

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoreo
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
GRAFANA_ENABLED=true
GRAFANA_PASSWORD=<GENERAR>
EOF

echo "✅ Template creado: microservices/.env.example"
```

### 1.2 Corregir CORS Hardcodeado

**Ubicaciones a Corregir:**

**Archivo 1:** microservices/user-service/src/app.js
```javascript
// ANTES (línea 55-57):
const corsOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3002',
];

// DESPUÉS:
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

// O mejor, crear función helper:
const getCORSOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
  }
  // Desarrollo: permitir localhost
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3010',
    'http://localhost:3001',
  ];
};
```

**Archivo 2:** microservices/product-service/src/middleware/common.js
```javascript
// ANTES (línea 37-38):
origin: [
  'http://localhost:3000',
  'http://localhost:3009',
],

// DESPUÉS:
origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
```

**Archivo 3:** microservices/review-service/src/middleware/common.js
```javascript
// ANTES (línea 14):
origin: process.env.CORS_ORIGIN || 'http://localhost:3000',

// DESPUÉS:
origin: process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',') : 
  'http://localhost:3000',
```

**Script para aplicar cambios automáticamente:**
```bash
#!/bin/bash
# scripts/fix-cors-hardcoding.sh

echo "🔧 Corrigiendo CORS hardcodeado..."

# Archivos a corregir
FILES=(
  "microservices/user-service/src/app.js"
  "microservices/user-service/src/server.simple.js"
  "microservices/product-service/src/middleware/common.js"
  "microservices/review-service/src/middleware/common.js"
  "microservices/promotion-service/server.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Reemplazar localhost hardcodeado
    sed -i "s/'http:\/\/localhost:3000'/(process.env.CORS_ORIGINS || 'http:\/\/localhost:3000').split(',')/g" "$file"
    sed -i "s/'http:\/\/localhost:5173'/(process.env.CORS_ORIGINS || 'http:\/\/localhost:5173').split(',')/g" "$file"
    echo "✅ $file"
  fi
done

echo "✅ CORS hardcoding corregido"
```

### 1.3 Crear Shared Module para Validación

**Archivo:** microservices/shared/validators/index.js
```javascript
const Joi = require('joi');

// Schemas comunes reutilizables
const commonSchemas = {
  // ID validation
  id: Joi.string().trim().required().messages({
    'string.empty': 'ID no puede estar vacío',
    'any.required': 'ID es requerido',
  }),

  // Email validation
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email es requerido',
  }),

  // Password validation - Mínimo 8 chars, 1 mayúscula, 1 número
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password debe tener al menos 8 caracteres',
      'string.pattern.base': 'Password debe contener mayúsculas y números',
    }),

  // Rating validation
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating debe ser un número',
    'number.min': 'Rating mínimo es 1',
    'number.max': 'Rating máximo es 5',
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

// Validación middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        error: true,
        message: 'Validación fallida',
        details: messages,
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = {
  commonSchemas,
  validate,
  Joi,
};
```

**Uso en servicios:**
```javascript
// microservices/review-service/src/routes/reviews.js
const { validate, commonSchemas, Joi } = require('@flores-victoria/shared/validators');

const createReviewSchema = Joi.object({
  productId: commonSchemas.id,
  rating: commonSchemas.rating,
  comment: Joi.string().max(1000),
  ...commonSchemas.pagination,
});

router.post('/reviews', 
  validate(createReviewSchema),
  reviewController.create
);
```

---

## 2. LOGGING - CENTRALIZACIÓN

### 2.1 Crear Logger Único

**Archivo:** microservices/shared/logging/logger.js
```javascript
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

/**
 * Crear logger centralizado
 * @param {string} serviceName - Nombre del servicio
 * @param {string} environment - Entorno (development, test, production)
 * @returns {winston.Logger}
 */
const createLogger = (serviceName, environment = process.env.NODE_ENV || 'development') => {
  const isDev = environment === 'development';
  const logDir = path.join(process.cwd(), 'logs', serviceName);

  const transports = [
    // Consola siempre
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        isDev
          ? winston.format.colorize()
          : winston.format.uncolorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let metaStr = '';
          if (Object.keys(meta).length > 0) {
            metaStr = JSON.stringify(meta, null, 2);
          }
          return `[${timestamp}] [${level.toUpperCase()}] [${serviceName}] ${message} ${metaStr}`;
        })
      ),
    }),
  ];

  // File rotation solo en producción
  if (!isDev) {
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDir, '%DATE%-error.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxDays: '14d',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
      new DailyRotateFile({
        filename: path.join(logDir, '%DATE%-combined.log'),
        datePattern: 'YYYY-MM-DD',
        maxDays: '14d',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );
  }

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    defaultMeta: { service: serviceName },
    transports,
  });

  // Agregar método withRequestId para correlación
  logger.withRequestId = (requestId) => {
    return {
      info: (msg, meta) => logger.info(msg, { ...meta, requestId }),
      error: (msg, meta) => logger.error(msg, { ...meta, requestId }),
      warn: (msg, meta) => logger.warn(msg, { ...meta, requestId }),
      debug: (msg, meta) => logger.debug(msg, { ...meta, requestId }),
    };
  };

  return logger;
};

module.exports = { createLogger };
```

### 2.2 Middleware para Logging Automático

**Archivo:** microservices/shared/middleware/logging.js
```javascript
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware para logging de requests/responses
 */
const loggingMiddleware = (logger) => {
  return (req, res, next) => {
    // Generar request ID si no existe
    const requestId = req.get('x-request-id') || uuidv4();
    req.id = requestId;
    res.set('x-request-id', requestId);

    // Logger con contexto de request
    req.logger = logger.withRequestId(requestId);

    // Log request
    req.logger.debug(`${req.method} ${req.path}`, {
      query: req.query,
      body: sanitizeBody(req.body), // Remover passwords, tokens, etc.
    });

    // Capturar response
    const originalSend = res.send;
    res.send = function(data) {
      res.send = originalSend;

      const duration = Date.now() - req.startTime;
      req.logger.info(`${req.method} ${req.path}`, {
        status: res.statusCode,
        duration: `${duration}ms`,
      });

      return res.send(data);
    };

    req.startTime = Date.now();
    next();
  };
};

/**
 * Sanitizar body para no loguear información sensible
 */
const sanitizeBody = (body) => {
  if (!body) return body;

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'Authorization'];
  const sanitized = { ...body };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
};

module.exports = { loggingMiddleware };
```

### 2.3 Usar en Todos los Servicios

**Archivo:** microservices/{service}/src/server.js
```javascript
const express = require('express');
const { createLogger } = require('@flores-victoria/shared/logging');
const { loggingMiddleware } = require('@flores-victoria/shared/middleware/logging');

const app = express();
const logger = createLogger('product-service');

// Agregar early para capturar todos los requests
app.use(loggingMiddleware(logger));

// Resto del código...
```

---

## 3. TESTING - COBERTURA

### 3.1 Plan de Cobertura Escalonado

**Meta Inicial (1 mes): 40% cobertura**
```bash
# Servicios prioritarios (en orden):
1. auth-service (target: 85%)
2. product-service (target: 80%)
3. order-service (target: 75%)
4. cart-service (target: 70%)
```

**Meta Intermedia (3 meses): 60% cobertura**
```bash
# Agregar tests a servicios restantes
5. user-service
6. review-service
7. wishlist-service
8. contact-service
9. notification-service
```

**Meta Final (6 meses): 75% cobertura**
```bash
# API Gateway, servicios auxiliares, e2e tests
```

### 3.2 Test Fixtures para Servicios

**Archivo:** microservices/shared/test/fixtures.js
```javascript
/**
 * Fixtures para tests reutilizables
 */

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
  createdAt: new Date('2025-01-01'),
};

const mockProduct = {
  id: 'product-123',
  name: 'Rosa Roja',
  price: 49.99,
  category: 'rosas',
  stock: 50,
  description: 'Hermosa rosa roja',
};

const mockOrder = {
  id: 'order-123',
  userId: 'user-123',
  items: [{ productId: 'product-123', quantity: 1 }],
  total: 49.99,
  status: 'pending',
  createdAt: new Date(),
};

const mockReview = {
  id: 'review-123',
  productId: 'product-123',
  userId: 'user-123',
  rating: 5,
  comment: 'Excelente producto',
};

module.exports = {
  mockUser,
  mockProduct,
  mockOrder,
  mockReview,
};
```

### 3.3 Test para Auth Service

**Archivo:** microservices/auth-service/__tests__/auth.test.js (Extender)
```javascript
const request = require('supertest');
const app = require('../src/app');
const { mockUser } = require('@flores-victoria/shared/test/fixtures');
const jwt = require('jsonwebtoken');

describe('Auth Service', () => {
  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'SecurePass123',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', true);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'weak',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Primero registrar
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'SecurePass123',
        });

      // Luego login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'SecurePass123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'refresh@example.com',
          password: 'SecurePass123',
        });

      const refreshToken = registerRes.body.refreshToken;

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});
```

### 3.4 Configurar Coverage Thresholds

**Archivo:** config/jest.config.js (Actualizar)
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'microservices/*/src/**/*.js',
    '!microservices/*/src/server.js',
    '!microservices/*/src/app.js', // Opcional
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,      // Aumentar gradualmente
      functions: 50,
      lines: 50,
      statements: 50,
    },
    // Servicios críticos: requerimiento mayor
    './microservices/auth-service/': {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
    './microservices/product-service/': {
      branches: 75,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## 4. INFRAESTRUCTURA - MONITOREO

### 4.1 Agregar Prometheus y Grafana

**Archivo:** monitoring/docker-compose.monitoring.yml
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: flores-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:9090"]
      interval: 10s
      timeout: 5s
      retries: 5

  grafana:
    image: grafana/grafana:latest
    container_name: flores-grafana
    ports:
      - "3011:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_INSTALL_PLUGINS: 'grafana-piechart-panel'
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  node-exporter:
    image: prom/node-exporter:latest
    container_name: flores-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - app-network

volumes:
  prometheus-data:
  grafana-data:

networks:
  app-network:
    external: true
```

### 4.2 Exportar Métricas desde Servicios

**Archivo:** microservices/shared/middleware/metrics.js
```javascript
const promClient = require('prom-client');

// Métricas standard
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'collection'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

// Middleware para auto-recolectar métricas
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);

    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });

  next();
};

// Endpoint para Prometheus
const metricsEndpoint = (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  httpRequestDuration,
  dbQueryDuration,
};
```

### 4.3 Usar en Servicios

**Archivo:** microservices/{service}/src/app.js
```javascript
const { metricsMiddleware, metricsEndpoint } = 
  require('@flores-victoria/shared/middleware/metrics');

app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);
```

---

## 5. SCRIPTS DE VALIDACIÓN

### 5.1 Verificar Hardcoding

**Archivo:** scripts/check-hardcoding.sh
```bash
#!/bin/bash

echo "🔍 Verificando hardcoding..."

ISSUES=0

# Buscar localhost hardcodeado
if grep -r "localhost" microservices --include="*.js" | \
   grep -v "test\|example\|fixture" | \
   grep -vE ":\s*localhost"; then
  echo "❌ Encontrado localhost hardcodeado"
  ISSUES=$((ISSUES + 1))
fi

# Buscar passwords hardcodeados
if grep -r "password\s*[=:]\s*['\"]" microservices --include="*.js" | \
   grep -v "example\|test"; then
  echo "❌ Encontrado password hardcodeado"
  ISSUES=$((ISSUES + 1))
fi

# Buscar secrets hardcodeados
if grep -r "secret\s*[=:]\s*['\"]" microservices --include="*.js" | \
   grep -v "test\|example"; then
  echo "❌ Encontrado secret hardcodeado"
  ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
  echo "✅ No se encontraron hardcoding issues"
  exit 0
else
  echo "⚠️ Se encontraron $ISSUES issues"
  exit 1
fi
```

### 5.2 Validar Variables de Entorno

**Archivo:** scripts/validate-env.sh
```bash
#!/bin/bash

echo "🔍 Validando variables de entorno..."

# Variables requeridas
REQUIRED_VARS=(
  "JWT_SECRET"
  "DB_PASSWORD"
  "MONGO_INITDB_ROOT_PASSWORD"
  "CORS_ORIGINS"
)

MISSING=0

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Variable $var no configurada"
    MISSING=$((MISSING + 1))
  else
    echo "✅ $var configurada"
  fi
done

if [ $MISSING -eq 0 ]; then
  echo "✅ Todas las variables requeridas están configuradas"
  exit 0
else
  echo "⚠️ Faltan $MISSING variables"
  exit 1
fi
```

---

## RESUMEN DE ARCHIVOS A CREAR/MODIFICAR

### Nuevos Archivos:
1. ✅ `.gitignore` (actualizar)
2. ✅ `microservices/.env.example` (completar)
3. ✅ `microservices/shared/logging/logger.js` (crear)
4. ✅ `microservices/shared/middleware/logging.js` (crear)
5. ✅ `microservices/shared/validators/index.js` (crear)
6. ✅ `microservices/shared/test/fixtures.js` (crear)
7. ✅ `monitoring/docker-compose.monitoring.yml` (crear)
8. ✅ `scripts/fix-cors-hardcoding.sh` (crear)
9. ✅ `scripts/check-hardcoding.sh` (crear)
10. ✅ `scripts/validate-env.sh` (crear)

### Archivos a Modificar:
1. microservices/user-service/src/app.js
2. microservices/user-service/src/server.simple.js
3. microservices/product-service/src/middleware/common.js
4. microservices/review-service/src/middleware/common.js
5. microservices/promotion-service/server.js
6. microservices/*/src/server.js (agregar logger)
7. microservices/*/src/app.js (agregar metrics middleware)
8. config/jest.config.js (actualizar thresholds)
9. docker-compose.yml (agregar Prometheus/Grafana)
10. .github/workflows/main.yml (agregar coverage check)

---

**Tiempo estimado de implementación: 3-4 semanas para todos los cambios**
