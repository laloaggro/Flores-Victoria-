#!/bin/bash
# 🎨 FLORES VICTORIA - VALIDACIÓN DE MEJORAS
# ==========================================

echo "🌺 FLORES VICTORIA - Validación de Mejoras Aplicadas"
echo "===================================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
passed=0
failed=0
warnings=0

# Función para checks
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((passed++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((failed++))
    fi
}

warning() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((warnings++))
}

info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

echo "1️⃣  VERIFICANDO ARCHIVOS PRINCIPALES"
echo "------------------------------------"

# Verificar index.html
test -f "frontend/index.html"
check "index.html existe"

# Verificar CSS
test -f "frontend/css/animations.css"
check "animations.css existe"

test -f "frontend/css/style.css"
check "style.css existe"

# Verificar JS
test -f "frontend/js/ux-optimizations.js"
check "ux-optimizations.js existe"

# Verificar SEO files
test -f "frontend/sitemap.xml"
check "sitemap.xml existe"

test -f "frontend/robots.txt"
check "robots.txt existe"

echo ""
echo "2️⃣  VALIDANDO CONTENIDO HTML"
echo "----------------------------"

# Verificar Schema.org
grep -q "schema.org" frontend/index.html
check "Schema.org JSON-LD presente"

# Verificar Open Graph
grep -q "og:title" frontend/index.html
check "Open Graph tags presentes"

# Verificar ARIA
grep -q "aria-label" frontend/index.html
check "ARIA labels presentes"

# Verificar role attributes
grep -q 'role="banner"' frontend/index.html
check "Roles semánticos presentes"

# Verificar lazy loading
grep -q 'loading="lazy"' frontend/index.html
check "Lazy loading implementado"

# Verificar itemscope/itemtype
grep -q "itemscope" frontend/index.html
check "Microdata implementado"

echo ""
echo "3️⃣  VALIDANDO META TAGS"
echo "-----------------------"

# Verificar canonical
grep -q 'rel="canonical"' frontend/index.html
check "Canonical URL presente"

# Verificar viewport
grep -q "viewport-fit=cover" frontend/index.html
check "Viewport optimizado"

# Verificar theme-color
grep -q 'name="theme-color"' frontend/index.html
check "Theme color configurado"

# Verificar PWA
grep -q 'rel="manifest"' frontend/index.html
check "PWA manifest enlazado"

echo ""
echo "4️⃣  VALIDANDO SEO"
echo "----------------"

# Verificar sitemap actualizado
grep -q "2025-10-25" frontend/sitemap.xml
check "Sitemap actualizado (fecha correcta)"

# Verificar robots.txt
grep -q "Disallow: /admin/" frontend/robots.txt
check "Robots.txt con protecciones"

# Verificar título optimizado
grep -q "Flores Victoria.*Santiago" frontend/index.html
check "Título con keywords locales"

echo ""
echo "5️⃣  VALIDANDO ACCESIBILIDAD"
echo "---------------------------"

# Verificar aria-labelledby
grep -q "aria-labelledby" frontend/index.html
check "aria-labelledby usado"

# Verificar aria-expanded
grep -q "aria-expanded" frontend/index.html
check "aria-expanded implementado"

# Verificar alt en imágenes
image_count=$(grep -c '<img' frontend/index.html)
alt_count=$(grep -c 'alt=' frontend/index.html)

if [ $image_count -eq $alt_count ]; then
    echo -e "${GREEN}✅ PASS${NC}: Todas las imágenes tienen alt ($image_count/$alt_count)"
    ((passed++))
else
    echo -e "${RED}❌ FAIL${NC}: Faltan alt en imágenes ($alt_count/$image_count)"
    ((failed++))
fi

echo ""
echo "6️⃣  VALIDANDO CSS"
echo "----------------"

# Verificar animaciones
grep -q "@keyframes fadeInUp" frontend/css/animations.css
check "Animaciones definidas"

# Verificar responsive
grep -q "@media (max-width: 768px)" frontend/css/style.css
check "Media queries responsive"

# Verificar prefers-reduced-motion
grep -q "prefers-reduced-motion" frontend/css/animations.css
check "Respeto a reduced motion"

echo ""
echo "7️⃣  VALIDANDO JAVASCRIPT"
echo "-----------------------"

# Verificar UX class
grep -q "class UXEnhancements" frontend/js/ux-optimizations.js
check "Clase UXEnhancements definida"

# Verificar Intersection Observer
grep -q "IntersectionObserver" frontend/js/ux-optimizations.js
check "Intersection Observer usado"

# Verificar lazy loading
grep -q "setupLazyLoading" frontend/js/ux-optimizations.js
check "Sistema de lazy loading"

# Verificar accesibilidad
grep -q "setupAccessibilityEnhancements" frontend/js/ux-optimizations.js
check "Mejoras de accesibilidad JS"

echo ""
echo "8️⃣  VERIFICANDO PERFORMANCE"
echo "--------------------------"

# Verificar defer/async
grep -q 'defer' frontend/index.html
check "Scripts con defer"

# Verificar preconnect
grep -q "preconnect" frontend/index.html
check "Preconnect configurado"

# Verificar fonts optimization
grep -q 'media="print" onload' frontend/index.html
check "Fuentes con carga diferida"

echo ""
echo "9️⃣  VERIFICANDO STRUCTURED DATA"
echo "-------------------------------"

# Verificar FloristShop
grep -q '"@type": "FloristShop"' frontend/index.html
check "Schema FloristShop"

# Verificar BreadcrumbList
grep -q '"@type": "BreadcrumbList"' frontend/index.html
check "Schema BreadcrumbList"

# Verificar GeoCoordinates
grep -q "GeoCoordinates" frontend/index.html
check "Coordenadas geográficas"

# Verificar OpeningHours
grep -q "OpeningHoursSpecification" frontend/index.html
check "Horarios estructurados"

echo ""
echo "🔟  CHECKS DE SEGURIDAD"
echo "----------------------"

# Verificar rel="noopener"
grep -q 'rel="noopener' frontend/index.html
check "Links externos con noopener"

# Verificar no inline JavaScript peligroso
if ! grep -q "eval(" frontend/index.html && ! grep -q "innerHTML" frontend/index.html; then
    echo -e "${GREEN}✅ PASS${NC}: Sin código JavaScript peligroso"
    ((passed++))
else
    warning "Posible código JavaScript peligroso (eval/innerHTML)"
fi

echo ""
echo "============================================"
echo "📊 RESUMEN DE VALIDACIÓN"
echo "============================================"
echo -e "${GREEN}✅ PASSED: $passed${NC}"
echo -e "${RED}❌ FAILED: $failed${NC}"
echo -e "${YELLOW}⚠️  WARNINGS: $warnings${NC}"
echo ""

total=$((passed + failed))
percentage=$((passed * 100 / total))

echo -e "Score: ${BLUE}$percentage%${NC} ($passed/$total)"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡EXCELENTE! Todas las validaciones pasaron.${NC}"
    echo -e "${GREEN}El sitio cumple con todos los estándares de calidad.${NC}"
    exit 0
elif [ $percentage -ge 90 ]; then
    echo -e "${YELLOW}⚠️  MUY BUENO. Hay algunos items que revisar.${NC}"
    exit 0
elif [ $percentage -ge 70 ]; then
    echo -e "${YELLOW}⚠️  ACEPTABLE. Se recomienda revisar los items fallidos.${NC}"
    exit 1
else
    echo -e "${RED}❌ NECESITA MEJORAS. Hay varios items críticos.${NC}"
    exit 1
fi
