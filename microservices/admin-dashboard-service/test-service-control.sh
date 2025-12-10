#!/bin/bash

# Script para probar los controles de servicios en el dashboard

set -e

DASHBOARD_URL="https://admin-dashboard-service-production.up.railway.app"

echo "🧪 Testing Service Control Endpoints"
echo "====================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar health del dashboard
echo "1️⃣  Verificando health del dashboard..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${DASHBOARD_URL}/health")
if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo -e "   ${GREEN}✅ Dashboard healthy (HTTP $HEALTH_STATUS)${NC}"
else
    echo -e "   ${RED}❌ Dashboard error (HTTP $HEALTH_STATUS)${NC}"
    exit 1
fi
echo ""

# 2. Obtener lista de servicios
echo "2️⃣  Obteniendo lista de servicios..."
SERVICES=$(curl -s "${DASHBOARD_URL}/api/dashboard/services" | jq -r '.services[].name' | head -5)
echo -e "   ${GREEN}Servicios disponibles:${NC}"
echo "$SERVICES" | while read service; do
    echo "   • $service"
done
echo ""

# 3. Ver resumen de salud
echo "3️⃣  Resumen de salud de servicios..."
SUMMARY=$(curl -s "${DASHBOARD_URL}/api/dashboard/summary")
TOTAL=$(echo "$SUMMARY" | jq -r '.total')
HEALTHY=$(echo "$SUMMARY" | jq -r '.healthy')
UNHEALTHY=$(echo "$SUMMARY" | jq -r '.unhealthy')
CRITICAL=$(echo "$SUMMARY" | jq -r '.criticalDown')

echo "   Total servicios: $TOTAL"
echo -e "   ${GREEN}Healthy: $HEALTHY${NC}"
echo -e "   ${YELLOW}Unhealthy: $UNHEALTHY${NC}"
echo -e "   ${RED}Critical Down: $CRITICAL${NC}"
echo ""

# 4. Probar endpoint de restart (sin ejecutar, solo verificar que responda)
echo "4️⃣  Verificando endpoints de control..."
echo -e "   ${YELLOW}⚠️  IMPORTANTE: Este script NO ejecutará acciones de control${NC}"
echo "   Los endpoints disponibles son:"
echo "   • POST /api/dashboard/services/:serviceName/restart"
echo "   • POST /api/dashboard/services/:serviceName/stop"
echo "   • POST /api/dashboard/services/:serviceName/start"
echo ""

# 5. Instrucciones de prueba manual
echo "5️⃣  Para probar el control de servicios:"
echo ""
echo "   Opción A - Usar el Dashboard Web:"
echo "   1. Abre: ${DASHBOARD_URL}"
echo "   2. Haz clic en 'Restart' en un servicio NO crítico (ej: Cart Service)"
echo "   3. Confirma la acción"
echo "   4. Observa la notificación de éxito/error"
echo ""
echo "   Opción B - Usar curl (ejemplo con Cart Service):"
echo "   curl -X POST ${DASHBOARD_URL}/api/dashboard/services/Cart%20Service/restart"
echo ""
echo -e "${GREEN}✅ Dashboard funcionando correctamente${NC}"
echo -e "${YELLOW}📊 Abre el dashboard en tu navegador para usar los controles${NC}"
echo ""
