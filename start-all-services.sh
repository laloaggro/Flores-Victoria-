#!/bin/bash

#############################################
# Script para iniciar todos los servicios
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

# Crear directorio de logs si no existe
mkdir -p "$LOG_DIR"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Iniciando todos los servicios${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Array de servicios
declare -a SERVICES=(
    "cart-service:3001"
    "product-service:3002"
    "auth-service:3003"
    "user-service:3004"
    "order-service:3005"
)

# Función para iniciar un servicio
start_service() {
    local service_name=$1
    local port=$2
    local service_path="$PROJECT_ROOT/microservices/$service_name"
    
    echo -e "${YELLOW}[INFO]${NC} Iniciando $service_name en puerto $port..."
    
    # Verificar que existe el directorio
    if [ ! -d "$service_path" ]; then
        echo -e "${RED}[ERROR]${NC} No existe el directorio: $service_path"
        return 1
    fi
    
    # Verificar que existe package.json
    if [ ! -f "$service_path/package.json" ]; then
        echo -e "${RED}[ERROR]${NC} No existe package.json en: $service_path"
        return 1
    fi
    
    # Verificar si el puerto está ocupado
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}[WARN]${NC} Puerto $port ya está en uso, deteniendo proceso anterior..."
        kill -9 $(lsof -t -i:$port) 2>/dev/null || true
        sleep 2
    fi
    
    # Iniciar el servicio
    cd "$service_path" || return 1
    
    # Verificar node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}[WARN]${NC} No existe node_modules, ejecutando npm install..."
        npm install > "$LOG_DIR/${service_name}-install.log" 2>&1
    fi
    
    # Iniciar el servicio en background
    PORT=$port npm start > "$LOG_DIR/${service_name}.log" 2>&1 &
    local pid=$!
    
    echo "$pid" > "$LOG_DIR/${service_name}.pid"
    
    # Esperar un momento y verificar que sigue corriendo
    sleep 3
    
    if ps -p $pid > /dev/null; then
        echo -e "${GREEN}[OK]${NC} $service_name iniciado (PID: $pid) - Puerto: $port"
        echo -e "      Log: $LOG_DIR/${service_name}.log"
        return 0
    else
        echo -e "${RED}[ERROR]${NC} $service_name falló al iniciar"
        echo -e "      Ver log: $LOG_DIR/${service_name}.log"
        return 1
    fi
}

# Función para verificar el stack de monitoring
check_monitoring() {
    echo ""
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  Verificando Stack de Monitoring${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    
    cd "$PROJECT_ROOT" || exit 1
    
    if ! docker-compose -f docker-compose.monitoring.yml ps | grep -q "Up"; then
        echo -e "${YELLOW}[WARN]${NC} Stack de monitoring no está corriendo"
        echo -e "${YELLOW}[INFO]${NC} Iniciando stack de monitoring..."
        docker-compose -f docker-compose.monitoring.yml up -d
        sleep 5
    fi
    
    # Verificar servicios de monitoring
    echo -e "${GREEN}[INFO]${NC} Estado del stack de monitoring:"
    docker-compose -f docker-compose.monitoring.yml ps
    
    echo ""
    echo -e "${GREEN}[INFO]${NC} URLs de acceso:"
    echo -e "  • Grafana:      ${BLUE}http://localhost:3000${NC} (admin/admin123)"
    echo -e "  • Prometheus:   ${BLUE}http://localhost:9090${NC}"
    echo -e "  • Alertmanager: ${BLUE}http://localhost:9093${NC}"
}

# Función para mostrar estado de servicios
show_status() {
    echo ""
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  Estado de todos los servicios${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r service_name port <<< "$service_info"
        
        if [ -f "$LOG_DIR/${service_name}.pid" ]; then
            pid=$(cat "$LOG_DIR/${service_name}.pid")
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${GREEN}✓${NC} $service_name (PID: $pid) - http://localhost:$port"
            else
                echo -e "${RED}✗${NC} $service_name (detenido)"
            fi
        else
            echo -e "${RED}✗${NC} $service_name (no iniciado)"
        fi
    done
    
    echo ""
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  Endpoints de métricas${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r service_name port <<< "$service_info"
        echo -e "  • $service_name: ${BLUE}http://localhost:$port/metrics${NC}"
    done
}

# Función principal
main() {
    local failed=0
    
    # Verificar monitoring primero
    check_monitoring
    
    echo ""
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  Iniciando microservicios${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    
    # Iniciar cada servicio
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r service_name port <<< "$service_info"
        
        if ! start_service "$service_name" "$port"; then
            failed=$((failed + 1))
        fi
        
        echo ""
    done
    
    # Mostrar estado final
    show_status
    
    echo ""
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS]${NC} Todos los servicios iniciados correctamente"
        echo ""
        echo -e "${YELLOW}[INFO]${NC} Para detener todos los servicios, ejecuta:"
        echo -e "       ./stop-all-services.sh"
        echo ""
        echo -e "${YELLOW}[INFO]${NC} Para ver logs en tiempo real:"
        echo -e "       tail -f $LOG_DIR/<servicio>.log"
        echo ""
        return 0
    else
        echo -e "${RED}[ERROR]${NC} $failed servicio(s) fallaron al iniciar"
        echo -e "${YELLOW}[INFO]${NC} Revisa los logs en: $LOG_DIR/"
        echo ""
        return 1
    fi
}

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_ROOT" ]; then
    echo -e "${RED}[ERROR]${NC} No existe el directorio del proyecto: $PROJECT_ROOT"
    exit 1
fi

# Ejecutar función principal
main

# Guardar código de salida
exit_code=$?

# Si todo está OK, mostrar mensaje de siguiente paso
if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}  Sistema listo para usar${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo -e "Próximos pasos:"
    echo -e "  1. Abre Grafana: ${BLUE}http://localhost:3000${NC}"
    echo -e "  2. Genera tráfico de prueba a los servicios"
    echo -e "  3. Verifica las métricas en Prometheus: ${BLUE}http://localhost:9090${NC}"
    echo -e "  4. Revisa los dashboards en Grafana"
    echo ""
fi

exit $exit_code
