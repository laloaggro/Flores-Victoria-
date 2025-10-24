#!/bin/bash

# 🎨 ACTUALIZACIÓN MASIVA DE CSS - FLORES VICTORIA
# ===============================================

echo "🎨 ACTUALIZANDO CSS EN TODAS LAS PÁGINAS ESENCIALES"
echo "=================================================="
echo ""

PROJECT_ROOT="/home/impala/Documentos/Proyectos/flores-victoria"
cd "$PROJECT_ROOT" || exit 1

# CSS Links que necesitamos
CSS_LINKS='
    <!-- Fuentes -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Estilos principales -->
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/design-system.css">
    <link rel="stylesheet" href="/css/fixes.css">'

# Función para actualizar archivos HTML
update_html_css() {
    local file="$1"
    local relative_path="$2"
    
    if [ ! -f "$file" ]; then
        echo "❌ No existe: $file"
        return
    fi
    
    echo "🔄 Actualizando: $file"
    
    # Crear backup
    cp "$file" "$file.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Definir CSS correcto según la ubicación
    local css_prefix=""
    if [[ "$file" == *"/pages/"* ]]; then
        css_prefix="../.."
    elif [[ "$file" == *"/admin-panel/"* ]]; then
        css_prefix="../../frontend"
    elif [[ "$file" == *"/frontend/"* ]] && [[ "$file" != *"/pages/"* ]]; then
        css_prefix="."
    fi
    
    # Crear CSS actualizado
    local updated_css
    updated_css=$(echo "$CSS_LINKS" | sed "s|/css/|$css_prefix/css/|g")
    
    # Crear archivo temporal
    local temp_file=$(mktemp)
    
    # Procesar archivo
    awk -v css_links="$updated_css" '
    BEGIN { in_head = 0; css_added = 0; }
    /<head>/ { in_head = 1; print; next }
    /<\/head>/ { 
        if (in_head && !css_added) {
            print css_links
            css_added = 1
        }
        in_head = 0
        print
        next 
    }
    # Eliminar CSS existentes
    /rel="stylesheet"/ && /\.css/ { next }
    /fonts\.googleapis\.com/ { next }
    /font-awesome/ { next }
    /cdnjs\.cloudflare\.com/ { next }
    { print }
    ' "$file" > "$temp_file"
    
    # Reemplazar archivo original
    mv "$temp_file" "$file"
    
    echo "✅ Actualizado: $file"
}

# Lista de páginas esenciales
ESSENTIAL_PAGES=(
    "frontend/index.html"
    "frontend/pages/shop/products.html"
    "frontend/pages/shop/product-detail.html"
    "frontend/pages/shop/cart.html"
    "frontend/pages/shop/checkout.html"
    "frontend/pages/auth/login.html"
    "frontend/pages/auth/register.html"
    "frontend/pages/user/profile.html"
    "frontend/pages/user/orders.html"
    "frontend/pages/user/order-detail.html"
    "frontend/pages/info/contact.html"
    "frontend/pages/info/about.html"
    "frontend/pages/wishlist/wishlist.html"
    "frontend/pages/admin/dashboard.html"
    "frontend/pages/admin/products.html"
    "frontend/pages/admin/orders.html"
    "frontend/pages/admin/users.html"
    "frontend/pages/owner/dashboard.html"
    "frontend/pages/worker/dashboard.html"
    "frontend/pages/accounting/dashboard.html"
)

# Admin panel (necesita CSS diferente)
ADMIN_PANEL_PAGES=(
    "admin-panel/public/index.html"
    "admin-panel/public/dashboard-visual.html"
    "admin-panel/public/orders/index.html"
    "admin-panel/public/products/index.html"
    "admin-panel/public/users/index.html"
    "admin-panel/public/reports/index.html"
)

echo "🔄 Actualizando páginas principales..."
echo "====================================="

# Actualizar páginas principales
for page in "${ESSENTIAL_PAGES[@]}"; do
    if [ -f "$page" ]; then
        update_html_css "$page" "main"
    else
        echo "⚠️  No encontrada: $page"
    fi
done

echo ""
echo "🔄 Actualizando admin panel..."
echo "============================"

# CSS para admin panel
ADMIN_CSS_LINKS='
    <!-- Fuentes -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Estilos principales -->
    <link rel="stylesheet" href="../../frontend/css/base.css">
    <link rel="stylesheet" href="../../frontend/css/style.css">
    <link rel="stylesheet" href="../../frontend/css/design-system.css">
    <link rel="stylesheet" href="../../frontend/css/fixes.css">'

# Actualizar admin panel
for page in "${ADMIN_PANEL_PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "🔄 Actualizando admin: $page"
        
        # Backup
        cp "$page" "$page.backup-$(date +%Y%m%d-%H%M%S)"
        
        # Actualizar con CSS de admin
        temp_file=$(mktemp)
        awk -v css_links="$ADMIN_CSS_LINKS" '
        BEGIN { in_head = 0; css_added = 0; }
        /<head>/ { in_head = 1; print; next }
        /<\/head>/ { 
            if (in_head && !css_added) {
                print css_links
                css_added = 1
            }
            in_head = 0
            print
            next 
        }
        /rel="stylesheet"/ && /\.css/ { next }
        /fonts\.googleapis\.com/ { next }
        /font-awesome/ { next }
        /cdnjs\.cloudflare\.com/ { next }
        { print }
        ' "$page" > "$temp_file"
        
        mv "$temp_file" "$page"
        echo "✅ Actualizado admin: $page"
    else
        echo "⚠️  No encontrada: $page"
    fi
done

echo ""
echo "📊 VERIFICANDO RESULTADOS"
echo "========================"

# Verificar que el CSS se aplicó correctamente
check_css() {
    local file="$1"
    if [ -f "$file" ]; then
        local css_count=$(grep -c "\.css" "$file" 2>/dev/null || echo "0")
        if [ "$css_count" -ge 4 ]; then
            echo "✅ $file - CSS OK ($css_count archivos)"
        else
            echo "⚠️  $file - CSS PARCIAL ($css_count archivos)"
        fi
    fi
}

echo ""
echo "🎨 Verificando CSS en páginas principales:"
for page in "${ESSENTIAL_PAGES[@]}"; do
    check_css "$page"
done

echo ""
echo "🎨 Verificando CSS en admin panel:"
for page in "${ADMIN_PANEL_PAGES[@]}"; do
    check_css "$page"
done

echo ""
echo "✅ ACTUALIZACIÓN DE CSS COMPLETADA"
echo "=================================="
echo ""
echo "📊 RESUMEN:"
echo "   • Páginas principales actualizadas: ${#ESSENTIAL_PAGES[@]}"
echo "   • Admin panel actualizado: ${#ADMIN_PANEL_PAGES[@]}"
echo "   • CSS creados: 4 archivos (base.css, style.css, design-system.css, fixes.css)"
echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "   1. Verificar que las páginas cargan correctamente"
echo "   2. Probar navegación entre páginas"
echo "   3. Actualizar navegacion-central.html con el nuevo conteo"
echo ""
echo "🌐 Para probar:"
echo "   http://localhost:9002/frontend/index.html"
echo "   http://localhost:9002/navegacion-central.html"
echo ""