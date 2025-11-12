# 📊 Grafana Dashboards - Guía de Importación

## Dashboards Disponibles

### 1. Microservices Overview (`microservices-overview.json`)

**Métricas principales:**

- HTTP Requests Rate (5m)
- HTTP Request Duration (P95)
- HTTP Status Codes
- Error Rate
- Active Requests
- Rate Limit Exceeded

**Uso:** Vista general del rendimiento de todos los microservices.

---

### 2. Database Monitoring (`database-monitoring.json`)

**Métricas principales:**

- MongoDB Connections
- PostgreSQL Active Connections
- Database Query Duration (P95)
- Redis Memory Usage
- Cache Hit Rate
- Database Errors

**Uso:** Monitoreo de salud y rendimiento de bases de datos.

---

### 3. Error Tracking & Rate Limiting (`errors-rate-limiting.json`)

**Métricas principales:**

- Error Rate by Type
- Validation Errors
- Rate Limit Exceeded Events
- Error Distribution (pie chart)
- Top Endpoints with Errors (table)
- Authentication Failures

**Uso:** Identificar problemas de seguridad y validación.

---

## 🚀 Importación Rápida

### Método 1: Interfaz Web de Grafana

1. Acceder a Grafana: http://localhost:3000
2. Login: `admin` / `admin123`
3. Click en **"+"** (menú lateral izquierdo) → **"Import"**
4. Click en **"Upload JSON file"**
5. Seleccionar uno de los archivos `.json` de `monitoring/grafana/dashboards/`
6. Click en **"Load"**
7. Seleccionar datasource: **"Prometheus"**
8. Click en **"Import"**

### Método 2: Provisioning Automático

Los dashboards se importan automáticamente si Docker Compose está configurado correctamente.

Verificar en `docker-compose.full.yml`:

```yaml
grafana:
  volumes:
    - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
```

Los dashboards en `monitoring/grafana/dashboards/` se cargan automáticamente al iniciar Grafana.

---

## 📝 Personalización

### Editar Dashboards

1. Abrir dashboard en Grafana
2. Click en ⚙️ (Settings) arriba a la derecha
3. Modificar panels, queries, thresholds, etc.
4. Click en **"Save dashboard"**

### Exportar Dashboards Modificados

1. Click en **Share** (icono compartir)
2. Tab **"Export"**
3. Click en **"Save to file"**
4. Guardar JSON en `monitoring/grafana/dashboards/`

---

## 🔧 Configuración de Datasources

### Prometheus (Pre-configurado)

**URL:** `http://prometheus:9090`

**Configuración:**

```json
{
  "name": "Prometheus",
  "type": "prometheus",
  "url": "http://prometheus:9090",
  "access": "proxy",
  "isDefault": true
}
```

### Verificar Conexión

1. Ir a **Configuration** → **Data Sources**
2. Click en **"Prometheus"**
3. Click en **"Save & Test"**
4. Debe mostrar: ✅ "Data source is working"

---

## 📈 Queries Útiles

### HTTP Requests

```promql
# Total requests rate
rate(http_requests_total[5m])

# Requests by service
sum(rate(http_requests_total[5m])) by (service)

# Requests by status code
sum(rate(http_requests_total[5m])) by (status)
```

### Latency

```promql
# P50 latency
histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# P95 latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# P99 latency
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```

### Errors

```promql
# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m]))

# Error rate by service
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)

# Validation errors
sum(rate(validation_errors_total[5m])) by (service, field)
```

### Rate Limiting

```promql
# Rate limit exceeded
sum(rate(rate_limit_exceeded_total[5m]))

# By service
sum(rate(rate_limit_exceeded_total[5m])) by (service)
```

---

## 🎨 Paneles Recomendados

### Panel de Métricas de Negocio

```promql
# Orders created
sum(increase(orders_created_total[1h]))

# Cart items added
sum(increase(cart_items_added_total[1h]))

# Products viewed
sum(increase(products_viewed_total[1h]))
```

### Panel de SLA

```promql
# Availability (%)
(sum(rate(http_requests_total[5m])) - sum(rate(http_requests_total{status=~"5.."}[5m]))) / sum(rate(http_requests_total[5m])) * 100

# P95 latency < 500ms (SLA)
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) < 0.5
```

---

## 🚨 Alertas en Dashboards

### Configurar Alertas

1. Editar panel
2. Tab **"Alert"**
3. Click en **"Create Alert"**
4. Configurar condiciones:
   - **When:** `avg()` of query `A` is `above` `100`
   - **For:** `5m`
5. **Send to:** Configurar notification channel

### Alertas Recomendadas

**Error Rate > 1%:**

```
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.01
```

**P95 Latency > 1s:**

```
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
```

**Service Down:**

```
up{job=~".*-service"} == 0
```

---

## 📊 Variables de Dashboard

### Crear Variables Dinámicas

**Service Selector:**

```
label_values(http_requests_total, service)
```

**Time Range:**

```
$__interval (auto)
```

**Status Code:**

```
label_values(http_requests_total, status)
```

**Uso en Queries:**

```promql
sum(rate(http_requests_total{service="$service", status="$status"}[5m]))
```

---

## 🔍 Troubleshooting

### Dashboard no muestra datos

1. **Verificar datasource:** Configuration → Data Sources → Test
2. **Verificar Prometheus targets:** http://localhost:9090/targets
3. **Verificar query:** Usar Explore para probar queries
4. **Verificar time range:** Ajustar rango de tiempo en dashboard

### Queries lentas

1. Aumentar intervalo de scrape en Prometheus
2. Reducir resolución en query (usar `[1m]` en vez de `[10s]`)
3. Usar `recording rules` en Prometheus para pre-calcular métricas complejas

### Dashboards no se cargan automáticamente

1. Verificar volumen montado en docker-compose
2. Verificar provisioning config: `monitoring/grafana/provisioning/dashboards/dashboard.yml`
3. Reiniciar Grafana: `docker restart flores-victoria-grafana`

---

## 📚 Recursos

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)
- [Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/best-practices-for-creating-dashboards/)

---

## ✅ Checklist de Importación

- [ ] Grafana corriendo en http://localhost:3000
- [ ] Login exitoso (admin/admin123)
- [ ] Datasource Prometheus configurado y funcionando
- [ ] Dashboard "Microservices Overview" importado
- [ ] Dashboard "Database Monitoring" importado
- [ ] Dashboard "Error Tracking & Rate Limiting" importado
- [ ] Todos los panels mostrando datos
- [ ] Variables de dashboard funcionando
- [ ] Alertas configuradas (opcional)

---

**¡Dashboards listos para usar!** 🎉
