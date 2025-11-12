#!/bin/bash

# 🔧 Fix usando jq para manejar el JSON correctamente

KIBANA_URL="http://localhost:5601"

echo "🔧 Corrigiendo visualizaciones con jq..."
echo ""

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
  
  viz_json=$(curl -s "$KIBANA_URL/api/saved_objects/visualization/$viz_id" -H "kbn-xsrf: true")
  title=$(echo "$viz_json" | jq -r '.attributes.title')
  echo "   $title"
  
  # Crear el payload usando jq para asegurar JSON correcto
  update_payload=$(jq -n \
    --arg searchSource '{"query":{"query":"","language":"kuery"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}' \
    '{
      attributes: {
        kibanaSavedObjectMeta: {
          searchSourceJSON: $searchSource
        }
      }
    }')
  
  result=$(curl -s -X PUT "$KIBANA_URL/api/saved_objects/visualization/$viz_id" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "$update_payload")
  
  if echo "$result" | jq -e '.id' > /dev/null 2>&1; then
    echo "   ✅ OK"
  else
    echo "   ❌ Error"
  fi
  echo ""
done

echo "✅ Completado"
