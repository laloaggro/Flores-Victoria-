# API Reference - MCP Server

## 📖 Índice

1. [Health Check](#health-check)
2. [Events](#events)
3. [Context](#context)
4. [Tasks](#tasks)
5. [Audit](#audit)
6. [Register](#register)
7. [Clear](#clear)
8. [Services Status](#services-status)
9. [Metrics](#metrics)
10. [Dashboard](#dashboard)

---

## Health Check

### `GET /health`

Endpoint básico de health check para verificar que el servidor está activo.

**Autenticación:** No requerida

**Request:**

```bash
curl http://localhost:5050/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": 1697823600000
}
```

**Status Codes:**

- `200 OK`: Servidor funcionando correctamente

**Uso:**

- Load balancers para verificar disponibilidad
- Kubernetes liveness/readiness probes
- Monitoring tools

**Ejemplo con JavaScript:**

```javascript
fetch('http://localhost:5050/health')
  .then((res) => res.json())
  .then((data) => console.log('Server status:', data.status));
```

---

## Events

### `POST /events`

Registra un evento en el sistema. Los eventos pueden ser errores, warnings, info, etc.

**Autenticación:** No requerida

**Request:**

```bash
curl -X POST http://localhost:5050/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "error",
    "payload": {
      "service": "auth-service",
      "message": "Database connection failed",
      "severity": "critical"
    }
  }'
```

**Body Parameters:**

| Campo     | Tipo   | Requerido | Descripción                                           |
| --------- | ------ | --------- | ----------------------------------------------------- |
| `type`    | string | Sí        | Tipo de evento: `error`, `warning`, `info`, `success` |
| `payload` | object | Sí        | Datos adicionales del evento                          |

**Response:**

```json
{
  "type": "error",
  "payload": {
    "service": "auth-service",
    "message": "Database connection failed",
    "severity": "critical"
  },
  "timestamp": 1697823600000
}
```

**Status Codes:**

- `200 OK`: Evento registrado correctamente
- `400 Bad Request`: Datos inválidos

**Ejemplos de Eventos:**

**Error Event:**

```json
{
  "type": "error",
  "payload": {
    "service": "payment-service",
    "error": "Payment gateway timeout",
    "userId": "user-123",
    "orderId": "order-456"
  }
}
```

**Warning Event:**

```json
{
  "type": "warning",
  "payload": {
    "service": "product-service",
    "message": "Low stock detected",
    "productId": "prod-789",
    "currentStock": 5
  }
}
```

**Info Event:**

```json
{
  "type": "info",
  "payload": {
    "service": "order-service",
    "message": "New order created",
    "orderId": "order-999",
    "total": 125.5
  }
}
```

---

## Context

### `GET /context`

Obtiene el contexto completo del sistema (modelos, agentes, tareas, auditoría, eventos).

**Autenticación:** No requerida

**Request:**

```bash
curl http://localhost:5050/context
```

**Response:**

```json
{
  "models": [
    {
      "name": "GPT-4",
      "version": "1.0",
      "provider": "OpenAI"
    }
  ],
  "agents": [
    {
      "id": "agent-001",
      "type": "customer-service",
      "status": "active"
    }
  ],
  "tasks": [
    {
      "name": "daily-backup",
      "status": "success",
      "timestamp": 1697823600000
    }
  ],
  "audit": [
    {
      "action": "user_created",
      "agent": "admin",
      "details": { "userId": "user-123" },
      "timestamp": 1697823600000
    }
  ],
  "events": [
    {
      "type": "info",
      "payload": { "message": "Server started" },
      "timestamp": 1697823600000
    }
  ]
}
```

**Status Codes:**

- `200 OK`: Contexto obtenido correctamente

**Uso:**

- Debugging del estado del sistema
- Dashboards de monitoreo
- Análisis de comportamiento

---

## Tasks

### `POST /tasks`

Simula la ejecución de una tarea automática. Útil para testing.

**Autenticación:** No requerida

**Request:**

```bash
curl -X POST http://localhost:5050/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "backup-database",
    "priority": "high"
  }'
```

**Body Parameters:**

| Campo      | Tipo   | Requerido | Descripción                        |
| ---------- | ------ | --------- | ---------------------------------- |
| `name`     | string | Sí        | Nombre de la tarea                 |
| `priority` | string | No        | Prioridad: `low`, `medium`, `high` |

**Response:**

```json
{
  "name": "backup-database",
  "status": "success",
  "timestamp": 1697823600000,
  "priority": "high"
}
```

**Status Codes:**

- `200 OK`: Tarea ejecutada correctamente

**Nota:** En producción, reemplazar con sistema de colas como RabbitMQ, Bull, o AWS SQS.

---

## Audit

### `POST /audit`

Registra una acción en el log de auditoría. Esencial para compliance y seguridad.

**Autenticación:** No requerida

**Request:**

```bash
curl -X POST http://localhost:5050/audit \
  -H "Content-Type: application/json" \
  -d '{
    "action": "user_deleted",
    "agent": "admin-john",
    "details": {
      "userId": "user-789",
      "reason": "GDPR request",
      "ipAddress": "192.168.1.100"
    }
  }'
```

**Body Parameters:**

| Campo     | Tipo   | Requerido | Descripción                                              |
| --------- | ------ | --------- | -------------------------------------------------------- |
| `action`  | string | Sí        | Acción realizada (ej: `user_created`, `order_cancelled`) |
| `agent`   | string | Sí        | Quién realizó la acción (usuario o sistema)              |
| `details` | object | Sí        | Detalles adicionales de la acción                        |

**Response:**

```json
{
  "action": "user_deleted",
  "agent": "admin-john",
  "details": {
    "userId": "user-789",
    "reason": "GDPR request",
    "ipAddress": "192.168.1.100"
  },
  "timestamp": 1697823600000
}
```

**Status Codes:**

- `200 OK`: Auditoría registrada correctamente
- `400 Bad Request`: Datos inválidos

**Casos de Uso:**

1. **Seguridad:**
   - Intentos de login fallidos
   - Cambios de permisos
   - Acceso a datos sensibles

2. **Compliance:**
   - Acciones GDPR (eliminación de datos)
   - Cambios en configuración crítica
   - Exportaciones de datos

3. **Debugging:**
   - Rastreo de bugs
   - Análisis de comportamiento de usuarios
   - Investigación de incidentes

---

## Register

### `POST /register`

Registra un nuevo modelo de IA o agente en el sistema.

**Autenticación:** No requerida

**Request:**

```bash
curl -X POST http://localhost:5050/register \
  -H "Content-Type: application/json" \
  -d '{
    "type": "agent",
    "data": {
      "id": "agent-chatbot-001",
      "name": "Customer Service Bot",
      "model": "GPT-4",
      "capabilities": ["text", "voice"],
      "language": "es"
    }
  }'
```

**Body Parameters:**

| Campo  | Tipo   | Requerido | Descripción             |
| ------ | ------ | --------- | ----------------------- |
| `type` | string | Sí        | Tipo: `model` o `agent` |
| `data` | object | Sí        | Datos del modelo/agente |

**Response para Agent:**

```json
{
  "type": "agent",
  "data": {
    "id": "agent-chatbot-001",
    "name": "Customer Service Bot",
    "model": "GPT-4",
    "capabilities": ["text", "voice"],
    "language": "es"
  }
}
```

**Response para Model:**

```json
{
  "type": "model",
  "data": {
    "name": "GPT-4",
    "version": "1.0",
    "provider": "OpenAI",
    "maxTokens": 8192
  }
}
```

**Status Codes:**

- `200 OK`: Registro exitoso
- `400 Bad Request`: Tipo inválido (debe ser `model` o `agent`)

---

## Clear

### `POST /clear`

⚠️ **PELIGRO**: Limpia TODO el contexto del sistema. Úsalo con extrema precaución.

**Autenticación:** No requerida

**Request:**

```bash
curl -X POST http://localhost:5050/clear
```

**Response:**

```json
{
  "status": "cleared"
}
```

**Status Codes:**

- `200 OK`: Contexto limpiado correctamente

**⚠️ Advertencias:**

- Esta operación es IRREVERSIBLE
- Se pierden todos los eventos, auditorías, tareas, etc.
- Solo usar en:
  - Entornos de desarrollo
  - Tests automatizados
  - Reset después de demos

**🚫 NO usar en:**

- Producción
- Staging con datos reales
- Sin backup previo

---

## Services Status

### `GET /check-services`

Verifica el estado de salud de todos los microservicios. Envía alertas si detecta servicios caídos.

**Autenticación:** ✅ Requerida (Basic Auth)

**Request:**

```bash
curl http://localhost:5050/check-services \
  -u admin:admin123
```

**Response:**

```json
{
  "healthy": 8,
  "unhealthy": 1,
  "total": 9,
  "services": [
    {
      "name": "auth-service",
      "url": "http://auth-service:3001/health",
      "status": "healthy",
      "responseTime": 45
    },
    {
      "name": "product-service",
      "url": "http://product-service:3002/health",
      "status": "unhealthy",
      "error": "Connection timeout"
    }
  ]
}
```

**Response Fields:**

| Campo                     | Tipo   | Descripción                                 |
| ------------------------- | ------ | ------------------------------------------- |
| `healthy`                 | number | Cantidad de servicios funcionando           |
| `unhealthy`               | number | Cantidad de servicios caídos                |
| `total`                   | number | Total de servicios monitoreados             |
| `services`                | array  | Detalle de cada servicio                    |
| `services[].name`         | string | Nombre del servicio                         |
| `services[].url`          | string | URL del health check                        |
| `services[].status`       | string | Estado: `healthy` o `unhealthy`             |
| `services[].responseTime` | number | Tiempo de respuesta en ms (solo si healthy) |
| `services[].error`        | string | Mensaje de error (solo si unhealthy)        |

**Status Codes:**

- `200 OK`: Health check completado
- `401 Unauthorized`: Credenciales incorrectas

**Alertas Automáticas:**

Si hay servicios caídos, se envía una notificación crítica:

```
⚠️ CRITICAL ALERT ⚠️
Services Down: 1/9

auth-service: Connection refused
```

---

## Metrics

### `GET /metrics` (JSON)

Obtiene métricas del sistema en formato JSON para consumo fácil.

**Autenticación:** No requerida

**Request:**

```bash
curl http://localhost:5050/metrics
```

**Response:**

```json
{
  "healthyServices": 8,
  "totalServices": 9,
  "eventsCount": 142,
  "auditsCount": 37,
  "uptimePercent": 99.8,
  "testsStatus": 1,
  "timestamp": 1697823600000
}
```

**Metrics Description:**

| Métrica           | Tipo      | Descripción                                 |
| ----------------- | --------- | ------------------------------------------- |
| `healthyServices` | Gauge     | Servicios funcionando actualmente           |
| `totalServices`   | Gauge     | Total de servicios monitoreados             |
| `eventsCount`     | Counter   | Eventos registrados desde el inicio         |
| `auditsCount`     | Counter   | Acciones auditadas desde el inicio          |
| `uptimePercent`   | Gauge     | Porcentaje de disponibilidad                |
| `testsStatus`     | Gauge     | 1 = todos los tests pasaron, 0 = hay fallos |
| `timestamp`       | Timestamp | Momento de la medición (Unix ms)            |

**Status Codes:**

- `200 OK`: Métricas obtenidas correctamente

---

### `GET /metrics/prometheus` (Text)

Obtiene métricas en formato Prometheus (text/plain) para scraping automático.

**Autenticación:** No requerida

**Request:**

```bash
curl http://localhost:5050/metrics/prometheus
```

**Response:**

```
# HELP mcp_healthy_services Number of healthy services
# TYPE mcp_healthy_services gauge
mcp_healthy_services 8

# HELP mcp_total_services Total number of services
# TYPE mcp_total_services gauge
mcp_total_services 9

# HELP mcp_events_count Total number of events
# TYPE mcp_events_count counter
mcp_events_count 142

# HELP mcp_audits_count Total number of audits
# TYPE mcp_audits_count counter
mcp_audits_count 37

# HELP mcp_uptime_percent Uptime percentage
# TYPE mcp_uptime_percent gauge
mcp_uptime_percent 99.8

# HELP mcp_tests_status Tests status (1=pass, 0=fail)
# TYPE mcp_tests_status gauge
mcp_tests_status 1
```

**Status Codes:**

- `200 OK`: Métricas generadas correctamente

**Content-Type:** `text/plain; version=0.0.4`

**Prometheus Configuration:**

```yaml
scrape_configs:
  - job_name: 'mcp-server'
    scrape_interval: 15s
    static_configs:
      - targets: ['mcp-server:5050']
    metrics_path: '/metrics/prometheus'
```

---

## Dashboard

### `GET /`

Dashboard web interactivo para visualizar el estado del sistema.

**Autenticación:** ✅ Requerida (Basic Auth)

**Request:**

```bash
# En el navegador
http://localhost:5050/

# Con curl
curl http://localhost:5050/ -u admin:admin123
```

**Response:** HTML page con dashboard interactivo

**Features:**

- 📊 Gráficos en tiempo real
- 🔴🟢 Estado de servicios (visual)
- 📈 Métricas históricas
- 📋 Logs recientes
- 🔔 Alertas activas

**Status Codes:**

- `200 OK`: Dashboard cargado
- `401 Unauthorized`: Credenciales incorrectas

---

## Error Responses

Todos los endpoints pueden devolver estos errores comunes:

### 400 Bad Request

```json
{
  "error": "Invalid request body",
  "details": "Field 'type' is required"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Basic authentication required"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

Actualmente NO implementado. Para producción, considera:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

---

## CORS Configuration

Configuración actual (PERMISIVA):

```javascript
app.use(
  cors({
    origin: '*', // ⚠️ Permite todos los orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

**Para Producción:**

```javascript
app.use(
  cors({
    origin: ['https://flores-victoria.com', 'https://admin.flores-victoria.com'],
    credentials: true,
    maxAge: 3600,
  })
);
```

---

## Best Practices

### 1. Authentication

```javascript
// Siempre validar credenciales
if (!req.headers.authorization) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### 2. Input Validation

```javascript
// Validar tipos de datos
if (typeof req.body.type !== 'string') {
  return res.status(400).json({ error: 'Invalid type' });
}
```

### 3. Error Handling

```javascript
try {
  // Operación riesgosa
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

### 4. Logging

```javascript
// Siempre loggear requests importantes
console.log(`[${new Date().toISOString()}] POST /audit by ${agent}`);
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
class MCPClient {
  constructor(baseURL = 'http://localhost:5050') {
    this.baseURL = baseURL;
  }

  async health() {
    const res = await fetch(`${this.baseURL}/health`);
    return res.json();
  }

  async logEvent(type, payload) {
    const res = await fetch(`${this.baseURL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    return res.json();
  }

  async getMetrics() {
    const res = await fetch(`${this.baseURL}/metrics`);
    return res.json();
  }
}

// Uso
const mcp = new MCPClient();
await mcp.logEvent('error', { message: 'Test error' });
```

### Python

```python
import requests

class MCPClient:
    def __init__(self, base_url='http://localhost:5050'):
        self.base_url = base_url

    def health(self):
        return requests.get(f'{self.base_url}/health').json()

    def log_event(self, event_type, payload):
        return requests.post(
            f'{self.base_url}/events',
            json={'type': event_type, 'payload': payload}
        ).json()

    def get_metrics(self):
        return requests.get(f'{self.base_url}/metrics').json()

# Uso
mcp = MCPClient()
mcp.log_event('error', {'message': 'Test error'})
```

---

## Changelog

### v1.0.0 (2025-01-15)

- Initial release
- Basic endpoints: health, events, context
- Health check de servicios
- Métricas Prometheus

### v1.1.0 (2025-02-01)

- Añadido: Dashboard web
- Añadido: Basic Authentication
- Mejorado: Manejo de errores

---

## Support

- 📧 Email: support@flores-victoria.com
- 📖 Docs: https://docs.flores-victoria.com
- 🐛 Issues: https://github.com/flores-victoria/issues
