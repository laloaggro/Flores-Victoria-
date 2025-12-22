#!/bin/bash
# Correlation ID Validation Script
#
# Valida que los Correlation IDs se propagan correctamente
# a través de todos los servicios
#
# Uso: bash scripts/validate-correlation-ids.sh
#

set -e

echo "🔗 Validando Correlation ID Propagation..."
echo ""

API_GATEWAY_URL="http://localhost:3000"
AUTH_SERVICE_URL="http://localhost:3001"
PRODUCT_SERVICE_URL="http://localhost:3009"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0

function test_correlation_id() {
  local test_name=$1
  local url=$2
  local method=${3:-GET}
  local data=$4
  
  test_count=$((test_count + 1))
  
  echo -n "Test $test_count: $test_name... "
  
  # Generar correlation ID
  CORRELATION_ID="test-$(date +%s%N)"
  
  # Hacer request con correlation ID
  if [ "$method" = "POST" ]; then
    response=$(curl -s -i -X POST "$url" \
      -H "X-Request-ID: $CORRELATION_ID" \
      -H "Content-Type: application/json" \
      -d "$data" 2>&1)
  else
    response=$(curl -s -i "$url" \
      -H "X-Request-ID: $CORRELATION_ID" 2>&1)
  fi
  
  # Verificar que el ID está en la respuesta
  if echo "$response" | grep -q "X-Request-ID: $CORRELATION_ID"; then
    echo -e "${GREEN}✅ PASS${NC}"
    pass_count=$((pass_count + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Respuesta: $response" | head -5
  fi
}

# Test 1: Health check propaga ID
test_correlation_id \
  "API Gateway /health propaga ID" \
  "$API_GATEWAY_URL/health"

# Test 2: Auth login propaga ID
test_correlation_id \
  "Auth Service /login propaga ID" \
  "$AUTH_SERVICE_URL/auth/login" \
  "POST" \
  '{"email":"test@example.com","password":"pass"}'

# Test 3: Product list propaga ID
test_correlation_id \
  "Product Service /products propaga ID" \
  "$PRODUCT_SERVICE_URL/products?limit=10"

# Test 4: API Gateway -> Auth Service propagación
echo -n "Test $((test_count + 1)): API Gateway -> Auth propagación... "
test_count=$((test_count + 1))

CORRELATION_ID="chain-$(date +%s%N)"

response=$(curl -s -i -X POST "$API_GATEWAY_URL/api/auth/login" \
  -H "X-Request-ID: $CORRELATION_ID" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}' 2>&1)

if echo "$response" | grep -q "X-Request-ID: $CORRELATION_ID"; then
  echo -e "${GREEN}✅ PASS${NC}"
  pass_count=$((pass_count + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 5: Verificar logs contienen correlation ID
echo -n "Test $((test_count + 1)): Logs contienen correlation ID... "
test_count=$((test_count + 1))

CORRELATION_ID="logs-$(date +%s%N)"

# Hacer request
curl -s "$API_GATEWAY_URL/health" \
  -H "X-Request-ID: $CORRELATION_ID" > /dev/null

# Esperar a que se escriban logs
sleep 1

# Verificar en logs
if docker-compose logs api-gateway | grep -q "$CORRELATION_ID"; then
  echo -e "${GREEN}✅ PASS${NC}"
  pass_count=$((pass_count + 1))
else
  echo -e "${YELLOW}⚠️  WARNING${NC} (logs pueden no incluirse)"
fi

# Test 6: Múltiples requests con IDs diferentes
echo -n "Test $((test_count + 1)): Múltiples requests con IDs distintos... "
test_count=$((test_count + 1))

ID1="multi-1-$(date +%s%N)"
ID2="multi-2-$(date +%s%N)"

response1=$(curl -s -i "$API_GATEWAY_URL/health" \
  -H "X-Request-ID: $ID1" 2>&1)

response2=$(curl -s -i "$API_GATEWAY_URL/health" \
  -H "X-Request-ID: $ID2" 2>&1)

if echo "$response1" | grep -q "X-Request-ID: $ID1" && \
   echo "$response2" | grep -q "X-Request-ID: $ID2"; then
  echo -e "${GREEN}✅ PASS${NC}"
  pass_count=$((pass_count + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 7: Default ID generado si no se envía
echo -n "Test $((test_count + 1)): ID por defecto si no se envía... "
test_count=$((test_count + 1))

response=$(curl -s -i "$API_GATEWAY_URL/health" 2>&1)

if echo "$response" | grep -q "X-Request-ID:"; then
  echo -e "${GREEN}✅ PASS${NC}"
  pass_count=$((pass_count + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Resumen
echo ""
echo "=================================="
echo "📊 Correlation ID Validation Results"
echo "=================================="
echo "Total Tests: $test_count"
echo -e "Passed: ${GREEN}$pass_count${NC}"
echo -e "Failed: ${RED}$((test_count - pass_count))${NC}"

if [ $pass_count -eq $test_count ]; then
  echo -e "\n${GREEN}✅ All tests passed!${NC}"
  echo ""
  echo "Correlation ID Propagation is working correctly:"
  echo "  ✓ IDs se incluyen en response headers"
  echo "  ✓ IDs se propagan entre servicios"
  echo "  ✓ IDs se incluyen en logs"
  echo "  ✓ Múltiples requests tiene IDs distintos"
  exit 0
else
  echo -e "\n${RED}❌ Some tests failed!${NC}"
  exit 1
fi
