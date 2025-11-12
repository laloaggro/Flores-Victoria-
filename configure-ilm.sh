#!/bin/bash

# 🔄 Configurar ILM (Index Lifecycle Management) para logs

ELASTICSEARCH_URL="http://localhost:9200"

echo "🔄 Configurando ILM para rotación de logs..."
echo ""

# 1. Crear política ILM
echo "📋 Creando política ILM: flores-victoria-ilm-policy"
curl -s -X PUT "$ELASTICSEARCH_URL/_ilm/policy/flores-victoria-ilm-policy" \
  -H "Content-Type: application/json" \
  -d '{
    "policy": {
      "phases": {
        "hot": {
          "min_age": "0ms",
          "actions": {
            "rollover": {
              "max_size": "50gb",
              "max_age": "7d",
              "max_docs": 100000
            },
            "set_priority": {
              "priority": 100
            }
          }
        },
        "warm": {
          "min_age": "7d",
          "actions": {
            "readonly": {},
            "set_priority": {
              "priority": 50
            }
          }
        },
        "delete": {
          "min_age": "30d",
          "actions": {
            "delete": {}
          }
        }
      }
    }
  }' | jq '.'

echo ""
echo "✅ Política ILM creada:"
echo "   • Hot Phase: 7 días (escritura activa, rollover a 50GB o 100k docs)"
echo "   • Warm Phase: 7-30 días (solo lectura)"
echo "   • Delete Phase: >30 días (eliminación automática)"
echo ""

# 2. Actualizar template de índice para usar ILM
echo "📝 Actualizando index template con ILM..."
curl -s -X PUT "$ELASTICSEARCH_URL/_index_template/flores-victoria-logs-template" \
  -H "Content-Type: application/json" \
  -d '{
    "index_patterns": ["flores-victoria-logs-*"],
    "template": {
      "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "index.lifecycle.name": "flores-victoria-ilm-policy",
        "index.lifecycle.rollover_alias": "flores-victoria-logs"
      },
      "mappings": {
        "properties": {
          "@timestamp": {"type": "date"},
          "service": {"type": "keyword"},
          "level": {"type": "keyword"},
          "message": {"type": "text"},
          "path": {"type": "keyword"},
          "method": {"type": "keyword"},
          "statusCode": {"type": "integer"},
          "duration": {"type": "float"}
        }
      }
    }
  }' | jq '.'

echo ""
echo "✅ Template actualizado con ILM"
echo ""

# 3. Verificar configuración
echo "🔍 Verificando configuración ILM..."
echo ""
echo "Política ILM:"
curl -s "$ELASTICSEARCH_URL/_ilm/policy/flores-victoria-ilm-policy" | jq '.["flores-victoria-ilm-policy"].policy.phases | keys'

echo ""
echo "✅ ILM configurado correctamente!"
echo ""
echo "📊 Política aplicada a índices flores-victoria-logs-*"
echo "🔄 Los logs se rotarán automáticamente cada 7 días o 50GB"
echo "🗑️ Los logs antiguos se eliminarán después de 30 días"
