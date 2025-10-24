#!/bin/bash

# Script para configurar automáticamente Grafana con dashboards personalizados
# y alertas para Flores Victoria

echo "📊 Configurando Grafana para Flores Victoria v2.0..."

# Configuración
GRAFANA_URL="http://localhost:3011"
GRAFANA_USER="admin"
GRAFANA_PASS="admin"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para hacer requests a Grafana API
grafana_api() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  if [ -n "$data" ]; then
    curl -s -X "$method" "$GRAFANA_URL/api/$endpoint" \
      -H "Content-Type: application/json" \
      -u "$GRAFANA_USER:$GRAFANA_PASS" \
      -d "$data"
  else
    curl -s -X "$method" "$GRAFANA_URL/api/$endpoint" \
      -H "Content-Type: application/json" \
      -u "$GRAFANA_USER:$GRAFANA_PASS"
  fi
}

# Verificar conectividad con Grafana
echo "🔍 Verificando conexión con Grafana..."
if curl -s --connect-timeout 5 "$GRAFANA_URL/api/health" >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Grafana disponible en $GRAFANA_URL${NC}"
else
  echo -e "${RED}❌ Grafana no disponible en $GRAFANA_URL${NC}"
  echo "💡 Asegúrate de que Grafana esté corriendo: docker compose ps grafana"
  exit 1
fi

# Configurar fuente de datos Prometheus
echo "🔗 Configurando fuente de datos Prometheus..."
PROMETHEUS_DATASOURCE=$(cat <<EOF
{
  "name": "Prometheus-FloresVictoria",
  "type": "prometheus",
  "url": "http://prometheus:9090",
  "access": "proxy",
  "basicAuth": false,
  "isDefault": true,
  "jsonData": {
    "httpMethod": "POST",
    "manageAlerts": true
  }
}
EOF
)

response=$(grafana_api POST "datasources" "$PROMETHEUS_DATASOURCE")
if echo "$response" | grep -q '"id"'; then
  echo -e "${GREEN}✅ Fuente de datos Prometheus configurada${NC}"
else
  echo -e "${YELLOW}⚠️  Fuente de datos ya existe o error: $response${NC}"
fi

# Importar dashboards
echo "📈 Importando dashboards personalizados..."

DASHBOARDS_DIR="monitoring/grafana/dashboards"
if [ -d "$DASHBOARDS_DIR" ]; then
  for dashboard_file in "$DASHBOARDS_DIR"/*.json; do
    if [ -f "$dashboard_file" ]; then
      dashboard_name=$(basename "$dashboard_file" .json)
      echo "  📊 Importando: $dashboard_name"
      
      # Crear payload para importación
      dashboard_content=$(cat "$dashboard_file")
      import_payload=$(cat <<EOF
{
  "dashboard": $(echo "$dashboard_content" | jq '.dashboard'),
  "overwrite": true,
  "inputs": [
    {
      "name": "DS_PROMETHEUS",
      "type": "datasource",
      "pluginId": "prometheus",
      "value": "Prometheus-FloresVictoria"
    }
  ]
}
EOF
)
      
      response=$(grafana_api POST "dashboards/import" "$import_payload")
      if echo "$response" | grep -q '"id"'; then
        echo -e "${GREEN}    ✅ Dashboard '$dashboard_name' importado${NC}"
      else
        echo -e "${RED}    ❌ Error importando '$dashboard_name': $response${NC}"
      fi
    fi
  done
else
  echo -e "${YELLOW}⚠️  Directorio de dashboards no encontrado: $DASHBOARDS_DIR${NC}"
fi

# Configurar alertas
echo "🚨 Configurando alertas..."

# Alerta para servicios caídos
SERVICE_DOWN_ALERT=$(cat <<EOF
{
  "alert": {
    "name": "Flores Victoria - Service Down",
    "message": "Un servicio de Flores Victoria está caído",
    "frequency": "30s",
    "conditions": [
      {
        "query": {
          "params": ["A", "5m", "now"]
        },
        "reducer": {
          "params": [],
          "type": "last"
        },
        "evaluator": {
          "params": [1],
          "type": "lt"
        }
      }
    ],
    "targets": [
      {
        "expr": "up{job=~\".*flores-victoria.*\"}",
        "refId": "A"
      }
    ]
  }
}
EOF
)

# Alerta para alta latencia
HIGH_LATENCY_ALERT=$(cat <<EOF
{
  "alert": {
    "name": "Flores Victoria - High Latency",
    "message": "Latencia alta detectada en servicios",
    "frequency": "1m",
    "conditions": [
      {
        "query": {
          "params": ["A", "5m", "now"]
        },
        "reducer": {
          "params": [],
          "type": "avg"
        },
        "evaluator": {
          "params": [2],
          "type": "gt"
        }
      }
    ],
    "targets": [
      {
        "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=~\".*flores-victoria.*\"}[5m]))",
        "refId": "A"
      }
    ]
  }
}
EOF
)

# Crear canal de notificación (webhook o email)
NOTIFICATION_CHANNEL=$(cat <<EOF
{
  "name": "flores-victoria-alerts",
  "type": "webhook",
  "settings": {
    "url": "http://localhost:3000/api/alerts/webhook",
    "httpMethod": "POST",
    "title": "Flores Victoria Alert",
    "text": "{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"
  }
}
EOF
)

echo "📬 Configurando canal de notificaciones..."
response=$(grafana_api POST "alert-notifications" "$NOTIFICATION_CHANNEL")
if echo "$response" | grep -q '"id"'; then
  echo -e "${GREEN}✅ Canal de notificaciones configurado${NC}"
else
  echo -e "${YELLOW}⚠️  Canal ya existe o error: $response${NC}"
fi

# Configurar organizaciones y usuarios
echo "👥 Configurando usuarios y permisos..."

# Crear organización para Flores Victoria
ORG_PAYLOAD=$(cat <<EOF
{
  "name": "Flores Victoria Monitoring"
}
EOF
)

response=$(grafana_api POST "orgs" "$ORG_PAYLOAD")
if echo "$response" | grep -q '"orgId"'; then
  echo -e "${GREEN}✅ Organización 'Flores Victoria Monitoring' creada${NC}"
else
  echo -e "${YELLOW}⚠️  Organización ya existe o error${NC}"
fi

# Resumen final
echo ""
echo -e "${BLUE}📋 RESUMEN DE CONFIGURACIÓN GRAFANA${NC}"
echo "=================================="
echo -e "🌐 URL: ${GREEN}$GRAFANA_URL${NC}"
echo -e "👤 Usuario: ${GREEN}$GRAFANA_USER${NC}"
echo -e "🔑 Contraseña: ${GREEN}$GRAFANA_PASS${NC}"
echo ""
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "🔗 Enlaces útiles:"
echo "   - Dashboard Principal: $GRAFANA_URL/d/flores-victoria-overview"
echo "   - Security Dashboard: $GRAFANA_URL/d/security-performance"  
echo "   - Alertas: $GRAFANA_URL/alerting/list"
echo ""
echo "💡 Para personalizar dashboards:"
echo "   1. Accede a Grafana en tu navegador"
echo "   2. Ve a Dashboards → Manage"
echo "   3. Selecciona un dashboard y haz clic en 'Edit'"
echo "   4. Personaliza según tus necesidades"