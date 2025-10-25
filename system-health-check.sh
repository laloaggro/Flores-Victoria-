#!/bin/bash

# 🏥 System Health Check - Flores Victoria v3.0
# Verifica el estado de todos los servicios y genera un reporte completo

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         🏥 Health Check - Flores Victoria v3.0          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Contadores
HEALTHY=0
UNHEALTHY=0
TOTAL=0

# Función para verificar servicio HTTP
check_http_service() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    TOTAL=$((TOTAL + 1))
    
    echo -ne "  ${BLUE}➜${NC} $name... "
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} HTTP $http_code"
        HEALTHY=$((HEALTHY + 1))
        return 0
    else
        echo -e "${RED}✗${NC} HTTP $http_code (expected $expected_code)"
        UNHEALTHY=$((UNHEALTHY + 1))
        return 1
    fi
}

# Función para verificar puerto en escucha
check_port() {
    local name=$1
    local port=$2
    
    TOTAL=$((TOTAL + 1))
    
    echo -ne "  ${BLUE}➜${NC} $name (port $port)... "
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${GREEN}✓${NC} Listening"
        HEALTHY=$((HEALTHY + 1))
        return 0
    else
        echo -e "${RED}✗${NC} Not listening"
        UNHEALTHY=$((UNHEALTHY + 1))
        return 1
    fi
}

# Función para verificar contenedor Docker
check_docker_container() {
    local name=$1
    
    TOTAL=$((TOTAL + 1))
    
    echo -ne "  ${BLUE}➜${NC} $name... "
    
    if docker ps --format '{{.Names}}' | grep -q "^$name\$" 2>/dev/null; then
        status=$(docker inspect --format='{{.State.Status}}' "$name" 2>/dev/null)
        health=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null)
        
        if [ "$status" = "running" ]; then
            if [ "$health" = "healthy" ] || [ "$health" = "<no value>" ]; then
                echo -e "${GREEN}✓${NC} Running ($health)"
                HEALTHY=$((HEALTHY + 1))
                return 0
            else
                echo -e "${YELLOW}⚠${NC} Running but unhealthy ($health)"
                UNHEALTHY=$((UNHEALTHY + 1))
                return 1
            fi
        else
            echo -e "${RED}✗${NC} Not running ($status)"
            UNHEALTHY=$((UNHEALTHY + 1))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} Container not found"
        UNHEALTHY=$((UNHEALTHY + 1))
        return 1
    fi
}

echo "📋 Verificando Servicios Core (HTTP Endpoints):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_http_service "API Gateway" "http://localhost:3000/health"
check_http_service "Admin Panel" "http://localhost:3021/health"
check_http_service "AI Service" "http://localhost:3002/health"
check_http_service "Order Service" "http://localhost:3004/health"
echo ""

echo "📋 Verificando Puertos en Escucha:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# Solo verificar puertos de servicios que no están en Docker
if ! docker ps --format '{{.Names}}' | grep -q "flores-victoria" 2>/dev/null; then
    check_port "API Gateway" 3000
    check_port "Admin Panel" 3021
    check_port "AI Service" 3002
    check_port "Order Service" 3004
    check_port "Auth Service" 3017
    check_port "Payment Service" 3018
else
    echo -e "  ${BLUE}ℹ${NC} Servicios corriendo en Docker - verificando endpoints en su lugar"
fi
echo ""

echo "📋 Verificando Contenedores Docker (si aplica):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v docker &> /dev/null; then
    check_docker_container "flores-victoria-admin-panel"
    check_docker_container "flores-victoria-ai-service"
    check_docker_container "flores-victoria-order-service"
else
    echo -e "  ${YELLOW}⚠${NC} Docker no disponible, saltando verificación"
fi
echo ""

echo "📋 Verificando Endpoints Clave:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_http_service "Gateway Status" "http://localhost:3000/api/status"
check_http_service "Admin Documentation" "http://localhost:3021/documentation.html"
check_http_service "Admin Control Center" "http://localhost:3021/control-center.html"
check_http_service "AI Recommendations" "http://localhost:3002/ai/recommendations"
check_http_service "Order List" "http://localhost:3004/api/orders"
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    📊 Resumen Final                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "  Total de verificaciones: $TOTAL"
echo -e "  ${GREEN}Saludables:${NC} $HEALTHY"
echo -e "  ${RED}No saludables:${NC} $UNHEALTHY"
echo ""

# Calcular porcentaje
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((HEALTHY * 100 / TOTAL))
    
    if [ $PERCENTAGE -eq 100 ]; then
        echo -e "  ${GREEN}✓ Sistema 100% operacional${NC} 🎉"
        exit 0
    elif [ $PERCENTAGE -ge 80 ]; then
        echo -e "  ${YELLOW}⚠ Sistema mayormente operacional ($PERCENTAGE%)${NC}"
        exit 0
    elif [ $PERCENTAGE -ge 50 ]; then
        echo -e "  ${YELLOW}⚠ Sistema parcialmente operacional ($PERCENTAGE%)${NC}"
        exit 1
    else
        echo -e "  ${RED}✗ Sistema con problemas críticos ($PERCENTAGE%)${NC}"
        exit 1
    fi
else
    echo -e "  ${RED}✗ No se pudieron realizar verificaciones${NC}"
    exit 1
fi
