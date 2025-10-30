# 🚨 Troubleshooting Guide - Flores Victoria

Guía completa de resolución de problemas comunes.

---

## 🔍 Quick Diagnosis

### Sistema no arranca

```bash
# 1. Verificar estado de servicios
docker-compose -f docker-compose.full.yml ps

# 2. Ver logs
docker-compose -f docker-compose.full.yml logs --tail=50

# 3. Verificar puertos en uso
sudo netstat -tlnp | grep -E ':(3001|3002|3003|3004|3005|5432|27017|6379)'

# 4. Verificar recursos
docker stats --no-stream
```

---

## 🗄️ Database Issues

### PostgreSQL no conecta

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Soluciones:**

```bash
# 1. Verificar que PostgreSQL está corriendo
docker-compose -f docker-compose.full.yml ps postgres

# 2. Ver logs de PostgreSQL
docker-compose -f docker-compose.full.yml logs postgres

# 3. Reiniciar PostgreSQL
docker-compose -f docker-compose.full.yml restart postgres

# 4. Verificar variables de entorno
docker-compose -f docker-compose.full.yml exec postgres env | grep POSTGRES

# 5. Test de conexión manual
docker-compose -f docker-compose.full.yml exec postgres psql -U admin -d flores_victoria -c "SELECT 1;"
```

**Prevención:**
```yaml
# docker-compose.full.yml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U admin"]
    interval: 10s
    timeout: 5s
    retries: 5
```

---

### MongoDB no conecta

**Síntomas:**
```
MongoServerError: Authentication failed
```

**Soluciones:**

```bash
# 1. Verificar MongoDB
docker-compose -f docker-compose.full.yml ps mongodb

# 2. Ver logs
docker-compose -f docker-compose.full.yml logs mongodb

# 3. Test de conexión
docker-compose -f docker-compose.full.yml exec mongodb mongosh \
  -u admin -p admin123 --authenticationDatabase admin

# 4. Verificar base de datos existe
docker-compose -f docker-compose.full.yml exec mongodb mongosh \
  -u admin -p admin123 --authenticationDatabase admin \
  --eval "show dbs"

# 5. Recrear MongoDB (CUIDADO: Borra datos)
docker-compose -f docker-compose.full.yml down mongodb
docker volume rm flores-victoria_mongodb_data
docker-compose -f docker-compose.full.yml up -d mongodb
```

---

### Redis no conecta

**Síntomas:**
```
Error: Redis connection to localhost:6379 failed
```

**Soluciones:**

```bash
# 1. Verificar Redis
docker-compose -f docker-compose.full.yml ps redis

# 2. Test de conexión
docker-compose -f docker-compose.full.yml exec redis redis-cli ping

# 3. Ver estadísticas
docker-compose -f docker-compose.full.yml exec redis redis-cli INFO

# 4. Limpiar cache (si es necesario)
docker-compose -f docker-compose.full.yml exec redis redis-cli FLUSHALL
```

---

## 🔐 Authentication Issues

### JWT Token inválido

**Síntomas:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

**Soluciones:**

```bash
# 1. Verificar JWT_SECRET está configurado
docker-compose -f docker-compose.full.yml exec auth-service env | grep JWT_SECRET

# 2. Verificar que todos los servicios usan el mismo SECRET
grep -r "JWT_SECRET" services/*/src/

# 3. Generar nuevo JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 4. Actualizar .env
echo "JWT_SECRET=nuevo_secret_aqui" > services/auth-service/.env

# 5. Reiniciar servicios
docker-compose -f docker-compose.full.yml restart auth-service user-service
```

---

### Login siempre falla

**Síntomas:**
```
401 Unauthorized - Credenciales inválidas
```

**Debug:**

```bash
# 1. Verificar usuario existe en DB
docker-compose -f docker-compose.full.yml exec postgres psql -U admin -d flores_victoria \
  -c "SELECT id, email, role FROM users WHERE email='user@example.com';"

# 2. Test de bcrypt (password hashing)
node -e "
const bcrypt = require('bcrypt');
const password = 'test123';
const hash = bcrypt.hashSync(password, 10);
console.log('Hash:', hash);
console.log('Valid:', bcrypt.compareSync(password, hash));
"

# 3. Ver logs del auth-service
docker-compose -f docker-compose.full.yml logs -f auth-service | grep -i "login"
```

---

## 🌐 API / Network Issues

### CORS errors

