# 🔐 Plan de Acción - Implementación de Seguridad
## Flores Victoria - Diciembre 2025

---

## 📌 PRIORIDAD 1: AUMENTAR TEST COVERAGE (CRÍTICO)

### Estado Actual
- **Coverage global:** 25.91% (muy bajo)
- **Target:** 70% (industry standard)
- **Gap:** 44.09 puntos porcentuales

### Servicios sin Testing (0% coverage)
1. **auth-service**
   - routes/auth.js: 116 líneas sin tests
   - routes/twoFactor.js: 103 líneas sin tests
   - Impacto: CRÍTICO (servicio de autenticación)

2. **product-service**
   - routes/products.test.js existe pero 0%
   - Impacto: ALTO

3. **order-service**
   - Sin tests
   - Impacto: ALTO

4. **cart-service**
   - Sin tests
   - Impacto: ALTO

5. **user-service**
   - Sin tests
   - Impacto: MEDIO

6. **payment-service**
   - Sin tests
   - Impacto: ALTO (manejo de dinero)

### Plan Detallado por Servicio

#### auth-service (SEMANA 1-2)
**Objetivo:** 80% coverage

**Archivos a cubrir:**

1. **routes/auth.js** (116 líneas)
   ```javascript
   // Tests faltantes:
   POST /auth/register
     ✅ Success: valid email, strong password
     ✅ Validation: weak password (sin números, mayúsculas)
     ✅ Validation: email inválido
     ✅ Validation: usuario ya existe
     ✅ Validation: missing fields
   
   POST /auth/login
     ✅ Success: credenciales correctas
     ✅ Error: password incorrecto
     ✅ Error: usuario no existe
     ✅ Error: cuenta deshabilitada
   
   POST /auth/refresh-token
     ✅ Success: token válido
     ✅ Error: token expirado
     ✅ Error: token inválido
   
   GET /auth/logout
     ✅ Success: logout y revocación
   
   POST /auth/password-reset
     ✅ Success: email enviado
     ✅ Validation: email no existe
   ```

2. **routes/twoFactor.js** (103 líneas)
   ```javascript
   // Tests faltantes:
   POST /2fa/setup
     ✅ Success: QR code generado
     ✅ Error: 2FA ya configurado
   
   POST /2fa/verify
     ✅ Success: código válido
     ✅ Error: código expirado
     ✅ Error: código incorrecto
   
   POST /2fa/disable
     ✅ Success: 2FA deshabilitado
   ```

3. **services/refreshTokenService.js** (62 líneas, 61.29% coverage)
   - Mejorar a 95%: Tests para edge cases

4. **utils/authUtils.js**
   - Tests de hashPassword, comparePassword

**Tiempo estimado:** 16-20 horas

#### product-service (SEMANA 2-3)
**Objetivo:** 75% coverage

**Archivos a cubrir:**
1. routes/products.js - CRUD operations
2. Product model validation
3. Image upload handling

**Tiempo estimado:** 12-16 horas

#### order-service (SEMANA 3-4)
**Objetivo:** 70% coverage

**Archivos a cubrir:**
1. Order creation workflow
2. Payment integration
3. Order status updates
4. Invoice generation

**Tiempo estimado:** 14-18 horas

#### user-service (SEMANA 4-5)
**Objetivo:** 70% coverage

**Archivos a cubrir:**
1. User profile management
2. Address management
3. Preferences

**Tiempo estimado:** 10-14 horas

#### cart-service (SEMANA 5-6)
**Objetivo:** 70% coverage

**Archivos a cubrir:**
1. Add to cart
2. Remove from cart
3. Update quantity
4. Clear cart

**Tiempo estimado:** 8-12 horas

#### payment-service (SEMANA 6-7)
**Objetivo:** 70% coverage

**Archivos a cubrir:**
1. Transbank integration
2. Payment processing
3. Refund handling
4. Payment validation

**Tiempo estimado:** 14-18 horas

### Implementación

#### Paso 1: Setup de Jest en cada servicio

```bash
# Para cada microservicio
cd microservices/[servicio]
npm install --save-dev jest @babel/preset-env babel-jest
npm install --save-dev @testing-library/node supertest
```

#### Paso 2: Crear jest.config.js

```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.mock.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ['**/__tests__/**/*.test.js'],
};
```

#### Paso 3: Crear __tests__ structure

