# 🛠️ COMANDOS ÚTILES - GUÍA RÁPIDA

## Verificación Inmediata

### 1. Verificar HTTPS en Railway
```bash
# Chequear HSTS header
curl -I https://[tu-app].railway.app/

# Debe mostrar:
# Strict-Transport-Security: max-age=63072000

# Ver detalles de certificado
openssl s_client -connect [tu-app].railway.app:443 -showcerts

# Verificar con SSL Labs (online)
# https://www.ssllabs.com/ssltest/analyze.html?d=[tu-app].railway.app
```

### 2. Verificar Coverage Actual
```bash
# Ejecutar tests con coverage
npm test -- --coverage

# Ver reporte HTML
open coverage/lcov-report/index.html

# Check contra threshold (70%)
npm test -- --coverage --coverageReporters=text-summary
```

### 3. Listar servicios sin tests
```bash
# Ver coverage por servicio
cat coverage/coverage-summary.json | jq '.[] | select(.lines.pct == 0) | .lines.pct'

# O más detallado:
for service in microservices/*/; do
  echo "=== $(basename $service) ==="
  grep "pct" coverage/$(basename $service)*/coverage-summary.json 2>/dev/null | head -1
done
```

---

## Testing - Configuración

### 1. Crear jest.config.js en un servicio
```bash
cd microservices/auth-service

cat > jest.config.js << 'EOF'
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
EOF
```

### 2. Instalar dependencias de test
```bash
npm install --save-dev jest @babel/preset-env babel-jest
npm install --save-dev @testing-library/node supertest
```

### 3. Crear estructura de tests
```bash
mkdir -p src/__tests__/{unit,routes,integration}

# Crear archivo de test básico
cat > src/__tests__/unit/example.test.js << 'EOF'
describe('Example Tests', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
EOF
```

### 4. Ejecutar tests
```bash
# Tests de un servicio
cd microservices/auth-service
npm test

# Tests con coverage
npm test -- --coverage

# Tests en watch mode
npm test -- --watch

# Tests de un archivo específico
npm test -- auth.test.js

# Tests que contengan una palabra
npm test -- --testNamePattern="should register"
```

---

## Token Revocation - Setup

### 1. Verificar Redis disponible
```bash
# Si corres Docker
docker ps | grep redis

# Conectar a Redis
redis-cli
> PING
PONG

> SELECT 1
OK

> SET test-key "test-value"
OK

> DEL test-key
(integer) 1
```

### 2. Crear archivo de servicio
```bash
cat > microservices/shared/services/tokenBlacklistService.js << 'EOF'
const redis = require('ioredis');

const redisClient = new redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

async function revokeToken(token, expiresIn) {
  const key = `token_blacklist:${token}`;
  await redisClient.setex(key, expiresIn, '1');
}

async function isTokenRevoked(token) {
  const key = `token_blacklist:${token}`;
  const exists = await redisClient.exists(key);
  return exists === 1;
}

module.exports = { revokeToken, isTokenRevoked };
EOF
```

### 3. Crear test de revocation
```bash
cat > microservices/auth-service/src/__tests__/integration/logout.test.js << 'EOF'
const request = require('supertest');
const app = require('../../app');
const tokenBlacklist = require('@flores-victoria/shared/services/tokenBlacklistService');

describe('POST /auth/logout', () => {
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

    // 3. Verify token is revoked
    const isRevoked = await tokenBlacklist.isTokenRevoked(token);
    expect(isRevoked).toBe(true);
  });
});
EOF
```

---

## CSRF - SameSite Cookies

### 1. Implementar SameSite
```bash
cat > microservices/api-gateway/src/middleware/csrf-improved.js << 'EOF'
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

function setupCsrf(app) {
  app.use(cookieParser());
  
  app.use((req, res, next) => {
    // Generar CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    // ✅ IMPORTANTE: SameSite=Strict
    res.cookie('csrfToken', csrfToken, {
      httpOnly: true,      // No accesible vía JS
      secure: true,        // Solo HTTPS
      sameSite: 'Strict',  // ✅ NUEVO
      maxAge: 3600000,     // 1 hora
    });
    
    res.setHeader('X-CSRF-Token', csrfToken);
    next();
  });
}

function validateCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies.csrfToken;

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'CSRF token invalid' });
  }

  next();
}

module.exports = { setupCsrf, validateCsrf };
EOF
```

### 2. Usar en app.js
```javascript
const { setupCsrf, validateCsrf } = require('./middleware/csrf-improved');

const app = express();
setupCsrf(app);
app.use(validateCsrf);
```

---

## CI/CD - Configuración de Coverage Threshold

### Agregar a .github/workflows/main.yml
```yaml
test:
  name: 🧪 Tests
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests with coverage
      run: npm test -- --coverage
    
    - name: Check coverage thresholds
      run: |
        COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
        echo "Coverage: ${COVERAGE}%"
        
        if (( $(echo "$COVERAGE < 70" | bc -l) )); then
          echo "❌ Coverage ${COVERAGE}% is below 70% threshold"
          exit 1
        fi
        
        echo "✅ Coverage ${COVERAGE}% meets threshold"
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v4
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        fail_ci_if_error: false
```

---

## Monitoreo y Logs

### 1. Ver logs de un servicio en Docker
```bash
# Logs en tiempo real
docker logs -f api-gateway

# Últimas 100 líneas
docker logs --tail 100 api-gateway

# Logs con timestamp
docker logs -f --timestamps api-gateway

# Filtrar por palabra clave
docker logs api-gateway | grep "ERROR"
```

