# 📊 Guía Rápida: Ver Métricas en Grafana

## 🚀 Paso 1: Iniciar los Servicios

Primero, asegúrate de que todo está corriendo:

```bash
# Desde el directorio del proyecto
cd /home/impala/Documentos/Proyectos/flores-victoria

# Iniciar todos los servicios
./start-all-services.sh
```

Esto iniciará:
- ✅ Stack de monitoring (Prometheus, Grafana, Alertmanager)
- ✅ Los 5 microservicios (cart, product, auth, user, order)

---

## 🌐 Paso 2: Acceder a Grafana

1. **Abre tu navegador** y ve a: http://localhost:3000

2. **Login:**
   - Usuario: `admin`
   - Password: `admin123`

3. **Primera vez:** Grafana te pedirá cambiar la contraseña (puedes saltarlo haciendo clic en "Skip")

---

## 📊 Paso 3: Ver Métricas - MÉTODO RÁPIDO

### Opción A: Explorar Métricas Directamente

1. En Grafana, haz clic en el **menú hamburguesa** (☰) en la esquina superior izquierda
2. Selecciona **"Explore"** (🔍)
3. Verás el editor de queries de Prometheus

**Queries útiles para empezar:**

```promql
# Ver tasa de requests por segundo por servicio
rate(http_requests_total[5m])

# Ver requests totales por servicio
sum(http_requests_total) by (service)

# Ver errores HTTP 5xx
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)

# Ver tiempo de respuesta promedio (p95)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Ver requests activos
http_requests_in_progress

# Ver errores de validación
sum(validation_errors_total) by (service)

# Ver rate limiting
rate_limit_exceeded_total
```

4. **Copia cualquiera de estas queries** en el campo de texto
5. Haz clic en **"Run query"** o presiona `Shift + Enter`
6. Cambia entre vista de **Graph** y **Table** usando los botones superiores

---

## 📈 Paso 4: Crear Tu Primer Dashboard

### Método Manual:

1. **Clic en el menú (☰)** → **Dashboards** → **"New Dashboard"**
2. **Clic en "Add visualization"**
3. **Selecciona "Prometheus"** como datasource
4. **Agrega una query**, por ejemplo:
   ```promql
   rate(http_requests_total[5m])
   ```
5. **Personaliza el panel:**
   - Cambia el título en la pestaña "Panel options"
   - Ajusta el tipo de visualización (Time series, Stat, Gauge, Table, etc.)
6. **Clic en "Apply"** para guardar el panel
7. **Clic en el ícono de disco** (💾) para guardar el dashboard

### Método Rápido - Importar Dashboard Pre-configurado:

1. **Descarga dashboards de la comunidad:**
   - Menú (☰) → **Dashboards** → **"Import"**
   - **Dashboard ID sugeridos:**
     - `1860` - Node Exporter Full
     - `3662` - Prometheus 2.0 Overview
     - `11074` - Node Exporter for Prometheus

2. **Pega el ID del dashboard** en el campo "Import via grafana.com"
3. **Clic en "Load"**
4. **Selecciona "Prometheus"** como datasource
5. **Clic en "Import"**

---

## 🎯 Paso 5: Ver Métricas de Nuestros Microservicios

### Panel 1: Tasa de Requests

```promql
# Query
sum(rate(http_requests_total[5m])) by (service)

# Configuración
- Tipo: Time series (gráfico de líneas)
- Título: "HTTP Request Rate by Service"
- Unit: reqps (requests per second)
- Legend: {{service}}
```

### Panel 2: Tasa de Errores

```promql
# Query
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service) 
/ 
sum(rate(http_requests_total[5m])) by (service) 
* 100

# Configuración
- Tipo: Time series
- Título: "Error Rate (%)"
- Unit: percent (0-100)
- Thresholds: <1% verde, 1-5% amarillo, >5% rojo
```

### Panel 3: Tiempo de Respuesta (Percentiles)

```promql
# Query para p50
histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le)) * 1000

# Query para p95
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le)) * 1000

# Query para p99
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le)) * 1000

# Configuración
- Tipo: Time series
- Título: "Response Time Percentiles"
- Unit: ms (milliseconds)
```

### Panel 4: Requests Activos

```promql
# Query
sum(http_requests_in_progress) by (service)

# Configuración
- Tipo: Stat o Gauge
- Título: "Active Requests"
```

### Panel 5: Errores de Aplicación

```promql
# Query
sum(increase(app_errors_total[5m])) by (service, type)

# Configuración
- Tipo: Bar chart
- Título: "Application Errors (Last 5m)"
```

---

## 🔥 Paso 6: Generar Tráfico para Ver Métricas

Si no ves datos, genera algo de tráfico:

```bash
# Requests al product-service
for i in {1..100}; do curl http://localhost:3002/api/products; done

# Requests al cart-service
for i in {1..100}; do curl http://localhost:3001/api/cart; done

# Requests a todos los servicios
for port in 3001 3002 3003 3004 3005; do
  for i in {1..20}; do 
    curl -s http://localhost:$port/metrics > /dev/null
  done
done
```

Luego **refresca Grafana** y verás las métricas aparecer.

---

## 📱 Paso 7: Dashboard Completo Pre-configurado

He creado un dashboard completo en `monitoring/dashboards/microservices-overview.json`

**Para importarlo:**

1. **Menú (☰)** → **Dashboards** → **"Import"**
2. **Clic en "Upload JSON file"**
3. **Selecciona:** `/home/impala/Documentos/Proyectos/flores-victoria/monitoring/dashboards/microservices-overview.json`
4. **Selecciona datasource:** Prometheus
5. **Clic en "Import"**

