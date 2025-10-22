#!/bin/bash

# Script de validación para mejoras avanzadas (PWA, SEO, UX)

BASE_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
PUBLIC_DIR="$BASE_DIR/public"

echo ""
echo "🔍 VALIDACIÓN DE MEJORAS AVANZADAS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Contadores
total=0
passed=0
failed=0

# Función para verificar archivo
check_file() {
    local file=$1
    local name=$2
    ((total++))
    
    if [ -f "$file" ]; then
        echo "  ✓ $name"
        ((passed++))
        return 0
    else
        echo "  ✗ $name - NO ENCONTRADO"
        ((failed++))
        return 1
    fi
}

# Función para verificar contenido en archivo
check_content() {
    local file=$1
    local pattern=$2
    local name=$3
    ((total++))
    
    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo "  ✓ $name"
        ((passed++))
        return 0
    else
        echo "  ✗ $name - NO ENCONTRADO"
        ((failed++))
        return 1
    fi
}

echo "📦 1. ARCHIVOS PWA"
echo "─────────────────────────────────────────────────────────"
check_file "$PUBLIC_DIR/manifest.json" "manifest.json"
check_file "$PUBLIC_DIR/sw.js" "Service Worker"
check_file "$PUBLIC_DIR/offline.html" "Página offline"
check_file "$PUBLIC_DIR/favicon.png" "Favicon"
check_file "$PUBLIC_DIR/apple-touch-icon.png" "Apple Touch Icon"

echo ""
echo "🎨 2. ÍCONOS PWA"
echo "─────────────────────────────────────────────────────────"
ICON_SIZES=(72 96 128 144 152 192 384 512)
for size in "${ICON_SIZES[@]}"; do
    check_file "$PUBLIC_DIR/icons/icon-${size}x${size}.png" "Ícono ${size}x${size}"
done

echo ""
echo "📜 3. SCRIPTS JAVASCRIPT"
echo "─────────────────────────────────────────────────────────"
check_file "$PUBLIC_DIR/js/sw-register.js" "SW Register"
check_file "$PUBLIC_DIR/js/seo-manager.js" "SEO Manager"
check_file "$PUBLIC_DIR/js/ux-enhancements.js" "UX Enhancements"

echo ""
echo "🌐 4. INTEGRACIÓN EN index.html"
echo "─────────────────────────────────────────────────────────"
INDEX="$BASE_DIR/index.html"
check_content "$INDEX" 'rel="manifest"' "Referencia a manifest.json"
check_content "$INDEX" 'rel="apple-touch-icon"' "Apple Touch Icon link"
check_content "$INDEX" 'theme-color' "Meta theme-color"
check_content "$INDEX" 'sw-register.js' "Service Worker registration"
check_content "$INDEX" 'seo-manager.js' "SEO Manager script"
check_content "$INDEX" 'ux-enhancements.js' "UX Enhancements script"

echo ""
echo "📄 5. INTEGRACIÓN EN PÁGINAS CLAVE"
echo "─────────────────────────────────────────────────────────"
PAGES=(
    "$BASE_DIR/pages/products.html:Productos"
    "$BASE_DIR/pages/about.html:Nosotros"
    "$BASE_DIR/pages/contact.html:Contacto"
    "$BASE_DIR/pages/cart.html:Carrito"
)

for page_info in "${PAGES[@]}"; do
    IFS=: read -r page name <<< "$page_info"
    if [ -f "$page" ]; then
        if grep -q 'rel="manifest"' "$page" && \
           grep -q 'sw-register.js' "$page" && \
           grep -q 'seo-manager.js' "$page"; then
            echo "  ✓ $name - Referencias PWA/SEO completas"
            ((passed++))
        else
            echo "  ✗ $name - Referencias incompletas"
            ((failed++))
        fi
        ((total++))
    else
        echo "  ⚠ $name - Archivo no encontrado"
        ((total++))
        ((failed++))
    fi
done

echo ""
echo "🔧 6. CONTENIDO DE MANIFEST.JSON"
echo "─────────────────────────────────────────────────────────"
if [ -f "$PUBLIC_DIR/manifest.json" ]; then
    check_content "$PUBLIC_DIR/manifest.json" '"name"' "Campo 'name'"
    check_content "$PUBLIC_DIR/manifest.json" '"short_name"' "Campo 'short_name'"
    check_content "$PUBLIC_DIR/manifest.json" '"icons"' "Array de íconos"
    check_content "$PUBLIC_DIR/manifest.json" '"start_url"' "URL de inicio"
    check_content "$PUBLIC_DIR/manifest.json" '"display"' "Modo de display"
    check_content "$PUBLIC_DIR/manifest.json" '"theme_color"' "Color de tema"
