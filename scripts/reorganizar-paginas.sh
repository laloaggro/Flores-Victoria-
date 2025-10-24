#!/bin/bash

echo "🗂️  REORGANIZACIÓN DE PÁGINAS - FLORES VICTORIA"
echo "==============================================="
echo ""

# Crear directorios organizados
BASE_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend/pages"

echo "📁 Creando estructura organizativa..."

# Crear directorios por categorías
mkdir -p "$BASE_DIR/auth"           # Autenticación
mkdir -p "$BASE_DIR/shop"           # E-commerce
mkdir -p "$BASE_DIR/user"           # Panel de usuario
mkdir -p "$BASE_DIR/admin"          # Administración
mkdir -p "$BASE_DIR/legal"          # Páginas legales
mkdir -p "$BASE_DIR/info"           # Información corporativa
mkdir -p "$BASE_DIR/support"        # Soporte y ayuda
mkdir -p "$BASE_DIR/dev"            # Desarrollo y testing
mkdir -p "$BASE_DIR/wishlist"       # Todas las variantes de wishlist

echo "✅ Directorios creados"
echo ""

echo "🔄 Plan de reorganización:"
echo "=========================="
echo ""

echo "👤 AUTH (Autenticación):"
echo "   login.html → auth/login.html"
echo "   register.html → auth/register.html"
echo "   forgot-password.html → auth/forgot-password.html"
echo "   reset-password.html → auth/reset-password.html"
echo "   new-password.html → auth/new-password.html"
echo ""

echo "🛍️  SHOP (E-commerce):"
echo "   products.html → shop/products.html"
echo "   product-detail.html → shop/product-detail.html"
echo "   catalog.html → shop/catalog.html"
echo "   cart.html → shop/cart.html"
echo "   checkout.html → shop/checkout.html"
echo ""

echo "👤 USER (Panel de Usuario):"
echo "   profile.html → user/profile.html"
echo "   orders.html → user/orders.html"
echo "   order-detail.html → user/order-detail.html"
echo "   invoice.html → user/invoice.html"
echo "   shipping.html → user/shipping.html"
echo ""

echo "🔧 ADMIN (Administración):"
echo "   admin.html → admin/dashboard.html"
echo "   admin-orders.html → admin/orders.html"
echo "   admin-products.html → admin/products.html"
echo "   admin-users.html → admin/users.html"
echo "   server-admin.html → admin/server.html"
echo ""

echo "📋 LEGAL (Páginas Legales):"
echo "   terms.html → legal/terms.html"
echo "   privacy.html → legal/privacy.html"
echo ""

echo "ℹ️  INFO (Información Corporativa):"
echo "   about.html → info/about.html"
echo "   contact.html → info/contact.html"
echo "   testimonials.html → info/testimonials.html"
echo ""

echo "🆘 SUPPORT (Soporte y Ayuda):"
echo "   faq.html → support/faq.html"
echo "   sitemap.html → support/sitemap.html"
echo ""

echo "🛠️  DEV (Desarrollo y Testing):"
echo "   test-styles.html → dev/test-styles.html"
echo "   footer-demo.html → dev/footer-demo.html"
echo "   example-improved.html → dev/example-improved.html"
echo ""

echo "💝 WISHLIST (Lista de Deseos):"
echo "   wishlist.html → wishlist/wishlist.html"
echo "   wishlist-*.html → wishlist/*.html"
echo ""

