#!/bin/bash

# 🐳 GESTIÓN DOCKER SERVICIOS CORE - FLORES VICTORIA v3.0
# Script para gestionar servicios core con Docker Compose

echo "🐳 GESTIÓN DOCKER SERVICIOS CORE - FLORES VICTORIA v3.0"
echo "====================================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m' 
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Función para mostrar ayuda
show_help() {
    echo ""
    echo -e "${BLUE}📖 COMANDOS DISPONIBLES:${NC}"
    echo "  up        - Iniciar servicios core con Docker"
    echo "  down      - Detener servicios core"
    echo "  restart   - Reiniciar servicios core"
    echo "  status    - Ver estado de contenedores"
    echo "  logs      - Ver logs de todos los servicios"
    echo "  logs-ai   - Ver logs del AI Service"
    echo "  logs-order - Ver logs del Order Service" 
    echo "  logs-admin - Ver logs del Admin Panel"
    echo "  build     - Rebuil containers"
    echo "  clean     - Limpiar contenedores y volúmenes"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo -e "${YELLOW}💡 Ejemplos:${NC}"
    echo "  ./docker-core.sh up"
    echo "  ./docker-core.sh logs-ai"
    echo "  ./docker-core.sh status"
}

# Verificar si docker-compose está disponible
check_docker() {
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ docker-compose no está instalado${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker no está corriendo${NC}"
        exit 1
    fi
}

# Función principal
case "$1" in
    up)
        echo -e "${BLUE}🚀 Iniciando servicios core con Docker...${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml up -d
        echo ""
        echo -e "${GREEN}✅ Servicios iniciados${NC}"
    echo -e "${YELLOW}🔗 URLs disponibles:${NC}"
    echo "  - Admin Panel: http://localhost:3021"
        echo "  - AI Service: http://localhost:3002/ai/recommendations"
        echo "  - Order Service: http://localhost:3004/api/orders"
        ;;
    down)
        echo -e "${BLUE}🛑 Deteniendo servicios core...${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml down
        echo -e "${GREEN}✅ Servicios detenidos${NC}"
        ;;
    restart)
        echo -e "${BLUE}🔄 Reiniciando servicios core...${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml restart
        echo -e "${GREEN}✅ Servicios reiniciados${NC}"
        ;;
    status)
        echo -e "${BLUE}📊 Estado de contenedores:${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml ps
        ;;
    logs)
        echo -e "${BLUE}📝 Logs de todos los servicios:${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml logs -f
        ;;
    logs-ai)
        echo -e "${BLUE}🤖 Logs del AI Service:${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml logs -f ai-service
        ;;
    logs-order)
        echo -e "${BLUE}🛒 Logs del Order Service:${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml logs -f order-service
        ;;
    logs-admin)
        echo -e "${BLUE}🛡️ Logs del Admin Panel:${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml logs -f admin-panel
        ;;
    build)
        echo -e "${BLUE}🔨 Rebuilding containers...${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml build --no-cache
        echo -e "${GREEN}✅ Containers rebuilt${NC}"
        ;;
    clean)
        echo -e "${BLUE}🧹 Limpiando contenedores y volúmenes...${NC}"
        check_docker
        docker-compose -f docker-compose.core.yml down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ Limpieza completada${NC}"
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        echo -e "${YELLOW}⚠️  No se especificó ningún comando${NC}"
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando desconocido: $1${NC}"
        show_help
        exit 1
        ;;
esac