**Síntomas:**
```
Access to fetch at 'http://localhost:3003/api/auth/login' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Soluciones:**

```javascript
// services/auth-service/src/index.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://flores-victoria.com'
  ],
  credentials: true
}));
```

```bash
# Reiniciar servicio
docker-compose -f docker-compose.full.yml restart auth-service
```

---

### Rate limit errors

**Síntomas:**
```
429 Too Many Requests - Rate limit exceeded
```

**Soluciones:**

```bash
# 1. Ver estado de rate limiting en Redis
docker-compose -f docker-compose.full.yml exec redis redis-cli KEYS "ratelimit:*"

# 2. Limpiar rate limits (desarrollo solamente)
docker-compose -f docker-compose.full.yml exec redis redis-cli \
  --eval "return redis.call('del', unpack(redis.call('keys', 'ratelimit:*')))" 0

# 3. Ajustar límites (development)
# shared/middleware/rateLimiter.js
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 1000, // Aumentar para desarrollo
  message: 'Too many requests'
});
```

---

### Timeout errors

**Síntomas:**
```
Error: timeout of 5000ms exceeded
```

**Soluciones:**

```javascript
// frontend/src/services/api.js
const axiosInstance = axios.create({
  timeout: 30000, // Aumentar timeout a 30s
});

// Backend: Ajustar timeouts
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});
```

---

## 📦 Docker Issues

### Container no arranca

**Síntomas:**
```
Container xyz exited with code 1
```

**Debug:**

```bash
# 1. Ver logs completos
docker-compose -f docker-compose.full.yml logs service-name

# 2. Ver últimas 100 líneas
docker-compose -f docker-compose.full.yml logs --tail=100 service-name

# 3. Entrar al container
docker-compose -f docker-compose.full.yml run service-name /bin/bash

# 4. Ver dependencias
docker-compose -f docker-compose.full.yml config --services

# 5. Reconstruir imagen
docker-compose -f docker-compose.full.yml build --no-cache service-name
docker-compose -f docker-compose.full.yml up -d service-name
```

---

### Puerto ya en uso

**Síntomas:**
```
Error: bind: address already in use
```

**Soluciones:**

```bash
# 1. Ver qué está usando el puerto
sudo lsof -i :3001

# 2. Matar proceso
kill -9 <PID>

# 3. O cambiar puerto en docker-compose
# docker-compose.full.yml
services:
  cart-service:
    ports:
      - "3011:3001"  # Usar 3011 externamente
```

---

### Out of memory

**Síntomas:**
```
Container killed - OOM
```

**Soluciones:**

```bash
# 1. Ver uso de memoria
docker stats --no-stream

# 2. Aumentar límites
# docker-compose.full.yml
services:
  product-service:
    mem_limit: 1g
    mem_reservation: 512m

# 3. Limpiar Docker
docker system prune -a --volumes

# 4. Reiniciar Docker daemon
sudo systemctl restart docker
```

---

## 🐛 Application Bugs

### Stock no se actualiza

**Debug:**

```bash
# 1. Ver stock actual
docker-compose -f docker-compose.full.yml exec mongodb mongosh \
  -u admin -p admin123 --authenticationDatabase admin \
  --eval "db.products.find({}, {name:1, stock:1})"

# 2. Verificar transacciones
docker-compose -f docker-compose.full.yml logs order-service | grep -i "stock"

# 3. Test manual
curl -X POST http://localhost:3002/api/products/test-stock-update \
  -H "Content-Type: application/json" \
  -d '{"productId": "xxx", "quantity": -1}'
```

---

### Carrito se vacía solo

**Posibles causas:**

1. **TTL en Redis:**
```bash
# Ver TTL del carrito
docker-compose -f docker-compose.full.yml exec redis redis-cli TTL "cart:userId"

# Aumentar TTL
# services/cart-service/src/cache.js
redis.setex(`cart:${userId}`, 3600 * 24, JSON.stringify(cart)); // 24 horas
```

2. **Session expira:**
```javascript
// Aumentar expiración de token JWT
// services/auth-service/src/auth.js
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '7d' // 7 días en vez de 24h
});
```

---

### Órdenes duplicadas

**Soluciones:**

```javascript
// Agregar idempotency key
// services/order-service/src/controllers/order.js
async function createOrder(req, res) {
  const idempotencyKey = req.headers['idempotency-key'];
  
  // Check if order already exists
  const existing = await Order.findOne({ idempotencyKey });
  if (existing) {
    return res.status(200).json({ success: true, data: existing });
  }
  
  // Create new order
  const order = await Order.create({
    ...req.body,
    idempotencyKey
  });
  
  res.status(201).json({ success: true, data: order });
}
```

```javascript
// Frontend: Generar idempotency key
// frontend/src/services/api.js
const createOrder = async (orderData) => {
  const idempotencyKey = `${Date.now()}-${Math.random()}`;
  
  return axios.post('/api/orders', orderData, {
    headers: { 'Idempotency-Key': idempotencyKey }
  });
};
```

---

## 📊 Monitoring Issues

### Grafana no muestra datos

**Soluciones:**

```bash
# 1. Verificar Prometheus está scrapeando
curl http://localhost:9090/api/v1/targets

