#!/bin/bash

# 🔧 Corregir Dashboard de Business Metrics - Versión 2
# Crear visualizaciones directamente en Elasticsearch

ELASTICSEARCH_URL="http://localhost:9200"
DATA_VIEW_ID="8870237b-ffe5-4b39-8f7f-5d95d100ad39"

echo "🔧 Creando Dashboard de Business Metrics (v2)..."
echo ""

# IDs para las nuevas visualizaciones
VIZ1_ID="business-requests-hourly"
VIZ2_ID="business-top-services"
VIZ3_ID="business-log-levels"
VIZ4_ID="business-activity-rate"
DASHBOARD_ID="business-metrics-dashboard"

# 1. Visualización: Requests por Hora
echo "📈 Creando: Requests por Hora del Día"
curl -s -X PUT "$ELASTICSEARCH_URL/.kibana/_doc/visualization:$VIZ1_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "visualization",
    "references": [{
      "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
      "type": "index-pattern",
      "id": "'$DATA_VIEW_ID'"
    }],
    "visualization": {
      "title": "📅 Requests por Hora del Día",
      "visState": "{\"title\":\"Requests por Hora\",\"type\":\"line\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"params\":{\"field\":\"@timestamp\",\"timeRange\":{\"from\":\"now-7d\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"h\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{}},\"schema\":\"segment\"}],\"params\":{\"type\":\"line\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"line\",\"mode\":\"normal\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false}}",
      "uiStateJSON": "{}",
      "description": "Distribución de requests por hora",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[],\"indexRefName\":\"kibanaSavedObjectMeta.searchSourceJSON.index\"}"
      }
    },
    "updated_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }' | jq -r '.result'

echo "   ✅ ID: $VIZ1_ID"

# 2. Visualización: Top Servicios
echo "📈 Creando: Top Servicios"
curl -s -X PUT "$ELASTICSEARCH_URL/.kibana/_doc/visualization:$VIZ2_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "visualization",
    "references": [{
      "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
      "type": "index-pattern",
      "id": "'$DATA_VIEW_ID'"
    }],
    "visualization": {
      "title": "🏆 Top Servicios Más Activos",
      "visState": "{\"title\":\"Top Servicios\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"service.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":10,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":false,\"labels\":{\"show\":true,\"values\":true,\"last_level\":true,\"truncate\":100}}}",
      "uiStateJSON": "{}",
      "description": "Servicios más utilizados",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[],\"indexRefName\":\"kibanaSavedObjectMeta.searchSourceJSON.index\"}"
      }
    },
    "updated_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }' | jq -r '.result'

echo "   ✅ ID: $VIZ2_ID"

# 3. Visualización: Niveles de Log
echo "📈 Creando: Distribución de Niveles"
curl -s -X PUT "$ELASTICSEARCH_URL/.kibana/_doc/visualization:$VIZ3_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "visualization",
    "references": [{
      "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
      "type": "index-pattern",
      "id": "'$DATA_VIEW_ID'"
    }],
    "visualization": {
      "title": "🎯 Distribución de Niveles de Log",
      "visState": "{\"title\":\"Niveles de Log\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"level.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true,\"labels\":{\"show\":true,\"values\":true,\"last_level\":true,\"truncate\":100}}}",
      "uiStateJSON": "{}",
      "description": "Distribución por nivel de log",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[],\"indexRefName\":\"kibanaSavedObjectMeta.searchSourceJSON.index\"}"
      }
    },
    "updated_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }' | jq -r '.result'

echo "   ✅ ID: $VIZ3_ID"

# 4. Visualización: Tasa de Actividad
echo "📈 Creando: Tasa de Actividad"
curl -s -X PUT "$ELASTICSEARCH_URL/.kibana/_doc/visualization:$VIZ4_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "visualization",
    "references": [{
      "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
      "type": "index-pattern",
      "id": "'$DATA_VIEW_ID'"
    }],
    "visualization": {
      "title": "📊 Tasa de Actividad por Servicio",
      "visState": "{\"title\":\"Tasa de Actividad\",\"type\":\"area\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"params\":{\"field\":\"@timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"auto\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{}},\"schema\":\"segment\"},{\"id\":\"3\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"service.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"},\"schema\":\"group\"}],\"params\":{\"type\":\"area\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"area\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true,\"interpolate\":\"linear\",\"valueAxis\":\"ValueAxis-1\"}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false}}",
      "uiStateJSON": "{}",
      "description": "Actividad de servicios en el tiempo",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[],\"indexRefName\":\"kibanaSavedObjectMeta.searchSourceJSON.index\"}"
      }
    },
    "updated_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }' | jq -r '.result'

echo "   ✅ ID: $VIZ4_ID"

echo ""
echo "📊 Creando Dashboard..."

# Crear el Dashboard
curl -s -X PUT "$ELASTICSEARCH_URL/.kibana/_doc/dashboard:$DASHBOARD_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "dashboard",
    "references": [
      {"name": "panel_1", "type": "visualization", "id": "'$VIZ1_ID'"},
      {"name": "panel_2", "type": "visualization", "id": "'$VIZ2_ID'"},
      {"name": "panel_3", "type": "visualization", "id": "'$VIZ3_ID'"},
      {"name": "panel_4", "type": "visualization", "id": "'$VIZ4_ID'"}
    ],
    "dashboard": {
      "title": "🎯 Flores Victoria - Business Metrics",
      "description": "Métricas de negocio y uso del sistema",
      "panelsJSON": "[{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":0,\"y\":0,\"w\":24,\"h\":12,\"i\":\"1\"},\"panelIndex\":\"1\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_1\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":24,\"y\":0,\"w\":24,\"h\":12,\"i\":\"2\"},\"panelIndex\":\"2\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_2\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":0,\"y\":12,\"w\":24,\"h\":12,\"i\":\"3\"},\"panelIndex\":\"3\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_3\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":24,\"y\":12,\"w\":24,\"h\":12,\"i\":\"4\"},\"panelIndex\":\"4\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_4\"}]",
      "optionsJSON": "{\"useMargins\":true,\"syncColors\":false,\"hidePanelTitles\":false}",
      "timeRestore": true,
      "timeTo": "now",
      "timeFrom": "now-7d",
      "refreshInterval": {
        "pause": false,
        "value": 60000
      }
    },
    "updated_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }' | jq -r '.result'

echo "   ✅ Dashboard ID: $DASHBOARD_ID"

# Refrescar Kibana
echo ""
echo "🔄 Refrescando índice de Kibana..."
curl -s -X POST "$ELASTICSEARCH_URL/.kibana/_refresh" > /dev/null

echo ""
echo "✅ Dashboard de Business Metrics creado correctamente!"
echo ""
echo "📊 Visualizaciones:"
echo "   1. 📅 Requests por Hora del Día"
echo "   2. 🏆 Top Servicios Más Activos"
echo "   3. 🎯 Distribución de Niveles de Log"
echo "   4. 📊 Tasa de Actividad por Servicio"
echo ""
echo "🌐 Ver dashboard en:"
echo "   http://localhost:5601/app/dashboards#/view/$DASHBOARD_ID"
echo ""
echo "ℹ️ Si no aparece inmediatamente, espera 10 segundos y recarga la página"
