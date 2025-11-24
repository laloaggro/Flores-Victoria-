#!/bin/bash

# 🔧 Recrear Dashboard de Business Metrics desde cero

KIBANA_URL="http://localhost:5601"
DATA_VIEW_ID="8870237b-ffe5-4b39-8f7f-5d95d100ad39"

echo "🗑️ Eliminando dashboard y visualizaciones anteriores..."
echo ""

# Eliminar dashboard anterior
curl -s -X DELETE "$KIBANA_URL/api/saved_objects/dashboard/74e220f0-bdf1-11f0-b865-c1fad42913f7" -H "kbn-xsrf: true" > /dev/null

# Eliminar visualizaciones anteriores
for id in "72725970-bdf1-11f0-b865-c1fad42913f7" "73104720-bdf1-11f0-b865-c1fad42913f7" "73aad970-bdf1-11f0-b865-c1fad42913f7" "7442d3b0-bdf1-11f0-b865-c1fad42913f7"; do
  curl -s -X DELETE "$KIBANA_URL/api/saved_objects/visualization/$id" -H "kbn-xsrf: true" > /dev/null
done

echo "✅ Objetos anteriores eliminados"
echo ""
echo "📊 Creando nuevas visualizaciones con formato correcto..."
echo ""

# Función para crear visualización con formato correcto
create_visualization() {
  local TITLE="$1"
  local VIS_STATE="$2"
  local DESCRIPTION="$3"
  
  # searchSourceJSON debe ser STRING
  local SEARCH_SOURCE='{"query":{"query":"","language":"kuery"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}'
  
  local RESPONSE=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/visualization" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d '{
      "attributes": {
        "title": "'"$TITLE"'",
        "visState": "'"$VIS_STATE"'",
        "uiStateJSON": "{}",
        "description": "'"$DESCRIPTION"'",
        "version": 1,
        "kibanaSavedObjectMeta": {
          "searchSourceJSON": "'"$SEARCH_SOURCE"'"
        }
      },
      "references": [{
        "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
        "type": "index-pattern",
        "id": "'$DATA_VIEW_ID'"
      }]
    }')
  
  echo "$RESPONSE" | jq -r '.id'
}

# 1. Line Chart - Requests por Hora
echo "1️⃣ Creando: 📅 Requests por Hora del Día"
VIS_STATE_1='{"title":"Requests por Hora","type":"line","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"date_histogram","params":{"field":"@timestamp","timeRange":{"from":"now-7d","to":"now"},"useNormalizedEsInterval":true,"scaleMetricValues":false,"interval":"h","drop_partials":false,"min_doc_count":1,"extended_bounds":{}},"schema":"segment"}],"params":{"type":"line","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"line","mode":"normal","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false}}'

VIZ1_ID=$(create_visualization "📅 Requests por Hora del Día" "$VIS_STATE_1" "Distribución de requests por hora")
echo "   ✅ ID: $VIZ1_ID"

# 2. Pie Chart - Top Servicios
echo "2️⃣ Creando: 🏆 Top Servicios Más Activos"
VIS_STATE_2='{"title":"Top Servicios","type":"pie","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"service.keyword","orderBy":"1","order":"desc","size":10,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"segment"}],"params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":false,"labels":{"show":true,"values":true,"last_level":true,"truncate":100}}}'

VIZ2_ID=$(create_visualization "🏆 Top Servicios Más Activos" "$VIS_STATE_2" "Servicios más utilizados")
echo "   ✅ ID: $VIZ2_ID"

# 3. Donut - Niveles de Log
echo "3️⃣ Creando: 🎯 Distribución de Niveles de Log"
VIS_STATE_3='{"title":"Niveles de Log","type":"pie","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"level.keyword","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"segment"}],"params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":true,"values":true,"last_level":true,"truncate":100}}}'

VIZ3_ID=$(create_visualization "🎯 Distribución de Niveles de Log" "$VIS_STATE_3" "Distribución por nivel de log")
echo "   ✅ ID: $VIZ3_ID"

# 4. Area Chart - Tasa de Actividad
echo "4️⃣ Creando: 📊 Tasa de Actividad por Servicio"
VIS_STATE_4='{"title":"Tasa de Actividad","type":"area","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"date_histogram","params":{"field":"@timestamp","timeRange":{"from":"now-24h","to":"now"},"useNormalizedEsInterval":true,"scaleMetricValues":false,"interval":"auto","drop_partials":false,"min_doc_count":1,"extended_bounds":{}},"schema":"segment"},{"id":"3","enabled":true,"type":"terms","params":{"field":"service.keyword","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"group"}],"params":{"type":"area","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"area","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true,"interpolate":"linear","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false}}'

VIZ4_ID=$(create_visualization "📊 Tasa de Actividad por Servicio" "$VIS_STATE_4" "Actividad de servicios en el tiempo")
echo "   ✅ ID: $VIZ4_ID"

echo ""
echo "📊 Creando Dashboard..."

# Crear Dashboard
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

DASHBOARD_ID=$(echo "$DASHBOARD_RESPONSE" | jq -r '.id')

echo "   ✅ Dashboard ID: $DASHBOARD_ID"
echo ""
echo "✅ Dashboard recreado desde cero!"
echo ""
echo "📊 Visualizaciones creadas:"
echo "   1. 📅 Requests por Hora del Día (Line Chart)"
echo "   2. 🏆 Top Servicios Más Activos (Pie Chart)"
echo "   3. 🎯 Distribución de Niveles de Log (Donut)"
echo "   4. 📊 Tasa de Actividad por Servicio (Area Chart)"
echo ""
echo "🌐 Dashboard disponible en:"
echo "   http://localhost:5601/app/dashboards#/view/$DASHBOARD_ID"
echo ""
echo "⚠️ IMPORTANTE: Limpia la caché del navegador (Ctrl+Shift+Delete) o abre en ventana privada"
