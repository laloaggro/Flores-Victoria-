#!/bin/bash
# Health Check Mejorado - Flores Victoria v3.0
# Verifica el estado de todos los servicios críticos

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🏥 Health Check - Flores Victoria v3.0"
echo "========================================"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TOTAL=0
HEALTHY=0
UNHEALTHY=0

check_http() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"
    
    TOTAL=$((TOTAL + 1))
    
    printf "%-30s" "$name"
    
    if http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null); then
        if [ "$http_code" = "$expected_code" ]; then
            echo -e " ${GREEN}✓ OK${NC} (HTTP $http_code)"
            HEALTHY=$((HEALTHY + 1))
            return 0
        else
            echo -e " ${YELLOW}⚠ WARNING${NC} (HTTP $http_code, esperado $expected_code)"
            UNHEALTHY=$((UNHEALTHY + 1))
            return 1
        fi
    else
        echo -e " ${RED}✗ FAIL${NC} (no responde)"
        UNHEALTHY=$((UNHEALTHY + 1))
        return 1
    fi
}

check_port() {
    local name="$1"
    local port="$2"
    
    TOTAL=$((TOTAL + 1))
    
    printf "%-30s" "$name:$port"
    
    if ss -tlnp 2>/dev/null | grep -q ":$port " || lsof -i:"$port" >/dev/null 2>&1; then
        echo -e " ${GREEN}✓ LISTENING${NC}"
        HEALTHY=$((HEALTHY + 1))
        return 0
    else
        echo -e " ${RED}✗ NOT LISTENING${NC}"
        UNHEALTHY=$((UNHEALTHY + 1))
        return 1
    fi
}

check_docker() {
    local container="$1"
    
    TOTAL=$((TOTAL + 1))
    
    printf "%-30s" "Docker: $container"
    
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^$container$"; then
        local status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
        if [ "$status" = "running" ]; then
            echo -e " ${GREEN}✓ RUNNING${NC}"
            HEALTHY=$((HEALTHY + 1))
            return 0
        else
            echo -e " ${YELLOW}⚠ $status${NC}"
            UNHEALTHY=$((UNHEALTHY + 1))
            return 1
        fi
    else
        echo -e " ${RED}✗ NOT FOUND${NC}"
        UNHEALTHY=$((UNHEALTHY + 1))
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════════════

echo -e "${BLUE}📡 Servicios HTTP${NC}"
echo "──────────────────────────────"
check_http "Admin Panel Health" "http://localhost:3021/health"
check_http "Admin Control Center" "http://localhost:3021/control-center.html"
check_http "Main Site" "http://localhost:3000/" "200"

echo ""
echo -e "${BLUE}🐳 Contenedores Docker${NC}"
echo "──────────────────────────────"
check_docker "flores-victoria-admin-panel" || true
check_docker "flores-victoria-order-service" || true
check_docker "flores-victoria-grafana" || true
check_docker "flores-victoria-prometheus" || true

echo ""
echo -e "${BLUE}🔌 Servicios en Puertos${NC}"
echo "──────────────────────────────"
check_port "AI Service" 3013 || true
check_port "Auth Service" 3017 || true
check_port "Payment Service" 3018 || true
check_port "Notification Service" 3016 || true
check_port "Main Site" 3000 || true

echo ""
echo -e "${BLUE}📊 Resumen${NC}"
echo "══════════════════════════════"
echo "Total verificaciones: $TOTAL"
echo -e "Saludables: ${GREEN}$HEALTHY${NC}"
echo -e "Con problemas: ${RED}$UNHEALTHY${NC}"

# Porcentaje de salud
HEALTH_PCT=$((HEALTHY * 100 / TOTAL))
echo "Porcentaje de salud: ${HEALTH_PCT}%"

echo ""

# Exit code y mensaje basado en resultado
if [ $UNHEALTHY -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los servicios están funcionando correctamente${NC}"
    exit 0
elif [ $HEALTH_PCT -ge 70 ]; then
    echo -e "${YELLOW}⚠️  Algunos servicios tienen problemas (${HEALTH_PCT}% saludable)${NC}"
    echo "Ejecuta 'npm run ports:status' para más detalles"
    exit 1
else
    echo -e "${RED}❌ Múltiples servicios críticos tienen problemas (${HEALTH_PCT}% saludable)${NC}"
    echo "Ejecuta 'npm run ports:dashboard' para diagnóstico completo"
    exit 2
fi
