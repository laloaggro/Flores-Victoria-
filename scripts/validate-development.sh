#!/bin/bash

# Script de validación funcional del sitio en desarrollo
# Verifica que todos los componentes estén funcionando correctamente

echo "🔍 VALIDACIÓN FUNCIONAL - DESARROLLO"
echo "══════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
BASE_URL="http://localhost:5173"

# Función para verificar URL
check_url() {
    local url=$1
    local description=$2
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}✓${NC} $description (HTTP $HTTP_CODE)"
        ((PASSED++))
        return 0
    else
        echo -e "  ${RED}✗${NC} $description (HTTP $HTTP_CODE)"
        ((FAILED++))
        return 1
    fi
}

# Función para verificar archivo
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $description"
        ((PASSED++))
        return 0
    else
        echo -e "  ${RED}✗${NC} $description (no existe)"
        ((FAILED++))
        return 1
    fi
}

# Función para verificar contenido
check_content() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $description"
        ((PASSED++))
        return 0
    else
        echo -e "  ${RED}✗${NC} $description (no encontrado)"
        ((FAILED++))
        return 1
    fi
}

# 1. VERIFICAR SERVIDOR ACTIVO
echo "1️⃣  SERVIDOR DE DESARROLLO"
echo "─────────────────────────────────────────────────────────"
check_url "$BASE_URL/index.html" "Página principal accesible"
check_url "$BASE_URL/manifest.json" "Manifest.json accesible"
check_url "$BASE_URL/sw.js" "Service Worker accesible"
check_url "$BASE_URL/logo.svg" "Logo SVG accesible"
echo ""

# 2. VERIFICAR PÁGINAS PRINCIPALES
echo "2️⃣  PÁGINAS PRINCIPALES"
echo "─────────────────────────────────────────────────────────"
check_url "$BASE_URL/pages/products.html" "Productos"
check_url "$BASE_URL/pages/about.html" "Nosotros"
check_url "$BASE_URL/pages/contact.html" "Contacto"
check_url "$BASE_URL/pages/cart.html" "Carrito"
check_url "$BASE_URL/pages/wishlist.html" "Lista de deseos"
echo ""

# 3. VERIFICAR ICONOS PWA
echo "3️⃣  ICONOS PWA"
echo "─────────────────────────────────────────────────────────"
check_url "$BASE_URL/icons/icon-72x72.png" "Icon 72x72"
check_url "$BASE_URL/icons/icon-192x192.png" "Icon 192x192"
check_url "$BASE_URL/icons/icon-512x512.png" "Icon 512x512"
check_url "$BASE_URL/favicon.png" "Favicon"
check_url "$BASE_URL/apple-touch-icon.png" "Apple Touch Icon"
echo ""

# 4. VERIFICAR ARCHIVOS DE CONFIGURACIÓN
echo "4️⃣  ARCHIVOS DE CONFIGURACIÓN"
echo "─────────────────────────────────────────────────────────"
check_file "frontend/public/js/config/business-config.js" "Business Config"
check_file "frontend/public/js/seo-manager.js" "SEO Manager"
check_file "frontend/public/js/ux-enhancements.js" "UX Enhancements"
check_file "frontend/public/js/sw-register.js" "SW Register"
echo ""

# 5. VERIFICAR DATOS DE NEGOCIO
echo "5️⃣  DATOS DE NEGOCIO (business-config.js)"
echo "─────────────────────────────────────────────────────────"
check_content "frontend/public/js/config/business-config.js" "arreglosvictoriafloreria@gmail.com" "Email producción"
check_content "frontend/public/js/config/business-config.js" "16123271-8" "RUT"
check_content "frontend/public/js/config/business-config.js" "1980" "Fundada 1980"
check_content "frontend/public/js/config/business-config.js" "es_CL" "Locale Chile"
check_content "frontend/public/js/config/business-config.js" "facebook.com/profile.php?id=61578999845743" "Facebook URL"
check_content "frontend/public/js/config/business-config.js" "instagram.com/arreglosvictoria" "Instagram URL"
echo ""

