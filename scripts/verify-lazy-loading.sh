#!/bin/bash

###############################################################################
# Script de Verificación de Lazy Loading
# Verifica que los componentes se carguen bajo demanda correctamente
###############################################################################

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  🧪 VERIFICACIÓN DE LAZY LOADING                                  ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:4173"
FAILED=0

###############################################################################
# VERIFICACIONES
###############################################################################

echo -e "${BLUE}1. Verificando que el servidor esté corriendo...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200"; then
    echo -e "   ${GREEN}✓ Servidor activo en $BASE_URL${NC}"
else
    echo -e "   ${RED}✗ Servidor no disponible${NC}"
    echo ""
    echo "   Inicia el servidor con:"
    echo "   cd frontend && npx vite preview --port 4173"
    exit 1
fi
echo ""

###############################################################################

echo -e "${BLUE}2. Verificando archivos críticos...${NC}"

CRITICAL_FILES=(
    "/js/components/core-bundle.js"
    "/js/components/toast.js"
    "/js/components/loading.js"
    "/js/components/common-bundle.js"
    "/js/global-functions.js"
    "/js/lazy-components.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$file")
    if [ "$STATUS" = "200" ]; then
        echo -e "   ${GREEN}✓${NC} $(basename "$file")"
    else
        echo -e "   ${RED}✗${NC} $(basename "$file") (HTTP $STATUS)"
        FAILED=$((FAILED + 1))
    fi
done
echo ""

###############################################################################

echo -e "${BLUE}3. Verificando componentes lazy...${NC}"

LAZY_FILES=(
    "/js/components/cart-manager.js"
    "/js/components/wishlist-manager.js"
    "/js/components/product-comparison.js"
    "/js/components/product-image-zoom.js"
    "/js/components/product-recommendations.js"
    "/js/components/instant-search.js"
    "/js/components/form-validator.js"
    "/js/components/products-carousel.js"
    "/js/components/shipping-options.js"
    "/js/components/dark-mode.js"
)

for file in "${LAZY_FILES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$file")
    if [ "$STATUS" = "200" ]; then
        echo -e "   ${GREEN}✓${NC} $(basename "$file")"
    else
        echo -e "   ${RED}✗${NC} $(basename "$file") (HTTP $STATUS)"
        FAILED=$((FAILED + 1))
    fi
done
echo ""

###############################################################################

echo -e "${BLUE}4. Verificando HTML actualizado...${NC}"

# Verificar que index.html contiene lazy-components.js
if curl -s "$BASE_URL" | grep -q "lazy-components.js"; then
    echo -e "   ${GREEN}✓${NC} index.html incluye lazy-components.js"
else
    echo -e "   ${RED}✗${NC} index.html NO incluye lazy-components.js"
    FAILED=$((FAILED + 1))
fi

# Verificar que NO carga cart-manager directamente
if curl -s "$BASE_URL" | grep -q 'script.*src.*cart-manager.js'; then
    echo -e "   ${YELLOW}⚠${NC}  index.html carga cart-manager.js directamente (debería ser lazy)"
else
    echo -e "   ${GREEN}✓${NC} index.html NO carga cart-manager.js (correcto - es lazy)"
fi

# Verificar que NO carga wishlist-manager directamente
if curl -s "$BASE_URL" | grep -q 'script.*src.*wishlist-manager.js'; then
    echo -e "   ${YELLOW}⚠${NC}  index.html carga wishlist-manager.js directamente (debería ser lazy)"
else
    echo -e "   ${GREEN}✓${NC} index.html NO carga wishlist-manager.js (correcto - es lazy)"
fi

echo ""

###############################################################################

echo -e "${BLUE}5. Verificando estructura del sistema lazy...${NC}"

# Descargar lazy-components.js y verificar estructura
LAZY_CONTENT=$(curl -s "$BASE_URL/js/lazy-components.js")

if echo "$LAZY_CONTENT" | grep -q "window.LazyComponents"; then
    echo -e "   ${GREEN}✓${NC} Exporta API global (window.LazyComponents)"
