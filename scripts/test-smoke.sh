#!/bin/bash
# Script de smoke test rápido para validar servicios y frontend

set -e

GATEWAY="http://localhost:3000"
FRONTEND="http://localhost:5173"

echo "🔍 Smoke Test - Flores Victoria"
echo "================================"
echo ""

# Health checks
echo "✓ Health checks:"
curl -sf "$GATEWAY/api/auth/health" > /dev/null && echo "  ✓ Auth service OK" || echo "  ✗ Auth service FAIL"
curl -sf "$GATEWAY/api/products/health" > /dev/null && echo "  ✓ Product service OK" || echo "  ✗ Product service FAIL"

# Productos
echo ""
echo "✓ Endpoints de datos:"
PRODUCTS=$(curl -sf "$GATEWAY/api/products" | jq -r 'length')
echo "  ✓ Products: $PRODUCTS items"

# Login test
echo ""
echo "✓ Auth flow (admin):"
LOGIN_RESPONSE=$(curl -sf -X POST "$GATEWAY/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flores.local","password":"admin123"}' 2>/dev/null || echo '{}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')
if [ -n "$TOKEN" ]; then
  echo "  ✓ Login OK - Token: ${TOKEN:0:20}..."
  
  # Profile test
  PROFILE=$(curl -sf "$GATEWAY/api/auth/profile" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.data.user.role // empty')
  echo "  ✓ Profile OK - Role: $PROFILE"
else
  echo "  ✗ Login FAIL"
fi

# Frontend
echo ""
echo "✓ Frontend:"
curl -sf "$FRONTEND" > /dev/null && echo "  ✓ Index page loads" || echo "  ✗ Index page FAIL"
curl -sf "$FRONTEND/pages/products.html" > /dev/null && echo "  ✓ Products page loads" || echo "  ✗ Products page FAIL"
curl -sf "$FRONTEND/pages/login.html" > /dev/null && echo "  ✓ Login page loads" || echo "  ✗ Login page FAIL"

# Archivos estáticos clave
echo ""
echo "✓ Assets:"
curl -sf "$FRONTEND/js/main.js" > /dev/null && echo "  ✓ main.js" || echo "  ✗ main.js FAIL"
curl -sf "$FRONTEND/css/style.css" > /dev/null && echo "  ✓ style.css" || echo "  ✗ style.css FAIL"
curl -sf "$FRONTEND/js/config/api.js" > /dev/null && echo "  ✓ api.js" || echo "  ✗ api.js FAIL"
curl -sf "$FRONTEND/js/utils/httpClient.js" > /dev/null && echo "  ✓ httpClient.js" || echo "  ✗ httpClient.js FAIL"

echo ""
echo "================================"
echo "✓ Smoke test completo"
echo ""
echo "URLs rápidas:"
echo "  Frontend: $FRONTEND"
echo "  Login:    $FRONTEND/pages/login.html"
echo "  Products: $FRONTEND/pages/products.html"
