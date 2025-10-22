#!/bin/bash

###############################################################################
# Script: web-manager.sh
# Descripción: Script maestro para gestionar todos los componentes del sitio web
# Uso: ./scripts/web-manager.sh [comando] [opciones]
###############################################################################

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directorio del proyecto
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Funciones de impresión
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Función de ayuda
show_help() {
    print_header "Gestor de Sitio Web - Flores Victoria"
    
    echo -e "${YELLOW}Uso:${NC}"
    echo "  ./scripts/web-manager.sh [comando] [opciones]"
    echo ""
    
    echo -e "${YELLOW}Comandos disponibles:${NC}"
    echo ""
    
    echo -e "${CYAN}Gestión del Panel de Administración:${NC}"
    echo "  admin:start [dev|prod]   - Inicia el panel de administración"
    echo "  admin:stop               - Detiene el panel de administración"
    echo "  admin:restart [dev|prod] - Reinicia el panel de administración"
    echo "  admin:status             - Muestra el estado del panel"
    echo "  admin:logs [follow]      - Muestra los logs del panel"
    echo ""
    
    echo -e "${CYAN}Gestión del Frontend:${NC}"
    echo "  frontend:start [dev|prod] - Inicia el frontend"
    echo "  frontend:stop             - Detiene el frontend"
    echo "  frontend:restart          - Reinicia el frontend"
    echo ""
    
    echo -e "${CYAN}Gestión de Servicios:${NC}"
    echo "  services:start [dev|prod] - Inicia todos los servicios"
    echo "  services:stop             - Detiene todos los servicios"
    echo "  services:restart          - Reinicia todos los servicios"
    echo "  services:status           - Estado de todos los servicios"
    echo ""
    
    echo -e "${CYAN}Docker:${NC}"
    echo "  docker:up [dev|prod]     - Levanta contenedores Docker"
    echo "  docker:down              - Detiene contenedores Docker"
    echo "  docker:logs [servicio]   - Muestra logs de Docker"
    echo "  docker:ps                - Lista contenedores activos"
    echo ""
    
    echo -e "${CYAN}Utilidades:${NC}"
    echo "  status                   - Estado general del sistema"
    echo "  health                   - Verifica salud de servicios"
    echo "  clean                    - Limpia archivos temporales"
    echo "  help                     - Muestra esta ayuda"
    echo ""
    
    echo -e "${YELLOW}Ejemplos:${NC}"
    echo "  ./scripts/web-manager.sh admin:start dev"
    echo "  ./scripts/web-manager.sh services:status"
    echo "  ./scripts/web-manager.sh docker:up prod"
    echo ""
}

# Función para verificar puerto
check_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Admin panel commands
admin_start() {
    local mode="${1:-dev}"
    bash "$SCRIPT_DIR/admin-start.sh" "$mode"
}

admin_stop() {
    bash "$SCRIPT_DIR/admin-stop.sh"
}

admin_restart() {
    local mode="${1:-dev}"
    bash "$SCRIPT_DIR/admin-restart.sh" "$mode"
}

admin_status() {
    bash "$SCRIPT_DIR/admin-status.sh"
}

admin_logs() {
    local mode="${1:-tail}"
    bash "$SCRIPT_DIR/admin-logs.sh" "$mode"
}

# Frontend commands
frontend_start() {
    local mode="${1:-dev}"
    print_info "Iniciando frontend en modo $mode..."
    cd "$PROJECT_DIR/frontend"
    if [ "$mode" = "prod" ]; then
        npm run build && npm run preview
    else
        npm run dev
    fi
}

frontend_stop() {
    print_info "Deteniendo frontend..."
    pkill -f "vite" || print_warning "No se encontró proceso de Vite"
}

# Services commands
services_start() {
    local mode="${1:-dev}"
    print_header "Iniciando todos los servicios en modo $mode"
    
    cd "$PROJECT_DIR"
    bash "./start-all.sh" "$mode"
}

services_stop() {
    print_header "Deteniendo todos los servicios"
    
    cd "$PROJECT_DIR"
    bash "./stop-all.sh"
}