Este dashboard incluye:
- ✅ Request rate por servicio
- ✅ Error rate
- ✅ Response time (p50, p95, p99)
- ✅ Active requests
- ✅ Total requests counter
- ✅ Error count
- ✅ Validation errors
- ✅ Top 10 slowest endpoints

---

## 🎨 Personalización Avanzada

### Cambiar Rango de Tiempo

- **Top derecha** de Grafana → selector de tiempo
- Opciones rápidas: Last 5m, 15m, 1h, 6h, 24h
- Custom: Define tu propio rango

### Auto-refresh

- **Top derecha** → ícono de refresh
- Selecciona intervalo: 5s, 10s, 30s, 1m, etc.

### Variables

Para hacer dashboards dinámicos:

1. **Dashboard settings (⚙️)** → **Variables** → **"Add variable"**
2. Crear variable `service`:
   ```promql
   Query: label_values(http_requests_total, service)
   ```
3. Usar en queries: `{service="$service"}`

### Alertas Visuales

1. **Edita cualquier panel**
2. **Pestaña "Alert"**
3. **"Create alert rule from this panel"**
4. Define condiciones:
   ```
   WHEN avg() OF query(A, 5m, now) IS ABOVE 100
   ```

---

## 🔍 Queries Útiles por Categoría

### HTTP Metrics

```promql
# Requests por método HTTP
sum(rate(http_requests_total[5m])) by (method)

# Requests por ruta
sum(rate(http_requests_total[5m])) by (route)

# Requests por código de estado
sum(rate(http_requests_total[5m])) by (status)

# Requests 4xx (client errors)
sum(rate(http_requests_total{status=~"4.."}[5m]))

# Requests 5xx (server errors)
sum(rate(http_requests_total{status=~"5.."}[5m]))
```

### Rate Limiting

```promql
# Veces que se alcanzó el límite
rate_limit_exceeded_total

# Rate limit por tipo de limiter
sum(rate(rate_limit_exceeded_total[5m])) by (limiter)
```

### Validation

```promql
# Errores de validación totales
validation_errors_total

# Por tipo de validación
sum(validation_errors_total) by (field)
```

### Errores de Aplicación

```promql
# Errores por tipo
sum(app_errors_total) by (type)

# Tasa de errores en los últimos 5 minutos
sum(increase(app_errors_total[5m]))
```

### Performance

```promql
# Latencia promedio
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Requests más lentos (p99)
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Throughput total
sum(rate(http_requests_total[5m]))
```

---

## 🎯 Tips y Trucos

### 1. Combinar Múltiples Queries

Puedes agregar múltiples queries en un solo panel:
- Query A: `rate(http_requests_total{service="cart-service"}[5m])`
- Query B: `rate(http_requests_total{service="product-service"}[5m])`

### 2. Operaciones Matemáticas

```promql
# Tasa de éxito (%)
(sum(rate(http_requests_total{status=~"2.."}[5m])) 
/ 
sum(rate(http_requests_total[5m]))) * 100
```

### 3. Agregaciones

```promql
sum()     # Suma
avg()     # Promedio
min()     # Mínimo
max()     # Máximo
count()   # Conteo
topk(5)   # Top 5
bottomk(3) # Bottom 3
```

### 4. Filtros

```promql
# Por servicio
http_requests_total{service="cart-service"}

# Por múltiples servicios
http_requests_total{service=~"cart-service|product-service"}

# Excluir servicios
http_requests_total{service!="auth-service"}

# Por código de estado
http_requests_total{status="200"}
```

---

## 📱 Acceso Móvil

Grafana es responsive, puedes acceder desde tu móvil:
- Misma URL: http://localhost:3000
- Usa tu IP local si estás en la misma red: http://192.168.x.x:3000

---

## 🆘 Troubleshooting

### No veo datos en Grafana

1. **Verifica que Prometheus está recolectando:**
   - Ve a http://localhost:9090/targets
   - Todos los servicios deben estar "UP"

2. **Genera tráfico:**
   ```bash
   curl http://localhost:3001/metrics
   curl http://localhost:3002/metrics
   ```

3. **Verifica que hay métricas en Prometheus:**
   - http://localhost:9090/graph
   - Query: `http_requests_total`
   - Deberías ver resultados

### "No data" en el panel

- **Verifica el rango de tiempo:** Asegúrate de estar viendo "Last 15 minutes"
- **Verifica la query:** Cópiala y pruébala en el "Explore"
- **Genera tráfico:** Los servicios necesitan recibir requests

### Grafana no carga

```bash
# Verifica que el contenedor está corriendo
docker ps | grep grafana

# Reinicia Grafana
docker-compose -f docker-compose.monitoring.yml restart grafana

# Ve los logs
docker logs flores-victoria-grafana
```

---

## 📚 Recursos Adicionales

- **PromQL Basics:** https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Grafana Docs:** https://grafana.com/docs/grafana/latest/
- **Dashboard Gallery:** https://grafana.com/grafana/dashboards/

---

## ✅ Checklist Rápido

- [ ] Servicios iniciados con `./start-all-services.sh`
- [ ] Grafana accesible en http://localhost:3000
- [ ] Login exitoso (admin/admin123)
- [ ] Datasource Prometheus configurado
- [ ] Primer query ejecutado en "Explore"
- [ ] Dashboard creado o importado
- [ ] Tráfico generado a los servicios
- [ ] Métricas visibles en los paneles

---

**¡Listo! Ahora puedes visualizar todas las métricas de tu sistema en tiempo real. 🎉**
