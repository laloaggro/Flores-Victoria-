#!/bin/bash

# 🌺 Crear Dashboard Profesional de Flores Victoria en Kibana

KIBANA_URL="http://localhost:5601"

echo "🌺 Creando Dashboard 'Flores Victoria - Analytics'..."
echo ""

# IDs de las visualizaciones que acabamos de crear
# Nota: Estos IDs son generados por Kibana y pueden variar

# Obtenemos los IDs de las visualizaciones recién creadas
echo "📊 Obteniendo IDs de las visualizaciones..."

# Buscar visualizaciones por título
VIZ_REQUESTS=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=visualization&search_fields=title&search=Requests%20por%20Servicio" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
VIZ_ERRORS=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=visualization&search_fields=title&search=Errores%20vs" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
VIZ_TIMELINE=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=visualization&search_fields=title&search=Timeline%20de%20Actividad" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
VIZ_ENDPOINTS=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=visualization&search_fields=title&search=Top%2010%20Endpoints" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
VIZ_TOTAL=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=visualization&search_fields=title&search=Total%20de%20Requests" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
VIZ_ERROR_COUNT=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=visualization&search_fields=title&search=Errores%20Totales" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
VIZ_RESPONSE=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=visualization&search_fields=title&search=Tiempo%20de%20Respuesta" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
VIZ_HOURLY=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=visualization&search_fields=title&search=Logs%20por%20Hora" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "✅ IDs obtenidos:"
echo "   🌸 Requests por Servicio: $VIZ_REQUESTS"
echo "   💐 Errores vs Éxitos: $VIZ_ERRORS"
echo "   🌹 Timeline: $VIZ_TIMELINE"
echo "   🎯 Top Endpoints: $VIZ_ENDPOINTS"
echo "   ⚡ Total Requests: $VIZ_TOTAL"
echo "   🚨 Errores: $VIZ_ERROR_COUNT"
echo "   ⏱️ Response Time: $VIZ_RESPONSE"
echo "   📈 Hourly Logs: $VIZ_HOURLY"
echo ""

# Crear Dashboard con layout profesional
echo "🎨 Creando dashboard profesional..."

curl -X POST "$KIBANA_URL/api/saved_objects/dashboard" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "🌺 Flores Victoria - Analytics Dashboard",
      "description": "Dashboard profesional de monitoreo de microservicios con colores de la marca Flores Victoria",
      "panelsJSON": "[{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":0,\"y\":0,\"w\":12,\"h\":8,\"i\":\"panel-1\"},\"panelIndex\":\"panel-1\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_panel-1\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":12,\"y\":0,\"w\":12,\"h\":8,\"i\":\"panel-2\"},\"panelIndex\":\"panel-2\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_panel-2\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":24,\"y\":0,\"w\":12,\"h\":8,\"i\":\"panel-3\"},\"panelIndex\":\"panel-3\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_panel-3\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":36,\"y\":0,\"w\":12,\"h\":8,\"i\":\"panel-4\"},\"panelIndex\":\"panel-4\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_panel-4\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":0,\"y\":8,\"w\":24,\"h\":12,\"i\":\"panel-5\"},\"panelIndex\":\"panel-5\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_panel-5\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":24,\"y\":8,\"w\":24,\"h\":12,\"i\":\"panel-6\"},\"panelIndex\":\"panel-6\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_panel-6\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":0,\"y\":20,\"w\":24,\"h\":12,\"i\":\"panel-7\"},\"panelIndex\":\"panel-7\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_panel-7\"},{\"version\":\"8.11.0\",\"type\":\"visualization\",\"gridData\":{\"x\":24,\"y\":20,\"w\":24,\"h\":12,\"i\":\"panel-8\"},\"panelIndex\":\"panel-8\",\"embeddableConfig\":{\"enhancements\":{}},\"panelRefName\":\"panel_panel-8\"}]",
      "optionsJSON": "{\"useMargins\":true,\"syncColors\":false,\"syncCursor\":true,\"syncTooltips\":false,\"hidePanelTitles\":false}",
      "version": 1,
      "timeRestore": true,
      "timeTo": "now",
      "timeFrom": "now-24h",
      "refreshInterval": {
        "pause": false,
        "value": 30000
      },
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
      }
    },
    "references": [
      {"name": "panel_panel-1", "type": "visualization", "id": "'"$VIZ_TOTAL"'"},
      {"name": "panel_panel-2", "type": "visualization", "id": "'"$VIZ_ERROR_COUNT"'"},
      {"name": "panel_panel-3", "type": "visualization", "id": "'"$VIZ_RESPONSE"'"},
      {"name": "panel_panel-4", "type": "visualization", "id": "'"$VIZ_REQUESTS"'"},
      {"name": "panel_panel-5", "type": "visualization", "id": "'"$VIZ_TIMELINE"'"},
      {"name": "panel_panel-6", "type": "visualization", "id": "'"$VIZ_ERRORS"'"},
      {"name": "panel_panel-7", "type": "visualization", "id": "'"$VIZ_ENDPOINTS"'"},
      {"name": "panel_panel-8", "type": "visualization", "id": "'"$VIZ_HOURLY"'"}
    ]
  }'

echo ""
echo "✅ Dashboard creado exitosamente!"
echo ""
echo "📊 Layout del Dashboard:"
echo ""
echo "   Fila 1 (Métricas KPI):"
echo "   ┌──────────┬──────────┬──────────┬──────────┐"
echo "   │ ⚡ Total │ 🚨 Errors│ ⏱️ Speed │🌸 Donut  │"
echo "   │ Requests │  Count   │   Avg    │Services  │"
echo "   └──────────┴──────────┴──────────┴──────────┘"
echo ""
echo "   Fila 2 (Análisis de Actividad):"
echo "   ┌────────────────────┬────────────────────┐"
echo "   │  🌹 Timeline       │  💐 Errors Chart   │"
echo "   │  (Area gradiente)  │  (Bar stacked)     │"
echo "   └────────────────────┴────────────────────┘"
echo ""
echo "   Fila 3 (Detalles):"
echo "   ┌────────────────────┬────────────────────┐"
echo "   │  🎯 Top Endpoints  │  📈 Hourly Logs    │"
echo "   │  (Horizontal bar)  │  (Line chart)      │"
echo "   └────────────────────┴────────────────────┘"
echo ""
echo "🎉 ¡Dashboard personalizado de Flores Victoria creado!"
echo ""
echo "🌐 Accede a tu dashboard en:"
echo "   http://localhost:5601/app/dashboards"
echo ""
echo "✨ Características:"
echo "   • Paleta de colores rosa/magenta de Flores Victoria"
echo "   • Auto-refresh cada 30 segundos"
echo "   • Rango de tiempo: últimas 24 horas"
echo "   • 8 visualizaciones profesionales"
echo "   • Layout optimizado para monitore o"
echo ""
