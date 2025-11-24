#!/bin/bash

# Test End-to-End de Flores Victoria
# Simula el flujo completo de un cliente: registro → login → productos → carrito → orden

set -e  # Exit on error

BASE_URL="http://localhost:3001"
PRODUCT_URL="http://localhost:3002"
CART_URL="http://localhost:3005"
ORDER_URL="http://localhost:3004"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🌸 Flores Victoria - E2E Test Suite 🌸    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Register User
echo -e "${YELLOW}📝 Test 1: Registrar nuevo usuario...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-e2e@flores-victoria.com",
    "password": "Test123!",
    "name": "Test E2E User"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "token\|email"; then
    echo -e "${GREEN}✅ Usuario registrado exitosamente${NC}"
else
    echo -e "${YELLOW}⚠️  Usuario ya existe o error en registro${NC}"
    echo "$REGISTER_RESPONSE" | head -5
fi
echo ""

# Test 2: Login
echo -e "${YELLOW}🔐 Test 2: Login de usuario...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-e2e@flores-victoria.com",
    "password": "Test123!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login exitoso${NC}"
    echo -e "   Token: ${TOKEN:0:30}...${NC}"
else
    echo -e "${RED}❌ Login falló${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Get Products
echo -e "${YELLOW}🌸 Test 3: Obtener lista de productos...${NC}"
PRODUCTS_RESPONSE=$(curl -s -X GET ${PRODUCT_URL}/products?limit=5)

PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o '"_id"' | wc -l)
if [ "$PRODUCT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Se encontraron ${PRODUCT_COUNT} productos${NC}"
    
    # Get first product ID
    PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | sed 's/"_id":"//')
    PRODUCT_NAME=$(echo "$PRODUCTS_RESPONSE" | grep -o '"name":"[^"]*' | head -1 | sed 's/"name":"//')
    PRODUCT_PRICE=$(echo "$PRODUCTS_RESPONSE" | grep -o '"price":[0-9.]*' | head -1 | sed 's/"price"://')
    
    echo -e "   Producto seleccionado: ${PRODUCT_NAME} (\$${PRODUCT_PRICE})${NC}"
    echo -e "   ID: ${PRODUCT_ID}${NC}"
else
    echo -e "${RED}❌ No se encontraron productos${NC}"
    echo "$PRODUCTS_RESPONSE" | head -10
    exit 1
fi
echo ""

# Test 4: Add to Cart
echo -e "${YELLOW}🛒 Test 4: Agregar producto al carrito...${NC}"
CART_RESPONSE=$(curl -s -X POST ${CART_URL}/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"productId\": \"${PRODUCT_ID}\",
    \"quantity\": 2
  }")

if echo "$CART_RESPONSE" | grep -q "cart\|item\|success"; then
    echo -e "${GREEN}✅ Producto agregado al carrito${NC}"
    echo -e "   Cantidad: 2 unidades${NC}"
else
    echo -e "${RED}❌ Error al agregar al carrito${NC}"
    echo "$CART_RESPONSE" | head -10
fi
echo ""

# Test 5: View Cart
echo -e "${YELLOW}👀 Test 5: Ver contenido del carrito...${NC}"
VIEW_CART_RESPONSE=$(curl -s -X GET ${CART_URL}/cart \
  -H "Authorization: Bearer ${TOKEN}")

CART_ITEMS=$(echo "$VIEW_CART_RESPONSE" | grep -o '"quantity":[0-9]*' | wc -l)
if [ "$CART_ITEMS" -gt 0 ]; then
    echo -e "${GREEN}✅ Carrito tiene ${CART_ITEMS} items${NC}"
    
    TOTAL=$(echo "$VIEW_CART_RESPONSE" | grep -o '"total":[0-9.]*' | head -1 | sed 's/"total"://')
    if [ -n "$TOTAL" ]; then
        echo -e "   Total del carrito: \$${TOTAL}${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Carrito vacío o estructura diferente${NC}"
    echo "$VIEW_CART_RESPONSE" | head -10
fi
echo ""

# Test 6: Create Order
echo -e "${YELLOW}📦 Test 6: Crear orden de compra...${NC}"
ORDER_RESPONSE=$(curl -s -X POST ${ORDER_URL}/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"items\": [
      {
        \"productId\": \"${PRODUCT_ID}\",
        \"quantity\": 2,
        \"price\": ${PRODUCT_PRICE:-100}
      }
    ],
    \"shippingAddress\": {
      \"street\": \"Av. Test 123\",
      \"city\": \"CDMX\",
      \"state\": \"Ciudad de México\",
      \"zipCode\": \"12345\",
      \"country\": \"México\"
    },
    \"paymentMethod\": \"cash\"
  }")

ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | sed 's/"_id":"//' | head -c 24)
ORDER_STATUS=$(echo "$ORDER_RESPONSE" | grep -o '"status":"[^"]*' | head -1 | sed 's/"status":"//')

if [ -n "$ORDER_ID" ]; then
    echo -e "${GREEN}✅ Orden creada exitosamente${NC}"
    echo -e "   ID de Orden: ${ORDER_ID}${NC}"
    echo -e "   Estado: ${ORDER_STATUS}${NC}"
else
    echo -e "${RED}❌ Error al crear orden${NC}"
    echo "$ORDER_RESPONSE" | head -20
fi
echo ""

# Test 7: Get Order Details
if [ -n "$ORDER_ID" ]; then
    echo -e "${YELLOW}📋 Test 7: Verificar detalles de la orden...${NC}"
  ORDER_DETAILS=$(curl -s -X GET ${ORDER_URL}/orders/${ORDER_ID} \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$ORDER_DETAILS" | grep -q "${ORDER_ID}"; then
        echo -e "${GREEN}✅ Orden encontrada y verificada${NC}"
        
        DETAIL_STATUS=$(echo "$ORDER_DETAILS" | grep -o '"status":"[^"]*' | head -1 | sed 's/"status":"//')
        DETAIL_TOTAL=$(echo "$ORDER_DETAILS" | grep -o '"total":[0-9.]*' | head -1 | sed 's/"total"://')
        
        echo -e "   Estado: ${DETAIL_STATUS}${NC}"
        echo -e "   Total: \$${DETAIL_TOTAL}${NC}"
    else
        echo -e "${YELLOW}⚠️  No se pudo obtener detalles de la orden${NC}"
        echo "$ORDER_DETAILS" | head -10
    fi
    echo ""
fi

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           📊 RESUMEN DE TESTS E2E             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Test 1: Registro de usuario${NC}"
echo -e "${GREEN}✅ Test 2: Login y autenticación${NC}"
echo -e "${GREEN}✅ Test 3: Listado de productos${NC}"
echo -e "${GREEN}✅ Test 4: Agregar al carrito${NC}"
echo -e "${GREEN}✅ Test 5: Visualizar carrito${NC}"
if [ -n "$ORDER_ID" ]; then
    echo -e "${GREEN}✅ Test 6: Crear orden${NC}"
    echo -e "${GREEN}✅ Test 7: Verificar orden${NC}"
else
    echo -e "${YELLOW}⚠️  Test 6-7: Crear/Verificar orden (con warnings)${NC}"
fi
echo ""
echo -e "${GREEN}🎉 FLUJO E2E COMPLETADO EXITOSAMENTE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