services_restart() {
    services_stop
    sleep 2
    services_start "${1:-dev}"
}

services_status() {
    print_header "Estado de Servicios"
    
    declare -A services=(
        ["Frontend"]="5173"
        ["Admin Panel"]="3010"
        ["API Gateway"]="3000"
        ["Auth Service"]="3001"
        ["Product Service"]="3009"
    )
    
    for service in "${!services[@]}"; do
        port="${services[$service]}"
        if check_port $port; then
            print_success "$service - Puerto $port (ACTIVO)"
        else
            print_error "$service - Puerto $port (INACTIVO)"
        fi
    done
}

# Docker commands
docker_up() {
    local mode="${1:-dev}"
    print_header "Levantando contenedores Docker en modo $mode"
    
    cd "$PROJECT_DIR"
    if [ "$mode" = "prod" ]; then
        docker compose -f docker-compose.yml up -d --build
    else
        docker compose -f docker-compose.dev-simple.yml up -d --build
    fi
}

docker_down() {
    print_header "Deteniendo contenedores Docker"
    
    cd "$PROJECT_DIR"
    docker compose down
}

docker_logs() {
    local service="${1:-}"
    
    cd "$PROJECT_DIR"
    if [ -z "$service" ]; then
        docker compose logs -f
    else
        docker compose logs -f "$service"
    fi
}

docker_ps() {
    print_header "Contenedores Docker Activos"
    docker compose ps
}

# Status general
general_status() {
    print_header "Estado General del Sistema"
    
    services_status
    
    echo ""
    print_info "Verificando contenedores Docker..."
    docker compose ps 2>/dev/null || print_warning "Docker compose no disponible o no hay contenedores"
}

# Health check
health_check() {
    print_header "Verificación de Salud"
    
    declare -A endpoints=(
        ["Admin Panel"]="http://localhost:3010/health"
        ["API Gateway"]="http://localhost:3000/health"
        ["Frontend"]="http://localhost:5173"
    )
    
    for service in "${!endpoints[@]}"; do
        endpoint="${endpoints[$service]}"
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null || echo "000")
        
        if [ "$http_code" = "200" ]; then
            print_success "$service - OK ($http_code)"
        else
            print_error "$service - FAIL (HTTP $http_code)"
        fi
    done
}

# Clean
clean_temp() {
    print_header "Limpiando archivos temporales"
    
    print_info "Limpiando node_modules/.cache..."
    find "$PROJECT_DIR" -type d -name ".cache" -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    
    print_info "Limpiando archivos de log antiguos..."
    find "$PROJECT_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    print_info "Limpiando archivos de build temporales..."
    find "$PROJECT_DIR" -type d -name "dist" -o -name "build" | while read dir; do
        if [ -d "$dir" ]; then
            print_info "  Limpiando $dir"
            rm -rf "$dir"
        fi
    done
    
    print_success "Limpieza completada"
}

# Main command handler
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        # Admin panel
        admin:start)
            admin_start "$@"
            ;;
        admin:stop)
            admin_stop
            ;;
        admin:restart)
            admin_restart "$@"
            ;;
        admin:status)
            admin_status
            ;;
        admin:logs)
            admin_logs "$@"
            ;;
        
        # Frontend
        frontend:start)
            frontend_start "$@"
            ;;
        frontend:stop)
            frontend_stop
            ;;
        frontend:restart)
            frontend_stop
            sleep 2
            frontend_start "$@"
            ;;
        
        # Services
        services:start)
            services_start "$@"
            ;;
        services:stop)
            services_stop
            ;;
        services:restart)
            services_restart "$@"
            ;;
        services:status)
            services_status
            ;;
        
        # Docker
        docker:up)
            docker_up "$@"
            ;;
        docker:down)
            docker_down
            ;;
        docker:logs)
            docker_logs "$@"
            ;;
        docker:ps)
            docker_ps
            ;;
        
        # Utilities
        status)
            general_status
            ;;
        health)
            health_check
            ;;
        clean)
            clean_temp
            ;;
        help|--help|-h)
            show_help
            ;;
        
        *)
            print_error "Comando desconocido: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar comando principal
main "$@"
