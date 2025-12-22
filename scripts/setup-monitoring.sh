#!/bin/bash
# Setup Prometheus and Grafana for Flores Victoria
#
# Este script configura:
# 1. Prometheus datasource en Grafana
# 2. Dashboards recomendados
# 3. Alertas para métricas críticas
#
# Uso: bash scripts/setup-monitoring.sh
#

set -e

echo "🚀 Configurando Prometheus y Grafana..."

PROMETHEUS_URL="http://localhost:9090"
GRAFANA_URL="http://localhost:3000"
GRAFANA_ADMIN="admin"
GRAFANA_PASSWORD="${GRAFANA_PASSWORD:-admin}"

# Esperar a que Grafana esté lista
echo "⏳ Esperando a que Grafana esté disponible..."
for i in {1..30}; do
  if curl -s "$GRAFANA_URL/api/health" > /dev/null 2>&1; then
    echo "✅ Grafana está disponible"
    break
  fi
  echo "Intento $i/30..."
  sleep 1
done

# Obtener token de API
echo "🔑 Autenticando con Grafana..."
API_TOKEN=$(curl -s -X POST "$GRAFANA_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"user\":\"$GRAFANA_ADMIN\",\"password\":\"$GRAFANA_PASSWORD\"}" | jq -r '.token')

if [ -z "$API_TOKEN" ] || [ "$API_TOKEN" = "null" ]; then
  echo "❌ Error: No se pudo autenticar con Grafana"
  exit 1
fi

echo "✅ Autenticado: $API_TOKEN"

# Crear datasource de Prometheus
echo "📊 Creando datasource de Prometheus..."
curl -s -X POST "$GRAFANA_URL/api/datasources" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Prometheus",
    "type": "prometheus",
    "url": "'$PROMETHEUS_URL'",
    "access": "proxy",
    "isDefault": true,
    "jsonData": {
      "timeInterval": "15s"
    }
  }' | jq .

echo "✅ Datasource de Prometheus creado"

# Crear Dashboard: API Gateway Performance
echo "📈 Creando Dashboard: API Gateway Performance..."
curl -s -X POST "$GRAFANA_URL/api/dashboards/db" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dashboard": {
      "title": "API Gateway Performance",
      "tags": ["api-gateway", "monitoring"],
      "timezone": "browser",
      "panels": [
        {
          "title": "Request Rate (req/s)",
          "targets": [
            {
              "expr": "rate(http_requests_total[1m])"
            }
          ],
          "type": "graph"
        },
        {
          "title": "Response Time (P95)",
          "targets": [
            {
              "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
            }
          ],
          "type": "graph"
        },
        {
          "title": "Error Rate",
          "targets": [
            {
              "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])"
            }
          ],
          "type": "graph"
        },
        {
          "title": "Memory Usage (MB)",
          "targets": [
            {
              "expr": "process_resident_memory_bytes / 1024 / 1024"
            }
          ],
          "type": "graph"
        }
      ]
    },
    "overwrite": true
  }' | jq .

echo "✅ Dashboard API Gateway creado"

# Crear Dashboard: Auth Service Health
echo "📈 Creando Dashboard: Auth Service Health..."
curl -s -X POST "$GRAFANA_URL/api/dashboards/db" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dashboard": {
      "title": "Auth Service Health",
      "tags": ["auth-service", "monitoring"],
      "timezone": "browser",
      "panels": [
        {
          "title": "Login Requests",
          "targets": [
            {
              "expr": "rate(http_requests_total{path=~\"/auth/login\"}[1m])"
            }
          ],
          "type": "graph"
        },
        {
          "title": "Database Connection Pool",
          "targets": [
            {
              "expr": "pg_connection_pool_available"
            }
          ],
          "type": "gauge"
        },
        {
          "title": "Token Revocations",
          "targets": [
            {
              "expr": "rate(token_revocations_total[5m])"
            }
          ],
          "type": "graph"
        },
        {
          "title": "Logout Success Rate",
          "targets": [
            {
              "expr": "rate(http_requests_total{path=\"/auth/logout\",status=\"200\"}[5m]) / rate(http_requests_total{path=\"/auth/logout\"}[5m])"
            }
          ],
          "type": "gauge"
        }
      ]
    },
    "overwrite": true
  }' | jq .

echo "✅ Dashboard Auth Service creado"

