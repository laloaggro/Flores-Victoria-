#!/bin/bash

#############################################
# Script para detener todos los servicios
# Autor: Sistema de Observabilidad v2.0.0
# Fecha: 2024-10-29
#############################################

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="/home/impala/Documentos/Proyectos/flores-victoria"
LOG_DIR="$PROJECT_ROOT/logs"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Deteniendo todos los servicios${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Array de servicios
declare -a SERVICES=(
    "cart-service"
    "product-service"
    "auth-service"
    "user-service"
    "order-service"
)

stopped=0
failed=0

# Detener cada servicio
for service_name in "${SERVICES[@]}"; do
    if [ -f "$LOG_DIR/${service_name}.pid" ]; then
        pid=$(cat "$LOG_DIR/${service_name}.pid")
        
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}[INFO]${NC} Deteniendo $service_name (PID: $pid)..."
            kill -15 $pid 2>/dev/null
            
            # Esperar un momento
            sleep 2
            
            # Verificar si se detuvo
            if ! ps -p $pid > /dev/null 2>&1; then
                echo -e "${GREEN}[OK]${NC} $service_name detenido"
                rm "$LOG_DIR/${service_name}.pid"
                stopped=$((stopped + 1))
            else
                echo -e "${YELLOW}[WARN]${NC} Forzando cierre de $service_name..."
                kill -9 $pid 2>/dev/null
                rm "$LOG_DIR/${service_name}.pid"
                stopped=$((stopped + 1))
            fi
        else
            echo -e "${YELLOW}[WARN]${NC} $service_name ya estaba detenido"
            rm "$LOG_DIR/${service_name}.pid"
        fi
    else
        echo -e "${YELLOW}[WARN]${NC} No se encontró PID para $service_name"
    fi
done

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Deteniendo Stack de Monitoring${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

cd "$PROJECT_ROOT" || exit 1

if docker-compose -f docker-compose.monitoring.yml ps | grep -q "Up"; then
    echo -e "${YELLOW}[INFO]${NC} Deteniendo contenedores de monitoring..."
    docker-compose -f docker-compose.monitoring.yml down
    echo -e "${GREEN}[OK]${NC} Stack de monitoring detenido"
else
    echo -e "${YELLOW}[INFO]${NC} Stack de monitoring ya estaba detenido"
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Resumen${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "  Servicios detenidos: $stopped"
echo -e "  Stack de monitoring: detenido"
echo ""
echo -e "${YELLOW}[INFO]${NC} Logs conservados en: $LOG_DIR/"
echo -e "${YELLOW}[INFO]${NC} Para iniciar nuevamente: ./start-all-services.sh"
echo ""
