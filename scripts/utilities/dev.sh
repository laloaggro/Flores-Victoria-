#!/bin/bash

# Script para gestión completa del entorno de desarrollo - Flores Victoria
# Uso: ./dev.sh [comando]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
COMPOSE_FILE="docker-compose.dev-simple.yml"
PROJECT_NAME="flores-victoria"

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}=== Flores Victoria - Gestor de Desarrollo ===${NC}"
    echo ""
    echo "Uso: ./dev.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start           - Iniciar todos los servicios de desarrollo"
    echo "  stop            - Detener todos los servicios"
    echo "  restart         - Reiniciar todos los servicios"
    echo "  rebuild         - Reconstruir e iniciar todos los servicios"
    echo "  logs [service]  - Ver logs (opcional: especificar servicio)"
    echo "  status          - Ver estado de los servicios"
    echo "  clean           - Limpiar contenedores, volúmenes e imágenes"
    echo "  test            - Ejecutar todas las pruebas"
    echo "  open            - Abrir servicios en el navegador"
    echo "  shell [service] - Abrir shell en un servicio específico"
    echo "  help            - Mostrar esta ayuda"
    echo ""
    echo "Servicios disponibles:"
    echo "  - frontend"
    echo "  - admin-panel"
    echo "  - api-gateway"
    echo "  - auth-service"
    echo "  - product-service"
    echo ""
}

# Función para iniciar servicios
start_services() {
    echo -e "${GREEN}🚀 Iniciando servicios de desarrollo...${NC}"
    docker compose -f $COMPOSE_FILE up -d
    echo -e "${GREEN}✅ Servicios iniciados correctamente${NC}"
    show_urls
}

# Función para detener servicios
stop_services() {
    echo -e "${YELLOW}⏸️  Deteniendo servicios...${NC}"
    docker compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
}

# Función para reiniciar servicios
restart_services() {
    echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
    docker compose -f $COMPOSE_FILE restart
    echo -e "${GREEN}✅ Servicios reiniciados${NC}"
}

# Función para reconstruir servicios
rebuild_services() {
    echo -e "${YELLOW}🔨 Reconstruyendo servicios...${NC}"
    docker compose -f $COMPOSE_FILE up -d --build
    echo -e "${GREEN}✅ Servicios reconstruidos e iniciados${NC}"
    show_urls
}

# Función para ver logs
view_logs() {
    if [ -z "$1" ]; then
        echo -e "${BLUE}📋 Mostrando logs de todos los servicios...${NC}"
        docker compose -f $COMPOSE_FILE logs -f
    else
        echo -e "${BLUE}📋 Mostrando logs de $1...${NC}"
        docker compose -f $COMPOSE_FILE logs -f $1
    fi
}

# Función para ver estado
show_status() {
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    docker compose -f $COMPOSE_FILE ps
}

# Función para limpiar
clean_all() {
    echo -e "${RED}🧹 Limpiando contenedores, volúmenes e imágenes...${NC}"
    read -p "¿Estás seguro? Esto eliminará todos los datos locales (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose -f $COMPOSE_FILE down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ Limpieza completada${NC}"
    else
        echo -e "${YELLOW}Operación cancelada${NC}"
    fi
}

# Función para ejecutar tests
run_tests() {
    echo -e "${BLUE}🧪 Ejecutando pruebas...${NC}"
    if [ -f "./scripts/test-full.sh" ]; then
        ./scripts/test-full.sh
    else
        echo -e "${YELLOW}⚠️  Script de pruebas no encontrado${NC}"
    fi
}

# Función para abrir servicios en navegador
open_services() {
    echo -e "${BLUE}🌐 Abriendo servicios en el navegador...${NC}"
    
    # Verificar si xdg-open está disponible (Linux)
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:5173" &
        xdg-open "http://localhost:3010" &
    # Verificar si open está disponible (macOS)
    elif command -v open &> /dev/null; then
        open "http://localhost:5173"
        open "http://localhost:3010"
    else
        echo -e "${YELLOW}⚠️  No se pudo abrir el navegador automáticamente${NC}"
        show_urls
    fi
}

# Función para abrir shell en un servicio
open_shell() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Debes especificar un servicio${NC}"
        echo "Uso: ./dev.sh shell [servicio]"
        return 1
    fi
    
    echo -e "${BLUE}🔧 Abriendo shell en $1...${NC}"
    docker compose -f $COMPOSE_FILE exec $1 /bin/sh
}

# Función para mostrar URLs
show_urls() {
    echo ""
    echo -e "${GREEN}=== Servicios Disponibles ===${NC}"
    echo -e "Frontend:      ${BLUE}http://localhost:5173${NC}"
    echo -e "Admin Panel:   ${BLUE}http://localhost:3010${NC}"
    echo -e "API Gateway:   ${BLUE}http://localhost:3000${NC}"
    echo -e "Auth Service:  ${BLUE}http://localhost:3001${NC}"
    echo -e "Product Svc:   ${BLUE}http://localhost:3009${NC}"
    echo ""
}

# Procesamiento de comandos
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    rebuild)
        rebuild_services
        ;;
    logs)
        view_logs $2
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    test)
        run_tests
        ;;
    open)
        open_services
        ;;
    shell)
        open_shell $2
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            show_help
        else
            echo -e "${RED}❌ Comando desconocido: $1${NC}"
            echo ""
            show_help
            exit 1
        fi
        ;;
esac
