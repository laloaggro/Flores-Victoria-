# 📋 GUÍA DE INTEGRACIÓN: LOGS A ELK STACK

## 🎯 Objetivo

Configurar los microservicios de Flores Victoria para enviar logs al stack ELK (Elasticsearch,
Logstash, Kibana) para monitoreo centralizado.

---

## 🚀 QUICK START

### 1. Instalar Winston y Transporte de Logstash

En cada microservicio, instalar las dependencias necesarias:

```bash
npm install winston winston-logstash@0.4.0 --save
```

---

## 📝 CONFIGURACIÓN POR SERVICIO

### Configuración Básica (Aplicar a TODOS los microservicios)

Crear archivo `logger.js` en cada servicio:

```javascript
// logger.js
const winston = require('winston');
const LogstashTransport = require('winston-logstash/lib/winston-logstash-latest');

const SERVICE_NAME = process.env.SERVICE_NAME || 'unknown-service';
const LOGSTASH_HOST = process.env.LOGSTASH_HOST || 'logstash';
const LOGSTASH_PORT = process.env.LOGSTASH_PORT || 5000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: SERVICE_NAME,
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport (siempre mantener para debug local)
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),

    // Logstash transport (envío centralizado)
    new LogstashTransport({
      port: LOGSTASH_PORT,
      host: LOGSTASH_HOST,
      node_name: SERVICE_NAME,

      // Opciones de conexión
      max_connect_retries: -1, // Reintentos infinitos
      timeout_connect_retries: 10000, // 10 segundos entre reintentos

      // SSL/TLS (desactivado en desarrollo)
      ssl_enable: false,
    }),
  ],
});

// Manejadores de errores del transporte
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

module.exports = logger;
```

---

## 🎨 EJEMPLOS DE USO

### En Controllers/Routes

```javascript
const logger = require('./logger');

// Log de información
logger.info('Usuario autenticado correctamente', {
  userId: user.id,
  username: user.username,
  ip: req.ip,
});

// Log de advertencia
logger.warn('Intento de acceso a recurso no autorizado', {
  userId: user.id,
  resource: req.path,
  method: req.method,
});

// Log de error
logger.error('Error al procesar pedido', {
  error: error.message,
  stack: error.stack,
  orderId: order.id,
});

// Log de debug
logger.debug('Query ejecutado', {
  query: 'SELECT * FROM products',
  duration: 45,
  rows: 150,
});
```

### Middleware de Logging de Requests

```javascript
const logger = require('./logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}

app.use(requestLogger);
```

### Error Handler Global

```javascript
const logger = require('./logger');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

app.use(errorHandler);
```

---

## 🔧 CONFIGURACIÓN DOCKER

### Variables de Entorno en docker-compose.yml

Para cada servicio, agregar las siguientes variables de entorno:

```yaml
services:
  api-gateway:
    environment:
      - SERVICE_NAME=api-gateway
      - LOGSTASH_HOST=logstash
      - LOGSTASH_PORT=5000
      - LOG_LEVEL=info
      - NODE_ENV=production
    depends_on:
      - logstash

  auth-service:
    environment:
      - SERVICE_NAME=auth-service
      - LOGSTASH_HOST=logstash
      - LOGSTASH_PORT=5000
      - LOG_LEVEL=info
      - NODE_ENV=production
    depends_on:
      - logstash

  product-service:
    environment:
      - SERVICE_NAME=product-service
      - LOGSTASH_HOST=logstash
      - LOGSTASH_PORT=5000
      - LOG_LEVEL=info
      - NODE_ENV=production
    depends_on:
      - logstash

  # ... Repetir para todos los servicios
```

---

## 📊 NIVELES DE LOG

Usar niveles apropiados para cada situación:

