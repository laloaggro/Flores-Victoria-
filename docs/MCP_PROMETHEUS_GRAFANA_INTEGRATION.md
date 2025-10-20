# Integración MCP con Prometheus y Grafana

## Resumen

Este documento explica cómo integrar el MCP server con Prometheus (métricas) y Grafana (visualización).

## Configuración de Prometheus

### 1. Actualizar mcp-server para exponer métricas en formato Prometheus

El servidor MCP ya tiene un endpoint `/metrics` que devuelve JSON. Para integrarlo con Prometheus, necesitamos:

1. Instalar `prom-client` en `mcp-server/package.json`:
   ```bash
   cd mcp-server
   npm install prom-client
   ```

2. Añadir endpoint `/metrics/prometheus` en `mcp-server/server.js` que devuelva métricas en formato Prometheus.

3. Configurar Prometheus para scrapear el endpoint.

### 2. Archivo prometheus.yml

Crear o actualizar `monitoring/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'mcp-server'
    static_configs:
      - targets: ['mcp-server:5050']
    metrics_path: '/metrics/prometheus'
    basic_auth:
      username: 'admin'
      password: 'changeme'
```

### 3. Añadir Prometheus a docker-compose.yml

```yaml
  prometheus:
    image: prom/prometheus:latest
    container_name: flores-victoria-prometheus
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - app-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
```

## Configuración de Grafana

### 1. Añadir Grafana a docker-compose.yml

```yaml
  grafana:
    image: grafana/grafana:latest
    container_name: flores-victoria-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - app-network
    depends_on:
      - prometheus
```

### 2. Configurar datasource de Prometheus

Crear `monitoring/grafana/datasources/prometheus.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

### 3. Dashboard de Grafana para MCP

Crear `monitoring/grafana/dashboards/mcp-dashboard.json` con paneles para:

- Total de eventos registrados
- Total de auditorías
- Servicios healthy vs unhealthy (gauge)
- Rate de eventos por minuto
- Latencia de health checks

## Métricas expuestas por MCP

El endpoint `/metrics` actual devuelve:

- `healthyServices`: número de servicios saludables
- `totalServices`: total de servicios monitoreados
- `eventsCount`: eventos registrados
- `auditsCount`: auditorías registradas
- `uptime`: porcentaje de uptime

## Siguientes pasos

1. Ejecutar `npm install prom-client` en `mcp-server/`
2. Añadir endpoint `/metrics/prometheus` en `server.js`
3. Crear directorios y archivos de configuración:
   ```bash
   mkdir -p monitoring/prometheus monitoring/grafana/dashboards monitoring/grafana/datasources
   ```
4. Añadir servicios prometheus y grafana a `docker-compose.yml`
5. Reiniciar: `docker compose up -d prometheus grafana`
6. Acceder a Grafana en http://localhost:3000 (admin/admin)
7. Importar dashboard de MCP

## Comandos útiles

```bash
# Ver métricas actuales de MCP (JSON)
curl -u admin:changeme http://localhost:5051/metrics | jq '.'

# Ver métricas de Prometheus
curl http://localhost:9090/api/v1/targets

# Reiniciar Prometheus después de cambios de config
docker compose restart prometheus
```

## Notas

- Las credenciales de auth básica se configuran en variables de entorno (`MCP_DASHBOARD_USER`, `MCP_DASHBOARD_PASS`).
- Si no expones el puerto del MCP al host, Prometheus puede accederlo internamente en la red de Docker.
- Grafana puede configurarse para alertas automáticas cuando servicios estén unhealthy.
