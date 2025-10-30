# 🚀 Monitoring Quick Start Guide

## Configuración Completada

Se ha configurado un stack completo de observabilidad con:
- ✅ **Prometheus** - Recolección de métricas
- ✅ **Grafana** - Visualización y dashboards
- ✅ **Alertmanager** - Gestión de alertas

---

## 🎯 Inicio Rápido (5 minutos)

### 1. Levantar Stack de Monitoring

```bash
# Iniciar Prometheus + Grafana + Alertmanager
docker-compose -f docker-compose.monitoring.yml up -d

# Verificar que estén corriendo
docker-compose -f docker-compose.monitoring.yml ps
```

**Servicios disponibles:**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Alertmanager: http://localhost:9093

---

### 2. Iniciar Microservicios

```bash
# Terminal 1: Cart Service
cd microservices/cart-service && npm start

# Terminal 2: Product Service  
cd microservices/product-service && npm start

# Terminal 3: Auth Service
cd microservices/auth-service && npm start

# Terminal 4: User Service
cd microservices/user-service && npm start

# Terminal 5: Order Service
cd microservices/order-service && npm start
```

---

### 3. Acceder a Grafana

1. Abrir http://localhost:3000
2. Login:
   - **Usuario:** admin
   - **Password:** admin123
3. ¡Dashboards ya están configurados! 🎉

---

## 📊 Dashboards Disponibles

### 1. HTTP Requests Overview
**Métricas incluidas:**
- Request rate por servicio
- Response time (p50, p95, p99)
- Status codes distribution
- Active requests

**Queries ejemplo:**
```promql
# Request rate
rate(http_requests_total[5m])

# Response time p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m])
```

### 2. Error Rates Dashboard
**Métricas incluidas:**
- Total errors por tipo
- Error rate por servicio
- Top errores más frecuentes

**Queries ejemplo:**
```promql
# Error rate percentage
(sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100

# Errors by type
sum by (type) (rate(errors_total[5m]))
```

### 3. Business Metrics Dashboard
**Métricas incluidas:**
- Orders created
- Cart operations
- User registrations
- Product views

---

## 🔍 Verificar Métricas

### Prometheus Targets
```bash
# Verificar que todos los servicios estén siendo scrapeados
curl http://localhost:9090/api/v1/targets

# Debería mostrar:
# ✅ cart-service (host.docker.internal:3001)
# ✅ product-service (host.docker.internal:3002)
# ✅ auth-service (host.docker.internal:3003)
# ✅ user-service (host.docker.internal:3004)
# ✅ order-service (host.docker.internal:3005)
```

### Métricas de un Servicio
```bash
# Ver métricas de cart-service
curl http://localhost:3001/metrics

# Deberías ver:
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
# http_requests_total{method="GET",route="/health",status="200"} 5
```

---

## ⚠️ Alertas Configuradas

### Alertas Críticas
- **ServiceDown:** Servicio caído por >1min
- **HighErrorRate:** Error rate >5% por >5min

### Alertas de Advertencia
- **HighResponseTime:** p95 >2s por >5min
- **RateLimitExceeded:** Muchos rate limits
- **SlowDatabaseQueries:** Queries >1s

### Ver Alertas Activas
```bash
# En Prometheus
http://localhost:9090/alerts

# En Alertmanager
http://localhost:9093/#/alerts
```

---

## 🧪 Generar Tráfico de Prueba

```bash
# Generar requests al cart-service
for i in {1..100}; do
  curl http://localhost:3001/health
  sleep 0.1
done

# Generar un error
curl -X POST http://localhost:3001/api/cart/invalid-route

# Ver métricas actualizadas
curl http://localhost:3001/metrics | grep http_requests_total
```

---

## 📈 Queries Útiles de Prometheus

### HTTP Performance
```promql
# Request rate por servicio
sum by (service) (rate(http_requests_total[5m]))

# Response time percentiles
histogram_quantile(0.95, sum by (service, le) (rate(http_request_duration_seconds_bucket[5m])))

# Requests por método
sum by (method) (rate(http_requests_total[5m]))
```

### Errors
```promql
# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# Errors por servicio
sum by (service) (rate(errors_total[5m]))

# Top 5 rutas con más errores
topk(5, sum by (route) (rate(http_requests_total{status=~"5.."}[5m])))
```

### Rate Limiting
```promql
# Rate limit hits
sum by (service) (rate(rate_limit_hits_total[5m]))

# Rate limit exceeded
sum by (service) (rate(rate_limit_exceeded_total[5m]))
```

### Database
```promql
# Query duration p95
histogram_quantile(0.95, sum by (operation, le) (rate(db_query_duration_seconds_bucket[5m])))

# Active connections
db_connections_active
```

---

## 🛠️ Troubleshooting

### Prometheus no encuentra los servicios
```bash
# 1. Verificar que los servicios estén corriendo
curl http://localhost:3001/health
curl http://localhost:3002/health

# 2. Verificar endpoint /metrics
curl http://localhost:3001/metrics

# 3. Ver logs de Prometheus
docker logs flores-victoria-prometheus
```

### Grafana no muestra datos
1. Verificar datasource en Grafana Settings > Data Sources
2. Test connection debe ser exitoso
3. Ejecutar query de prueba: `up`

### Alertas no se disparan
```bash
# 1. Verificar rules en Prometheus
http://localhost:9090/rules

# 2. Ver evaluación de alertas
http://localhost:9090/alerts

# 3. Logs de Alertmanager
docker logs flores-victoria-alertmanager
```

---

## 🚦 Próximos Pasos

### Personalizar Dashboards
1. Crear dashboard personalizado en Grafana
2. Agregar paneles con queries específicas
3. Configurar variables para filtrar por servicio

### Configurar Notificaciones
1. Editar `monitoring/alertmanager.yml`
2. Agregar receivers (email, Slack, webhook)
3. Reiniciar Alertmanager

### Agregar Métricas de Negocio
```javascript
// En tu código
const { MetricsHelper } = require('../../shared/middleware/metrics');

MetricsHelper.incrementBusinessMetric('orders_completed', { 
  status: 'success',
  payment_method: 'credit_card'
});
```

---

## 📚 Recursos

- **Prometheus Docs:** https://prometheus.io/docs/
- **Grafana Docs:** https://grafana.com/docs/
- **PromQL Basics:** https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Dashboard Examples:** https://grafana.com/grafana/dashboards/

---

## ✅ Checklist de Validación

- [ ] Prometheus scrapeando todos los servicios
- [ ] Grafana muestra datos en dashboards
- [ ] Alertas configuradas y funcionando
- [ ] Métricas de negocio visibles
- [ ] Tests ejecutándose correctamente
- [ ] Documentación actualizada

---

**¡Stack de monitoring listo para producción!** 🎉
