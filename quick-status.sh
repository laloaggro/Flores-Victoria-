#!/bin/bash

#############################################
# Script de verificación rápida del sistema
# Autor: Sistema de Observabilidad v2.0.0
# Fecha: 2024-10-29
#############################################

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Estado del Sistema Completo${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# 1. Verificar Stack de Monitoring
echo -e "${YELLOW}[1/4]${NC} Verificando Stack de Monitoring..."
if docker-compose -f /home/impala/Documentos/Proyectos/flores-victoria/docker-compose.monitoring.yml ps | grep -q "Up"; then
    echo -e "${GREEN}  ✓ Stack de monitoring corriendo${NC}"
    
    # Verificar health de cada servicio
    if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Prometheus healthy${NC} (http://localhost:9090)"
    else
        echo -e "${RED}  ✗ Prometheus no responde${NC}"
    fi
    
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Grafana healthy${NC} (http://localhost:3000) [admin/admin123]"
    else
        echo -e "${YELLOW}  ⚠ Grafana iniciando...${NC}"
    fi
    
    if curl -s http://localhost:9093/-/healthy > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Alertmanager healthy${NC} (http://localhost:9093)"
    else
        echo -e "${YELLOW}  ⚠ Alertmanager iniciando...${NC}"
    fi
else
    echo -e "${RED}  ✗ Stack de monitoring no está corriendo${NC}"
    echo -e "${YELLOW}    Ejecuta: docker-compose -f docker-compose.monitoring.yml up -d${NC}"
fi

echo ""

# 2. Verificar Microservicios
echo -e "${YELLOW}[2/4]${NC} Verificando Microservicios..."

declare -a SERVICES=(
    "cart-service:3001"
    "product-service:3002"
    "auth-service:3003"
    "user-service:3004"
    "order-service:3005"
)

services_up=0
services_down=0

for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    
    if curl -s http://localhost:$port/health > /dev/null 2>&1 || curl -s http://localhost:$port/metrics > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ $service_name${NC} (http://localhost:$port)"
        services_up=$((services_up + 1))
    else
        echo -e "${RED}  ✗ $service_name${NC} (no responde en puerto $port)"
        services_down=$((services_down + 1))
    fi
done

echo ""

# 3. Verificar Métricas
echo -e "${YELLOW}[3/4]${NC} Verificando Recolección de Métricas..."

if curl -s http://localhost:9090/api/v1/targets 2>/dev/null | grep -q "health"; then
    # Contar targets activos
    active_targets=$(curl -s http://localhost:9090/api/v1/targets 2>/dev/null | grep -o '"health":"up"' | wc -l)
    total_targets=$(curl -s http://localhost:9090/api/v1/targets 2>/dev/null | grep -o '"health":"' | wc -l)
    
    echo -e "${GREEN}  ✓ Prometheus está recolectando métricas${NC}"
    echo -e "    Targets activos: $active_targets/$total_targets"
else
    echo -e "${YELLOW}  ⚠ Esperando a que Prometheus configure targets...${NC}"
fi

echo ""

# 4. Verificar Logs
echo -e "${YELLOW}[4/4]${NC} Verificando Sistema de Logs..."

LOG_DIR="/home/impala/Documentos/Proyectos/flores-victoria/logs"

if [ -d "$LOG_DIR" ]; then
    log_count=$(ls -1 "$LOG_DIR"/*.log 2>/dev/null | wc -l)
    if [ $log_count -gt 0 ]; then
        echo -e "${GREEN}  ✓ Logs encontrados: $log_count archivos${NC}"
        echo -e "    Directorio: $LOG_DIR"
    else
        echo -e "${YELLOW}  ⚠ No hay archivos de log aún${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠ Directorio de logs no existe${NC}"
    echo -e "    Se creará al iniciar servicios"
fi

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Resumen${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

total_services=5
if [ $services_up -eq $total_services ]; then
    echo -e "${GREEN}  ✓ Sistema completamente operacional${NC}"
    echo -e "    Microservicios: ${GREEN}$services_up/$total_services UP${NC}"
elif [ $services_up -gt 0 ]; then
    echo -e "${YELLOW}  ⚠ Sistema parcialmente operacional${NC}"
    echo -e "    Microservicios: ${YELLOW}$services_up/$total_services UP${NC}"
    echo -e "    ${RED}$services_down/$total_services DOWN${NC}"
else
    echo -e "${RED}  ✗ Microservicios no iniciados${NC}"
    echo -e "    Ejecuta: ${BLUE}./start-all-services.sh${NC}"
fi

echo ""

# URLs de acceso rápido
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  URLs de Acceso${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo -e "  Monitoring Stack:"
echo -e "    • Grafana:      ${BLUE}http://localhost:3000${NC}  (admin/admin123)"
echo -e "    • Prometheus:   ${BLUE}http://localhost:9090${NC}"
echo -e "    • Alertmanager: ${BLUE}http://localhost:9093${NC}"
echo ""
echo -e "  Microservicios:"
for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    echo -e "    • $service_name: ${BLUE}http://localhost:$port${NC}"
done
echo ""
echo -e "  Endpoints de Métricas:"
for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    echo -e "    • $service_name: ${BLUE}http://localhost:$port/metrics${NC}"
done

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Comandos Útiles${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo -e "  Gestión de Servicios:"
echo -e "    ${BLUE}./start-all-services.sh${NC}   - Iniciar todos los servicios"
echo -e "    ${BLUE}./stop-all-services.sh${NC}    - Detener todos los servicios"
echo -e "    ${BLUE}./quick-status.sh${NC}         - Ver este estado"
echo ""
echo -e "  Logs:"
echo -e "    ${BLUE}tail -f logs/<servicio>.log${NC}  - Ver log en tiempo real"
echo -e "    ${BLUE}ls -lh logs/${NC}                 - Listar todos los logs"
echo ""
echo -e "  Testing:"
echo -e "    ${BLUE}cd shared && npm test${NC}         - Ejecutar tests unitarios"
echo -e "    ${BLUE}./validate-stack.sh${NC}          - Validar configuración"
echo ""
