#!/bin/bash

# Script para monitorear el estado de todos los servicios en tiempo real
# Ejecutar mientras Railway redespliega los servicios

echo "🔍 Monitoreando servicios en Railway..."
echo "========================================"
echo ""

DASHBOARD_URL="https://admin-dashboard-service-production.up.railway.app/api/dashboard"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_services() {
    local response=$(curl -s "$DASHBOARD_URL")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al conectar con el dashboard${NC}"
        return 1
    fi
    
    # Extraer summary
    local total=$(echo "$response" | jq -r '.summary.total' 2>/dev/null)
    local healthy=$(echo "$response" | jq -r '.summary.healthy' 2>/dev/null)
    local unhealthy=$(echo "$response" | jq -r '.summary.unhealthy' 2>/dev/null)
    local critical=$(echo "$response" | jq -r '.summary.criticalDown' 2>/dev/null)
    
    if [ -z "$total" ]; then
        echo -e "${RED}❌ Error al parsear respuesta del dashboard${NC}"
        return 1
    fi
    
    # Calcular porcentaje
    local percentage=$(( healthy * 100 / total ))
    
    # Timestamp
    local timestamp=$(date '+%H:%M:%S')
    
    # Mostrar resumen
    echo -e "${BLUE}[$timestamp]${NC} Estado de servicios:"
    echo -e "  Total: $total"
    echo -e "  ${GREEN}✅ Healthy: $healthy${NC} (${percentage}%)"
    echo -e "  ${YELLOW}⚠️  Unhealthy: $unhealthy${NC}"
    echo -e "  ${RED}🔥 Critical Down: $critical${NC}"
    echo ""
    
    # Mostrar servicios individuales
    echo "$response" | jq -r '.services[] | "  \(.status == "healthy" and "✅" or "❌") \(.name) - \(.status) \(if .responseTime then "(\(.responseTime)ms)" else "" end)"' 2>/dev/null
    
    echo ""
    echo "----------------------------------------"
    echo ""
    
    # Retornar 0 si todos healthy, 1 si no
    if [ "$healthy" -eq "$total" ]; then
        return 0
    else
        return 1
    fi
}

# Verificar si jq está instalado
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq no está instalado. Instalando...${NC}"
    sudo apt-get update && sudo apt-get install -y jq
fi

echo "🚀 Iniciando monitoreo continuo (Ctrl+C para detener)"
echo ""

# Contador de verificaciones
count=0
all_healthy=false

while true; do
    count=$((count + 1))
    echo "📊 Verificación #$count"
    
    if check_services; then
        echo -e "${GREEN}🎉 ¡TODOS LOS SERVICIOS ESTÁN HEALTHY!${NC}"
        echo ""
        all_healthy=true
        break
    fi
    
    # Esperar 10 segundos antes de la siguiente verificación
    echo "⏳ Esperando 10 segundos para próxima verificación..."
    echo ""
    sleep 10
done

if [ "$all_healthy" = true ]; then
    echo "✅ Monitoreo completado exitosamente"
    echo "🌐 Dashboard: https://admin-dashboard-service-production.up.railway.app"
    exit 0
else
    echo "⚠️  Monitoreo detenido por usuario"
    exit 1
fi
