#!/bin/bash

# 🧪 Script de Verificación de Endpoints - Promotion Service
# Valida que todos los endpoints del servicio de promociones funcionen correctamente

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_URL="${API_URL:-http://localhost:3000}"
PROMOTION_URL="$API_URL/api/promotions"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 Verificación de Endpoints - Promotion Service${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Contador de tests
PASSED=0
FAILED=0

# Función para verificar endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_code="$5"
    
    echo -ne "Testing: ${name}... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $http_code)"
        echo -e "${YELLOW}Response: $body${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# ID de promoción de prueba (se creará dinámicamente)
PROMO_ID=""

echo -e "${YELLOW}📝 Creando promoción de prueba...${NC}"
echo ""

# 1. POST /api/promotions - Crear nueva promoción
echo -e "${BLUE}━━━ 1. CREATE Endpoints ━━━${NC}"
create_data='{
  "code": "TEST_AUTO_'$(date +%s)'",
  "name": "Test Automation",
  "description": "Promoción de prueba automatizada",
  "type": "percentage",
  "value": 20,
  "startDate": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
  "endDate": "'$(date -u -d '+7 days' +%Y-%m-%dT%H:%M:%S.000Z)'"
}'

response=$(curl -s -X POST "$PROMOTION_URL" -H "Content-Type: application/json" -d "$create_data")
http_code=$(curl -s -w "%{http_code}" -X POST "$PROMOTION_URL" -H "Content-Type: application/json" -d "$create_data" -o /dev/null)

if [ "$http_code" -eq "201" ]; then
    echo -e "${GREEN}✓${NC} POST /api/promotions - Crear nueva"
    PROMO_ID=$(echo $response | jq -r '.promotion._id // .promotion.id')
    PROMO_CODE=$(echo $response | jq -r '.promotion.code')
    PASSED=$((PASSED + 1))
    echo -e "   ${GREEN}→ ID: $PROMO_ID${NC}"
    echo -e "   ${GREEN}→ Código: $PROMO_CODE${NC}"
else
    echo -e "${RED}✗${NC} POST /api/promotions - Crear nueva (HTTP $http_code)"
    FAILED=$((FAILED + 1))
    echo "Respuesta: $response"
fi
echo ""

# 2. READ Endpoints
echo -e "${BLUE}━━━ 2. READ Endpoints ━━━${NC}"

test_endpoint "GET /api/promotions - Listar todas" "GET" "$PROMOTION_URL" "" "200"
test_endpoint "GET /api/promotions?page=1&limit=5" "GET" "$PROMOTION_URL?page=1&limit=5" "" "200"
test_endpoint "GET /api/promotions/active" "GET" "$PROMOTION_URL/active" "" "200"

if [ -n "$PROMO_ID" ]; then
    test_endpoint "GET /api/promotions/:id - Por ID" "GET" "$PROMOTION_URL/$PROMO_ID" "" "200"
    test_endpoint "GET /api/promotions/code/:code" "GET" "$PROMOTION_URL/code/$PROMO_CODE" "" "200"
else
    echo -e "${YELLOW}⚠ Skipping ID-based tests (no promo ID)${NC}"
fi
echo ""

# 3. VALIDATE Endpoint
echo -e "${BLUE}━━━ 3. VALIDATION Endpoints ━━━${NC}"

if [ -n "$PROMO_CODE" ]; then
    validate_data='{"code": "'$PROMO_CODE'"}'
    test_endpoint "POST /api/promotions/validate - Código válido" "POST" "$PROMOTION_URL/validate" "$validate_data" "200"
    
    invalid_validate='{"code": "NOEXISTE123"}'
    test_endpoint "POST /api/promotions/validate - Código inválido" "POST" "$PROMOTION_URL/validate" "$invalid_validate" "404"
else
    echo -e "${YELLOW}⚠ Skipping validation tests (no promo code)${NC}"
fi
echo ""

# 4. UPDATE Endpoint
echo -e "${BLUE}━━━ 4. UPDATE Endpoints ━━━${NC}"

if [ -n "$PROMO_ID" ]; then
    update_data='{"name": "Test Updated", "value": 25}'
    test_endpoint "PUT /api/promotions/:id - Actualizar" "PUT" "$PROMOTION_URL/$PROMO_ID" "$update_data" "200"
else
    echo -e "${YELLOW}⚠ Skipping update tests (no promo ID)${NC}"
fi
echo ""

# 5. USE Endpoint
echo -e "${BLUE}━━━ 5. USAGE Endpoints ━━━${NC}"

if [ -n "$PROMO_ID" ]; then
    use_data='{"userId": "test_user_123"}'
    test_endpoint "POST /api/promotions/:id/use - Registrar uso" "POST" "$PROMOTION_URL/$PROMO_ID/use" "$use_data" "200"
else
    echo -e "${YELLOW}⚠ Skipping usage tests (no promo ID)${NC}"
fi
echo ""

# 6. STATS & ANALYTICS
echo -e "${BLUE}━━━ 6. ANALYTICS Endpoints ━━━${NC}"

if [ -n "$PROMO_ID" ]; then
    test_endpoint "GET /api/promotions/:id/stats" "GET" "$PROMOTION_URL/$PROMO_ID/stats" "" "200"
fi

test_endpoint "GET /api/promotions/analytics" "GET" "$PROMOTION_URL/analytics" "" "200"
echo ""

# 7. DELETE Endpoint (al final para limpiar)
echo -e "${BLUE}━━━ 7. DELETE Endpoints ━━━${NC}"

if [ -n "$PROMO_ID" ]; then
    test_endpoint "DELETE /api/promotions/:id - Eliminar" "DELETE" "$PROMOTION_URL/$PROMO_ID" "" "200"
    
    # Verificar que fue eliminada
    test_endpoint "GET eliminada (debe dar 404)" "GET" "$PROMOTION_URL/$PROMO_ID" "" "404"
else
    echo -e "${YELLOW}⚠ Skipping delete tests (no promo ID)${NC}"
fi
echo ""

# 8. BULK Operations
echo -e "${BLUE}━━━ 8. BULK Endpoints ━━━${NC}"

bulk_data='{"action": "deactivate", "ids": []}'
test_endpoint "POST /api/promotions/bulk - Operación masiva" "POST" "$PROMOTION_URL/bulk" "$bulk_data" "200"
echo ""

# Resumen
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESUMEN DE TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "✅ Tests exitosos: ${GREEN}$PASSED${NC}"
echo -e "❌ Tests fallidos:  ${RED}$FAILED${NC}"
echo -e "📈 Total:          $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 TODOS LOS TESTS PASARON EXITOSAMENTE${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}⚠️  ALGUNOS TESTS FALLARON${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
