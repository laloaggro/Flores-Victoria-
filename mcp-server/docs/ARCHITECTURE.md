# Arquitectura del MCP Server

## 📐 Visión General

El **MCP Server** (Model Context Protocol Server) es el núcleo central de coordinación y monitoreo
de toda la arquitectura de microservicios del sistema Flores Victoria. Actúa como un hub de
observabilidad, auditoría y orquestación.

## 🎯 Propósito y Responsabilidades

### Responsabilidades Principales

1. **Monitoreo de Salud (Health Monitoring)**
   - Verificación periódica del estado de todos los microservicios
   - Detección temprana de fallos y degradación del servicio
   - Alertas automáticas cuando hay servicios caídos

2. **Registro de Eventos (Event Logging)**
   - Centralización de eventos del sistema
   - Registro estructurado de acciones importantes
   - Trazabilidad completa de operaciones

3. **Auditoría (Audit Trail)**
   - Registro de acciones de usuarios y agentes de IA
   - Cumplimiento normativo (compliance)
   - Investigación de incidentes de seguridad

4. **Métricas y Reportes (Metrics & Reporting)**
   - Recopilación de métricas en tiempo real
   - Exportación para sistemas de monitoreo (Prometheus, Grafana)
   - Dashboards interactivos

## 🏗️ Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        MCP Server                            │
│                      (Puerto 5050)                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Express    │  │  Body Parser │  │     CORS     │     │
│  │   Router     │  │  Middleware  │  │  Middleware  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Basic      │  │   Health     │  │   Notifier   │     │
│  │     Auth     │  │   Checker    │  │   Module     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Contexto Global (In-Memory Storage)          │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │  │
│  │  │ Models │ │ Agents │ │ Tasks  │ │ Audit  │       │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘       │  │
│  │  ┌────────┐                                          │  │
│  │  │ Events │                                          │  │
│  │  └────────┘                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
  ┌──────────┐          ┌──────────┐          ┌──────────┐
  │  Auth    │          │ Product  │          │  Order   │
  │ Service  │          │ Service  │          │ Service  │
  └──────────┘          └──────────┘          └──────────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              ┌──────────┐        ┌──────────┐
              │   Cart   │        │ Wishlist │
              │ Service  │        │ Service  │
              └──────────┘        └──────────┘
```

## 🔄 Flujo de Datos

### 1. Health Check Flow

```
┌──────────────┐
│  Dashboard   │  GET /check-services
│   Browser    │─────────────────────────┐
└──────────────┘                         │
                                         ▼
                                  ┌──────────────┐
                                  │  MCP Server  │
                                  │ (Auth Check) │
                                  └──────┬───────┘
                                         │
                         ┌───────────────┼───────────────┐
                         │               │               │
                         ▼               ▼               ▼
                   GET /health     GET /health     GET /health
                 ┌──────────┐    ┌──────────┐    ┌──────────┐
                 │  Auth    │    │ Product  │    │  Order   │
                 │ Service  │    │ Service  │    │ Service  │
                 └────┬─────┘    └────┬─────┘    └────┬─────┘
                      │               │               │
                      │  200 OK       │  200 OK       │  200 OK
                      └───────────────┼───────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │  Aggregate    │
                              │   Results     │
                              └───────┬───────┘
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                        ▼                           ▼
                 unhealthy > 0?            Return JSON Report
                        │
                        ▼ YES
                 ┌──────────────┐
                 │ Send Critical│
                 │    Alert     │
                 └──────────────┘