| Nivel       | Uso                               | Ejemplo                            |
| ----------- | --------------------------------- | ---------------------------------- |
| **error**   | Errores que requieren atención    | Conexión DB perdida, Error en pago |
| **warn**    | Situaciones anormales no críticas | Rate limit alcanzado, Cache miss   |
| **info**    | Eventos importantes del negocio   | Usuario login, Pedido creado       |
| **http**    | Requests HTTP                     | GET /api/products 200              |
| **verbose** | Información detallada             | Query ejecutado, Cache hit         |
| **debug**   | Información de desarrollo         | Variable values, Flow control      |

---

## 🎯 CAMPOS RECOMENDADOS

### Para todos los logs:

- `timestamp` - Fecha/hora (automático)
- `level` - Nivel de log (automático)
- `message` - Mensaje descriptivo
- `service` - Nombre del servicio (automático)
- `environment` - prod/dev/staging (automático)

### Para logs de negocio:

- `userId` - ID del usuario
- `orderId` - ID del pedido
- `productId` - ID del producto
- `action` - Acción realizada
- `result` - success/failure

### Para logs de performance:

- `duration` - Duración en ms
- `query` - Query ejecutado
- `cacheHit` - true/false
- `responseSize` - Tamaño de respuesta

### Para logs de errores:

- `error` - Mensaje del error
- `stack` - Stack trace
- `errorCode` - Código de error
- `requestId` - ID de request para tracing

---

## 🔍 KIBANA - CREACIÓN DE INDEX PATTERN

### Paso 1: Acceder a Kibana

- URL: http://localhost:5601
- Esperar a que termine de inicializar

### Paso 2: Crear Index Pattern

1. Ir a **Stack Management** (menú izquierdo)
2. Seleccionar **Index Patterns**
3. Click en **Create index pattern**
4. Ingresar: `flores-victoria-logs-*`
5. Click **Next step**
6. Seleccionar **@timestamp** como Time field
7. Click **Create index pattern**

### Paso 3: Ver Logs en Discover

1. Ir a **Discover** (menú izquierdo)
2. Seleccionar index pattern: `flores-victoria-logs-*`
3. Ajustar rango de tiempo (última 1 hora, 24 horas, etc.)
4. Ver logs en tiempo real

---

## 📈 DASHBOARDS RECOMENDADOS

### Dashboard 1: Overview General

- Total de logs por servicio (pie chart)
- Logs por nivel de severidad (bar chart)
- Timeline de logs (area chart)
- Top 10 errores (table)

### Dashboard 2: Performance

- Duración promedio de requests (metric)
- Requests por minuto (line chart)
- Servicios más lentos (bar chart)
- P95, P99 latency (gauge)

### Dashboard 3: Errores y Alertas

- Conteo de errores por servicio (bar chart)
- Errores en el tiempo (line chart)
- Stack traces más comunes (table)
- Rate de error (%) (metric)

### Dashboard 4: Negocio

- Pedidos por hora (area chart)
- Usuarios activos (metric)
- Revenue tracking (line chart)
- Productos más vistos (table)

---

## 🚨 ALERTAS RECOMENDADAS

### Alerta 1: Error Rate Alto

```
Condición: error_count > 100 en 5 minutos
Acción: Email + Slack notification
```

### Alerta 2: Servicio Caído

```
Condición: no logs de servicio en 2 minutos
Acción: Email + SMS
```

### Alerta 3: Latencia Alta

```
Condición: avg(duration) > 1000ms en 5 minutos
Acción: Slack notification
```

### Alerta 4: Espacio en Disco

```
Condición: elasticsearch disk usage > 80%
Acción: Email a DevOps
```

---

## 📊 QUERIES ÚTILES EN KIBANA

### Buscar todos los errores:

```
level: "error"
```

### Buscar errores de un servicio específico:

```
service: "order-service" AND level: "error"
```

### Buscar por usuario:

```
userId: "123456"
```

### Buscar requests lentos (>1 segundo):

```
duration > 1000
```

### Buscar errores en las últimas 24 horas:

```
level: "error" AND @timestamp >= now-24h
```

