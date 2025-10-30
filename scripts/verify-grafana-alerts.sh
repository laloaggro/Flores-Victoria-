#!/bin/bash

# Script para verificar la configuración de alertas en Grafana
# Uso: ./scripts/verify-grafana-alerts.sh

set -e

GRAFANA_URL="http://localhost:3000"
GRAFANA_USER="${GRAFANA_ADMIN_USER:-admin}"
GRAFANA_PASS="${GRAFANA_ADMIN_PASSWORD:-admin}"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     VERIFICACIÓN DE ALERTAS EN GRAFANA                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar que Grafana esté corriendo
echo "🔍 1. Verificando estado de Grafana..."
if ! docker ps | grep -q flores-victoria-grafana; then
    echo "   ❌ ERROR: Contenedor de Grafana no está corriendo"
    echo "   💡 Ejecuta: docker-compose up -d grafana"
    exit 1
fi
echo "   ✅ Grafana está corriendo"
echo ""

# 2. Verificar conectividad
echo "🔍 2. Verificando conectividad..."
if ! curl -s -o /dev/null -w "%{http_code}" "$GRAFANA_URL/api/health" | grep -q "200"; then
    echo "   ❌ ERROR: No se puede conectar a Grafana en $GRAFANA_URL"
    exit 1
fi
echo "   ✅ Grafana accesible en $GRAFANA_URL"
echo ""

# 3. Verificar datasources
echo "🔍 3. Verificando datasources..."
DATASOURCE_RESPONSE=$(curl -s -u "$GRAFANA_USER:$GRAFANA_PASS" "$GRAFANA_URL/api/datasources")
DATASOURCE_COUNT=$(echo "$DATASOURCE_RESPONSE" | grep -o '"name"' | wc -l)

if [ "$DATASOURCE_COUNT" -eq 0 ]; then
    echo "   ⚠️  ADVERTENCIA: No se encontraron datasources configurados"
    echo "   💡 Verifica: monitoring/grafana/provisioning/datasources.yml"
else
    echo "   ✅ Datasources configurados: $DATASOURCE_COUNT"
    echo "$DATASOURCE_RESPONSE" | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | while read -r ds; do
        echo "      - $ds"
    done
fi
echo ""

# 4. Verificar reglas de alertas
echo "🔍 4. Verificando reglas de alertas..."
RULES_RESPONSE=$(curl -s -u "$GRAFANA_USER:$GRAFANA_PASS" "$GRAFANA_URL/api/v1/provisioning/alert-rules")
RULES_COUNT=$(echo "$RULES_RESPONSE" | grep -o '"uid"' | wc -l)

if [ "$RULES_COUNT" -eq 0 ]; then
    echo "   ⚠️  ADVERTENCIA: No se encontraron reglas de alertas"
    echo "   💡 Verifica: monitoring/grafana/provisioning/alerting/rules.yml"
else
    echo "   ✅ Reglas de alertas configuradas: $RULES_COUNT"
    
    # Listar reglas
    echo "$RULES_RESPONSE" | grep -o '"title":"[^"]*"' | sed 's/"title":"//g' | sed 's/"//g' | while read -r rule; do
        echo "      - $rule"
    done
fi
echo ""

# 5. Verificar contact points
echo "🔍 5. Verificando contact points (canales de notificación)..."
CONTACT_RESPONSE=$(curl -s -u "$GRAFANA_USER:$GRAFANA_PASS" "$GRAFANA_URL/api/v1/provisioning/contact-points")
CONTACT_COUNT=$(echo "$CONTACT_RESPONSE" | grep -o '"name"' | wc -l)

if [ "$CONTACT_COUNT" -eq 0 ]; then
    echo "   ⚠️  ADVERTENCIA: No se encontraron contact points"
    echo "   💡 Verifica: monitoring/grafana/provisioning/alerting/contactpoints.yml"
else
    echo "   ✅ Contact points configurados: $CONTACT_COUNT"
    echo "$CONTACT_RESPONSE" | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | while read -r cp; do
        echo "      - $cp"
    done
fi
echo ""

# 6. Verificar Prometheus
echo "🔍 6. Verificando conectividad con Prometheus..."
if docker ps | grep -q flores-victoria-prometheus; then
    PROM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/api/v1/status/config)
    if [ "$PROM_STATUS" = "200" ]; then
        echo "   ✅ Prometheus accesible en http://localhost:9090"
        
        # Verificar métricas disponibles
        METRICS_COUNT=$(curl -s http://localhost:9090/api/v1/label/__name__/values | grep -o '"' | wc -l)
        if [ "$METRICS_COUNT" -gt 0 ]; then
            echo "   ✅ Métricas disponibles en Prometheus"
        else
            echo "   ⚠️  ADVERTENCIA: No se encontraron métricas en Prometheus"
        fi
    else
        echo "   ⚠️  ADVERTENCIA: Prometheus no responde correctamente"
    fi
else
    echo "   ❌ ERROR: Contenedor de Prometheus no está corriendo"
    echo "   💡 Ejecuta: docker-compose up -d prometheus"
fi
echo ""

# 7. Verificar logs recientes de Grafana
echo "🔍 7. Verificando logs recientes (últimos errores)..."
ERROR_COUNT=$(docker logs flores-victoria-grafana --tail 100 2>&1 | grep -i "level=error" | wc -l)

if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "   ⚠️  Se encontraron $ERROR_COUNT errores en los logs recientes"
    echo "   📋 Últimos errores:"
    docker logs flores-victoria-grafana --tail 100 2>&1 | grep -i "level=error" | tail -5 | sed 's/^/      /'
    echo "   💡 Para ver todos los logs: docker logs flores-victoria-grafana"
else
    echo "   ✅ No se encontraron errores recientes en los logs"
fi
echo ""

# Resumen
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                          RESUMEN                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Estadísticas:"
echo "   - Datasources:      $DATASOURCE_COUNT"
echo "   - Reglas de alertas: $RULES_COUNT"
echo "   - Contact points:   $CONTACT_COUNT"
echo "   - Errores recientes: $ERROR_COUNT"
echo ""
echo "🌐 URLs útiles:"
echo "   - Grafana:    $GRAFANA_URL (user: $GRAFANA_USER)"
echo "   - Prometheus: http://localhost:9090"
echo "   - Alertas:    $GRAFANA_URL/alerting/list"
echo ""

# Estado final
if [ "$DATASOURCE_COUNT" -gt 0 ] && [ "$RULES_COUNT" -gt 0 ] && [ "$ERROR_COUNT" -eq 0 ]; then
    echo "✅ ESTADO: Configuración de alertas OK"
    exit 0
elif [ "$ERROR_COUNT" -gt 0 ]; then
    echo "⚠️  ESTADO: Configuración con errores - revisar logs"
    exit 1
else
    echo "⚠️  ESTADO: Configuración incompleta"
    exit 1
fi
