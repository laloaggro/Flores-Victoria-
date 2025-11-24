#!/bin/bash

# 🌺 Configuración personalizada de Kibana para Flores Victoria
# Con paleta de colores del sitio web (Jardín Romántico)

KIBANA_URL="http://localhost:5601"
INDEX_PATTERN="flores-victoria-logs-*"

# Colores del sitio Flores Victoria
PRIMARY_PINK="#c2185b"        # Rosa Frambuesa
PRIMARY_LIGHT="#e91e63"       # Rosa Brillante
PRIMARY_DARK="#880e4f"        # Magenta Profundo
SECONDARY_PURPLE="#7b1fa2"    # Púrpura Real
SECONDARY_LIGHT="#9c27b0"     # Púrpura Medio
ACCENT_PINK="#f8bbd0"         # Rosa Ballet
ACCENT_LIGHT="#fce4ec"        # Rosa Muy Claro
SUCCESS_GREEN="#4caf50"       # Verde éxito
ERROR_RED="#f44336"           # Rojo error
WARNING_ORANGE="#ff9800"      # Naranja advertencia

echo "🌺 Configurando dashboards personalizados de Flores Victoria..."
echo ""

# Función para esperar a que Kibana esté disponible
wait_for_kibana() {
    echo "⏳ Esperando a que Kibana esté disponible..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "$KIBANA_URL/api/status" > /dev/null 2>&1; then
            echo "✅ Kibana está disponible"
            return 0
        fi
        attempt=$((attempt + 1))
        echo "   Intento $attempt/$max_attempts..."
        sleep 2
    done
    echo "❌ Error: Kibana no está disponible después de esperar"
    return 1
}

# Esperar a Kibana
wait_for_kibana || exit 1

echo ""
echo "🎨 Creando visualizaciones personalizadas..."
echo ""

# ============================================
# 1. Requests por Servicio - Donut Chart Rosa
# ============================================
echo "📊 Creando visualización: Requests por Servicio (Donut)"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "🌸 Requests por Servicio",
      "visState": "{\"title\":\"🌸 Requests por Servicio\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"service.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":10,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"}}],\"params\":{\"type\":\"donut\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true,\"labels\":{\"show\":true,\"values\":true,\"last_level\":true,\"truncate\":100},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$PRIMARY_PINK"'\",\"'"$PRIMARY_LIGHT"'\",\"'"$SECONDARY_PURPLE"'\",\"'"$SECONDARY_LIGHT"'\",\"'"$ACCENT_PINK"'\",\"'"$PRIMARY_DARK"'\"],\"stops\":[0,16.67,33.34,50.01,66.68,83.35],\"gradient\":false,\"rangeMin\":0,\"rangeMax\":100}}}}",
      "uiStateJSON": "{}",
      "description": "Distribución de requests por microservicio con colores de la marca Flores Victoria",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"index\":\"'"$INDEX_PATTERN"'\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }'

echo ""
echo "✅ Visualización 'Requests por Servicio' creada"
echo ""

# ============================================
# 2. Errores vs Éxitos - Bar Chart
# ============================================
echo "📈 Creando visualización: Errores vs Éxitos"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "💐 Errores vs Éxitos",
      "visState": "{\"title\":\"💐 Errores vs Éxitos\",\"type\":\"histogram\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"level.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"}}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{\"show\":false},\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$SUCCESS_GREEN"'\",\"'"$WARNING_ORANGE"'\",\"'"$ERROR_RED"'\",\"'"$PRIMARY_PINK"'\",\"'"$SECONDARY_PURPLE"'\"],\"stops\":[0,25,50,75,100],\"gradient\":false}}}}",
      "uiStateJSON": "{}",
      "description": "Comparación de niveles de log (info, warn, error) con código de colores",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"index\":\"'"$INDEX_PATTERN"'\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }'

echo ""
echo "✅ Visualización 'Errores vs Éxitos' creada"
echo ""

# ============================================
# 3. Timeline de Actividad - Area Chart
# ============================================
echo "📉 Creando visualización: Timeline de Actividad"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "🌹 Timeline de Actividad",
      "visState": "{\"title\":\"🌹 Timeline de Actividad\",\"type\":\"area\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"schema\":\"segment\",\"params\":{\"field\":\"@timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"auto\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{}}},{\"id\":\"3\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"group\",\"params\":{\"field\":\"service.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"}}],\"params\":{\"type\":\"area\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Requests\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"area\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true,\"interpolate\":\"linear\",\"valueAxis\":\"ValueAxis-1\"}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$PRIMARY_PINK"'\",\"'"$PRIMARY_LIGHT"'\",\"'"$SECONDARY_PURPLE"'\",\"'"$SECONDARY_LIGHT"'\",\"'"$ACCENT_PINK"'\"],\"stops\":[0,25,50,75,100],\"gradient\":true}}}}",
      "uiStateJSON": "{}",
      "description": "Timeline de actividad de los microservicios con gradiente rosa",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"index\":\"'"$INDEX_PATTERN"'\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }'

