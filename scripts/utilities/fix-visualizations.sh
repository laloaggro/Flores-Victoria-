#!/bin/bash

# 🌺 Reparar visualizaciones de Kibana - Flores Victoria
# Elimina y recrea las visualizaciones con referencias correctas al data view

KIBANA_URL="http://localhost:5601"
DATA_VIEW_ID="8870237b-ffe5-4b39-8f7f-5d95d100ad39"

echo "🔧 Reparando visualizaciones de Flores Victoria..."
echo ""

# Colores del sitio Flores Victoria
PRIMARY_PINK="#c2185b"
PRIMARY_LIGHT="#e91e63"
PRIMARY_DARK="#880e4f"
SECONDARY_PURPLE="#7b1fa2"
SECONDARY_LIGHT="#9c27b0"
ACCENT_PINK="#f8bbd0"
ACCENT_LIGHT="#fce4ec"
SUCCESS_GREEN="#4caf50"
ERROR_RED="#f44336"
WARNING_ORANGE="#ff9800"

# Función para eliminar visualización por título
delete_viz_by_title() {
    local title="$1"
    echo "🗑️  Eliminando: $title"
    local viz_id=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=visualization&search_fields=title&search=$title" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$viz_id" ]; then
        curl -X DELETE "$KIBANA_URL/api/saved_objects/visualization/$viz_id" -H "kbn-xsrf: true" > /dev/null 2>&1
        echo "   ✅ Eliminada"
    fi
}

echo "🗑️  Limpiando visualizaciones antiguas..."
delete_viz_by_title "🌸%20Requests"
delete_viz_by_title "💐%20Errores"
delete_viz_by_title "🌹%20Timeline"
delete_viz_by_title "🎯%20Top"
delete_viz_by_title "⚡%20Total"
delete_viz_by_title "🚨%20Errores"
delete_viz_by_title "⏱️%20Tiempo"
delete_viz_by_title "📈%20Logs"

echo ""
echo "🎨 Creando visualizaciones nuevas con data view correcto..."
echo ""

# ============================================
# 1. Total de Requests - Metric
# ============================================
echo "⚡ Creando: Total de Requests"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "⚡ Total de Requests",
      "visState": "{\"title\":\"⚡ Total de Requests\",\"type\":\"metric\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{\"customLabel\":\"Total Requests\"}}],\"params\":{\"addTooltip\":true,\"addLegend\":false,\"type\":\"metric\",\"metric\":{\"percentageMode\":false,\"useRanges\":false,\"colorSchema\":\"Green to Red\",\"metricColorMode\":\"None\",\"colorsRange\":[{\"from\":0,\"to\":10000}],\"labels\":{\"show\":true},\"invertColors\":false,\"style\":{\"bgFill\":\"'"$ACCENT_LIGHT"'\",\"bgColor\":false,\"labelColor\":false,\"subText\":\"\",\"fontSize\":60}}}}",
      "uiStateJSON": "{}",
      "description": "Total de requests procesados",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    },
    "references": [
      {
        "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
        "type": "index-pattern",
        "id": "'"$DATA_VIEW_ID"'"
      }
    ]
  }' | jq -r '.id' | tee /tmp/viz_total.id

echo "✅ Total de Requests creado"
echo ""

# ============================================
# 2. Errores Totales - Metric
# ============================================
echo "🚨 Creando: Errores Totales"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "🚨 Errores Totales",
      "visState": "{\"title\":\"🚨 Errores Totales\",\"type\":\"metric\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{\"customLabel\":\"Total Errores\"}}],\"params\":{\"addTooltip\":true,\"addLegend\":false,\"type\":\"metric\",\"metric\":{\"percentageMode\":false,\"useRanges\":false,\"colorSchema\":\"Green to Red\",\"metricColorMode\":\"None\",\"colorsRange\":[{\"from\":0,\"to\":10000}],\"labels\":{\"show\":true},\"invertColors\":false,\"style\":{\"bgFill\":\"'"$ERROR_RED"'\",\"bgColor\":true,\"labelColor\":true,\"subText\":\"\",\"fontSize\":60}}}}",
      "uiStateJSON": "{}",
      "description": "Total de errores en el sistema",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"level:error\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    },
    "references": [
      {
        "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
        "type": "index-pattern",
        "id": "'"$DATA_VIEW_ID"'"
      }
    ]
  }' | jq -r '.id' | tee /tmp/viz_errors.id