echo "❓ ¿Proceder con la reorganización? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔄 Iniciando reorganización..."
    
    # Mover archivos de autenticación
    echo "📁 Moviendo archivos de autenticación..."
    mv "$BASE_DIR/login.html" "$BASE_DIR/auth/"
    mv "$BASE_DIR/register.html" "$BASE_DIR/auth/"
    mv "$BASE_DIR/forgot-password.html" "$BASE_DIR/auth/"
    mv "$BASE_DIR/reset-password.html" "$BASE_DIR/auth/"
    mv "$BASE_DIR/new-password.html" "$BASE_DIR/auth/"
    
    # Mover archivos de e-commerce
    echo "📁 Moviendo archivos de e-commerce..."
    mv "$BASE_DIR/products.html" "$BASE_DIR/shop/"
    mv "$BASE_DIR/product-detail.html" "$BASE_DIR/shop/"
    mv "$BASE_DIR/catalog.html" "$BASE_DIR/shop/"
    mv "$BASE_DIR/cart.html" "$BASE_DIR/shop/"
    mv "$BASE_DIR/checkout.html" "$BASE_DIR/shop/"
    
    # Mover archivos de usuario
    echo "📁 Moviendo archivos de usuario..."
    mv "$BASE_DIR/profile.html" "$BASE_DIR/user/"
    mv "$BASE_DIR/orders.html" "$BASE_DIR/user/"
    mv "$BASE_DIR/order-detail.html" "$BASE_DIR/user/"
    mv "$BASE_DIR/invoice.html" "$BASE_DIR/user/"
    mv "$BASE_DIR/shipping.html" "$BASE_DIR/user/"
    
    # Mover archivos de administración
    echo "📁 Moviendo archivos de administración..."
    mv "$BASE_DIR/admin.html" "$BASE_DIR/admin/dashboard.html"
    mv "$BASE_DIR/admin-orders.html" "$BASE_DIR/admin/orders.html"
    mv "$BASE_DIR/admin-products.html" "$BASE_DIR/admin/products.html"
    mv "$BASE_DIR/admin-users.html" "$BASE_DIR/admin/users.html"
    mv "$BASE_DIR/server-admin.html" "$BASE_DIR/admin/server.html"
    
    # Mover archivos legales
    echo "📁 Moviendo archivos legales..."
    mv "$BASE_DIR/terms.html" "$BASE_DIR/legal/"
    mv "$BASE_DIR/privacy.html" "$BASE_DIR/legal/"
    
    # Mover archivos informativos
    echo "📁 Moviendo archivos informativos..."
    mv "$BASE_DIR/about.html" "$BASE_DIR/info/"
    mv "$BASE_DIR/contact.html" "$BASE_DIR/info/"
    mv "$BASE_DIR/testimonials.html" "$BASE_DIR/info/"
    
    # Mover archivos de soporte
    echo "📁 Moviendo archivos de soporte..."
    mv "$BASE_DIR/faq.html" "$BASE_DIR/support/"
    mv "$BASE_DIR/sitemap.html" "$BASE_DIR/support/"
    
    # Mover archivos de desarrollo
    echo "📁 Moviendo archivos de desarrollo..."
    mv "$BASE_DIR/test-styles.html" "$BASE_DIR/dev/"
    mv "$BASE_DIR/footer-demo.html" "$BASE_DIR/dev/"
    mv "$BASE_DIR/example-improved.html" "$BASE_DIR/dev/"
    
    # Mover archivos de wishlist
    echo "📁 Moviendo archivos de wishlist..."
    mv "$BASE_DIR/wishlist.html" "$BASE_DIR/wishlist/"
    mv "$BASE_DIR"/wishlist-*.html "$BASE_DIR/wishlist/" 2>/dev/null || true
    
    echo ""
    echo "✅ ¡Reorganización completada!"
    echo ""
    echo "📊 Nueva estructura:"
    tree "$BASE_DIR" -I "*.backup*" || find "$BASE_DIR" -type d | sort
    
else
    echo ""
    echo "❌ Reorganización cancelada"
fi

echo ""
echo "📋 RESUMEN DE ORGANIZACIÓN PROPUESTA:"
echo "====================================="
echo ""
echo "📁 auth/         - Autenticación (login, register, passwords)"
echo "📁 shop/         - E-commerce (productos, carrito, checkout)"
echo "📁 user/         - Panel usuario (perfil, pedidos, facturas)"
echo "📁 admin/        - Administración (dashboard, gestión)"
echo "📁 legal/        - Términos y privacidad"
echo "📁 info/         - Información corporativa"
echo "📁 support/      - Soporte y ayuda"
echo "📁 dev/          - Desarrollo y testing"
echo "📁 wishlist/     - Lista de deseos (todas las variantes)"
echo ""
echo "🎯 BENEFICIOS:"
echo "=============="
echo "✅ Mejor organización y mantenibilidad"
echo "✅ Fácil localización de archivos"
echo "✅ Separación clara de responsabilidades"
echo "✅ Estructura escalable"
echo "✅ Mejores prácticas de desarrollo web"