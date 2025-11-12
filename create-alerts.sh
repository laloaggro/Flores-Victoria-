#!/bin/bash

# 🚨 Crear alertas en Kibana para monitoreo proactivo

KIBANA_URL="http://localhost:5601"

echo "🚨 Creando alertas de Kibana..."
echo ""

# 1. Alerta: Error Rate Alto
echo "📌 Alerta 1: Error Rate > 10 en 5 minutos"
curl -s -X POST "$KIBANA_URL/api/alerting/rule" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "🚨 Error Rate Alto - Flores Victoria",
    "tags": ["flores-victoria", "errors", "critical"],
    "rule_type_id": ".es-query",
    "consumer": "alerts",
    "schedule": {
      "interval": "1m"
    },
    "actions": [],
    "params": {
      "index": ["flores-victoria-logs-*"],
      "timeField": "@timestamp",
      "esQuery": "{\"query\":{\"bool\":{\"filter\":[{\"range\":{\"@timestamp\":{\"gte\":\"now-5m\"}}},{\"term\":{\"level.keyword\":\"error\"}}]}}}",
      "size": 100,
      "thresholdComparator": ">",
      "threshold": [10],
      "timeWindowSize": 5,
      "timeWindowUnit": "m"
    },
    "notify_when": "onActiveAlert",
    "enabled": true
  }' | jq -r 'if .id then "   ✅ Creada: " + .id else "   ❌ Error: " + (.message // .error) end'

echo ""

# 2. Alerta: Servicio Sin Responder
echo "📌 Alerta 2: Servicio sin logs en 2 minutos"
curl -s -X POST "$KIBANA_URL/api/alerting/rule" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "⚠️ Servicio Sin Responder - Flores Victoria",
    "tags": ["flores-victoria", "availability", "warning"],
    "rule_type_id": ".es-query",
    "consumer": "alerts",
    "schedule": {
      "interval": "1m"
    },
    "actions": [],
    "params": {
      "index": ["flores-victoria-logs-*"],
      "timeField": "@timestamp",
      "esQuery": "{\"query\":{\"bool\":{\"must\":[{\"range\":{\"@timestamp\":{\"gte\":\"now-2m\"}}}]}}}",
      "size": 1,
      "thresholdComparator": "<",
      "threshold": [1],
      "timeWindowSize": 2,
      "timeWindowUnit": "m"
    },
    "notify_when": "onActiveAlert",
    "enabled": true
  }' | jq -r 'if .id then "   ✅ Creada: " + .id else "   ❌ Error: " + (.message // .error) end'

echo ""

# 3. Alerta: Performance Degradado
echo "📌 Alerta 3: Duración promedio > 1000ms"
curl -s -X POST "$KIBANA_URL/api/alerting/rule" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "⏱️ Performance Degradado - Flores Victoria",
    "tags": ["flores-victoria", "performance", "warning"],
    "rule_type_id": ".es-query",
    "consumer": "alerts",
    "schedule": {
      "interval": "2m"
    },
    "actions": [],
    "params": {
      "index": ["flores-victoria-logs-*"],
      "timeField": "@timestamp",
      "esQuery": "{\"query\":{\"bool\":{\"filter\":[{\"range\":{\"@timestamp\":{\"gte\":\"now-5m\"}}},{\"range\":{\"duration\":{\"gte\":1000}}}]}}}",
      "size": 100,
      "thresholdComparator": ">",
      "threshold": [5],
      "timeWindowSize": 5,
      "timeWindowUnit": "m"
    },
    "notify_when": "onActiveAlert",
    "enabled": true
  }' | jq -r 'if .id then "   ✅ Creada: " + .id else "   ❌ Error: " + (.message // .error) end'

echo ""
echo "✅ ¡Alertas creadas!"
echo "📋 Ver alertas en: http://localhost:5601/app/management/insightsAndAlerting/triggersActions/rules"
echo ""
echo "ℹ️  Para configurar notificaciones (Email/Slack):"
echo "   1. Ve a Stack Management → Alerts and Insights → Connectors"
echo "   2. Crea un conector (Email, Slack, Webhook, etc.)"
echo "   3. Edita las alertas para agregar acciones con el conector"