else
    echo -e "   ${RED}✗${NC} NO exporta API global"
    FAILED=$((FAILED + 1))
fi

if echo "$LAZY_CONTENT" | grep -q "COMPONENTS.*cart"; then
    echo -e "   ${GREEN}✓${NC} Configura componente cart"
else
    echo -e "   ${RED}✗${NC} NO configura componente cart"
    FAILED=$((FAILED + 1))
fi

if echo "$LAZY_CONTENT" | grep -q "loadComponent"; then
    echo -e "   ${GREEN}✓${NC} Implementa función loadComponent"
else
    echo -e "   ${RED}✗${NC} NO implementa función loadComponent"
    FAILED=$((FAILED + 1))
fi

if echo "$LAZY_CONTENT" | grep -q "IntersectionObserver"; then
    echo -e "   ${GREEN}✓${NC} Usa IntersectionObserver para visibilidad"
else
    echo -e "   ${YELLOW}⚠${NC}  NO usa IntersectionObserver"
fi

if echo "$LAZY_CONTENT" | grep -q "requestIdleCallback"; then
    echo -e "   ${GREEN}✓${NC} Usa requestIdleCallback para precarga"
else
    echo -e "   ${YELLOW}⚠${NC}  NO usa requestIdleCallback"
fi

echo ""

###############################################################################

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  📋 PRUEBAS MANUALES RECOMENDADAS                                  ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Abre el navegador en: ${BLUE}http://localhost:4173${NC}"
echo ""
echo "  1. Abre DevTools (F12)"
echo "     • Ve a la pestaña 'Network'"
echo "     • Filtra por 'JS'"
echo "     • Recarga la página (Ctrl+R)"
echo ""
echo "  2. Verifica carga inicial:"
echo "     ✓ Deberías ver solo ~60KB de JS"
echo "     ✓ NO deberías ver cart-manager.js"
echo "     ✓ NO deberías ver wishlist-manager.js"
echo ""
echo "  3. Haz clic en 'Agregar al carrito':"
echo "     ✓ cart-manager.js debería cargarse bajo demanda"
echo "     ✓ Ver en Network: cart-manager.js aparece"
echo ""
echo "  4. Haz clic en el ícono de wishlist:"
echo "     ✓ wishlist-manager.js debería cargarse"
echo ""
echo "  5. Abre la consola del navegador:"
echo "     • Deberías ver logs como:"
echo "       [LazyComponents] 🚀 Inicializando sistema..."
echo "       [LazyComponents] ✅ Sistema configurado (10 componentes)"
echo "       [LazyComponents] 🎯 Trigger activado: cart"
echo ""
echo "  6. Usa Lighthouse para verificar:"
echo "     • Pestaña 'Lighthouse'"
echo "     • Selecciona 'Performance'"
echo "     • Genera reporte"
echo "     • Verifica mejoras en TTI y FCP"
echo ""

###############################################################################

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  🔍 HERRAMIENTAS DE ANÁLISIS                                       ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Coverage Analysis (DevTools):"
echo "    1. DevTools > More Tools > Coverage"
echo "    2. Clic en 'Start instrumenting'"
echo "    3. Recarga la página"
echo "    4. Verifica % de código no usado"
echo ""
echo "  Network Throttling:"
echo "    1. DevTools > Network"
echo "    2. Throttling dropdown > Fast 3G"
echo "    3. Recarga y observa tiempos de carga"
echo ""
echo "  Performance Recording:"
echo "    1. DevTools > Performance"
echo "    2. Clic en 'Record'"
echo "    3. Recarga la página"
echo "    4. Analiza Main Thread activity"
echo ""

###############################################################################

if [ $FAILED -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║  ✅ TODAS LAS VERIFICACIONES PASARON                              ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}✨ Sistema de lazy loading configurado correctamente${NC}"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║  ❌ ALGUNAS VERIFICACIONES FALLARON                               ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${RED}Fallos encontrados: $FAILED${NC}"
    echo ""
    echo "Revisa los errores arriba y corrige los problemas."
    echo ""
    exit 1
fi
