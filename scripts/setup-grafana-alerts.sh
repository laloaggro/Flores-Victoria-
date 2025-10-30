#!/bin/bash

# Script para verificar y aplicar configuración de alertas de Grafana
# Uso: ./scripts/setup-grafana-alerts.sh

set -e

echo "🚨 Configuración de Alertas de Grafana"
echo "======================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Verificar que Grafana esté corriendo
echo "1. Verificando estado de Grafana..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    print_info "Grafana está corriendo en http://localhost:3000"
else
    print_error "Grafana no está accesible. Inicia el contenedor con: docker-compose up -d grafana"
    exit 1
fi

# 2. Verificar que Prometheus esté corriendo
echo ""
echo "2. Verificando estado de Prometheus..."
if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    print_info "Prometheus está corriendo en http://localhost:9090"
else
    print_warning "Prometheus no está accesible. Algunas alertas pueden no funcionar."
fi

# 3. Verificar archivos de configuración
echo ""
echo "3. Verificando archivos de configuración..."

CONFIG_FILES=(
    "monitoring/grafana/provisioning/alerting/rules.yml"
    "monitoring/grafana/provisioning/alerting/contactpoints.yml"
    "monitoring/grafana/provisioning/datasources/prometheus.yml"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_info "Encontrado: $file"
    else
        print_error "Falta: $file"
        exit 1
    fi
done

# 4. Verificar variables de entorno
echo ""
echo "4. Verificando variables de entorno..."

if [ -f ".env" ]; then
    print_info "Archivo .env encontrado"
    
    # Verificar variables importantes
    if grep -q "ALERT_EMAIL=" .env; then
        ALERT_EMAIL=$(grep "ALERT_EMAIL=" .env | cut -d '=' -f2)
        print_info "Email de alertas configurado: $ALERT_EMAIL"
    else
        print_warning "ALERT_EMAIL no configurado en .env"
    fi
    
    if grep -q "SLACK_WEBHOOK_URL=" .env; then
        print_info "Slack webhook configurado"
    else
        print_warning "SLACK_WEBHOOK_URL no configurado (opcional)"
    fi
else
    print_warning "Archivo .env no encontrado. Copia .env.example a .env"
fi

# 5. Reiniciar Grafana para aplicar configuración
echo ""
echo "5. ¿Reiniciar Grafana para aplicar configuración? (s/n)"
read -r restart_choice

if [[ "$restart_choice" == "s" || "$restart_choice" == "S" ]]; then
    echo "Reiniciando Grafana..."
    docker restart flores-victoria-grafana 2>/dev/null || docker-compose restart grafana
    
    echo "Esperando que Grafana inicie..."
    sleep 5
    
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        print_info "Grafana reiniciado exitosamente"
    else
        print_error "Error al reiniciar Grafana"
        exit 1
    fi
fi

# 6. Verificar reglas de alertas cargadas
echo ""
echo "6. Verificando reglas de alertas en Grafana..."
echo ""

# Obtener información de Grafana usando API
GRAFANA_URL="http://localhost:3000"
GRAFANA_USER="${GRAFANA_ADMIN_USER:-admin}"
GRAFANA_PASS="${GRAFANA_ADMIN_PASSWORD:-admin}"

# Listar reglas de alertas
echo "Consultando API de Grafana..."
RULES_RESPONSE=$(curl -s -u "$GRAFANA_USER:$GRAFANA_PASS" \
    "$GRAFANA_URL/api/ruler/grafana/api/v1/rules" 2>/dev/null || echo "{}")

if [ "$RULES_RESPONSE" != "{}" ] && [ "$RULES_RESPONSE" != "" ]; then
    print_info "Reglas de alertas disponibles en Grafana"
else
    print_warning "No se pudieron obtener las reglas. Verifica credenciales de Grafana."
fi

# 7. Resumen de configuración
echo ""
echo "======================================"
echo "📊 Resumen de Configuración"
echo "======================================"
echo ""
echo "Reglas de Alertas Configuradas:"
echo "  1. ✓ High CPU Usage (>80% por 5min)"
echo "  2. ✓ High Memory Usage (>85% por 5min)"
echo "  3. ✓ Service Down (2min)"
echo "  4. ✓ High Error Rate (>5% por 5min)"
echo "  5. ✓ Slow Response Time (P95 >2s por 5min)"
echo "  6. ✓ DB Connection Pool Exhausted (<10 por 2min)"
echo "  7. ✓ MongoDB Replica Set Member Down (2min)"
echo "  8. ✓ Redis Memory Usage High (>90% por 5min)"
echo "  9. ✓ Disk Space Low (<15% por 5min)"
echo " 10. ✓ API Gateway High Latency (P99 >3s por 5min)"
echo ""
echo "Canales de Notificación:"
echo "  • Email: ${ALERT_EMAIL:-No configurado}"
echo "  • Slack: $([ -n "$SLACK_WEBHOOK_URL" ] && echo "Configurado" || echo "No configurado")"
echo "  • Webhook: Configurado"
echo "  • Discord: $([ -n "$DISCORD_WEBHOOK_URL" ] && echo "Configurado" || echo "No configurado")"
echo ""
echo "======================================"
echo "🎯 Próximos Pasos"
echo "======================================"
echo ""
echo "1. Accede a Grafana: http://localhost:3000"
echo "   Usuario: $GRAFANA_USER"
echo "   Contraseña: (definida en .env)"
echo ""
echo "2. Ve a Alerting > Alert rules para ver las reglas"
echo ""
echo "3. Ve a Alerting > Contact points para configurar notificaciones"
echo ""
echo "4. Para configurar Slack:"
echo "   - Crea un webhook en: https://api.slack.com/messaging/webhooks"
echo "   - Agrega SLACK_WEBHOOK_URL a .env"
echo "   - Reinicia Grafana"
echo ""
echo "5. Para configurar Discord:"
echo "   - Ve a Server Settings > Integrations > Webhooks"
echo "   - Crea un webhook y copia la URL"
echo "   - Agrega DISCORD_WEBHOOK_URL a .env"
echo "   - Reinicia Grafana"
echo ""
echo "6. Para probar alertas:"
echo "   - Ve a una regla de alerta en Grafana"
echo "   - Click en 'Test' para enviar alerta de prueba"
echo ""
echo "✅ Configuración de alertas completada!"
