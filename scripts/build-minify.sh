#!/bin/bash
# Build script para minificar CSS y JS
# Flores Victoria - Optimización de Performance

set -e

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
cd "$FRONTEND_DIR"

echo "🔧 Flores Victoria - Build Script"
echo "================================="
echo ""

# Verificar herramientas
if ! command -v terser &> /dev/null; then
    echo "❌ terser no instalado. Ejecuta: npm install -g terser"
    exit 1
fi

if ! command -v csso &> /dev/null; then
    echo "❌ csso no instalado. Ejecuta: npm install -g csso-cli"
    exit 1
fi

# Crear directorio de build si no existe
mkdir -p dist/css dist/js

echo "📦 Minificando CSS..."
echo "---------------------"

# CSS principales a minificar
CSS_FILES=(
    "css/bundle.css"
    "css/style.css"
    "css/themes.css"
    "css/design-system.css"
    "css/base.css"
    "css/cookie-consent.css"
    "css/accessibility.css"
)

for file in "${CSS_FILES[@]}"; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .css)
        original_size=$(wc -c < "$file")
        csso "$file" -o "dist/css/${filename}.min.css" 2>/dev/null
        minified_size=$(wc -c < "dist/css/${filename}.min.css")
        savings=$((original_size - minified_size))
        percent=$((savings * 100 / original_size))
        echo "  ✅ $file → ${filename}.min.css (ahorro: ${percent}%)"
    fi
done

echo ""
echo "📦 Minificando JavaScript..."
echo "----------------------------"

# JS principales a minificar
JS_FILES=(
    "js/load-products.js"
    "js/chatbot.js"
    "js/cookie-consent.js"
    "js/analytics.js"
    "js/reviews.js"
    "js/newsletter.js"
    "js/coupons.js"
    "js/related-products.js"
    "js/lazy-components.js"
    "js/pwa-install.js"
    "js/theme-switcher.js"
    "js/global-functions.js"
    "js/occasion-filters.js"
)

for file in "${JS_FILES[@]}"; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .js)
        original_size=$(wc -c < "$file")
        terser "$file" -c -m -o "dist/js/${filename}.min.js" 2>/dev/null
        minified_size=$(wc -c < "dist/js/${filename}.min.js")
        savings=$((original_size - minified_size))
        percent=$((savings * 100 / original_size))
        echo "  ✅ $file → ${filename}.min.js (ahorro: ${percent}%)"
    fi
done

echo ""
echo "📊 Resumen de tamaños:"
echo "----------------------"
echo "CSS original:   $(du -sh css/ | cut -f1)"
echo "CSS minificado: $(du -sh dist/css/ | cut -f1)"
echo "JS original:    $(du -sh js/ | cut -f1)"
echo "JS minificado:  $(du -sh dist/js/ | cut -f1)"

echo ""
echo "✅ Build completado!"
echo ""
echo "Para usar los archivos minificados, actualiza las referencias en HTML:"
echo "  /css/style.css → /dist/css/style.min.css"
echo "  /js/analytics.js → /dist/js/analytics.min.js"