### 2. Ejecutar Health Check
```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/api/auth/health

# Product Service
curl http://localhost:3009/api/products/health

# Con verbose
curl -v http://localhost:3000/health
```

### 3. Ver métricas Prometheus
```bash
# Abrir Grafana
open http://localhost:3000

# Query útiles en Prometheus:
# http://localhost:9090

# Rate de errores
rate(http_requests_total{status=~"5.."}[5m])

# Latencia P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Errores por endpoint
sum by (endpoint) (rate(http_requests_total{status=~"5.."}[5m]))
```

---

## Base de Datos - Validación

### 1. PostgreSQL - Verificar índices
```bash
# Conectar
psql -U flores_user -d flores_db -h localhost

# Listar índices
\di

# Ver queries lentas
SELECT query, calls, mean_time, max_time 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;

# Ver planes de query
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

### 2. MongoDB - Verificar índices
```bash
# Conectar
mongosh --username root --password [password] --authenticationDatabase admin

# Usar BD
use products_db

# Listar índices
db.products.getIndexes()

# Ver estadísticas
db.products.stats()
```

### 3. Redis - Verificar keys
```bash
# Conectar
redis-cli

# Ver tamaño de BD
INFO memory

# Ver todas las keys (cuidado en prod)
KEYS *

# Ver keys de token blacklist
KEYS token_blacklist:*

# Limpiar BD de test
FLUSHDB

# Limpiar todas las DBs
FLUSHALL
```

---

## Deployment - Railway

### 1. Verificar deployment
```bash
# Ver status en Railway web UI
# https://railway.app/dashboard

# Logs de Railway
railway logs

# Ver variables de entorno
railway variables

# Establecer variable
railway variables set JWT_SECRET="new-secret-key"
```

### 2. Trigger deployment
```bash
# Push a main o develop dispara deploy automáticamente
git push origin main

# Ver status del build
# En https://railway.app/dashboard
```

---

## Debugging - Comandos Útiles

### 1. Verificar puertos
```bash
# Ver qué está usando cada puerto
lsof -i :3000    # API Gateway
lsof -i :3001    # Auth Service
lsof -i :3009    # Product Service
lsof -i :5173    # Frontend
lsof -i :6379    # Redis
lsof -i :5432    # PostgreSQL
```

### 2. Ver procesos Node
```bash
# Listar todos
ps aux | grep node

# Ver específico
ps aux | grep api-gateway
```

### 3. Matar procesos
```bash
# Kill por PID
kill -9 [PID]

# Kill todo Node
killall node

# Kill por puerto
lsof -ti:3000 | xargs kill -9
```

### 4. Verificar conectividad
```bash
# Ping a servicio
curl -I http://localhost:3000/health

# Resolve DNS
nslookup api.floresvictoria.cl

# Ver ruta de red
traceroute api.floresvictoria.cl

# Test de latencia
time curl http://localhost:3000/health
```

---

## Seguridad - Verificaciones

### 1. Escanear vulnerabilidades
```bash
# npm audit
npm audit

# Fijar vulnerabilidades automáticamente
npm audit fix

# Audit con severidad
npm audit --audit-level=moderate

# Audit en todos los servicios
for service in microservices/*/; do
  cd "$service"
  echo "=== $(basename $service) ==="
  npm audit --audit-level=moderate
  cd ../..
done
```

### 2. Verificar secretos
```bash
# Buscar secretos potenciales
git log -p --all -S "password" | head -50

# Verificar en código actual
grep -r "secret\|password\|key" microservices/ | grep -v node_modules | grep -v coverage

# Usar herramienta de escaneo
npm install -g truffleHog
truffleHog filesystem . --json
```

### 3. Verificar dependencias
```bash
# Listar versiones
npm ls

# Listar versiones de un paquete
npm ls express

# Buscar vulnerabilidades conocidas
npm audit

# Actualizar seguro
npm update

# Forzar actualización de un paquete
npm install express@latest
```

---

## Útiles Finales

### 1. Setup rápido para development
```bash
# Instalar dependencias todas
npm ci
for service in microservices/*/; do
  cd "$service"
  npm ci
  cd ../..
done

# Iniciar Docker Compose
docker-compose -f docker-compose.dev-simple.yml up -d

# Ver logs
docker-compose logs -f api-gateway

# Detener
docker-compose down
```

### 2. Limpiar y resetear
```bash
# Limpiar docker
docker system prune -a

# Limpiar node_modules
find . -name "node_modules" -type d -exec rm -rf {} +

# Limpiar coverage
rm -rf coverage

# Resetear BD (solo en dev)
docker-compose down -v
docker-compose up -d
```

### 3. Verificar todo rápido
```bash
#!/bin/bash
# Guardar como: check-all.sh

echo "🔍 Verificando proyecto..."

echo "✓ Testing"
npm test -- --coverage 2>/dev/null | grep "PASS\|FAIL"

echo "✓ Linting"
npm run lint 2>/dev/null || echo "No lint configured"

echo "✓ Security audit"
npm audit --audit-level=moderate 2>/dev/null | tail -3

echo "✓ Docker"
docker-compose config > /dev/null 2>&1 && echo "✓ Docker-compose valid" || echo "✗ Docker-compose error"

echo "✓ Health checks"
curl -s http://localhost:3000/health > /dev/null && echo "✓ API Gateway OK" || echo "✗ API Gateway down"

echo "✓ Coverage"
cat coverage/coverage-summary.json 2>/dev/null | jq '.total.lines.pct' || echo "No coverage"

echo "🎉 Verificación completada!"
```

---

**Última actualización:** 19/12/2025
**Próxima revisión:** 6/01/2026
