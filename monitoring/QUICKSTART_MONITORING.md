# 🚀 Guía de Inicio Rápido - Monitoring Stack

## 📋 Resumen

Este stack de monitoring incluye:

- **Prometheus**: Recolección de métricas
- **Grafana**: Visualización y dashboards
- **AlertManager**: Gestión de alertas
- **Node Exporter**: Métricas del sistema (CPU, RAM, Disk)
- **MongoDB Exporter**: Métricas de base de datos

## 🎯 Inicio Rápido (3 minutos)

### 1. Iniciar el Stack Completo

```bash
# Asegurarse de que la red existe
docker network create flores-victoria-network

# Iniciar monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Verificar que todo está corriendo
docker-compose -f docker-compose.monitoring.yml ps
```

### 2. Acceder a las Interfaces

| Servicio     | URL                   | Usuario | Contraseña |
| ------------ | --------------------- | ------- | ---------- |
| Grafana      | http://localhost:3000 | admin   | admin123   |
| Prometheus   | http://localhost:9090 | -       | -          |
| AlertManager | http://localhost:9093 | -       | -          |

### 3. Ver Dashboards en Grafana

1. Abrir http://localhost:3000
2. Login: `admin` / `admin123`
3. Ir a **Dashboards** → **Browse**
4. Abrir **E-Commerce Performance**

## 📊 Dashboards Disponibles

### E-Commerce Performance Dashboard

**Métricas de Negocio:**

- ✅ Usuarios activos en tiempo real
- ✅ Tasa de conversión
- ✅ Abandono de carrito
- ✅ Valor promedio de orden (AOV)
- ✅ Top productos más vistos

**Métricas Técnicas:**

- ✅ Web Vitals (FCP, LCP, CLS)
- ✅ Tasa de requests
- ✅ Tiempo de respuesta
- ✅ Tasa de errores
- ✅ Cache hit rate

**Infraestructura:**

- ✅ CPU y Memoria
- ✅ Network I/O
- ✅ MongoDB queries
- ✅ Conexiones de BD

## 🚨 Alertas Configuradas

### Alertas de Performance

- ⚠️ Response time > 2s (5 min)
- ⚠️ FCP > 1.8s (5 min)
- ⚠️ LCP > 2.5s (5 min)
- ⚠️ CLS > 0.1 (5 min)

### Alertas de Negocio

- ⚠️ Conversion rate < 1% (30 min)
- ⚠️ Cart abandonment > 80% (30 min)
- ⚠️ Sin ventas en 2 horas

### Alertas de Infraestructura

- 🔴 CPU > 80% (5 min)
- 🔴 Memoria > 85% (5 min)
- 🔴 Disco < 15% (10 min)
- 🔴 Service down (2 min)

### Alertas de Base de Datos

- ⚠️ Slow queries > 100 ops/sec
- ⚠️ Conexiones > 100
- 🔴 MongoDB down (1 min)

## 📈 Queries Útiles de Prometheus

### Web Performance

```promql
# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Request rate
sum(rate(http_requests_total[1m])) by (method, status)

# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
```

### Business Metrics

```promql
# Conversion rate
(sum(rate(orders_completed_total[1h])) / sum(rate(cart_views_total[1h]))) * 100

# Cart abandonment
(1 - (sum(rate(orders_completed_total[1h])) / sum(rate(cart_created_total[1h])))) * 100

# Average order value
avg(order_total_value)
```

### Infrastructure

```promql
# CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Disk space free
(node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100
```

### Database

```promql
# MongoDB query rate
rate(mongodb_op_latencies_ops_total[5m])

# MongoDB connections
mongodb_connections{state="current"}

# MongoDB operations by type
rate(mongodb_op_counters_total[5m])
```

## 🔧 Configuración de Alertas Email

Editar `monitoring/alertmanager.yml`:

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@floresvictoria.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'your-app-password'

route:
  receiver: 'email-notifications'

receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'admin@floresvictoria.com'
        headers:
          Subject: '[ALERT] {{ .GroupLabels.alertname }}'
```

Reiniciar alertmanager:

```bash
docker-compose -f docker-compose.monitoring.yml restart alertmanager
```

## 📱 Integración con Slack

```yaml
receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

## 🎨 Crear Dashboards Personalizados

1. En Grafana, ir a **+** → **Create Dashboard**
2. Agregar panel → **Add Query**
3. Seleccionar **Prometheus** como datasource
4. Escribir query PromQL
5. Configurar visualización (Graph, Stat, Table, etc.)
6. Guardar dashboard

## 📊 Métricas a Instrumentar en el Backend

### Express.js (Node.js)

```javascript
const promClient = require('prom-client');

// Registro de métricas
const register = new promClient.Registry();

// Métricas de HTTP
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 3, 5],
});

// Métricas de negocio
const ordersCompleted = new promClient.Counter({
  name: 'orders_completed_total',
  help: 'Total number of completed orders',
});

const cartCreated = new promClient.Counter({
  name: 'cart_created_total',
  help: 'Total number of carts created',
});

// Registrar métricas
register.registerMetric(httpRequestDuration);
register.registerMetric(ordersCompleted);
register.registerMetric(cartCreated);

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Middleware para capturar métricas
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  next();
});
```

## 🔍 Troubleshooting

### Prometheus no recolecta métricas

```bash
# Verificar targets en Prometheus
curl http://localhost:9090/api/v1/targets

# Ver logs
docker logs flores-victoria-prometheus

# Verificar configuración
docker exec flores-victoria-prometheus promtool check config /etc/prometheus/prometheus.yml
```

### Grafana no muestra datos

1. Verificar que Prometheus está como datasource
2. Verificar que hay datos en Prometheus: http://localhost:9090/graph
3. Revisar query en panel
4. Ajustar time range

### MongoDB Exporter falla

```bash
# Verificar conexión a MongoDB
docker logs flores-victoria-mongodb-exporter

# Probar manualmente
curl http://localhost:9216/metrics
```

## 📚 Recursos Adicionales

- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **PromQL Tutorial**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Node Exporter**: https://github.com/prometheus/node_exporter
- **MongoDB Exporter**: https://github.com/percona/mongodb_exporter

## ⚡ Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.monitoring.yml logs -f

# Reiniciar todo el stack
docker-compose -f docker-compose.monitoring.yml restart

# Parar el stack
docker-compose -f docker-compose.monitoring.yml down

# Parar y eliminar volúmenes (⚠️ borra datos históricos)
docker-compose -f docker-compose.monitoring.yml down -v

# Ver métricas de un servicio
curl http://localhost:9090/api/v1/query?query=up

# Exportar dashboard de Grafana
curl http://admin:admin123@localhost:3000/api/dashboards/db/ecommerce-performance
```

## 🎯 Próximos Pasos

1. ✅ Instrumentar endpoints del backend con métricas
2. ✅ Configurar notificaciones (email/Slack)
3. ✅ Agregar métricas de Web Vitals desde el frontend
4. ✅ Crear alertas personalizadas según SLAs
5. ✅ Configurar retention de datos (por defecto 15 días)
6. ✅ Backup automático de dashboards

---

**¿Dudas?** Ver documentación completa en `/monitoring/docs/`
