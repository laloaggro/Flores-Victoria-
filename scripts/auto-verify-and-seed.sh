#!/bin/bash
# Script de verificación automática y seed de datos
# Espera a que los servicios estén listos y luego ejecuta la inicialización

set -e

API_GATEWAY="https://api-gateway-production-949b.up.railway.app"
MAX_RETRIES=30
RETRY_INTERVAL=10

echo "════════════════════════════════════════════════════════════"
echo "🚀 VERIFICACIÓN AUTOMÁTICA Y SEED DE DATOS"
echo "════════════════════════════════════════════════════════════"
echo ""

# Función para verificar si un servicio está listo
check_service() {
  local url=$1
  local service_name=$2
  
  echo "🔍 Verificando $service_name..."
  
  for i in $(seq 1 $MAX_RETRIES); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
      echo "✅ $service_name está listo! (intento $i/$MAX_RETRIES)"
      return 0
    else
      echo "⏳ Esperando $service_name... ($i/$MAX_RETRIES) - HTTP $HTTP_CODE"
      sleep $RETRY_INTERVAL
    fi
  done
  
  echo "❌ $service_name no respondió después de $MAX_RETRIES intentos"
  return 1
}

# Paso 1: Verificar API Gateway
echo ""
echo "════════════════════════════════════════════════════════════"
echo "1️⃣  VERIFICANDO API GATEWAY"
echo "════════════════════════════════════════════════════════════"
echo ""

if check_service "$API_GATEWAY/health" "API Gateway"; then
  echo ""
  echo "✅ API Gateway operativo"
else
  echo ""
  echo "❌ API Gateway no disponible. Abortando..."
  exit 1
fi

# Paso 2: Verificar Product Service
echo ""
echo "════════════════════════════════════════════════════════════"
echo "2️⃣  VERIFICANDO PRODUCT SERVICE"
echo "════════════════════════════════════════════════════════════"
echo ""

if check_service "$API_GATEWAY/api/products" "Product Service"; then
  echo ""
  echo "✅ Product Service operativo"
  
  # Verificar cuántos productos hay
  PRODUCT_COUNT=$(curl -s "$API_GATEWAY/api/products" | jq '. | length' 2>/dev/null || echo "0")
  echo "📊 Productos actuales en MongoDB: $PRODUCT_COUNT"
else
  echo ""
  echo "⚠️  Product Service no disponible. Continuando con otros pasos..."
fi

# Paso 3: Verificar Auth Service
echo ""
echo "════════════════════════════════════════════════════════════"
echo "3️⃣  VERIFICANDO AUTH SERVICE"
echo "════════════════════════════════════════════════════════════"
echo ""

if check_service "$API_GATEWAY/api/auth/health" "Auth Service"; then
  echo ""
  echo "✅ Auth Service operativo"
else
  echo ""
  echo "⚠️  Auth Service no disponible"
fi

# Paso 4: Seed de productos (si la DB está vacía)
echo ""
echo "════════════════════════════════════════════════════════════"
echo "4️⃣  SEED DE PRODUCTOS"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ "$PRODUCT_COUNT" = "0" ] || [ -z "$PRODUCT_COUNT" ]; then
  echo "🌱 Base de datos vacía. Iniciando seed de productos..."
  echo ""
  
  # Leer productos del JSON
  PRODUCTS_FILE="frontend/public/assets/mock/products.json"
  
  if [ ! -f "$PRODUCTS_FILE" ]; then
    echo "❌ Archivo de productos no encontrado: $PRODUCTS_FILE"
    exit 1
  fi
  
  TOTAL_PRODUCTS=$(jq '. | length' "$PRODUCTS_FILE")
  echo "📦 Encontrados $TOTAL_PRODUCTS productos para cargar"
  echo ""
  
  SUCCESS=0
  FAILED=0
  
  # Iterar sobre cada producto
  jq -c '.[]' "$PRODUCTS_FILE" | while read -r product; do
    NAME=$(echo "$product" | jq -r '.name')
    ID=$(echo "$product" | jq -r '.id')
    
    # Transformar al formato esperado
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
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      "$API_GATEWAY/api/products" \
      -H "Content-Type: application/json" \
      -d "$BODY" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
      echo "✅ [$ID] $NAME"
      ((SUCCESS++)) || true
    else
      echo "❌ [$ID] $NAME (HTTP $HTTP_CODE)"
      ((FAILED++)) || true
    fi
    
    # Pausa para no saturar
    sleep 0.1
  done
  
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "📊 RESUMEN DEL SEED"
  echo "════════════════════════════════════════════════════════════"
  echo "✅ Éxito: $SUCCESS productos"
  echo "❌ Fallos: $FAILED productos"
  echo "📦 Total: $TOTAL_PRODUCTS productos"
  echo "════════════════════════════════════════════════════════════"
else
  echo "ℹ️  Ya hay $PRODUCT_COUNT productos en la base de datos"
  echo "   Omitiendo seed..."
fi

# Paso 5: Verificación final
echo ""
echo "════════════════════════════════════════════════════════════"
echo "5️⃣  VERIFICACIÓN FINAL"
echo "════════════════════════════════════════════════════════════"
echo ""

FINAL_COUNT=$(curl -s "$API_GATEWAY/api/products" | jq '. | length' 2>/dev/null || echo "0")
echo "📊 Total de productos en MongoDB: $FINAL_COUNT"
echo ""

# Probar frontend
echo "🌐 Verificando frontend..."
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://frontend-production-d0b0.up.railway.app" 2>/dev/null)
if [ "$FRONTEND_CODE" = "200" ]; then
  echo "✅ Frontend accesible"
else
  echo "⚠️  Frontend: HTTP $FRONTEND_CODE"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ VERIFICACIÓN Y SEED COMPLETADOS"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🎯 URLs principales:"
echo "   • Frontend: https://frontend-production-d0b0.up.railway.app"
echo "   • API Gateway: $API_GATEWAY"
echo "   • API Productos: $API_GATEWAY/api/products"
echo ""
echo "🔗 Próximos pasos:"
echo "   1. Inicializar tablas PostgreSQL (ejecutar /tmp/init-all-databases.sql)"
echo "   2. Probar registro/login de usuarios"
echo "   3. Verificar flujo completo de compra"
echo ""
