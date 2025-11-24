#!/bin/bash

# 🔧 Fix DEFINITIVO: searchSourceJSON debe ser STRING, no objeto

KIBANA_URL="http://localhost:5601"

echo "🔧 Corrigiendo searchSourceJSON como STRING..."
echo ""

# Array de IDs de visualizaciones
viz_ids=(
  "29cf4aa0-bdd5-11f0-b865-c1fad42913f7"
  "2a6a2b10-bdd5-11f0-b865-c1fad42913f7"
  "2b03d300-bdd5-11f0-b865-c1fad42913f7"
  "2ba2ab10-bdd5-11f0-b865-c1fad42913f7"
  "2c4071b0-bdd5-11f0-b865-c1fad42913f7"
  "2cdc6390-bdd5-11f0-b865-c1fad42913f7"
  "2d7659a0-bdd5-11f0-b865-c1fad42913f7"
  "2e142040-bdd5-11f0-b865-c1fad42913f7"
)

for viz_id in "${viz_ids[@]}"; do
  echo "📝 Actualizando: $viz_id"
  
  # Obtener la visualización actual
  viz_json=$(curl -s "$KIBANA_URL/api/saved_objects/visualization/$viz_id" -H "kbn-xsrf: true")
  
  title=$(echo "$viz_json" | jq -r '.attributes.title')
  echo "   Título: $title"
  
  # Crear el searchSourceJSON correcto como STRING
  search_source_string='{"query":{"query":"","language":"kuery"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}'
  
  # Crear el payload de actualización con searchSourceJSON como STRING
  update_payload=$(jq -n \
    --arg search "$search_source_string" \
    '{
      attributes: {
        kibanaSavedObjectMeta: {
          searchSourceJSON: $search
        }
      }
    }')
  
  # Actualizar la visualización
  result=$(curl -s -X PUT "$KIBANA_URL/api/saved_objects/visualization/$viz_id" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "$update_payload")
  
  if echo "$result" | jq -e '.id' > /dev/null 2>&1; then
    echo "   ✅ Actualizada"
  else
    echo "   ❌ Error"
    echo "$result" | jq -r '.message // .error' 2>/dev/null
  fi
  echo ""
done

echo ""
echo "✅ ¡Corrección completada!"
echo "🔄 Refresca con Ctrl+F5: http://localhost:5601/app/dashboards#/view/5013bd40-bdd5-11f0-b865-c1fad42913f7"
