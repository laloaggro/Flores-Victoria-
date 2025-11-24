#!/bin/bash

# 📊 Crear dashboard de Business Metrics

KIBANA_URL="http://localhost:5601"
DATA_VIEW_ID="8870237b-ffe5-4b39-8f7f-5d95d100ad39"

echo "📊 Creando Dashboard de Business Metrics..."
echo ""

# 1. Visualización: Requests por Hora del Día
echo "📈 Creando: Requests por Hora del Día"
VIZ1_ID=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "📅 Requests por Hora del Día",
      "visState": "{\"title\":\"Requests por Hora\",\"type\":\"histogram\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"schema\":\"segment\",\"params\":{\"field\":\"@timestamp\",\"interval\":\"h\",\"min_doc_count\":1}}],\"params\":{\"type\":\"histogram\",\"addTooltip\":true,\"addLegend\":true}}",
      "uiStateJSON": "{}",
      "description": "Distribución de requests por hora",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[],\"indexRefName\":\"kibanaSavedObjectMeta.searchSourceJSON.index\"}"
      }
    },
    "references": [{
      "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
      "type": "index-pattern",
      "id": "'$DATA_VIEW_ID'"
    }]
  }' | jq -r '.id')

echo "   ✅ ID: $VIZ1_ID"

# 2. Visualización: Servicios Más Activos
echo "📈 Creando: Top Servicios"
VIZ2_ID=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "🏆 Top Servicios Más Activos",
      "visState": "{\"title\":\"Top Servicios\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"service.keyword\",\"size\":10,\"order\":\"desc\",\"orderBy\":\"1\"}}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"isDonut\":false}}",
      "uiStateJSON": "{}",
      "description": "Servicios más utilizados",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[],\"indexRefName\":\"kibanaSavedObjectMeta.searchSourceJSON.index\"}"
      }
    },
    "references": [{
      "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
      "type": "index-pattern",
      "id": "'$DATA_VIEW_ID'"
    }]
  }' | jq -r '.id')

echo "   ✅ ID: $VIZ2_ID"

# 3. Crear el dashboard
echo ""
echo "📊 Creando Dashboard de Business Metrics..."
DASHBOARD_ID=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/dashboard" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "🎯 Flores Victoria - Business Metrics",
      "description": "Métricas de negocio y uso del sistema",
      "panelsJSON": "[{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":0,\"y\":0,\"w\":24,\"h\":15,\"i\":\"1\"},\"panelIndex\":\"1\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_1\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":24,\"y\":0,\"w\":24,\"h\":15,\"i\":\"2\"},\"panelIndex\":\"2\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_2\"}]",
      "optionsJSON": "{\"useMargins\":true,\"syncColors\":false,\"hidePanelTitles\":false}",
      "timeRestore": true,
      "timeTo": "now",
      "timeFrom": "now-7d",
      "refreshInterval": {
        "pause": false,
        "value": 60000
      }
    },
    "references": [
      {"name": "panel_1", "type": "visualization", "id": "'$VIZ1_ID'"},
      {"name": "panel_2", "type": "visualization", "id": "'$VIZ2_ID'"}
    ]
  }' | jq -r '.id')

echo "   ✅ Dashboard ID: $DASHBOARD_ID"
echo ""
echo "✅ Dashboard de Business Metrics creado!"
echo "🌐 Ver en: http://localhost:5601/app/dashboards#/view/$DASHBOARD_ID"
