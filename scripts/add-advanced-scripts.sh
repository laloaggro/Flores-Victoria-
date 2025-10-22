#!/bin/bash

# Script para agregar scripts de mejoras avanzadas (SEO, UX) a páginas HTML
# Agrega: seo-manager.js y ux-enhancements.js antes del cierre de body

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"

echo "🚀 Agregando scripts de mejoras avanzadas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Páginas a actualizar
PAGES=(
    "$FRONTEND_DIR/index.html"
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
    "$FRONTEND_DIR/pages/product-detail.html"
    "$FRONTEND_DIR/pages/forgot-password.html"
    "$FRONTEND_DIR/pages/new-password.html"
    "$FRONTEND_DIR/pages/reset-password.html"
    "$FRONTEND_DIR/pages/shipping.html"
)

SCRIPTS_TO_ADD='    <!-- Advanced Enhancements -->
    <script src="/js/seo-manager.js"></script>
    <script src="/js/ux-enhancements.js"></script>'

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
    
    # Verificar si ya tiene los scripts
    if grep -q 'seo-manager.js' "$page" && grep -q 'ux-enhancements.js' "$page"; then
        echo "  ○ $(basename $page) - Ya tiene scripts avanzados"
        ((skipped++))
        continue
    fi
    
    # Crear backup
    cp "$page" "${page}.backup-advanced"
    
    # Agregar scripts antes del cierre de body pero después de sw-register
    if grep -q 'sw-register.js' "$page"; then
        # Agregar después de sw-register
        sed -i '/sw-register.js/a\'"$SCRIPTS_TO_ADD" "$page"
    else
        # Agregar antes de </body>
        sed -i 's|</body>|'"$SCRIPTS_TO_ADD"'\n</body>|' "$page"
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
echo "💡 Funcionalidades agregadas:"
echo "   • SEO Manager: Meta tags Open Graph, Twitter Cards, Schema.org"
echo "   • UX Enhancements: Scroll to top, Toast notifications, Loading overlay"
echo ""
echo "📖 Uso:"
echo "   // Toast notifications"
echo "   toast.success('Operación exitosa')"
echo "   toast.error('Error al procesar')"
echo "   "
echo "   // Loading overlay"
echo "   loading.show('Procesando...')"
echo "   loading.hide()"
echo "   "
echo "   // SEO para productos"
echo "   seoManager.init('product', { title, description, price, image })"