echo "✅ Errores Totales creado"
echo ""

# ============================================
# 3. Tiempo de Respuesta - Metric
# ============================================
echo "⏱️ Creando: Tiempo de Respuesta"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "⏱️ Tiempo de Respuesta Promedio",
      "visState": "{\"title\":\"⏱️ Tiempo de Respuesta Promedio\",\"type\":\"metric\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"avg\",\"schema\":\"metric\",\"params\":{\"field\":\"duration\",\"customLabel\":\"Avg Response (ms)\"}}],\"params\":{\"addTooltip\":true,\"addLegend\":false,\"type\":\"metric\",\"metric\":{\"percentageMode\":false,\"useRanges\":true,\"colorSchema\":\"Green to Red\",\"metricColorMode\":\"Background\",\"colorsRange\":[{\"from\":0,\"to\":100},{\"from\":100,\"to\":500},{\"from\":500,\"to\":10000}],\"labels\":{\"show\":true},\"invertColors\":false,\"style\":{\"bgFill\":\"'"$SUCCESS_GREEN"'\",\"bgColor\":true,\"labelColor\":false,\"subText\":\"milliseconds\",\"fontSize\":48}}}}",
      "uiStateJSON": "{}",
      "description": "Tiempo promedio de respuesta",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    },
    "references": [
      {
        "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
        "type": "index-pattern",
        "id": "'"$DATA_VIEW_ID"'"
      }
    ]
  }' | jq -r '.id' | tee /tmp/viz_response.id

echo "✅ Tiempo de Respuesta creado"
echo ""

# ============================================
# 4. Requests por Servicio - Donut
# ============================================
echo "🌸 Creando: Requests por Servicio"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "🌸 Requests por Servicio",
      "visState": "{\"title\":\"🌸 Requests por Servicio\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"service.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":10,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"}}],\"params\":{\"type\":\"donut\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true,\"labels\":{\"show\":true,\"values\":true,\"last_level\":true,\"truncate\":100},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$PRIMARY_PINK"'\",\"'"$PRIMARY_LIGHT"'\",\"'"$SECONDARY_PURPLE"'\",\"'"$SECONDARY_LIGHT"'\",\"'"$ACCENT_PINK"'\",\"'"$PRIMARY_DARK"'\"],\"stops\":[0,16.67,33.34,50.01,66.68,83.35],\"gradient\":false,\"rangeMin\":0,\"rangeMax\":100}}}}",
      "uiStateJSON": "{}",
      "description": "Distribución de requests por servicio",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    },
    "references": [
      {
        "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
        "type": "index-pattern",
        "id": "'"$DATA_VIEW_ID"'"
      }
    ]
  }' | jq -r '.id' | tee /tmp/viz_donut.id

echo "✅ Requests por Servicio creado"
echo ""