echo ""
echo "✅ Visualización 'Timeline de Actividad' creada"
echo ""

# ============================================
# 4. Top Endpoints - Horizontal Bar
# ============================================
echo "📊 Creando visualización: Top Endpoints"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "🎯 Top 10 Endpoints Más Usados",
      "visState": "{\"title\":\"🎯 Top 10 Endpoints Más Usados\",\"type\":\"horizontal_bar\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"url.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":10,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"}}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"BottomAxis-1\",\"type\":\"value\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Requests\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"normal\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":false,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{\"show\":false},\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$PRIMARY_PINK"'\"],\"stops\":[0,100],\"gradient\":false}}}}",
      "uiStateJSON": "{}",
      "description": "Los 10 endpoints con más tráfico",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"index\":\"'"$INDEX_PATTERN"'\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }'

echo ""
echo "✅ Visualización 'Top Endpoints' creada"
echo ""

# ============================================
# 5. Performance Metrics - Metric
# ============================================
echo "⚡ Creando visualización: Performance Metrics"
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
        "searchSourceJSON": "{\"index\":\"'"$INDEX_PATTERN"'\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }'

echo ""
echo "✅ Visualización 'Total de Requests' creada"
echo ""

# ============================================
# 6. Error Rate - Metric
# ============================================
echo "🚨 Creando visualización: Error Rate"
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
        "searchSourceJSON": "{\"index\":\"'"$INDEX_PATTERN"'\",\"query\":{\"query\":\"level:error\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }'

echo ""
echo "✅ Visualización 'Errores Totales' creada"
echo ""

# ============================================
# 7. Response Time Average - Metric
# ============================================
echo "⏱️ Creando visualización: Response Time"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "⏱️ Tiempo de Respuesta Promedio",
      "visState": "{\"title\":\"⏱️ Tiempo de Respuesta Promedio\",\"type\":\"metric\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"avg\",\"schema\":\"metric\",\"params\":{\"field\":\"duration\",\"customLabel\":\"Avg Response (ms)\"}}],\"params\":{\"addTooltip\":true,\"addLegend\":false,\"type\":\"metric\",\"metric\":{\"percentageMode\":false,\"useRanges\":true,\"colorSchema\":\"Green to Red\",\"metricColorMode\":\"Background\",\"colorsRange\":[{\"from\":0,\"to\":100},{\"from\":100,\"to\":500},{\"from\":500,\"to\":10000}],\"labels\":{\"show\":true},\"invertColors\":false,\"style\":{\"bgFill\":\"'"$SUCCESS_GREEN"'\",\"bgColor\":true,\"labelColor\":false,\"subText\":\"milliseconds\",\"fontSize\":48}}}}",
      "uiStateJSON": "{}",
      "description": "Tiempo promedio de respuesta de los servicios",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"index\":\"'"$INDEX_PATTERN"'\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }'

echo ""
echo "✅ Visualización 'Response Time' creada"
echo ""

# ============================================
# 8. Logs por Hora - Line Chart
# ============================================
echo "📈 Creando visualización: Logs por Hora"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "📈 Logs por Hora",
      "visState": "{\"title\":\"📈 Logs por Hora\",\"type\":\"line\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"schema\":\"segment\",\"params\":{\"field\":\"@timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"h\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{}}}],\"params\":{\"type\":\"line\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"line\",\"mode\":\"normal\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":3,\"showCircles\":true,\"interpolate\":\"linear\"}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"},\"palette\":{\"type\":\"palette\",\"name\":\"custom\",\"params\":{\"colors\":[\"'"$PRIMARY_PINK"'\"],\"stops\":[0,100],\"gradient\":false}}}}",
      "uiStateJSON": "{}",
      "description": "Logs agrupados por hora para ver patrones de tráfico",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"index\":\"'"$INDEX_PATTERN"'\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }'

echo ""
echo "✅ Visualización 'Logs por Hora' creada"
echo ""

echo "🎨 Todas las visualizaciones creadas exitosamente!"
echo ""
echo "📋 Visualizaciones disponibles:"
echo "   1. 🌸 Requests por Servicio (Donut rosa)"
echo "   2. 💐 Errores vs Éxitos (Bar chart)"
echo "   3. 🌹 Timeline de Actividad (Area chart gradiente)"
echo "   4. 🎯 Top 10 Endpoints (Horizontal bar)"
echo "   5. ⚡ Total de Requests (Metric)"
echo "   6. 🚨 Errores Totales (Metric rojo)"
echo "   7. ⏱️ Tiempo de Respuesta Promedio (Metric)"
echo "   8. 📈 Logs por Hora (Line chart)"
echo ""
echo "🌺 ¡Configuración completada!"
echo ""
echo "💡 Próximo paso: Accede a Kibana en http://localhost:5601"
echo "   y crea un dashboard combinando estas visualizaciones"
echo ""
