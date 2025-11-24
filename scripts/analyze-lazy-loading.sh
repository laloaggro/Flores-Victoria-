#!/bin/bash

###############################################################################
# Script de Análisis de Optimización Lazy Loading
# Flores Victoria - Bundle Size Analyzer
###############################################################################

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  📊 ANÁLISIS DE OPTIMIZACIÓN: LAZY LOADING DE COMPONENTES        ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/../frontend" || exit 1

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

###############################################################################
# FUNCIÓN: Calcular tamaño en KB
###############################################################################
get_size_kb() {
    local file=$1
    if [ -f "$file" ]; then
        du -k "$file" | cut -f1
    else
        echo "0"
    fi
}

###############################################################################
# CALCULAR TAMAÑOS
###############################################################################

echo -e "${BLUE}═══ JavaScript Crítico (Carga Inmediata) ═══${NC}"
echo ""

# Críticos
CORE_BUNDLE=$(get_size_kb "js/components/core-bundle.js")
TOAST=$(get_size_kb "js/components/toast.js")
LOADING=$(get_size_kb "js/components/loading.js")
COMMON_BUNDLE=$(get_size_kb "js/components/common-bundle.js")
GLOBAL_FUNCTIONS=$(get_size_kb "js/global-functions.js")
LAZY_SYSTEM=$(get_size_kb "js/lazy-components.js")

CRITICAL_TOTAL=$((CORE_BUNDLE + TOAST + LOADING + COMMON_BUNDLE + GLOBAL_FUNCTIONS + LAZY_SYSTEM))

echo "  📦 core-bundle.js           ${CORE_BUNDLE} KB"
echo "  📦 toast.js                 ${TOAST} KB"
echo "  📦 loading.js               ${LOADING} KB"
echo "  📦 common-bundle.js         ${COMMON_BUNDLE} KB"
echo "  📦 global-functions.js      ${GLOBAL_FUNCTIONS} KB"
echo "  📦 lazy-components.js       ${LAZY_SYSTEM} KB"
echo "  ─────────────────────────────────"
echo -e "  ${GREEN}TOTAL CRÍTICO:          ${CRITICAL_TOTAL} KB${NC}"
echo ""

###############################################################################

echo -e "${YELLOW}═══ JavaScript Lazy (Carga Bajo Demanda) ═══${NC}"
echo ""

# Lazy
CART=$(get_size_kb "js/components/cart-manager.js")
WISHLIST=$(get_size_kb "js/components/wishlist-manager.js")
PRODUCT_COMPARISON=$(get_size_kb "js/components/product-comparison.js")
PRODUCT_IMAGE_ZOOM=$(get_size_kb "js/components/product-image-zoom.js")
PRODUCT_RECOMMENDATIONS=$(get_size_kb "js/components/product-recommendations.js")
INSTANT_SEARCH=$(get_size_kb "js/components/instant-search.js")
FORM_VALIDATOR=$(get_size_kb "js/components/form-validator.js")
PRODUCTS_CAROUSEL=$(get_size_kb "js/components/products-carousel.js")
SHIPPING=$(get_size_kb "js/components/shipping-options.js")
DARK_MODE=$(get_size_kb "js/components/dark-mode.js")

LAZY_TOTAL=$((CART + WISHLIST + PRODUCT_COMPARISON + PRODUCT_IMAGE_ZOOM + PRODUCT_RECOMMENDATIONS + INSTANT_SEARCH + FORM_VALIDATOR + PRODUCTS_CAROUSEL + SHIPPING + DARK_MODE))

echo "  ⚡ cart-manager.js          ${CART} KB"
echo "  ⚡ wishlist-manager.js      ${WISHLIST} KB"
echo "  ⚡ product-comparison.js    ${PRODUCT_COMPARISON} KB"
echo "  ⚡ product-image-zoom.js    ${PRODUCT_IMAGE_ZOOM} KB"
echo "  ⚡ product-recommendations  ${PRODUCT_RECOMMENDATIONS} KB"
echo "  ⚡ instant-search.js        ${INSTANT_SEARCH} KB"
echo "  ⚡ form-validator.js        ${FORM_VALIDATOR} KB"
echo "  ⚡ products-carousel.js     ${PRODUCTS_CAROUSEL} KB"
echo "  ⚡ shipping-options.js      ${SHIPPING} KB"
echo "  ⚡ dark-mode.js             ${DARK_MODE} KB"
echo "  ─────────────────────────────────"
echo -e "  ${YELLOW}TOTAL LAZY:             ${LAZY_TOTAL} KB${NC}"
echo ""

###############################################################################