```
__tests__/
  unit/
    auth.test.js
    password.test.js
  routes/
    auth.route.test.js
    twoFactor.route.test.js
  integration/
    auth.integration.test.js
```

#### Paso 4: Escribir tests siguiendo patrón AAA (Arrange-Act-Assert)

```javascript
describe('POST /auth/register', () => {
  it('should register a new user with valid data', async () => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User'
    };

    // Act
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe(userData.email);
    expect(response.body.data.id).toBeDefined();
  });

  it('should fail with duplicate email', async () => {
    // Arrange
    const userData = {
      email: 'existing@example.com',
      password: 'SecurePass123!',
      name: 'Test User'
    };
    // Usuario ya existe en BD

    // Act
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Assert
    expect(response.status).toBe(409);
    expect(response.body.error).toBe(true);
  });
});
```

#### Paso 5: Configurar CI/CD con coverage requirements

Agregar a [.github/workflows/main.yml](.github/workflows/main.yml):

```yaml
test:
  name: 🧪 Tests
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Run tests with coverage
      run: npm test -- --coverage
    
    - name: Check coverage thresholds
      run: |
        COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
        if (( $(echo "$COVERAGE < 70" | bc -l) )); then
          echo "❌ Coverage $COVERAGE% is below 70% threshold"
          exit 1
        fi
        echo "✅ Coverage $COVERAGE% meets threshold"
    
    - name: Upload coverage
      uses: codecov/codecov-action@v4
      if: always()
```

---

## 📌 PRIORIDAD 2: TOKEN REVOCATION / LOGOUT SEGURO (CRÍTICO)

### Problema Actual
- JWT tokens NO se revocan al logout
- Usuario puede usar token hasta que expire (7 días)
- Imposibilidad de logout inmediato
- Riesgo de token robado

### Solución: Blacklist con Redis

#### Implementación

**Archivo:** `microservices/auth-service/src/services/tokenBlacklistService.js`

```javascript
const redis = require('ioredis');
const logger = require('@flores-victoria/shared/logging/logger');

const redisClient = new redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 1, // DB separada para blacklist
});

const TOKEN_BLACKLIST_PREFIX = 'token_blacklist:';

/**
 * Revoca un token agregándolo a la blacklist
 * @param {string} token - JWT token
 * @param {number} expiresIn - Segundos hasta expiración
 */
async function revokeToken(token, expiresIn) {
  try {
    const key = `${TOKEN_BLACKLIST_PREFIX}${token}`;
    
    // Guardar en Redis con TTL = tiempo restante del token
    await redisClient.setex(key, expiresIn, '1');
    
    logger.info('Token revoked', { 
      tokenHash: hashToken(token),
      expiresIn 
    });
    
    return true;
  } catch (error) {
    logger.error('Error revoking token', { error: error.message });
    throw error;
  }
}

/**
 * Verifica si un token está revocado
 * @param {string} token - JWT token
 * @returns {Promise<boolean>}
 */
async function isTokenRevoked(token) {
  try {
    const key = `${TOKEN_BLACKLIST_PREFIX}${token}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.warn('Error checking token revocation', { error: error.message });
    // En caso de error, asumir que NO está revocado (fail open, pero logged)
    return false;
  }
}

/**
 * Hash de token para no guardar tokens completos en logs
 */
function hashToken(token) {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
    .substring(0, 16);
}

module.exports = {
  revokeToken,
  isTokenRevoked,
};
```

**Archivo:** `microservices/api-gateway/src/middleware/auth.js`

Modificar para verificar blacklist:

```javascript
const jwt = require('jsonwebtoken');
const tokenBlacklist = require('@flores-victoria/shared/services/tokenBlacklistService');

