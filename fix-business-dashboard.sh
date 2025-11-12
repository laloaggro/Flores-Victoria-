#!/bin/bash

# 🔧 Corregir y recrear Dashboard de Business Metrics

KIBANA_URL="http://localhost:5601"
DATA_VIEW_ID="8870237b-ffe5-4b39-8f7f-5d95d100ad39"

echo "🔧 Corrigiendo Dashboard de Business Metrics..."
echo ""

# Eliminar dashboard y visualizaciones anteriores si existen
echo "🗑️ Eliminando objetos anteriores..."
curl -s -X DELETE "$KIBANA_URL/api/saved_objects/dashboard/5a3a8270-bdf0-11f0-b865-c1fad42913f7" -H "kbn-xsrf: true" > /dev/null 2>&1
curl -s -X DELETE "$KIBANA_URL/api/saved_objects/visualization/592c46c0-bdf0-11f0-b865-c1fad42913f7" -H "kbn-xsrf: true" > /dev/null 2>&1
curl -s -X DELETE "$KIBANA_URL/api/saved_objects/visualization/599ff020-bdf0-11f0-b865-c1fad42913f7" -H "kbn-xsrf: true" > /dev/null 2>&1

echo "✅ Objetos anteriores eliminados"
echo ""

# 1. Visualización: Requests por Hora del Día (Line Chart)
echo "📈 Creando: Requests por Hora del Día"
VIZ1_RESPONSE=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "📅 Requests por Hora del Día",
      "visState": "{\"title\":\"Requests por Hora\",\"type\":\"line\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"params\":{\"field\":\"@timestamp\",\"timeRange\":{\"from\":\"now-7d\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"h\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{}},\"schema\":\"segment\"}],\"params\":{\"type\":\"line\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"line\",\"mode\":\"normal\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"}}}",
      "uiStateJSON": "{}",
      "description": "Distribución de requests por hora del día",
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
  }')

VIZ1_ID=$(echo $VIZ1_RESPONSE | jq -r '.id')
echo "   ✅ ID: $VIZ1_ID"

# 2. Visualización: Top Servicios (Pie Chart)
echo "📈 Creando: Top Servicios"
VIZ2_RESPONSE=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "🏆 Top Servicios Más Activos",
      "visState": "{\"title\":\"Top Servicios\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"service.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":10,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":false,\"labels\":{\"show\":true,\"values\":true,\"last_level\":true,\"truncate\":100}}}",
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
  }')

VIZ2_ID=$(echo $VIZ2_RESPONSE | jq -r '.id')
echo "   ✅ ID: $VIZ2_ID"

# 3. Visualización: Niveles de Log (Donut)
echo "📈 Creando: Distribución de Niveles"
VIZ3_RESPONSE=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "🎯 Distribución de Niveles de Log",
      "visState": "{\"title\":\"Niveles de Log\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"level.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true,\"labels\":{\"show\":true,\"values\":true,\"last_level\":true,\"truncate\":100}}}",
      "uiStateJSON": "{}",
      "description": "Distribución por nivel de log",
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
  }')

VIZ3_ID=$(echo $VIZ3_RESPONSE | jq -r '.id')
echo "   ✅ ID: $VIZ3_ID"

# 4. Visualización: Tasa de Actividad (Area Chart)
echo "📈 Creando: Tasa de Actividad"
VIZ4_RESPONSE=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "📊 Tasa de Actividad por Servicio",
      "visState": "{\"title\":\"Tasa de Actividad\",\"type\":\"area\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"params\":{\"field\":\"@timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"auto\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{}},\"schema\":\"segment\"},{\"id\":\"3\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"service.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"},\"schema\":\"group\"}],\"params\":{\"type\":\"area\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"area\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true,\"interpolate\":\"linear\",\"valueAxis\":\"ValueAxis-1\"}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"}}}",
      "uiStateJSON": "{}",
      "description": "Actividad de servicios en el tiempo",
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
  }')

VIZ4_ID=$(echo $VIZ4_RESPONSE | jq -r '.id')
echo "   ✅ ID: $VIZ4_ID"

echo ""
echo "📊 Creando Dashboard de Business Metrics..."

# Crear el dashboard con las 4 visualizaciones
DASHBOARD_RESPONSE=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/dashboard" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
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
    "references": [
      {"name": "panel_1", "type": "visualization", "id": "'$VIZ1_ID'"},
      {"name": "panel_2", "type": "visualization", "id": "'$VIZ2_ID'"},
      {"name": "panel_3", "type": "visualization", "id": "'$VIZ3_ID'"},
      {"name": "panel_4", "type": "visualization", "id": "'$VIZ4_ID'"}
    ]
  }')

DASHBOARD_ID=$(echo $DASHBOARD_RESPONSE | jq -r '.id')
echo "   ✅ Dashboard ID: $DASHBOARD_ID"
echo ""
echo "✅ Dashboard de Business Metrics corregido y creado!"
echo ""
echo "📊 Visualizaciones creadas:"
echo "   1. 📅 Requests por Hora del Día (Line Chart)"
echo "   2. 🏆 Top Servicios Más Activos (Pie Chart)"
echo "   3. 🎯 Distribución de Niveles de Log (Donut)"
echo "   4. 📊 Tasa de Actividad por Servicio (Area Chart)"
echo ""
echo "🌐 Ver dashboard en:"
echo "   http://localhost:5601/app/dashboards#/view/$DASHBOARD_ID"
