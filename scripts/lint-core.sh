#!/bin/bash
# Script para ejecutar ESLint solo en archivos core de producción

echo "🔍 Ejecutando ESLint en archivos core..."
echo ""

# Archivos core críticos
CORE_FILES=(
  "admin-panel/js/promotion-admin.js"
  "admin-panel/server.js"
  "backend/models/Promotion.js"
  "backend/routes/promotions.js"
  "backend/server.js"
  "microservices/api-gateway/src/config/index.js"
  "microservices/api-gateway/src/routes/index.js"
  "microservices/promotion-service/src/server.js"
  "frontend/js/main.js"
  "frontend/js/components/product/Products.js"
)

ERROR_COUNT=0
TOTAL_FILES=0

for file in "${CORE_FILES[@]}"; do
  if [ -f "$file" ]; then
    TOTAL_FILES=$((TOTAL_FILES + 1))
    echo "📄 Checking $file..."
    
    # Ejecutar ESLint y capturar errores
    ERRORS=$(npx eslint "$file" 2>&1 | grep -c "error" || echo "0")
    
    if [ "$ERRORS" -gt 0 ]; then
      echo "   ❌ $ERRORS errors found"
      ERROR_COUNT=$((ERROR_COUNT + ERRORS))
      npx eslint "$file" 2>&1 | grep "error" | head -5
    else
      echo "   ✅ No errors"
    fi
    echo ""
  fi
done

echo "========================================="
echo "📊 RESUMEN"
echo "========================================="
echo "Archivos verificados: $TOTAL_FILES"
echo "Total errores: $ERROR_COUNT"
echo ""

if [ "$ERROR_COUNT" -eq 0 ]; then
  echo "✅ ¡Todos los archivos core pasaron el linting!"
  exit 0
else
  echo "⚠️  Se encontraron $ERROR_COUNT errores en archivos core"
  exit 1
fi