### Buscar por mensaje:

```
message: "payment failed"
```

---

## 🛠️ COMANDOS ÚTILES

### Ver índices en Elasticsearch:

```bash
curl http://localhost:9200/_cat/indices?v
```

### Ver health del cluster:

```bash
curl http://localhost:9200/_cluster/health | jq
```

### Ver stats de Logstash:

```bash
curl http://localhost:9600/_node/stats | jq
```

### Probar envío de log:

```bash
echo '{"message":"test log","level":"info","service":"test"}' | nc localhost 5000
```

### Ver logs de Logstash:

```bash
docker-compose logs -f logstash
```

---

## 🎓 EJEMPLO COMPLETO: API Gateway

```javascript
// api-gateway/logger.js
const winston = require('winston');
const LogstashTransport = require('winston-logstash/lib/winston-logstash-latest');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'api-gateway',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    new LogstashTransport({
      port: 5000,
      host: 'logstash',
      node_name: 'api-gateway',
      max_connect_retries: -1,
      timeout_connect_retries: 10000,
      ssl_enable: false,
    }),
  ],
});

module.exports = logger;

// api-gateway/index.js
const express = require('express');
const logger = require('./logger');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
});

// Routes
app.get('/api/products', async (req, res) => {
  try {
    logger.info('Fetching products', {
      page: req.query.page,
      limit: req.query.limit,
    });

    const products = await getProducts();

    logger.info('Products fetched successfully', {
      count: products.length,
    });

    res.json(products);
  } catch (error) {
    logger.error('Error fetching products', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });

  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info('API Gateway started', {
    port: PORT,
    environment: process.env.NODE_ENV,
  });
});
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Instalar winston y winston-logstash en cada servicio
- [ ] Crear logger.js en cada servicio
- [ ] Agregar variables de entorno en docker-compose.yml
- [ ] Implementar request logging middleware
- [ ] Implementar error handler global
- [ ] Reemplazar console.log por logger
- [ ] Agregar logs de negocio importantes
- [ ] Crear index pattern en Kibana
- [ ] Crear dashboards en Kibana
- [ ] Configurar alertas
- [ ] Probar envío de logs
- [ ] Documentar queries útiles

---

## 🎯 MEJORES PRÁCTICAS

### 1. Estructurar Logs Consistentemente

```javascript
// ✅ BIEN
logger.info('User login', {
  userId: user.id,
  username: user.username,
  ip: req.ip,
});

// ❌ MAL
logger.info(`User ${user.username} logged in from ${req.ip}`);
```

### 2. Usar Niveles Apropiados

```javascript
// ✅ BIEN
logger.error('Database connection failed', { error: err.message });
logger.warn('Cache miss', { key: cacheKey });
logger.info('Order created', { orderId: order.id });

// ❌ MAL
logger.info('Database connection failed'); // Debería ser error
```

### 3. Incluir Contexto Útil

```javascript
// ✅ BIEN
logger.error('Payment failed', {
  error: err.message,
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  paymentMethod: order.paymentMethod,
});

// ❌ MAL
logger.error('Payment failed');
```

### 4. No Loggear Información Sensible

```javascript
// ✅ BIEN
logger.info('User authenticated', {
  userId: user.id,
  method: 'jwt',
});

// ❌ MAL
logger.info('User authenticated', {
  userId: user.id,
  password: user.password, // ¡NUNCA!
  creditCard: user.card, // ¡NUNCA!
});
```

---

## 📚 RECURSOS

- **Winston Documentation:** https://github.com/winstonjs/winston
- **Elasticsearch Guide:**
  https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
- **Logstash Documentation:** https://www.elastic.co/guide/en/logstash/current/index.html
- **Kibana Guide:** https://www.elastic.co/guide/en/kibana/current/index.html

---

**Estado:** ✅ ELK Stack Listo **Fecha:** Noviembre 2025 **Versión:** 1.0.0
