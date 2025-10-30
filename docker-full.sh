#!/bin/bash

# Script para iniciar stack completo con Docker Compose
# Flores Victoria - Sistema Unificado

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🚀 FLORES VICTORIA - DOCKER COMPOSE FULL 🚀            ║"
echo "║                Sistema Completo Dockerizado                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Por favor inicia Docker primero.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está corriendo${NC}"
echo ""

# Verificar archivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No se encontró .env, creando uno por defecto...${NC}"
    cat > .env << EOF
# JWT Secret
JWT_SECRET=wwgbBGyiCXE5ohx8wcZGMe6EqVoCZPNDhMWuOzQ4fxE=

# Environment
NODE_ENV=production
EOF
    echo -e "${GREEN}✅ .env creado${NC}"
fi
echo ""

# Modo de operación
MODE=${1:-"up"}

case $MODE in
    "up")
        echo -e "${BLUE}📦 Iniciando servicios...${NC}"
        docker compose -f docker-compose.full.yml up -d
        echo ""
        
        echo -e "${BLUE}⏳ Esperando a que los servicios estén listos (30s)...${NC}"
        sleep 30
        echo ""
        
        echo "╔════════════════════════════════════════════════════════════════╗"
        echo "║                    🎯 ESTADO DE SERVICIOS                      ║"
        echo "╚════════════════════════════════════════════════════════════════╝"
        echo ""
        
        # Verificar servicios
        services=("cart:3001" "product:3002" "auth:3003" "user:3004" "order:3005")
        
        printf "%-20s %-10s %s\n" "Servicio" "Puerto" "Estado"
        printf "%-20s %-10s %s\n" "--------------------" "------" "------"
        
        for service in "${services[@]}"; do
            name="${service%%:*}"
            port="${service##*:}"
            
            if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
                printf "%-20s %-10s ${GREEN}%s${NC}\n" "$name-service" "$port" "✅ HEALTHY"
            else
                printf "%-20s %-10s ${RED}%s${NC}\n" "$name-service" "$port" "❌ DOWN"
            fi
        done
        
        echo ""
        echo "╔════════════════════════════════════════════════════════════════╗"
        echo "║                    📊 MONITORING STACK                         ║"
        echo "╚════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "  📈 Prometheus:    http://localhost:9090"
        echo "  📊 Grafana:       http://localhost:3000 (admin/admin123)"
        echo "  🔔 Alertmanager:  http://localhost:9093"
        echo ""
        
        echo "╔════════════════════════════════════════════════════════════════╗"
        echo "║                      💾 BASES DE DATOS                         ║"
        echo "╚════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "  🍃 MongoDB:       localhost:27017 (admin/admin123)"
        echo "  🐘 PostgreSQL:    localhost:5432 (flores_user/flores_pass)"
        echo "  🔴 Redis:         localhost:6379"
        echo ""
        ;;
        
    "down")
        echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
        docker compose -f docker-compose.full.yml down
        echo -e "${GREEN}✅ Servicios detenidos${NC}"
        ;;
        
    "restart")
        echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
        docker compose -f docker-compose.full.yml restart
        echo -e "${GREEN}✅ Servicios reiniciados${NC}"
        ;;
        
    "logs")
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            docker compose -f docker-compose.full.yml logs -f --tail=100
        else
            docker compose -f docker-compose.full.yml logs -f --tail=100 "$SERVICE"
        fi
        ;;
        
    "ps")
        docker compose -f docker-compose.full.yml ps
        ;;
        
    "clean")
        echo -e "${RED}⚠️  Eliminando volúmenes y contenedores...${NC}"
        read -p "¿Estás seguro? Esto eliminará todos los datos (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose -f docker-compose.full.yml down -v
            echo -e "${GREEN}✅ Sistema limpiado${NC}"
        fi
        ;;
        
    *)
        echo "Uso: $0 {up|down|restart|logs|ps|clean}"
        echo ""
        echo "Comandos:"
        echo "  up       - Iniciar todos los servicios"
        echo "  down     - Detener todos los servicios"
        echo "  restart  - Reiniciar todos los servicios"
        echo "  logs     - Ver logs (opcional: logs <servicio>)"
        echo "  ps       - Mostrar estado de contenedores"
        echo "  clean    - Eliminar todo (incluye volúmenes)"
        exit 1
        ;;
esac
