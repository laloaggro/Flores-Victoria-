#!/bin/bash
# Railway Health Check Script
# Verifica el estado de todos los servicios desplegados

set -e

echo "🚀 Railway Services Health Check"
echo "================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Servicios a verificar
declare -A SERVICES=(
    ["API Gateway"]="https://api-gateway-production-b02f.up.railway.app/health"
    ["Auth Service"]="https://auth-service-production-ab8c.up.railway.app/health"
    ["Product Service"]="https://product-service-production-089c.up.railway.app/health"
    ["Order Service"]="https://order-service-production-29eb.up.railway.app/health"
    ["Cart Service"]="https://cart-service-production-73f6.up.railway.app/health"
    ["User Service"]="https://user-service-production-9ff7.up.railway.app/health"
    ["Payment Service"]="https://payment-service-production-c6e0.up.railway.app/health"
    ["Admin Dashboard"]="https://admin-dashboard-service-production.up.railway.app/"
    ["Frontend"]="https://frontend-v2-production-7508.up.railway.app/"
)

check_service() {
    local name=$1
    local url=$2
    
    # Timeout de 10 segundos
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if [ "$response" == "200" ]; then
        echo -e "  ${GREEN}✓${NC} $name - OK (HTTP $response)"
        return 0
    elif [ "$response" == "000" ]; then
        echo -e "  ${RED}✗${NC} $name - TIMEOUT/ERROR"
        return 1
    else
        echo -e "  ${YELLOW}⚠${NC} $name - HTTP $response"
        return 1
    fi
}

echo "Verificando servicios..."
echo ""

healthy=0
unhealthy=0

for name in "${!SERVICES[@]}"; do
    if check_service "$name" "${SERVICES[$name]}"; then
        ((healthy++))
    else
        ((unhealthy++))
    fi
done

echo ""
echo "================================="
echo -e "Total: ${GREEN}$healthy OK${NC}, ${RED}$unhealthy Fallidos${NC}"
echo ""

# Railway CLI check
if command -v railway &> /dev/null; then
    echo "📋 Railway CLI Info:"
    railway whoami 2>/dev/null || echo "  No autenticado"
    railway status 2>/dev/null || echo "  Sin proyecto vinculado"
fi