async function verifyToken(req, res, next) {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // ✅ NUEVO: Verificar si está revocado
    const isRevoked = await tokenBlacklist.isTokenRevoked(token);
    if (isRevoked) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { verifyToken };
```

**Archivo:** `microservices/auth-service/src/routes/auth.js`

Agregar endpoint de logout:

```javascript
const router = express.Router();
const tokenBlacklist = require('@flores-victoria/shared/services/tokenBlacklistService');
const { verifyToken } = require('@flores-victoria/shared/middleware/auth');

/**
 * POST /auth/logout
 * Revoca el token actual
 */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const token = extractToken(req);
    const decoded = jwt.decode(token);
    
    // Tiempo restante hasta expiración
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    // Revocar token
    await tokenBlacklist.revokeToken(token, expiresIn);
    
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
```

**Tests para token revocation:**

```javascript
describe('Token Revocation', () => {
  it('should revoke token on logout', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'Pass123!' });
    
    const token = loginRes.body.data.token;

    // 2. Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    
    expect(logoutRes.status).toBe(200);

    // 3. Verificar que token no funciona
    const useRes = await request(app)
      .get('/api/protected-endpoint')
      .set('Authorization', `Bearer ${token}`);
    
    expect(useRes.status).toBe(401);
  });

  it('should reject expired revoked tokens immediately', async () => {
    // Arrange
    const token = createTestToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    
    // Act
    await tokenBlacklist.revokeToken(token, 3600);
    
    // Assert
    const isRevoked = await tokenBlacklist.isTokenRevoked(token);
    expect(isRevoked).toBe(true);
  });
});
```

#### Tiempo estimado: 8-10 horas

---

## 📌 PRIORIDAD 3: VERIFICAR HTTPS EN PRODUCCIÓN (CRÍTICO)

### Verificación Checklist

**Paso 1: Verificar Railway HTTPS**

```bash
# En terminal
curl -v https://[tu-app].railway.app/health

# Debe mostrar:
# * Connected to ... (TLS 1.3)
# * certificate verify ok
```

**Paso 2: Verificar Headers de Seguridad**

```bash
curl -I https://[tu-app].railway.app/

# Debe contener:
# Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
# X-Content-Type-Options: nosniff
# X-Frame-Options: deny
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: ...
```

**Paso 3: Verificar Certificate**

```bash
# Ver detalles del certificado
openssl s_client -connect [tu-app].railway.app:443 -showcerts

# Verificar en SSL Labs
# https://www.ssllabs.com/ssltest/analyze.html?d=[tu-app].railway.app
```

**Paso 4: Verificar Configuración en Railway**

En [microservices/api-gateway/railway.toml](microservices/api-gateway/railway.toml):

```toml
[deploy]
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 5

[env]
NODE_ENV = "production"
# HTTPS debería estar habilitado automáticamente en Railway
```

#### Tiempo estimado: 2-3 horas

---

## 📌 PRIORIDAD 4: MEJORAR CSRF PROTECTION (MEDIA)

### Problema Actual
- CSRF token NO se rota en cada request
- Cookie NO tiene SameSite flag
- Patrón double-submit cookie incompleto

### Solución: SameSite Cookies + Token Rotation

**Archivo:** `microservices/api-gateway/src/middleware/security.js`

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');

// ✅ NUEVO: Configurar SameSite cookies
function setupCsrfProtection(app) {
  app.use(cookieParser());
  
  // Middleware para generar CSRF token
  app.use((req, res, next) => {
    const crypto = require('crypto');
    
    // Generar nuevo token para cada request (rotation)
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    // Guardar en cookie con SameSite
    res.cookie('csrfToken', csrfToken, {
      httpOnly: true,           // No accesible vía JavaScript
      secure: true,             // Solo HTTPS
      sameSite: 'Strict',       // ✅ NUEVO: Previene CSRF
      maxAge: 3600000,          // 1 hora
      domain: process.env.COOKIE_DOMAIN, // Dominio específico
    });
    
    // También disponible en header
    res.setHeader('X-CSRF-Token', csrfToken);
    
    next();
  });
}

// Middleware de validación CSRF
function csrfValidation(req, res, next) {
  // GET, HEAD, OPTIONS no necesitan validación
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies.csrfToken;

  if (!headerToken || !cookieToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  if (headerToken !== cookieToken) {
    return res.status(403).json({
      error: 'CSRF token invalid',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  next();
}

module.exports = {
  setupCsrfProtection,
  csrfValidation,
};
```

**Aplicar en app.js:**

```javascript
const { setupCsrfProtection, csrfValidation } = require('./middleware/security');

const app = express();

// ✅ Setup CSRF al inicio
setupCsrfProtection(app);

// ✅ Validar CSRF en POST/PUT/DELETE
app.use(csrfValidation);
```

**Tests:**