# Crear Dashboard: Product Service
echo "📈 Creando Dashboard: Product Service..."
curl -s -X POST "$GRAFANA_URL/api/dashboards/db" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dashboard": {
      "title": "Product Service",
      "tags": ["product-service", "monitoring"],
      "timezone": "browser",
      "panels": [
        {
          "title": "Product List Requests",
          "targets": [
            {
              "expr": "rate(http_requests_total{path=\"/products\"}[1m])"
            }
          ],
          "type": "graph"
        },
        {
          "title": "Search Latency (P95)",
          "targets": [
            {
              "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{path=\"/search\"}[5m]))"
            }
          ],
          "type": "graph"
        },
        {
          "title": "Cache Hit Rate",
          "targets": [
            {
              "expr": "rate(redis_hits[5m]) / (rate(redis_hits[5m]) + rate(redis_misses[5m]))"
            }
          ],
          "type": "gauge"
        },
        {
          "title": "MongoDB Query Time",
          "targets": [
            {
              "expr": "rate(mongodb_query_duration_seconds_sum[5m]) / rate(mongodb_query_duration_seconds_count[5m])"
            }
          ],
          "type": "graph"
        }
      ]
    },
    "overwrite": true
  }' | jq .

echo "✅ Dashboard Product Service creado"

# Crear Alert: High Error Rate
echo "🚨 Creando alerta: High Error Rate..."
curl -s -X POST "$GRAFANA_URL/api/ruler/grafana/rules/monitoring" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "high-error-rate",
    "title": "High Error Rate",
    "condition": "rate(http_requests_total{status=~\"5..\"}[5m]) > 0.05",
    "data": [
      {
        "refId": "A",
        "queryType": "",
        "model": {
          "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
          "interval": "",
          "legendFormat": "{{job}}"
        },
        "datasourceUid": "prometheus"
      }
    ],
    "noDataState": "NoData",
    "execErrState": "Alerting",
    "for": "5m",
    "annotations": {
      "description": "Error rate is high: {{ $value }}"
    }
  }' 2>/dev/null || echo "⚠️  Alert creation skipped"

# Crear Alert: High Latency
echo "🚨 Creando alerta: High Latency..."
curl -s -X POST "$GRAFANA_URL/api/ruler/grafana/rules/monitoring" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "high-latency",
    "title": "High Latency (P95 > 500ms)",
    "condition": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5",
    "data": [
      {
        "refId": "A",
        "queryType": "",
        "model": {
          "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
          "interval": "",
          "legendFormat": "{{job}}"
        },
        "datasourceUid": "prometheus"
      }
    ],
    "noDataState": "NoData",
    "execErrState": "Alerting",
    "for": "5m",
    "annotations": {
      "description": "P95 latency is high: {{ $value }}s"
    }
  }' 2>/dev/null || echo "⚠️  Alert creation skipped"

# Crear Alert: Memory High
echo "🚨 Creando alerta: Memory High..."
curl -s -X POST "$GRAFANA_URL/api/ruler/grafana/rules/monitoring" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "memory-high",
    "title": "Memory Usage High (> 400MB)",
    "condition": "process_resident_memory_bytes / 1024 / 1024 > 400",
    "data": [
      {
        "refId": "A",
        "queryType": "",
        "model": {
          "expr": "process_resident_memory_bytes / 1024 / 1024",
          "interval": "",
          "legendFormat": "{{job}}"
        },
        "datasourceUid": "prometheus"
      }
    ],
    "noDataState": "NoData",
    "execErrState": "Alerting",
    "for": "5m",
    "annotations": {
      "description": "Memory usage is high: {{ $value }}MB"
    }
  }' 2>/dev/null || echo "⚠️  Alert creation skipped"

echo ""
echo "✅ ============================================"
echo "✅ Monitoring Setup Completado!"
echo "✅ ============================================"
echo ""
echo "📊 Acceso a Dashboards:"
echo "   URL: $GRAFANA_URL"
echo "   Usuario: $GRAFANA_ADMIN"
echo "   Password: $GRAFANA_PASSWORD"
echo ""
echo "📈 Dashboards creados:"
echo "   1. API Gateway Performance"
echo "   2. Auth Service Health"
echo "   3. Product Service"
echo ""
echo "🚨 Alertas configuradas:"
echo "   1. High Error Rate (> 5%)"
echo "   2. High Latency (P95 > 500ms)"
echo "   3. Memory High (> 400MB)"
echo ""
echo "🔗 URLs rápidas:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3000"
echo "   Jaeger: http://localhost:16686"
echo ""
