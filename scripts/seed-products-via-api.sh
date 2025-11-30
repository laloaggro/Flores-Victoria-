#!/bin/bash
# Script para inicializar productos en MongoDB vía product-service API
# Ejecutar cuando product-service esté desplegado

PRODUCT_SERVICE_URL="${PRODUCT_SERVICE_URL:-https://product-service-production.up.railway.app}"
PRODUCTS_FILE="frontend/public/assets/mock/products.json"

echo "🚀 Iniciando carga de productos a MongoDB..."
echo "📍 URL del servicio: $PRODUCT_SERVICE_URL"
echo ""

# Verificar que el servicio esté disponible
echo "🔍 Verificando disponibilidad del servicio..."
if ! curl -f -s "${PRODUCT_SERVICE_URL}/health" > /dev/null 2>&1; then
  echo "❌ product-service no está disponible"
  echo "   Verifica que el servicio esté desplegado en Railway"
  exit 1
fi

echo "✅ Servicio disponible"
echo ""

# Leer productos del JSON
PRODUCTS=$(cat "$PRODUCTS_FILE")
TOTAL=$(echo "$PRODUCTS" | jq 'length')

echo "📦 Encontrados $TOTAL productos para cargar"
echo ""

# Contador
SUCCESS=0
FAILED=0

# Iterar sobre cada producto
echo "$PRODUCTS" | jq -c '.[]' | while read -r product; do
  # Extraer datos
  NAME=$(echo "$product" | jq -r '.name')
  ID=$(echo "$product" | jq -r '.id')
  
  # Transformar al formato esperado por el servicio
  SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
  
  BODY=$(echo "$product" | jq --arg slug "$SLUG" '{
    name: .name,
    slug: $slug,
    description: .description,
    price: .price,
    category: .category,
    images: [.image_url],
    stock: (.stock // 10),
    featured: (.featured // false),
    active: true
  }')
  
  # Enviar POST request
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "${PRODUCT_SERVICE_URL}/api/products" \
    -H "Content-Type: application/json" \
    -d "$BODY")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  
  if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ [$ID] $NAME"
    ((SUCCESS++))
  else
    echo "❌ [$ID] $NAME (HTTP $HTTP_CODE)"
    ((FAILED++))
  fi
  
  # Pequeña pausa para no saturar el servicio
  sleep 0.1
done

echo ""
echo "════════════════════════════════════════"
echo "📊 RESUMEN"
echo "════════════════════════════════════════"
echo "✅ Éxito: $SUCCESS productos"
echo "❌ Fallos: $FAILED productos"
echo "📦 Total: $TOTAL productos"
echo "════════════════════════════════════════"
