#!/bin/bash

# Script para crear versiones minificadas de componentes críticos
# Usa terser para minificación avanzada

echo "🗜️  Minificando componentes JavaScript..."

COMPONENTS_DIR="frontend/js/components"
DIST_DIR="frontend/js/dist"

# Crear directorio de distribución
mkdir -p "$DIST_DIR"

# Componentes críticos para minificar
COMPONENTS=(
    "quick-view-modal"
    "products-carousel"
    "product-comparison"
    "instant-search"
    "cart-manager"
    "product-image-zoom"
)

for component in "${COMPONENTS[@]}"; do
    SOURCE="$COMPONENTS_DIR/${component}.js"
    OUTPUT="$DIST_DIR/${component}.min.js"
    
    if [ -f "$SOURCE" ]; then
        echo "  🔨 Minificando ${component}.js..."
        
        npx terser "$SOURCE" \
            --compress \
            --mangle \
            --output "$OUTPUT" \
            --source-map "url=${component}.min.js.map" \
            --comments /^!/
        
        # Mostrar reducción de tamaño
        ORIGINAL_SIZE=$(stat -f%z "$SOURCE" 2>/dev/null || stat -c%s "$SOURCE" 2>/dev/null)
        MINIFIED_SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT" 2>/dev/null)
        REDUCTION=$(echo "scale=1; 100 - ($MINIFIED_SIZE * 100 / $ORIGINAL_SIZE)" | bc)
        
        echo "    ✅ ${component}.min.js creado"
        echo "    📊 Reducción: ${REDUCTION}% ($(numfmt --to=iec $ORIGINAL_SIZE) → $(numfmt --to=iec $MINIFIED_SIZE))"
    fi
done

echo ""
echo "✨ Minificación completada!"
echo "📁 Archivos minificados en: $DIST_DIR/"
echo ""
echo "Para usar en producción, actualiza las rutas en HTML:"
echo "  <script src=\"/js/dist/[componente].min.js\"></script>"
