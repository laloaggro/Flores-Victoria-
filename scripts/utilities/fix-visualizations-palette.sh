#!/bin/bash

# 🔧 Recrear visualizaciones con configuración correcta para Kibana 8.x

KIBANA_URL="http://localhost:5601"
DATA_VIEW_ID="8870237b-ffe5-4b39-8f7f-5d95d100ad39"

echo "🔧 Recreando visualizaciones problemáticas para Kibana 8.x..."
echo ""

# Colores Flores Victoria
COLOR_1="#c2185b"  # Rosa Frambuesa
COLOR_2="#e91e63"  # Rosa Brillante
COLOR_3="#880e4f"  # Magenta Profundo
COLOR_4="#7b1fa2"  # Púrpura Real
COLOR_5="#9c27b0"  # Púrpura Medio

# 1. Timeline de Actividad (Area Chart) - SIN palette personalizada
echo "📊 Recreando: 🌹 Timeline de Actividad"
curl -s -X PUT "$KIBANA_URL/api/saved_objects/visualization/2c4071b0-bdd5-11f0-b865-c1fad42913f7" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "🌹 Timeline de Actividad",
      "visState": "{\"title\":\"Timeline de Actividad\",\"type\":\"area\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"schema\":\"segment\",\"params\":{\"field\":\"@timestamp\",\"interval\":\"auto\",\"min_doc_count\":1}}],\"params\":{\"type\":\"area\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"area\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true,\"interpolate\":\"linear\"}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"}}}",
      "uiStateJSON": "{}",
      "description": "Actividad de requests a lo largo del tiempo",
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
  }' | jq -r 'if .id then "   ✅ Actualizada" else "   ❌ Error: " + (.message // .error) end'

echo ""

# 2. Errores vs Éxitos (Bar Chart) - SIN palette personalizada
echo "📊 Recreando: 💐 Errores vs Éxitos"
curl -s -X PUT "$KIBANA_URL/api/saved_objects/visualization/2cdc6390-bdd5-11f0-b865-c1fad42913f7" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "💐 Errores vs Éxitos",
      "visState": "{\"title\":\"Errores vs Éxitos\",\"type\":\"histogram\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"filters\",\"schema\":\"segment\",\"params\":{\"filters\":[{\"input\":{\"query\":\"level:error\",\"language\":\"kuery\"},\"label\":\"Errores\"},{\"input\":{\"query\":\"level:info OR level:warn\",\"language\":\"kuery\"},\"label\":\"Éxitos\"}]}}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false}}",
      "uiStateJSON": "{}",
      "description": "Comparación de errores vs requests exitosos",
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
  }' | jq -r 'if .id then "   ✅ Actualizada" else "   ❌ Error: " + (.message // .error) end'

echo ""

# 3. Top 10 Endpoints (Horizontal Bar) - SIN palette personalizada
echo "📊 Recreando: 🎯 Top 10 Endpoints"
curl -s -X PUT "$KIBANA_URL/api/saved_objects/visualization/2d7659a0-bdd5-11f0-b865-c1fad42913f7" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "🎯 Top 10 Endpoints",
      "visState": "{\"title\":\"Top 10 Endpoints\",\"type\":\"horizontal_bar\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"path.keyword\",\"size\":10,\"order\":\"desc\",\"orderBy\":\"1\"}}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"BottomAxis-1\",\"type\":\"value\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"stacked\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false}}",
      "uiStateJSON": "{}",
      "description": "Endpoints más utilizados",
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
  }' | jq -r 'if .id then "   ✅ Actualizada" else "   ❌ Error: " + (.message // .error) end'

echo ""

# 4. Logs por Hora (Line Chart) - SIN palette personalizada
echo "📊 Recreando: 📈 Logs por Hora"
curl -s -X PUT "$KIBANA_URL/api/saved_objects/visualization/2e142040-bdd5-11f0-b865-c1fad42913f7" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "📈 Logs por Hora",
      "visState": "{\"title\":\"Logs por Hora\",\"type\":\"line\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"schema\":\"segment\",\"params\":{\"field\":\"@timestamp\",\"interval\":\"h\",\"min_doc_count\":1}}],\"params\":{\"type\":\"line\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"line\",\"mode\":\"normal\",\"data\":{\"label\":\"Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true,\"interpolate\":\"linear\"}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false}}",
      "uiStateJSON": "{}",
      "description": "Distribución de logs por hora",
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
  }' | jq -r 'if .id then "   ✅ Actualizada" else "   ❌ Error: " + (.message // .error) end'

echo ""

# 5. Requests por Servicio (Donut) - Simplificado
echo "📊 Recreando: 🌸 Requests por Servicio"
curl -s -X PUT "$KIBANA_URL/api/saved_objects/visualization/2ba2ab10-bdd5-11f0-b865-c1fad42913f7" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "🌸 Requests por Servicio",
      "visState": "{\"title\":\"Requests por Servicio\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"service.keyword\",\"size\":10,\"order\":\"desc\",\"orderBy\":\"1\"}}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true,\"labels\":{\"show\":true,\"values\":true,\"last_level\":true,\"truncate\":100}}}",
      "uiStateJSON": "{}",
      "description": "Distribución de requests por servicio",
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
  }' | jq -r 'if .id then "   ✅ Actualizada" else "   ❌ Error: " + (.message // .error) end'

echo ""
echo "✅ ¡Visualizaciones recreadas sin paletas personalizadas!"
echo "🔄 Refresca el dashboard con Ctrl+F5"