# 2. Ver métricas de un servicio
curl http://localhost:3001/metrics

# 3. Verificar datasource en Grafana
# UI: Configuration → Data Sources → Prometheus
# Test connection

# 4. Re-importar dashboards
# UI: Dashboards → Import → Upload JSON
```

---

### Alertas no funcionan

**Debug:**

```bash
# 1. Ver configuración Alertmanager
docker-compose -f docker-compose.full.yml exec alertmanager cat /etc/alertmanager/alertmanager.yml

# 2. Ver alertas activas
curl http://localhost:9093/api/v1/alerts

# 3. Test manual de alerta
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {"alertname": "TestAlert", "severity": "critical"},
    "annotations": {"summary": "Test"}
  }]'
```

---

## 🧪 Testing Issues

### Tests fallan en CI

**Soluciones:**

```yaml
# .github/workflows/ci.yml
# Asegurar que servicios estén listos
- name: Wait for databases
  run: |
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready; do sleep 1; done'
    timeout 60 bash -c 'until docker-compose exec -T mongodb mongosh --eval "db.version()"; do sleep 1; done'
    timeout 60 bash -c 'until docker-compose exec -T redis redis-cli ping; do sleep 1; done'

- name: Run tests
  run: npm test
  env:
    NODE_ENV: test
    DATABASE_URL: postgresql://admin:admin123@localhost:5432/test_db
```

---

### Coverage muy bajo

**Mejorar:**

```bash
# 1. Ver reporte detallado
npm run test:coverage -- --verbose

# 2. Ver archivos sin cobertura
npm run test:coverage -- --coverage-unreported-files

# 3. Enfocarse en archivos críticos
npm test -- services/auth-service --coverage
```

---

## 🔧 Performance Issues

### API muy lenta

**Debug:**

```bash
# 1. Ver tiempos de respuesta
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/cart

# curl-format.txt:
# time_namelookup:  %{time_namelookup}\n
# time_connect:  %{time_connect}\n
# time_appconnect:  %{time_appconnect}\n
# time_pretransfer:  %{time_pretransfer}\n
# time_redirect:  %{time_redirect}\n
# time_starttransfer:  %{time_starttransfer}\n
# ----------\n
# time_total:  %{time_total}\n

# 2. Profiling con clinic
npm install -g clinic
clinic doctor -- node services/cart-service/src/index.js

# 3. Ver queries lentas (PostgreSQL)
docker-compose -f docker-compose.full.yml exec postgres psql -U admin -d flores_victoria \
  -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# 4. Ver queries lentas (MongoDB)
docker-compose -f docker-compose.full.yml exec mongodb mongosh \
  -u admin -p admin123 --authenticationDatabase admin \
  --eval "db.currentOp({op: 'query', secs_running: {$gt: 1}})"
```

---

### Alto uso de memoria

**Soluciones:**

```bash
# 1. Heap snapshot
node --inspect services/product-service/src/index.js
# Abrir chrome://inspect
# Take heap snapshot

# 2. Detectar memory leaks
npm install -g memwatch-next
node --require memwatch-next services/product-service/src/index.js

# 3. Limitar memoria de Node.js
NODE_OPTIONS="--max-old-space-size=512" node services/product-service/src/index.js
```

---

## 📞 Support Checklist

Cuando pides ayuda, incluye:

```bash
# 1. Versión del sistema
cat VERSION

# 2. Estado de servicios
docker-compose -f docker-compose.full.yml ps

# 3. Logs (últimas 100 líneas)
docker-compose -f docker-compose.full.yml logs --tail=100 > logs.txt

# 4. Variables de entorno (sin secretos)
env | grep -v SECRET | grep -v PASSWORD

# 5. Recursos del sistema
free -h
df -h
docker stats --no-stream

# 6. Versión de Docker
docker --version
docker-compose --version
```

---

**Troubleshooting Guide v1.0** | Última actualización: Enero 2024
