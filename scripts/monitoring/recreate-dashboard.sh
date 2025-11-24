#!/bin/bash

# 🌺 Recrear Dashboard de Flores Victoria con visualizaciones reparadas

KIBANA_URL="http://localhost:5601"

echo "🌺 Recreando Dashboard de Flores Victoria..."
echo ""

# Leer los IDs de las visualizaciones desde los archivos temporales
VIZ_TOTAL=$(cat /tmp/viz_total.id 2>/dev/null || echo "")
VIZ_ERRORS=$(cat /tmp/viz_errors.id 2>/dev/null || echo "")
VIZ_RESPONSE=$(cat /tmp/viz_response.id 2>/dev/null || echo "")
VIZ_DONUT=$(cat /tmp/viz_donut.id 2>/dev/null || echo "")
VIZ_TIMELINE=$(cat /tmp/viz_timeline.id 2>/dev/null || echo "")
VIZ_ERRORS_CHART=$(cat /tmp/viz_errors_chart.id 2>/dev/null || echo "")
VIZ_ENDPOINTS=$(cat /tmp/viz_endpoints.id 2>/dev/null || echo "")
VIZ_HOURLY=$(cat /tmp/viz_hourly.id 2>/dev/null || echo "")

echo "📊 IDs de visualizaciones:"
echo "   ⚡ Total: $VIZ_TOTAL"
echo "   🚨 Errors: $VIZ_ERRORS"
echo "   ⏱️ Response: $VIZ_RESPONSE"
echo "   🌸 Donut: $VIZ_DONUT"
echo "   🌹 Timeline: $VIZ_TIMELINE"
echo "   💐 Errors Chart: $VIZ_ERRORS_CHART"
echo "   🎯 Endpoints: $VIZ_ENDPOINTS"
echo "   📈 Hourly: $VIZ_HOURLY"
echo ""

# Eliminar dashboard antiguo si existe
echo "🗑️  Eliminando dashboard antiguo..."
OLD_DASHBOARD_ID=$(curl -s "$KIBANA_URL/api/saved_objects/_find?type=dashboard&search_fields=title&search=Flores%20Victoria" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$OLD_DASHBOARD_ID" ]; then
    curl -X DELETE "$KIBANA_URL/api/saved_objects/dashboard/$OLD_DASHBOARD_ID" -H "kbn-xsrf: true" > /dev/null 2>&1
    echo "   ✅ Dashboard antiguo eliminado"
fi

echo ""
echo "🎨 Creando nuevo dashboard..."

# Crear dashboard con las referencias correctas
curl -X POST "$KIBANA_URL/api/saved_objects/dashboard" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "🌺 Flores Victoria - Analytics Dashboard",
      "description": "Dashboard profesional de monitoreo con colores de la marca",
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
      {"name": "panel_panel-2", "type": "visualization", "id": "'"$VIZ_ERRORS"'"},
      {"name": "panel_panel-3", "type": "visualization", "id": "'"$VIZ_RESPONSE"'"},
      {"name": "panel_panel-4", "type": "visualization", "id": "'"$VIZ_DONUT"'"},
      {"name": "panel_panel-5", "type": "visualization", "id": "'"$VIZ_TIMELINE"'"},
      {"name": "panel_panel-6", "type": "visualization", "id": "'"$VIZ_ERRORS_CHART"'"},
      {"name": "panel_panel-7", "type": "visualization", "id": "'"$VIZ_ENDPOINTS"'"},
      {"name": "panel_panel-8", "type": "visualization", "id": "'"$VIZ_HOURLY"'"}
    ]
  }' | jq

echo ""
echo "✅ Dashboard recreado exitosamente!"
echo ""
echo "📊 Layout del Dashboard:"
echo ""
echo "   Fila 1 (KPIs):"
echo "   ┌──────────┬──────────┬──────────┬──────────┐"
echo "   │ ⚡ Total │ 🚨 Errors│ ⏱️ Speed │🌸 Donut  │"
echo "   └──────────┴──────────┴──────────┴──────────┘"
echo ""
echo "   Fila 2 (Análisis):"
echo "   ┌────────────────────┬────────────────────┐"
echo "   │  🌹 Timeline       │  💐 Errors Chart   │"
echo "   └────────────────────┴────────────────────┘"
echo ""
echo "   Fila 3 (Detalles):"
echo "   ┌────────────────────┬────────────────────┐"
echo "   │  🎯 Top Endpoints  │  📈 Hourly Logs    │"
echo "   └────────────────────┴────────────────────┘"
echo ""
echo "🌐 Accede al dashboard en:"
echo "   http://localhost:5601/app/dashboards"
echo ""
echo "🎉 ¡Todo reparado y listo para usar!"
echo ""