# ============================================
# 5. Timeline - Area Chart
# ============================================
echo "🌹 Creando: Timeline de Actividad"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "🌹 Timeline de Actividad",
      "visState": "{\"title\":\"🌹 Timeline de Actividad\",\"type\":\"area\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"schema\":\"segment\",\"params\":{\"field\":\"@timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"auto\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{}}},{\"id\":\"3\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"group\",\"params\":{\"field\":\"service.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"}}],\"params\":{\"type\":\"area\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Requests\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"area\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true,\"interpolate\":\"linear\",\"valueAxis\":\"ValueAxis-1\"}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$PRIMARY_PINK"'\",\"'"$PRIMARY_LIGHT"'\",\"'"$SECONDARY_PURPLE"'\",\"'"$SECONDARY_LIGHT"'\",\"'"$ACCENT_PINK"'\"],\"stops\":[0,25,50,75,100],\"gradient\":true}}}}",
      "uiStateJSON": "{}",
      "description": "Timeline de actividad",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    },
    "references": [
      {
        "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
        "type": "index-pattern",
        "id": "'"$DATA_VIEW_ID"'"
      }
    ]
  }' | jq -r '.id' | tee /tmp/viz_timeline.id

echo "✅ Timeline creado"
echo ""

# ============================================
# 6. Errores vs Éxitos - Bar Chart
# ============================================
echo "💐 Creando: Errores vs Éxitos"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "💐 Errores vs Éxitos",
      "visState": "{\"title\":\"💐 Errores vs Éxitos\",\"type\":\"histogram\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"level.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"}}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{\"show\":false},\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$SUCCESS_GREEN"'\",\"'"$WARNING_ORANGE"'\",\"'"$ERROR_RED"'\",\"'"$PRIMARY_PINK"'\",\"'"$SECONDARY_PURPLE"'\"],\"stops\":[0,25,50,75,100],\"gradient\":false}}}}",
      "uiStateJSON": "{}",
      "description": "Comparación de niveles de log",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    },
    "references": [
      {
        "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
        "type": "index-pattern",
        "id": "'"$DATA_VIEW_ID"'"
      }
    ]
  }' | jq -r '.id' | tee /tmp/viz_errors_chart.id

echo "✅ Errores vs Éxitos creado"
echo ""

# ============================================
# 7. Top Endpoints - Horizontal Bar
# ============================================
echo "🎯 Creando: Top Endpoints"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "🎯 Top 10 Endpoints",
      "visState": "{\"title\":\"🎯 Top 10 Endpoints\",\"type\":\"horizontal_bar\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"url.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":10,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"}}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"BottomAxis-1\",\"type\":\"value\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Requests\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"normal\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":false,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{\"show\":false},\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$PRIMARY_PINK"'\"],\"stops\":[0,100],\"gradient\":false}}}}",
      "uiStateJSON": "{}",
      "description": "Top 10 endpoints",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    },
    "references": [
      {
        "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
        "type": "index-pattern",
        "id": "'"$DATA_VIEW_ID"'"
      }
    ]
  }' | jq -r '.id' | tee /tmp/viz_endpoints.id

echo "✅ Top Endpoints creado"
echo ""

# ============================================
# 8. Logs por Hora - Line Chart
# ============================================
echo "📈 Creando: Logs por Hora"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "📈 Logs por Hora",
      "visState": "{\"title\":\"📈 Logs por Hora\",\"type\":\"line\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"schema\":\"segment\",\"params\":{\"field\":\"@timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"h\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{}}}],\"params\":{\"type\":\"line\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"line\",\"mode\":\"normal\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":3,\"showCircles\":true,\"interpolate\":\"linear\"}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$PRIMARY_PINK"'\"],\"stops\":[0,100],\"gradient\":false}}}}",
      "uiStateJSON": "{}",
      "description": "Logs por hora",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    },
    "references": [
      {
        "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
        "type": "index-pattern",
        "id": "'"$DATA_VIEW_ID"'"
      }
    ]
  }' | jq -r '.id' | tee /tmp/viz_hourly.id

echo "✅ Logs por Hora creado"
echo ""

echo "🎉 Todas las visualizaciones reparadas!"
echo ""
echo "📋 Nuevos IDs guardados en /tmp/viz_*.id"
echo ""
echo "💡 Próximo paso: Recrear el dashboard con estos nuevos IDs"
echo "   Ejecuta: ./recreate-dashboard.sh"
echo ""