# 6. VERIFICAR MANIFEST.JSON
echo "6️⃣  MANIFEST.JSON (PWA)"
echo "─────────────────────────────────────────────────────────"
check_content "frontend/public/manifest.json" "es-CL" "Locale correcto"
check_content "frontend/public/manifest.json" "Arreglos Victoria" "Nombre app"
check_content "frontend/public/manifest.json" "#2d5016" "Theme color"
check_content "frontend/public/manifest.json" "icon-512x512.png" "Icon 512x512"
echo ""

# 7. VERIFICAR SERVICE WORKER
echo "7️⃣  SERVICE WORKER"
echo "─────────────────────────────────────────────────────────"
check_content "frontend/public/sw.js" "cache.addAll" "Cache implementation"
check_content "frontend/public/sw.js" "fetch" "Fetch event"
check_content "frontend/public/sw.js" "install" "Install event"
echo ""

# 8. VERIFICAR SEO EN INDEX.HTML
echo "8️⃣  SEO META TAGS (index.html)"
echo "─────────────────────────────────────────────────────────"
check_content "frontend/index.html" 'rel="manifest"' "Link a manifest"
check_content "frontend/index.html" 'rel="apple-touch-icon"' "Apple touch icon"
check_content "frontend/index.html" 'name="theme-color"' "Theme color meta"
check_content "frontend/index.html" "seo-manager.js" "SEO Manager cargado"
check_content "frontend/index.html" "arreglosvictoriafloreria@gmail.com" "Email en footer"
echo ""

# 9. VERIFICAR IMÁGENES WEBP
echo "9️⃣  IMÁGENES WEBP"
echo "─────────────────────────────────────────────────────────"
WEBP_COUNT=$(find frontend/public/images -name "*.webp" 2>/dev/null | wc -l)
if [ "$WEBP_COUNT" -ge 20 ]; then
    echo -e "  ${GREEN}✓${NC} $WEBP_COUNT imágenes WebP encontradas"
    ((PASSED++))
else
    echo -e "  ${YELLOW}⚠${NC} Solo $WEBP_COUNT imágenes WebP (esperadas: 23)"
    ((FAILED++))
fi
echo ""

# 10. VERIFICAR SITEMAP
echo "🔟 SITEMAP.XML"
echo "─────────────────────────────────────────────────────────"
check_file "frontend/public/sitemap.xml" "Sitemap existe"
if [ -f "frontend/public/sitemap.xml" ]; then
    URL_COUNT=$(grep -c "<loc>" frontend/public/sitemap.xml 2>/dev/null || echo "0")
    if [ "$URL_COUNT" -ge 20 ]; then
        echo -e "  ${GREEN}✓${NC} $URL_COUNT URLs en sitemap"
        ((PASSED++))
    else
        echo -e "  ${YELLOW}⚠${NC} Solo $URL_COUNT URLs en sitemap"
        ((FAILED++))
    fi
fi
echo ""

# RESUMEN
echo "══════════════════════════════════════════════════════════"
echo "📊 RESUMEN DE VALIDACIÓN"
echo "══════════════════════════════════════════════════════════"
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo "  ✅ Pasadas:  $PASSED"
echo "  ❌ Fallidas: $FAILED"
echo "  📋 Total:    $TOTAL"
echo ""
echo "  🎯 Éxito:    $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDACIÓN EXITOSA${NC}"
    echo "   El sitio de desarrollo está funcionando correctamente."
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Abrir http://localhost:5173 en el navegador"
    echo "   2. Verificar visualización del logo"
    echo "   3. Probar instalación PWA (DevTools → Application → Manifest)"
    echo "   4. Revisar datos de contacto en footer"
    echo "   5. Probar modo offline (DevTools → Network → Offline)"
    exit 0
else
    echo -e "${RED}⚠️  VALIDACIÓN CON ERRORES${NC}"
    echo "   Revisa los elementos marcados con ✗"
    exit 1
fi
