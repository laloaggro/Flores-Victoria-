#!/bin/bash

# Script para verificar el estado de todos los microservicios en Railway
# Uso: ./scripts/railway-health-check.sh

set -e

BASE_URL="https://api-gateway-production-949b.up.railway.app"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "════════════════════════════════════════════════════════"
echo "🔍 Health Check - Flores Victoria Microservices"
echo "════════════════════════════════════════════════════════"
echo ""

# Función para verificar un endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Verificando ${name}... "
    
    response=$(curl -s -w "\n%{http_code}" "${url}" 2>&1)
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
        # Mostrar información adicional si existe
        if command -v jq &> /dev/null; then
            status=$(echo "$body" | jq -r '.status // empty' 2>/dev/null)
            service=$(echo "$body" | jq -r '.service // empty' 2>/dev/null)
            if [ -n "$status" ] && [ -n "$service" ]; then
                echo "  ↳ Status: $status | Service: $service"
            fi
        fi
        return 0
    else
        echo -e "${RED}✗ ERROR${NC} (HTTP $http_code)"
        if command -v jq &> /dev/null; then
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        else
            echo "$body"
        fi
        return 1
    fi
}

# Contador de servicios
total=0
success=0
failed=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 API Gateway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 1))
if check_endpoint "API Gateway Health" "${BASE_URL}/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 Authentication Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 3))
if check_endpoint "Auth Health" "${BASE_URL}/auth/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
if check_endpoint "Auth Ready" "${BASE_URL}/auth/ready"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
if check_endpoint "Auth Live" "${BASE_URL}/auth/live"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 User Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 3))
if check_endpoint "Users Health" "${BASE_URL}/api/users/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
if check_endpoint "Users Ready" "${BASE_URL}/api/users/ready"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
if check_endpoint "Users Live" "${BASE_URL}/api/users/live"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 Product Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 3))
if check_endpoint "Products Health" "${BASE_URL}/api/products/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
if check_endpoint "Products Ready" "${BASE_URL}/api/products/ready"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
if check_endpoint "Products Live" "${BASE_URL}/api/products/live"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 Order Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 1))
if check_endpoint "Orders Health" "${BASE_URL}/api/orders/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 Cart Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 1))
if check_endpoint "Cart Health" "${BASE_URL}/api/cart/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 Wishlist Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 1))
if check_endpoint "Wishlist Health" "${BASE_URL}/api/wishlist/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 Review Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 1))
if check_endpoint "Reviews Health" "${BASE_URL}/api/reviews/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 Contact Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 1))
if check_endpoint "Contacts Health" "${BASE_URL}/api/contacts/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 Payment Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 1))
if check_endpoint "Payments Health" "${BASE_URL}/payments/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 Promotion Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$((total + 1))
if check_endpoint "Promotions Health" "${BASE_URL}/api/promotions/health"; then
    success=$((success + 1))
else
    failed=$((failed + 1))
fi
echo ""

echo "════════════════════════════════════════════════════════"
echo "📊 Resumen"
echo "════════════════════════════════════════════════════════"
echo -e "Total de checks: ${BLUE}${total}${NC}"
echo -e "Exitosos: ${GREEN}${success}${NC}"
echo -e "Fallidos: ${RED}${failed}${NC}"
percentage=$((success * 100 / total))
echo -e "Porcentaje de éxito: ${BLUE}${percentage}%${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los servicios están funcionando correctamente${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Algunos servicios presentan problemas${NC}"
    echo ""
    echo "Revisa:"
    echo "  1. Variables de entorno en Railway (DATABASE_URL, MONGODB_URI, etc.)"
    echo "  2. Logs de servicios: railway logs -s <SERVICE-NAME>"
    echo "  3. Estado de bases de datos (PostgreSQL, MongoDB)"
    echo ""
    echo "Consulta: RAILWAY_ENVIRONMENT_VARS_COMPLETE.md"
    exit 1
fi