```

### 2. Event Registration Flow

```
┌──────────────┐
│ Microservice │  POST /events
│  (Any)       │  { type, payload }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  MCP Server  │
│ Body Parser  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Add Event   │
│  to Context  │
│  + Timestamp │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Return Event │
│   (200 OK)   │
└──────────────┘
```

### 3. Metrics Collection Flow

```
┌──────────────┐
│  Prometheus  │  GET /metrics/prometheus
│   Server     │  (every 15-30 seconds)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  MCP Server  │
│ Health Check │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Calculate   │
│   Metrics    │
│ (uptime, etc)│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Return Text  │
│ (Prometheus  │
│   Format)    │
└──────────────┘
```

## 🔐 Seguridad

### Autenticación

- **Basic Authentication**: Protege rutas sensibles
- **Credenciales**: Configurables mediante variables de entorno
- **Headers**: `Authorization: Basic <base64(user:pass)>`

### Rutas Protegidas

| Ruta                  | Autenticación | Propósito           |
| --------------------- | ------------- | ------------------- |
| `/`                   | ✅ Requerida  | Dashboard web       |
| `/check-services`     | ✅ Requerida  | Estado de servicios |
| `/health`             | ❌ Pública    | Health check básico |
| `/events`             | ❌ Pública    | Registro de eventos |
| `/metrics`            | ❌ Pública    | Métricas JSON       |
| `/metrics/prometheus` | ❌ Pública    | Métricas Prometheus |

### Mejores Prácticas de Seguridad

1. **Variables de Entorno**
   - Nunca hardcodear credenciales
   - Usar valores por defecto seguros en desarrollo
   - Cambiar contraseñas en producción

2. **HTTPS**
   - Usar HTTPS en producción
   - Certificados SSL/TLS válidos
   - Renovación automática (Let's Encrypt)

3. **Rate Limiting**
   - Implementar límites de peticiones
   - Prevenir ataques de fuerza bruta
   - Proteger contra DDoS

4. **CORS**
   - Restringir orígenes permitidos en producción
   - No usar `*` (todos los orígenes)
   - Lista blanca de dominios

## 💾 Almacenamiento de Datos

### In-Memory Storage

El MCP Server usa almacenamiento en memoria (RAM) para velocidad y simplicidad:

**Ventajas:**

- ⚡ Acceso ultra-rápido (nanosegundos)
- 🚀 Sin latencia de red o disco
- 💡 Implementación simple

**Desventajas:**

- 🔄 Los datos se pierden al reiniciar
- 📊 Limitado por la RAM disponible
- 🚫 No adecuado para persistencia a largo plazo

### Estructura del Contexto

```javascript
{
  models: [
    { name: 'GPT-4', version: '1.0', capabilities: ['text', 'code'] }
  ],
  agents: [
    { id: 'agent-001', type: 'customer-service', status: 'active' }
  ],
  tasks: [
    { name: 'backup', status: 'success', timestamp: 1234567890 }
  ],
  audit: [
    { action: 'user_delete', agent: 'admin', timestamp: 1234567890 }
  ],
  events: [
    { type: 'error', payload: { message: 'Connection failed' }, timestamp: 1234567890 }
  ]
}
```

### Migración a Persistencia

Para entornos de producción, considera migrar a:

1. **MongoDB**
   - Perfecto para documentos JSON
   - Escalable horizontalmente
   - Queries flexibles

2. **PostgreSQL**
   - ACID compliant
   - Relaciones complejas
   - Integridad referencial

3. **Redis**
   - Caché distribuido
   - Pub/Sub para eventos
   - Alta disponibilidad

## 📊 Métricas y Observabilidad

### Métricas Disponibles

| Métrica                | Descripción                  | Tipo    |
| ---------------------- | ---------------------------- | ------- |
| `mcp_healthy_services` | Servicios funcionando        | Gauge   |
| `mcp_total_services`   | Total de servicios           | Gauge   |
| `mcp_events_count`     | Eventos registrados          | Counter |
| `mcp_audits_count`     | Acciones auditadas           | Counter |
| `mcp_uptime_percent`   | Porcentaje de disponibilidad | Gauge   |
| `mcp_tests_status`     | Estado de tests              | Gauge   |

### Integración con Prometheus

**prometheus.yml**

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mcp-server'
    static_configs:
      - targets: ['mcp-server:5050']
    metrics_path: '/metrics/prometheus'
```

### Dashboards de Grafana

Importar dashboards preconstruidos:

- ID: 12345 (MCP Server Overview)
- ID: 12346 (Service Health Matrix)

## 🚀 Escalabilidad

### Horizontal Scaling

Para escalar el MCP Server:

1. **Stateless Design**
   - Mover contexto a Redis/MongoDB
   - Sesiones en caché distribuido
   - Sin estado local

2. **Load Balancer**
   - Nginx/HAProxy delante
   - Algoritmo round-robin
   - Health checks activos

3. **Service Mesh**
   - Istio para traffic management
   - Circuit breakers automáticos
   - Retry logic integrado

### Vertical Scaling

Optimizaciones para un solo servidor:

1. **Node.js Cluster**
   - Un proceso por CPU core
   - Balanceo automático
   - Mejor uso de recursos

2. **Caching**
   - Caché de health checks
   - Resultados de queries
   - Reduce latencia

3. **Asynchronous Operations**
   - Non-blocking I/O
   - Event-driven architecture
   - Streams para grandes datasets

## 🔧 Mantenimiento

### Logs

```bash
# Ver logs en tiempo real
docker compose logs -f mcp-server

# Últimas 100 líneas
docker compose logs --tail 100 mcp-server

# Filtrar por nivel
docker compose logs mcp-server | grep ERROR
```

### Backup del Contexto

```javascript
// Exportar contexto a archivo
const fs = require('fs');

app.get('/export', (req, res) => {
  const backup = JSON.stringify(context, null, 2);
  fs.writeFileSync('backup.json', backup);
  res.download('backup.json');
});

// Importar contexto desde archivo
app.post('/import', (req, res) => {
  const backup = JSON.parse(fs.readFileSync('backup.json'));
  context = backup;
  res.json({ status: 'imported' });
});
```

### Monitoreo de Recursos

```bash
# Uso de CPU y memoria
docker stats mcp-server

# Procesos dentro del contenedor
docker exec mcp-server ps aux

# Logs de sistema
docker exec mcp-server dmesg
```

## 📚 Referencias

- [Express.js Documentation](https://expressjs.com/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [REST API Design](https://restfulapi.net/)
- [Microservices Patterns](https://microservices.io/patterns/index.html)
