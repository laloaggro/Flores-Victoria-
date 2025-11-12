#!/bin/bash

# Script para configurar Kibana con dashboards de Flores Victoria
# Este script crea index patterns y dashboards automáticamente

KIBANA_URL="http://localhost:5601"
INDEX_PATTERN="flores-victoria-logs-*"

echo "🚀 Configurando Kibana para Flores Victoria..."
echo ""

# Esperar a que Kibana esté listo
echo "⏳ Esperando a que Kibana esté disponible..."
until curl -sf "$KIBANA_URL/api/status" > /dev/null; do
    echo "  Kibana aún no está listo, esperando..."
    sleep 5
done
echo "✅ Kibana está disponible"
echo ""

# Crear index pattern
echo "📊 Creando index pattern: $INDEX_PATTERN"
curl -X POST "$KIBANA_URL/api/data_views/data_view" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d "{
    \"data_view\": {
      \"title\": \"$INDEX_PATTERN\",
      \"timeFieldName\": \"@timestamp\",
      \"name\": \"Flores Victoria Logs\"
    }
  }" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Index pattern creado"
else
    echo "⚠️  Index pattern ya existe o error al crear"
fi
echo ""

# Crear visualización: Logs por servicio (Pie Chart)
echo "📈 Creando visualización: Logs por Servicio"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "Logs por Servicio",
      "visState": "{\"title\":\"Logs por Servicio\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"service.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":10},\"schema\":\"segment\"}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true}}",
      "uiStateJSON": "{}",
      "description": "Distribución de logs por microservicio",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"index\":\"flores-victoria-logs-*\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }' 2>/dev/null
echo "✅ Visualización 'Logs por Servicio' creada"
echo ""

# Crear visualización: Logs por Nivel (Bar Chart)
echo "📊 Creando visualización: Logs por Nivel"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "Logs por Nivel",
      "visState": "{\"title\":\"Logs por Nivel\",\"type\":\"histogram\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"level.keyword\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5},\"schema\":\"segment\"}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{\"show\":false}}}",
      "uiStateJSON": "{}",
      "description": "Conteo de logs por nivel de severidad",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"index\":\"flores-victoria-logs-*\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }' 2>/dev/null
echo "✅ Visualización 'Logs por Nivel' creada"
echo ""

# Crear visualización: Timeline de Logs
echo "📈 Creando visualización: Timeline de Logs"
curl -X POST "$KIBANA_URL/api/saved_objects/visualization" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "Timeline de Logs",
      "visState": "{\"title\":\"Timeline de Logs\",\"type\":\"line\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"params\":{\"field\":\"@timestamp\",\"timeRange\":{\"from\":\"now-1h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"auto\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{}},\"schema\":\"segment\"}],\"params\":{\"type\":\"line\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"line\",\"mode\":\"normal\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"interpolate\":\"linear\",\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"}}}",
      "uiStateJSON": "{}",
      "description": "Timeline de logs en el tiempo",
      "version": 1,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"index\":\"flores-victoria-logs-*\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }' 2>/dev/null
echo "✅ Visualización 'Timeline de Logs' creada"
echo ""

# Crear Dashboard Principal
echo "🎨 Creando Dashboard Principal"
curl -X POST "$KIBANA_URL/api/saved_objects/dashboard" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "Flores Victoria - Overview",
      "description": "Dashboard general de monitoreo de Flores Victoria",
      "panelsJSON": "[]",
      "optionsJSON": "{\"hidePanelTitles\":false,\"useMargins\":true}",
      "version": 1,
      "timeRestore": false,
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    }
  }' 2>/dev/null
echo "✅ Dashboard 'Flores Victoria - Overview' creado"
echo ""

echo "🎉 Configuración de Kibana completada!"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Accede a Kibana: $KIBANA_URL"
echo "  2. Ve a 'Discover' para ver los logs en tiempo real"
echo "  3. Ve a 'Dashboard' para ver las visualizaciones"
echo "  4. Personaliza los dashboards según tus necesidades"
echo ""
echo "💡 Tip: Los logs empezarán a aparecer cuando los microservicios"
echo "         envíen logs a Logstash (puerto 5000)"
