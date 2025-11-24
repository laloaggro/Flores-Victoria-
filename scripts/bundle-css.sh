#!/bin/bash

# Bundle CSS - Consolidar múltiples CSS en uno solo
# Flores Victoria - Performance Optimization

set -e

echo "📦 Consolidando archivos CSS..."

FRONTEND_DIR="frontend"
OUTPUT_FILE="$FRONTEND_DIR/css/bundle.css"
TEMP_FILE="$FRONTEND_DIR/css/bundle.temp.css"

# Limpiar archivo temporal
> "$TEMP_FILE"

# Array de archivos CSS en orden de importancia
CSS_FILES=(
    "css/base.css"
    "css/style.css"
    "css/design-system.css"
    "css/fixes.css"
    "css/products-enhanced.css"
    "css/products-page.css"
    "css/global-search.css"
    "css/mobile-responsive.css"
    "css/breadcrumbs.css"
    "css/mini-cart.css"
    "css/skeleton-loader.css"
    "css/testimonials-carousel.css"
    "css/social-proof.css"
    "css/chat-widget.css"
    "css/components/products-carousel.css"
    "css/components/whatsapp-cta.css"
    "css/components/product-recommendations.css"
    "css/components/product-comparison.css"
    "css/loading-progress.css"
    "css/lazy-images.css"
    "css/analytics-tracker.css"
    "css/service-worker-manager.css"
    "css/microinteractions.css"
    "css/fonts.css"
    "css/footer-fixes.css"
    "css/accessibility-fixes.css"
)

# Consolidar todos los CSS
for css_file in "${CSS_FILES[@]}"; do
    file_path="$FRONTEND_DIR/$css_file"
    if [ -f "$file_path" ]; then
        echo "  → Agregando $css_file"
        echo "/* ============================================= */" >> "$TEMP_FILE"
        echo "/* Archivo: $css_file */" >> "$TEMP_FILE"
        echo "/* ============================================= */" >> "$TEMP_FILE"
        cat "$file_path" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
    else
        echo "  ⚠️  Archivo no encontrado: $css_file"
    fi
done

# Minificar el bundle con clean-css si está disponible
if command -v cleancss &> /dev/null; then
    echo "🎨 Minificando bundle CSS..."
    cleancss -o "$OUTPUT_FILE" "$TEMP_FILE"
    rm "$TEMP_FILE"
else
    echo "⚠️  clean-css no disponible, usando archivo sin minificar"
    mv "$TEMP_FILE" "$OUTPUT_FILE"
fi

# Calcular tamaños
BUNDLE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo "✅ Bundle CSS generado!"
echo "📊 Resultados:"
echo "   Archivos consolidados: ${#CSS_FILES[@]}"
echo "   Tamaño bundle: $BUNDLE_SIZE"
echo "   Ubicación: $OUTPUT_FILE"
echo ""
echo "💡 Para usar el bundle, reemplazar todas las etiquetas <link> CSS por:"
echo '   <link rel="stylesheet" href="/css/bundle.css">'
