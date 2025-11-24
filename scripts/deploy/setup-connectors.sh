#!/bin/bash

# 🔔 Configurar conectores de notificación para las alertas

KIBANA_URL="http://localhost:5601"

echo "🔔 Configurando conectores de notificación..."
echo ""

# 1. Crear conector Webhook genérico (puede ser Slack, Discord, etc.)
echo "📌 Creando conector Webhook..."
WEBHOOK_ID=$(curl -s -X POST "$KIBANA_URL/api/actions/connector" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Webhook - Flores Victoria Alerts",
    "connector_type_id": ".webhook",
    "config": {
      "url": "https://webhook.site/your-unique-url",
      "method": "post",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "secrets": {}
  }' | jq -r '.id // empty')

if [ -n "$WEBHOOK_ID" ]; then
  echo "   ✅ Conector Webhook creado: $WEBHOOK_ID"
else
  echo "   ⚠️  No se pudo crear (puede que ya exista)"
fi

echo ""

# 2. Crear conector de Server Log (siempre funciona, para pruebas)
echo "📌 Creando conector Server Log..."
SERVERLOG_ID=$(curl -s -X POST "$KIBANA_URL/api/actions/connector" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Server Log - Flores Victoria",
    "connector_type_id": ".server-log"
  }' | jq -r '.id // empty')

if [ -n "$SERVERLOG_ID" ]; then
  echo "   ✅ Conector Server Log creado: $SERVERLOG_ID"
else
  echo "   ⚠️  No se pudo crear (puede que ya exista)"
fi

echo ""

# 3. Listar todos los conectores
echo "📋 Conectores disponibles:"
curl -s "$KIBANA_URL/api/actions/connectors" \
  -H "kbn-xsrf: true" | jq -r '.[] | "   - " + .name + " (" + .connector_type_id + ") - ID: " + .id'

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📝 Siguientes pasos:"
echo "   1. Ve a: http://localhost:5601/app/management/insightsAndAlerting/triggersActions/rules"
echo "   2. Edita cada alerta"
echo "   3. Agrega una acción con el conector creado"
echo ""
echo "💡 Para Slack:"
echo "   1. Crea un Incoming Webhook en Slack"
echo "   2. Usa la URL en el conector Webhook"
echo ""
echo "💡 Para Email:"
echo "   1. Configura SMTP en kibana.yml"
echo "   2. Crea un conector de tipo Email"
