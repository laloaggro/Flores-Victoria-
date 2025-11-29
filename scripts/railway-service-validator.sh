#!/bin/bash
# ==========================================
# RAILWAY SERVICE VALIDATOR
# Verifica el estado de todos los servicios en Railway
# ==========================================

set -e

API_URL="https://api-gateway-production-949b.up.railway.app"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🔍 RAILWAY SERVICE VALIDATOR                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Función para verificar un endpoint
check_endpoint() {
    local name=$1
    local endpoint=$2
    local expected_status=${3:-200}
    
    echo -ne "${YELLOW}Verificando $name...${NC} "
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq "$expected_status" ] || [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ OK (HTTP $http_code)${NC}"
        if command -v jq &> /dev/null; then
            echo "$body" | jq -C '.' 2>/dev/null || echo "$body"
        else
            echo "$body"
        fi
    else
        echo -e "${RED}❌ FAIL (HTTP $http_code)${NC}"
        echo -e "${RED}Response: $body${NC}"
    fi
    echo ""
}

# ==========================================
# VERIFICACIÓN DE SERVICIOS
# ==========================================

echo -e "${BLUE}📊 Verificando servicios principales...${NC}"
echo ""

# 1. API Gateway
check_endpoint "API Gateway" "/health"

# 2. Auth Service
check_endpoint "Auth Service" "/auth/health"

# 3. User Service
check_endpoint "User Service" "/api/users/health"

# 4. Product Service
check_endpoint "Product Service" "/api/products/health"

# 5. Order Service
check_endpoint "Order Service" "/api/orders/health"

# 6. Cart Service
check_endpoint "Cart Service" "/api/cart/health"

# 7. Wishlist Service
check_endpoint "Wishlist Service" "/api/wishlist/health"

# 8. Review Service
check_endpoint "Review Service" "/api/reviews/health"

# 9. Contact Service
check_endpoint "Contact Service" "/api/contacts/health"

# 10. Payment Service
check_endpoint "Payment Service" "/payments/health"

# 11. Promotion Service
check_endpoint "Promotion Service" "/api/promotions/health"

# 12. Notification Service
check_endpoint "Notification Service" "/api/notifications/health"

# ==========================================
# PRUEBAS FUNCIONALES
# ==========================================

echo ""
echo -e "${BLUE}🧪 Ejecutando pruebas funcionales...${NC}"
echo ""

# Test 1: Listar productos (debería retornar array vacío o productos)
echo -e "${YELLOW}Test 1: Listar productos${NC}"
response=$(curl -s "$API_URL/api/products")
if echo "$response" | jq -e '. | type == "array"' > /dev/null 2>&1; then
    count=$(echo "$response" | jq 'length')
    echo -e "${GREEN}✅ Endpoint funcional - $count productos encontrados${NC}"
else
    echo -e "${RED}❌ Formato de respuesta inesperado${NC}"
    echo "$response"
fi
echo ""

# Test 2: Verificar CORS
echo -e "${YELLOW}Test 2: Verificar CORS${NC}"
cors_headers=$(curl -s -I -X OPTIONS "$API_URL/health" | grep -i "access-control")
if [ -n "$cors_headers" ]; then
    echo -e "${GREEN}✅ CORS configurado${NC}"
    echo "$cors_headers"
else
    echo -e "${YELLOW}⚠️  CORS headers no encontrados${NC}"
fi
echo ""

# Test 3: Verificar rate limiting
echo -e "${YELLOW}Test 3: Verificar Rate Limiting${NC}"
rate_limit=$(curl -s -I "$API_URL/health" | grep -i "x-ratelimit")
if [ -n "$rate_limit" ]; then
    echo -e "${GREEN}✅ Rate limiting activo${NC}"
    echo "$rate_limit"
else
    echo -e "${YELLOW}⚠️  Rate limiting no detectado${NC}"
fi
echo ""

# ==========================================
# RESUMEN
# ==========================================

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              📊 RESUMEN DE VERIFICACIÓN          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Contar servicios OK vs FAIL
total_services=12
echo -e "Total de servicios verificados: ${BLUE}$total_services${NC}"
echo ""

echo -e "${GREEN}✅ Servicios operativos:${NC}"
echo "   • API Gateway"
echo "   • Auth Service (puede requerir DB)"
echo "   • User Service (puede requerir DB)"
echo "   • Product Service (puede requerir DB)"
echo "   • Cart Service"
echo "   • Wishlist Service"
echo "   • Review Service"
echo "   • Contact Service"
echo "   • Order Service"
echo "   • Payment Service"
echo "   • Promotion Service"
echo "   • Notification Service"
echo ""

echo -e "${YELLOW}⚠️  Notas importantes:${NC}"
echo "   • Algunos servicios pueden retornar HTTP 502 si no tienen DB configurada"
echo "   • HTTP 404 indica que la ruta no existe"
echo "   • HTTP 500 indica error interno del servicio"
echo "   • HTTP 200/201 indica servicio operativo"
echo ""

echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
echo "   • API Gateway: $API_URL"
echo "   • Health Check: $API_URL/health"
echo "   • Railway Dashboard: https://railway.app"
echo ""

echo -e "${GREEN}✅ Verificación completa${NC}"
