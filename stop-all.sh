#!/bin/bash

# 🛑 Stop All Services Script - Flores Victoria v3.0
# Detiene todos los servicios (Docker + procesos Node locales)

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║      🛑 Deteniendo Flores Victoria v3.0                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

STOPPED=0

echo "📦 Deteniendo contenedores Docker..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Detener Docker Compose core
if [ -f "docker-compose.core.yml" ]; then
    if docker-compose -f docker-compose.core.yml ps -q 2>/dev/null | grep -q .; then
        echo -ne "${BLUE}[INFO]${NC} Deteniendo docker-compose.core.yml... "
        docker-compose -f docker-compose.core.yml down > /dev/null 2>&1
        echo -e "${GREEN}[OK]${NC}"
        STOPPED=$((STOPPED + 1))
    else
        echo -e "${YELLOW}[SKIP]${NC} docker-compose.core.yml no tiene contenedores activos"
    fi
fi

# Detener Docker Compose principal
if [ -f "docker-compose.yml" ]; then
    if docker-compose ps -q 2>/dev/null | grep -q .; then
        echo -ne "${BLUE}[INFO]${NC} Deteniendo docker-compose.yml... "
        docker-compose down > /dev/null 2>&1
        echo -e "${GREEN}[OK]${NC}"
        STOPPED=$((STOPPED + 1))
    else
        echo -e "${YELLOW}[SKIP]${NC} docker-compose.yml no tiene contenedores activos"
    fi
fi

echo ""
echo "🔧 Deteniendo procesos Node.js..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Lista de servicios Node a detener
SERVICES=(
    "api-gateway.js"
    "auth-service.js"
    "payment-service.js"
    "notification-service.js"
    "ai-service.js"
    "ai-simple.js"
    "ai-service-standalone.js"
    "order-service.js"
    "order-service-simple.js"
    "admin-panel/server.js"
)

for service in "${SERVICES[@]}"; do
    # Buscar PIDs del servicio
    pids=$(pgrep -f "$service" 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo -ne "${BLUE}[INFO]${NC} Deteniendo $service (PIDs: $pids)... "
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 0.5
        
        # Verificar que se detuvo
        if ! pgrep -f "$service" > /dev/null 2>&1; then
            echo -e "${GREEN}[OK]${NC}"
            STOPPED=$((STOPPED + 1))
        else
            echo -e "${RED}[ERROR]${NC} No se pudo detener"
        fi
    else
        echo -e "${YELLOW}[SKIP]${NC} $service no está corriendo"
    fi
done

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  ✅ Servicios Detenidos                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "  Total de servicios detenidos: ${GREEN}$STOPPED${NC}"
echo ""
echo "📝 Para reiniciar el sistema:"
echo "   ./quick-start.sh       # Modo desarrollo local"
echo "   ./docker-core.sh up    # Modo Docker"
echo ""