TOTAL_ALL=$((CRITICAL_TOTAL + LAZY_TOTAL))
PERCENTAGE=$((CRITICAL_TOTAL * 100 / TOTAL_ALL))
SAVINGS=$((LAZY_TOTAL * 100 / TOTAL_ALL))

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  📈 RESUMEN DE OPTIMIZACIÓN                                        ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Total JavaScript:           ${TOTAL_ALL} KB"
echo ""
echo -e "  ${GREEN}✅ Carga Inicial:           ${CRITICAL_TOTAL} KB (${PERCENTAGE}%)${NC}"
echo -e "  ${YELLOW}⏳ Carga Bajo Demanda:      ${LAZY_TOTAL} KB (${SAVINGS}%)${NC}"
echo ""
echo "  ════════════════════════════════════"
echo ""
echo -e "  ${GREEN}🚀 Reducción de JS Inicial: ${SAVINGS}%${NC}"
echo ""

###############################################################################

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  📊 IMPACTO EN RENDIMIENTO (Estimado)                             ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Estimaciones basadas en 3G Fast (400 Kbps = 50 KB/s)
CRITICAL_TIME=$(echo "scale=2; $CRITICAL_TOTAL / 50" | bc)
TOTAL_TIME=$(echo "scale=2; $TOTAL_ALL / 50" | bc)

echo "  Red 3G Fast (50 KB/s):"
echo ""
echo "  ANTES (Todo el JS):"
echo "    Tiempo de descarga:     ${TOTAL_TIME}s"
echo "    Parse & Compile:        ~$(echo "$TOTAL_TIME * 1.5" | bc)s"
echo "    Time to Interactive:    ~$(echo "$TOTAL_TIME * 2" | bc)s"
echo ""
echo "  DESPUÉS (Solo Crítico):"
echo -e "    Tiempo de descarga:     ${GREEN}${CRITICAL_TIME}s${NC}"
echo -e "    Parse & Compile:        ${GREEN}~$(echo "$CRITICAL_TIME * 1.5" | bc)s${NC}"
echo -e "    Time to Interactive:    ${GREEN}~$(echo "$CRITICAL_TIME * 2" | bc)s${NC}"
echo ""

IMPROVEMENT=$(echo "scale=1; 100 - ($CRITICAL_TIME * 100 / $TOTAL_TIME)" | bc)
echo -e "  ${GREEN}⚡ Mejora en TTI: ~${IMPROVEMENT}%${NC}"
echo ""

###############################################################################

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  🎯 ESTRATEGIA DE CARGA                                            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  ${GREEN}✅ Carga Inmediata (${CRITICAL_TOTAL} KB):${NC}"
echo "     • Configuración global y utilidades"
echo "     • UI feedback (toast, loading)"
echo "     • Navegación (header, footer)"
echo "     • Sistema de carga lazy"
echo ""
echo "  ${YELLOW}⚡ Carga por Interacción:${NC}"
echo "     • Cart Manager (al hacer clic en carrito)"
echo "     • Wishlist Manager (al hacer clic en favoritos)"
echo "     • Instant Search (al enfocar búsqueda)"
echo "     • Form Validator (al enfocar formulario)"
echo ""
echo "  ${BLUE}👁️  Carga por Visibilidad:${NC}"
echo "     • Product Recommendations (al ser visible)"
echo "     • Products Carousel (al ser visible)"
echo ""
echo "  ${BLUE}🔄 Precarga en Idle:${NC}"
echo "     • Cart Manager (precarga automática)"
echo "     • Wishlist Manager (precarga automática)"
echo ""

###############################################################################

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  ✅ COMPONENTES CONFIGURADOS                                       ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Páginas actualizadas:"
echo "    ✓ /index.html"
echo "    ✓ /pages/products.html"
echo ""
echo "  Sistema implementado:"
echo "    ✓ /js/lazy-components.js"
echo ""
echo "  Documentación:"
echo "    ✓ /LAZY_LOADING_GUIDE.md"
echo ""

###############################################################################

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  🧪 PRUEBAS RECOMENDADAS                                           ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  1. Lighthouse Audit (Performance):"
echo "     lighthouse http://localhost:5173 --view"
echo ""
echo "  2. Bundle Analyzer:"
echo "     npm run analyze"
echo ""
echo "  3. Network Throttling:"
echo "     DevTools > Network > Throttling > Fast 3G"
echo ""
echo "  4. Coverage Analysis:"
echo "     DevTools > More Tools > Coverage"
echo ""
echo "  5. Verificar carga lazy:"
echo "     DevTools > Network > JS filter"
echo "     - Interactuar con carrito"
echo "     - Verificar que cart-manager.js se carga bajo demanda"
echo ""

###############################################################################

echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✨ Análisis completado${NC}"
echo ""