```javascript
describe('CSRF Protection with SameSite', () => {
  it('should set SameSite=Strict cookie', async () => {
    const res = await request(app).get('/api/products');
    
    const setCookieHeader = res.headers['set-cookie'][0];
    expect(setCookieHeader).toContain('SameSite=Strict');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('Secure');
  });

  it('should reject POST without CSRF token', async () => {
    const res = await request(app)
      .post('/api/cart')
      .send({ productId: 1 });
    
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('should accept POST with valid CSRF token', async () => {
    // 1. Get CSRF token
    const getRes = await request(app).get('/api/products');
    const csrfToken = getRes.headers['x-csrf-token'];
    const cookies = getRes.headers['set-cookie'];

    // 2. Use token in POST
    const postRes = await request(app)
      .post('/api/cart')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ productId: 1 });
    
    expect(postRes.status).toBe(201);
  });
});
```

#### Tiempo estimado: 4-6 horas

---

## 📌 PRIORIDAD 5: SECRETS MANAGEMENT PROFESIONAL (MEDIA)

### Opciones Evaluadas

#### Opción 1: AWS Secrets Manager (RECOMENDADO)
- ✅ Integración con Railway/AWS
- ✅ Rotación automática
- ✅ Auditoría completa
- ⚠️ Requiere cuenta AWS

**Implementación:**

```javascript
// microservices/shared/utils/secretsManager.js
const AWS = require('aws-sdk');

const client = new AWS.SecretsManager({
  region: process.env.AWS_REGION || 'us-east-1'
});

async function getSecret(secretName) {
  try {
    const data = await client.getSecretValue({ SecretId: secretName }).promise();
    
    if ('SecretString' in data) {
      return JSON.parse(data.SecretString);
    } else {
      return Buffer.from(data.SecretBinary, 'base64').toString('ascii');
    }
  } catch (error) {
    logger.error('Error retrieving secret', { secretName, error: error.message });
    throw error;
  }
}

// Usage en startup
const secrets = await getSecret('flores-victoria/prod/database');
process.env.DATABASE_URL = secrets.connection_string;
```

#### Opción 2: HashiCorp Vault
- ✅ Self-hosted or cloud
- ✅ Rotación automática
- ✅ Dynamic secrets
- ⚠️ Más complejo de configurar

#### Opción 3: Bitnami Sealed Secrets (Kubernetes)
- ✅ Open source
- ✅ Encriptación en reposo
- ⚠️ Solo para Kubernetes

### Recomendación
**AWS Secrets Manager** por compatibilidad con Railway

#### Tiempo estimado: 20-30 horas (implementación completa)

---

## 📋 CRONOGRAMA SUGERIDO

### Semana 1-2 (AHORA)
- [ ] Tests para auth-service (20h)
- [ ] Implementar token revocation (10h)
- [ ] Verificar HTTPS en Railway (3h)

**Total: 33 horas**

### Semana 3-4
- [ ] Tests para product-service (16h)
- [ ] Mejorar CSRF (6h)
- [ ] Tests para order-service (18h)

**Total: 40 horas**

### Semana 5-6
- [ ] Tests para user-service (14h)
- [ ] Tests para cart-service (12h)
- [ ] Comenzar Secrets Manager (10h)

**Total: 36 horas**

### Semana 7-8
- [ ] Completar Secrets Manager (20h)
- [ ] Tests para payment-service (18h)

**Total: 38 horas**

---

## 🚀 COMANDOS DE REFERENCIA

### Verificar coverage actual
```bash
npm test -- --coverage --collectCoverageFrom="src/**/*.js"
```

### Correr tests específicos
```bash
npm test -- auth.test.js
npm test -- --testPathPattern=auth
```

### Generar coverage report
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Validar contra threshold
```bash
npm test -- --coverage --coverageReporters=text-summary
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Auth Service Tests
- [ ] routes/auth.js: 100% coverage
- [ ] routes/twoFactor.js: 100% coverage
- [ ] services/refreshTokenService.js: 95% coverage
- [ ] utils/authUtils.js: 100% coverage
- [ ] Token revocation tests

### Token Revocation
- [ ] tokenBlacklistService.js creado
- [ ] auth.js verifica blacklist
- [ ] POST /logout implementado
- [ ] Tests de revocation creados
- [ ] Redis configurado para blacklist

### HTTPS Verification
- [ ] Certificate valid en Railway
- [ ] HSTS header verificado
- [ ] SSL Labs A+ rating
- [ ] Mixed content warnings resueltos

### CSRF Improvements
- [ ] SameSite=Strict implementado
- [ ] Token rotation en cada request
- [ ] HttpOnly + Secure flags
- [ ] Tests de CSRF coverage 100%

---

**Siguiente revisión:** 6 de enero de 2026
**Objetivo:** 70% coverage + Token revocation completo
