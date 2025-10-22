#!/bin/bash

# Script para agregar referencias PWA a todas las páginas HTML
# Agrega: favicon, apple-touch-icon, manifest y theme-color

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"

echo "🔧 Agregando referencias PWA a páginas HTML"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Definir las páginas a actualizar (excluyendo las que ya tienen PWA)
PAGES=(
    "$FRONTEND_DIR/pages/products.html"
    "$FRONTEND_DIR/pages/about.html"
    "$FRONTEND_DIR/pages/contact.html"
    "$FRONTEND_DIR/pages/login.html"
    "$FRONTEND_DIR/pages/register.html"
    "$FRONTEND_DIR/pages/cart.html"
    "$FRONTEND_DIR/pages/checkout.html"
    "$FRONTEND_DIR/pages/wishlist.html"
    "$FRONTEND_DIR/pages/profile.html"
    "$FRONTEND_DIR/pages/orders.html"
    "$FRONTEND_DIR/pages/order-detail.html"
    "$FRONTEND_DIR/pages/admin.html"
    "$FRONTEND_DIR/pages/admin-products.html"
    "$FRONTEND_DIR/pages/admin-orders.html"
    "$FRONTEND_DIR/pages/admin-users.html"
    "$FRONTEND_DIR/pages/forgot-password.html"
    "$FRONTEND_DIR/pages/new-password.html"
    "$FRONTEND_DIR/pages/reset-password.html"
    "$FRONTEND_DIR/pages/shipping.html"
    "$FRONTEND_DIR/pages/product-detail.html"
)

PWA_META='    <meta name="theme-color" content="#2d5016">'
PWA_LINKS='    \
    <!-- PWA -->\
    <link rel="icon" href="/favicon.png">\
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">\
    <link rel="manifest" href="/manifest.json">'

SW_SCRIPT='    \
    <!-- Service Worker Registration -->\
    <script src="/js/sw-register.js"></script>'

count=0
updated=0
skipped=0

for page in "${PAGES[@]}"; do
    ((count++))
    
    if [ ! -f "$page" ]; then
        echo "  ⚠ Archivo no encontrado: $(basename $page)"
        ((skipped++))
        continue
    fi
    
    # Verificar si ya tiene referencias PWA
    if grep -q 'rel="manifest"' "$page"; then
        echo "  ○ $(basename $page) - Ya tiene PWA"
        ((skipped++))
        continue
    fi
    
    # Crear backup
    cp "$page" "${page}.backup-pwa"
    
    # Agregar theme-color después de description si no existe
    if ! grep -q 'name="theme-color"' "$page"; then
        sed -i '/<meta name="description"/a\'"$PWA_META" "$page"
    fi
    
    # Agregar enlaces PWA después de description o theme-color
    if ! grep -q 'rel="manifest"' "$page"; then
        # Buscar la línea después de description o theme-color
        sed -i '/<meta name="theme-color"\|<meta name="description"/a\'"$PWA_LINKS" "$page"
    fi
    
    # Agregar script SW antes del cierre de body si no existe
    if ! grep -q 'sw-register.js' "$page"; then
        sed -i 's|</body>|'"$SW_SCRIPT"'\n</body>|' "$page"
    fi
    
    echo "  ✓ $(basename $page) - Actualizado"
    ((updated++))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumen:"
echo "   Total:        $count páginas"
echo "   Actualizadas: $updated páginas"
echo "   Omitidas:     $skipped páginas"
echo ""
echo "✅ Proceso completado"
echo ""
echo "💡 Notas:"
echo "   • Los backups están en: *.backup-pwa"
echo "   • Verifica que todo funcione correctamente"
echo "   • Puedes eliminar los backups con: rm *.backup-pwa"
