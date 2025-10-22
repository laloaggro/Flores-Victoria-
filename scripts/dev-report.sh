#!/bin/bash

# Script para generar reporte de desarrollo
# Muestra información útil sobre el estado del proyecto

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Reporte de Desarrollo - Flores Victoria    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

# Fecha y hora
echo -e "${CYAN}📅 Fecha:${NC} $(date '+%d/%m/%Y %H:%M:%S')\n"

# Estado de servicios
echo -e "${CYAN}📊 Estado de Servicios:${NC}"
docker compose -f docker-compose.dev-simple.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Uso de recursos
echo -e "${CYAN}💻 Uso de Recursos:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

# Puertos en uso
echo -e "${CYAN}🔌 Puertos en Uso:${NC}"
netstat -tuln 2>/dev/null | grep -E ":(5173|3000|3001|3009|3010)" | awk '{print $4}' | sort -u || echo "No se pudieron obtener los puertos"
echo ""

# Logs recientes (últimas 5 líneas de cada servicio)
echo -e "${CYAN}📝 Logs Recientes (últimas 5 líneas):${NC}"
for service in frontend admin-panel api-gateway auth-service product-service; do
    echo -e "\n${YELLOW}>> $service:${NC}"
    docker compose -f docker-compose.dev-simple.yml logs --tail=5 $service 2>/dev/null | tail -5
done
echo ""

# Health check
echo -e "${CYAN}🏥 Health Check:${NC}"
./scripts/health-check.sh 2>/dev/null || echo -e "${RED}Error al ejecutar health check${NC}"
echo ""

# Espacio en disco
echo -e "${CYAN}💾 Espacio en Disco (Docker):${NC}"
docker system df
echo ""

# Git status
if [ -d .git ]; then
    echo -e "${CYAN}📦 Git Status:${NC}"
    git status -s
    echo ""
    echo -e "${CYAN}🌿 Rama actual:${NC} $(git branch --show-current)"
    echo -e "${CYAN}📍 Último commit:${NC} $(git log -1 --pretty=format:'%h - %s (%cr)')"
    echo ""
fi

# Dependencias desactualizadas (opcional, puede ser lento)
# echo -e "${CYAN}📦 Dependencias:${NC}"
# echo "Verificando actualizaciones disponibles..."
# npm outdated || echo "Todas las dependencias están actualizadas"

echo -e "\n${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Reporte generado correctamente ✅${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}\n"
