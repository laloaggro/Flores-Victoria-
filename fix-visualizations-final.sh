#!/bin/bash

# 🔧 Fix DEFINITIVO: Usar indexRefName en lugar de index directo

KIBANA_URL="http://localhost:5601"

echo "🔧 Corrigiendo visualizaciones con indexRefName..."
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
  echo "📝 Actualizando visualización: $viz_id"
  
  # Obtener la visualización actual
  viz_json=$(curl -s "$KIBANA_URL/api/saved_objects/visualization/$viz_id" -H "kbn-xsrf: true")
  
  # Extraer title
  title=$(echo "$viz_json" | jq -r '.attributes.title')
  echo "   Título: $title"
  
  # Obtener el searchSourceJSON actual
  search_source=$(echo "$viz_json" | jq -r '.attributes.kibanaSavedObjectMeta.searchSourceJSON')
  
  # Crear nuevo searchSourceJSON con indexRefName en lugar de index
  new_search_source=$(echo "$search_source" | jq 'del(.index) | . + {indexRefName: "kibanaSavedObjectMeta.searchSourceJSON.index"}')
  
  # Actualizar la visualización
  update_payload=$(cat <<EOF
{
  "attributes": {
    "kibanaSavedObjectMeta": {
      "searchSourceJSON": $(echo "$new_search_source" | jq -c .)
    }
  }
}
EOF
)
  
  result=$(curl -s -X PUT "$KIBANA_URL/api/saved_objects/visualization/$viz_id" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "$update_payload")
  
  if echo "$result" | jq -e '.id' > /dev/null 2>&1; then
    echo "   ✅ Actualizada correctamente"
  else
    echo "   ❌ Error al actualizar"
    echo "$result" | jq
  fi
  echo ""
done

echo ""
echo "✅ Corrección DEFINITIVA completada!"
echo "🔄 Refresca el dashboard con Ctrl+F5: http://localhost:5601/app/dashboards#/view/5013bd40-bdd5-11f0-b865-c1fad42913f7"
echo ""
echo "📊 Verifica también la visualización de prueba en: http://localhost:5601/app/visualize#/edit/test-viz-001"
