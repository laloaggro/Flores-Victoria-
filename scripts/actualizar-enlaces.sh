#!/bin/bash

echo "🎯 ACTUALIZACIÓN DE ENLACES - FLORES VICTORIA"
echo "============================================="
echo ""

# Este script actualiza todos los enlaces internos después de la reorganización

BASE_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
FRONTEND_DIR="$BASE_DIR/frontend"
PAGES_DIR="$FRONTEND_DIR/pages"

# Mapeo de rutas antiguas a nuevas
declare -A ROUTE_MAP=(
    # Autenticación
    ["pages/login.html"]="pages/auth/login.html"
    ["pages/register.html"]="pages/auth/register.html"
    ["pages/forgot-password.html"]="pages/auth/forgot-password.html"
    ["pages/reset-password.html"]="pages/auth/reset-password.html"
    ["pages/new-password.html"]="pages/auth/new-password.html"
    
    # E-commerce
    ["pages/products.html"]="pages/shop/products.html"
    ["pages/product-detail.html"]="pages/shop/product-detail.html"
    ["pages/catalog.html"]="pages/shop/catalog.html"
    ["pages/cart.html"]="pages/shop/cart.html"
    ["pages/checkout.html"]="pages/shop/checkout.html"
    
    # Usuario
    ["pages/profile.html"]="pages/user/profile.html"
    ["pages/orders.html"]="pages/user/orders.html"
    ["pages/order-detail.html"]="pages/user/order-detail.html"
    ["pages/invoice.html"]="pages/user/invoice.html"
    ["pages/shipping.html"]="pages/user/shipping.html"
    
    # Admin
    ["pages/admin.html"]="pages/admin/dashboard.html"
    ["pages/admin-orders.html"]="pages/admin/orders.html"
    ["pages/admin-products.html"]="pages/admin/products.html"
    ["pages/admin-users.html"]="pages/admin/users.html"
    ["pages/server-admin.html"]="pages/admin/server.html"
    
    # Legal
    ["pages/terms.html"]="pages/legal/terms.html"
    ["pages/privacy.html"]="pages/legal/privacy.html"
    
    # Info
    ["pages/about.html"]="pages/info/about.html"
    ["pages/contact.html"]="pages/info/contact.html"
    ["pages/testimonials.html"]="pages/info/testimonials.html"
    
    # Support
    ["pages/faq.html"]="pages/support/faq.html"
    ["pages/sitemap.html"]="pages/support/sitemap.html"
    
    # Dev
    ["pages/test-styles.html"]="pages/dev/test-styles.html"
    ["pages/footer-demo.html"]="pages/dev/footer-demo.html"
    ["pages/example-improved.html"]="pages/dev/example-improved.html"
)

echo "🔧 Función de actualización de enlaces creada"
echo ""

# Función para actualizar enlaces en un archivo
update_links_in_file() {
    local file="$1"
    local backup_file="${file}.backup-reorganization"
    
    # Crear backup
    cp "$file" "$backup_file"
    
    echo "📝 Actualizando: $(basename "$file")"
    
    # Actualizar cada mapeo de ruta
    for old_route in "${!ROUTE_MAP[@]}"; do
        new_route="${ROUTE_MAP[$old_route]}"
        
        # Actualizar enlaces relativos
        sed -i "s|href=\"$old_route\"|href=\"$new_route\"|g" "$file"
        sed -i "s|href='$old_route'|href='$new_route'|g" "$file"
        
        # Actualizar imports y scripts
        sed -i "s|src=\"$old_route\"|src=\"$new_route\"|g" "$file"
        sed -i "s|src='$old_route'|src='$new_route'|g" "$file"
        
        # Actualizar window.location
        sed -i "s|'$old_route'|'$new_route'|g" "$file"
        sed -i "s|\"$old_route\"|\"$new_route\"|g" "$file"
    done
}

echo "🎯 PLAN DE ACTUALIZACIÓN:"
echo "========================"
echo ""
echo "1️⃣ Actualizar enlaces en páginas HTML"
echo "2️⃣ Actualizar archivos JavaScript"
echo "3️⃣ Actualizar configuración Vite"
echo "4️⃣ Actualizar sitemap.xml"
echo "5️⃣ Actualizar manifest.json"
echo ""

echo "❓ ¿Proceder con la actualización de enlaces? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔄 Iniciando actualización de enlaces..."
    
    # 1. Actualizar todas las páginas HTML
    echo "📄 Actualizando páginas HTML..."
    find "$FRONTEND_DIR" -name "*.html" -not -path "*/node_modules/*" -not -name "*backup*" | while read -r file; do
        update_links_in_file "$file"
    done
    
    # 2. Actualizar archivos JavaScript
    echo "🔧 Actualizando archivos JavaScript..."
    find "$FRONTEND_DIR" -name "*.js" -not -path "*/node_modules/*" | while read -r file; do
        update_links_in_file "$file"
    done
    
    # 3. Actualizar vite.config.js si existe
    if [ -f "$FRONTEND_DIR/vite.config.js" ]; then
        echo "⚙️  Actualizando vite.config.js..."
        update_links_in_file "$FRONTEND_DIR/vite.config.js"
    fi
    
    # 4. Crear sitemap actualizado
    echo "🗺️  Generando sitemap actualizado..."
    cat > "$FRONTEND_DIR/sitemap.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Páginas principales -->
    <url><loc>https://floresvictoria.cl/</loc><priority>1.0</priority></url>
    
    <!-- E-commerce -->
    <url><loc>https://floresvictoria.cl/pages/shop/products.html</loc><priority>0.9</priority></url>
    <url><loc>https://floresvictoria.cl/pages/shop/catalog.html</loc><priority>0.8</priority></url>
    <url><loc>https://floresvictoria.cl/pages/shop/cart.html</loc><priority>0.7</priority></url>
    
    <!-- Información -->
    <url><loc>https://floresvictoria.cl/pages/info/about.html</loc><priority>0.8</priority></url>
    <url><loc>https://floresvictoria.cl/pages/info/contact.html</loc><priority>0.8</priority></url>
    <url><loc>https://floresvictoria.cl/pages/info/testimonials.html</loc><priority>0.6</priority></url>
    
    <!-- Autenticación -->
    <url><loc>https://floresvictoria.cl/pages/auth/login.html</loc><priority>0.7</priority></url>
    <url><loc>https://floresvictoria.cl/pages/auth/register.html</loc><priority>0.7</priority></url>
    
    <!-- Legal -->
    <url><loc>https://floresvictoria.cl/pages/legal/terms.html</loc><priority>0.5</priority></url>
    <url><loc>https://floresvictoria.cl/pages/legal/privacy.html</loc><priority>0.5</priority></url>
    
    <!-- Soporte -->
    <url><loc>https://floresvictoria.cl/pages/support/faq.html</loc><priority>0.6</priority></url>
</urlset>
EOF
    
    echo ""
    echo "✅ ¡Actualización de enlaces completada!"
    echo ""
    echo "📋 RESUMEN:"
    echo "==========="
    echo "✅ Enlaces HTML actualizados"
    echo "✅ Scripts JavaScript actualizados"
    echo "✅ Configuración Vite actualizada"
    echo "✅ Sitemap regenerado"
    echo "✅ Backups creados (*.backup-reorganization)"
    echo ""
    echo "⚠️  SIGUIENTE PASO:"
    echo "Probar la navegación para verificar que todos los enlaces funcionan"
    
else
    echo ""
    echo "❌ Actualización de enlaces cancelada"
fi

echo ""
echo "📊 SCRIPT DE ACTUALIZACIÓN COMPLETADO"