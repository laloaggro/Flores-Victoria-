#!/bin/bash

# 🔧 Arreglar searchSourceJSON del dashboard de Business Metrics
# Convertir de objeto a string JSON

KIBANA_URL="http://localhost:5601"

echo "🔧 Corrigiendo searchSourceJSON en visualizaciones de Business Metrics..."
echo ""

# IDs de las visualizaciones
VIZ_IDS=(
  "72725970-bdf1-11f0-b865-c1fad42913f7"
  "73104720-bdf1-11f0-b865-c1fad42913f7"
  "73aad970-bdf1-11f0-b865-c1fad42913f7"
  "7442d3b0-bdf1-11f0-b865-c1fad42913f7"
)

VIZ_NAMES=(
  "📅 Requests por Hora"
  "🏆 Top Servicios"
  "🎯 Niveles de Log"
  "📊 Tasa de Actividad"
)

for i in "${!VIZ_IDS[@]}"; do
  VIZ_ID="${VIZ_IDS[$i]}"
  VIZ_NAME="${VIZ_NAMES[$i]}"
  
  echo "🔧 Procesando: $VIZ_NAME"
  
  # Obtener la visualización actual
  VIZ_DATA=$(curl -s "$KIBANA_URL/api/saved_objects/visualization/$VIZ_ID" -H "kbn-xsrf: true")
  
  # Extraer componentes
  TITLE=$(echo "$VIZ_DATA" | jq -r '.attributes.title')
  VIS_STATE=$(echo "$VIZ_DATA" | jq -r '.attributes.visState')
  UI_STATE=$(echo "$VIZ_DATA" | jq -r '.attributes.uiStateJSON')
  DESCRIPTION=$(echo "$VIZ_DATA" | jq -r '.attributes.description // ""')
  REFERENCES=$(echo "$VIZ_DATA" | jq -c '.references')
  
  # Crear searchSourceJSON como STRING (no objeto)
  SEARCH_SOURCE_STRING='{"query":{"query":"","language":"kuery"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}'
  
  # Actualizar la visualización
  curl -s -X PUT "$KIBANA_URL/api/saved_objects/visualization/$VIZ_ID?overwrite=true" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d '{
      "attributes": {
        "title": "'"$TITLE"'",
        "visState": '"$(echo "$VIS_STATE" | jq -R .)"',
        "uiStateJSON": '"$(echo "$UI_STATE" | jq -R .)"',
        "description": "'"$DESCRIPTION"'",
        "version": 1,
        "kibanaSavedObjectMeta": {
          "searchSourceJSON": "'"$SEARCH_SOURCE_STRING"'"
        }
      },
      "references": '"$REFERENCES"'
    }' > /dev/null
  
  echo "   ✅ Actualizado"
done

echo ""
echo "✅ Todas las visualizaciones corregidas!"
echo ""
echo "🌐 Dashboard disponible en:"
echo "   http://localhost:5601/app/dashboards#/view/74e220f0-bdf1-11f0-b865-c1fad42913f7"
echo ""
echo "🔄 Recarga la página del dashboard para ver los cambios"