fi

echo ""
echo "⚙️  7. FUNCIONALIDAD SERVICE WORKER"
echo "─────────────────────────────────────────────────────────"
if [ -f "$PUBLIC_DIR/sw.js" ]; then
    check_content "$PUBLIC_DIR/sw.js" 'CACHE_VERSION' "Versión de caché definida"
    check_content "$PUBLIC_DIR/sw.js" 'CACHE_NAME' "Nombre de caché"
    check_content "$PUBLIC_DIR/sw.js" 'addEventListener.*install' "Event listener: install"
    check_content "$PUBLIC_DIR/sw.js" 'addEventListener.*activate' "Event listener: activate"
    check_content "$PUBLIC_DIR/sw.js" 'addEventListener.*fetch' "Event listener: fetch"
    check_content "$PUBLIC_DIR/sw.js" 'caches.open' "API de caché utilizada"
fi

echo ""
echo "🎯 8. CARACTERÍSTICAS SEO MANAGER"
echo "─────────────────────────────────────────────────────────"
if [ -f "$PUBLIC_DIR/js/seo-manager.js" ]; then
    check_content "$PUBLIC_DIR/js/seo-manager.js" 'og:' "Open Graph tags"
    check_content "$PUBLIC_DIR/js/seo-manager.js" 'twitter:' "Twitter Cards"
    check_content "$PUBLIC_DIR/js/seo-manager.js" 'schema.org' "Schema.org structured data"
    check_content "$PUBLIC_DIR/js/seo-manager.js" 'LocalBusiness' "Schema LocalBusiness"
    check_content "$PUBLIC_DIR/js/seo-manager.js" 'Product' "Schema Product"
fi

echo ""
echo "✨ 9. COMPONENTES UX"
echo "─────────────────────────────────────────────────────────"
if [ -f "$PUBLIC_DIR/js/ux-enhancements.js" ]; then
    check_content "$PUBLIC_DIR/js/ux-enhancements.js" 'scroll-to-top' "Scroll to top button"
    check_content "$PUBLIC_DIR/js/ux-enhancements.js" 'toast' "Toast notifications"
    check_content "$PUBLIC_DIR/js/ux-enhancements.js" 'loading' "Loading overlay"
    check_content "$PUBLIC_DIR/js/ux-enhancements.js" 'smoothScroll\|Smooth' "Smooth scroll"
    check_content "$PUBLIC_DIR/js/ux-enhancements.js" 'validation\|Validation' "Form validation"
fi

echo ""
echo "🌐 10. SERVIDOR ACTIVO"
echo "─────────────────────────────────────────────────────────"
((total++))
if netstat -tuln 2>/dev/null | grep -q ':5173'; then
    echo "  ✓ Frontend corriendo en puerto 5173"
    ((passed++))
else
    echo "  ⚠ Frontend no detectado en puerto 5173"
    echo "    Ejecuta: cd frontend && npm run dev"
    ((failed++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 RESUMEN DE VALIDACIÓN"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  ✓ Pasadas:    $passed"
echo "  ✗ Fallidas:   $failed"
echo "  📋 Total:      $total"
echo ""

# Calcular porcentaje
percentage=$((passed * 100 / total))
echo "  🎯 Éxito:      $percentage%"
echo ""

if [ $failed -eq 0 ]; then
    echo "✅ TODAS LAS VALIDACIONES PASARON"
    echo ""
    echo "🎉 El sitio tiene todas las mejoras avanzadas implementadas:"
    echo "   • PWA con manifest y service worker"
    echo "   • Íconos en múltiples tamaños"
    echo "   • SEO con Open Graph, Twitter Cards y Schema.org"
    echo "   • UX mejorado con toast, loading y scroll to top"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Prueba la instalación PWA en un dispositivo móvil"
    echo "   2. Comparte una URL en redes sociales para ver las cards"
    echo "   3. Prueba el funcionamiento offline"
    echo "   4. Revisa el documento MEJORAS_AVANZADAS_2025.md"
    echo ""
    exit 0
else
    echo "⚠️  HAY ELEMENTOS QUE REQUIEREN ATENCIÓN"
    echo ""
    echo "Revisa los elementos marcados con ✗ arriba"
    echo ""
    echo "🔧 Posibles soluciones:"
    echo "   • Regenerar íconos: cd scripts/pwa-tools && npm run generate-icons"
    echo "   • Verificar paths de archivos"
    echo "   • Re-ejecutar scripts de integración"
    echo ""
    exit 1
fi
