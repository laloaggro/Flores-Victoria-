#!/bin/bash

# 🔍 AUDITORÍA Y CONSOLIDACIÓN DE PÁGINAS - FLORES VICTORIA
# ========================================================

echo "🔍 AUDITORÍA COMPLETA DE PÁGINAS DUPLICADAS"
echo "==========================================="
echo ""

PROJECT_ROOT="/home/impala/Documentos/Proyectos/flores-victoria"
BACKUP_DIR="$PROJECT_ROOT/consolidacion-backups/$(date +%Y%m%d_%H%M%S)"

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"

cd "$PROJECT_ROOT" || exit 1

echo "📊 ANÁLISIS DE DUPLICADOS POR FUNCIONALIDAD"
echo "==========================================="
echo ""

# FUNCIÓN: Analizar duplicados
analyze_duplicates() {
    local category="$1"
    local pattern="$2"
    local description="$3"
    
    echo "🔍 $description"
    echo "$(printf '=%.0s' {1..50})"
    
    # Encontrar archivos
    local files=($(find . -name "$pattern" -name "*.html" | grep -v backup | grep -v lighthouse | grep -v node_modules))
    
    # Clasificar por ubicación
    local functional=()
    local dist=()
    local duplicates=()
    
    for file in "${files[@]}"; do
        if [[ "$file" == *"/pages/"* ]]; then
            functional+=("$file")
        elif [[ "$file" == *"/dist/"* ]]; then  
            dist+=("$file")
        else
            duplicates+=("$file")
        fi
    done
    
    echo "✅ FUNCIONALES (mantener): ${#functional[@]}"
    printf '   %s\n' "${functional[@]}"
    echo ""
    
    echo "📦 DIST (eliminar - son build): ${#dist[@]}"
    printf '   %s\n' "${dist[@]}"
    echo ""
    
    echo "🗑️  DUPLICADOS (revisar): ${#duplicates[@]}"
    printf '   %s\n' "${duplicates[@]}"
    echo ""
    
    # Backup de funcionales
    for file in "${functional[@]}"; do
        if [ -f "$file" ]; then
            local backup_path="$BACKUP_DIR/$category/"
            mkdir -p "$backup_path"
            cp "$file" "$backup_path/"
        fi
    done
    
    # Eliminar archivos dist
    for file in "${dist[@]}"; do
        if [ -f "$file" ]; then
            echo "🗑️  Eliminando dist: $file"
            rm "$file"
        fi
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# ANÁLISIS POR CATEGORÍAS
analyze_duplicates "products" "*product*" "PRODUCTOS/CATÁLOGO"
analyze_duplicates "auth" "*login*" "LOGIN"
analyze_duplicates "auth" "*register*" "REGISTRO"  
analyze_duplicates "shop" "*cart*" "CARRITO"
analyze_duplicates "shop" "*checkout*" "CHECKOUT"
analyze_duplicates "admin" "*admin*" "ADMIN PANELS"
analyze_duplicates "users" "*user*" "USUARIOS"
analyze_duplicates "orders" "*order*" "PEDIDOS"

echo ""
echo "🎯 PÁGINAS ESENCIALES IDENTIFICADAS"
echo "=================================="

# Lista de páginas esenciales
ESSENTIAL_PAGES=(
    # CLIENTE
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
    
    # ADMIN
    "frontend/pages/admin/dashboard.html"
    "frontend/pages/admin/products.html"
    "frontend/pages/admin/orders.html"
    "frontend/pages/admin/users.html"
    "frontend/pages/owner/dashboard.html"
    "frontend/pages/worker/dashboard.html"
    
    # CONTABILIDAD
    "frontend/sistema-contable.html"
    "frontend/pages/accounting/dashboard.html"
    
    # ADMIN PANEL SEPARADO
    "admin-panel/public/index.html"
    "admin-panel/public/dashboard-visual.html"
    "admin-panel/public/orders/index.html" 
    "admin-panel/public/products/index.html"
    "admin-panel/public/users/index.html"
    "admin-panel/public/reports/index.html"
)

echo "📋 PÁGINAS ESENCIALES (${#ESSENTIAL_PAGES[@]} total):"
for page in "${ESSENTIAL_PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "✅ $page"
    else
        echo "❌ $page (FALTA)"
    fi
done

echo ""
echo "🗑️  ELIMINANDO ARCHIVOS OBSOLETOS"
echo "================================"

# Eliminar carpeta dist completa (es build)
if [ -d "frontend/dist" ]; then
    echo "🗑️  Eliminando frontend/dist/ completo (son archivos build)"
    rm -rf "frontend/dist"
fi

# Eliminar backups
if [ -d "backups" ]; then
    echo "🗑️  Eliminando backups/ antiguos"
    rm -rf "backups"
fi

if [ -d "frontend/backups" ]; then
    echo "🗑️  Eliminando frontend/backups/ antiguos"
    rm -rf "frontend/backups"  
fi

# Eliminar lighthouse reports
if [ -d "lighthouse-reports" ]; then
    echo "🗑️  Eliminando lighthouse-reports/ (reportes de auditoría)"
    rm -rf "lighthouse-reports"
fi

echo ""
echo "📊 ANÁLISIS DE PÁGINAS SIN CSS FUNCIONAL"
echo "======================================="

# Verificar páginas sin CSS
check_css_availability() {
    local file="$1"
    if [ -f "$file" ]; then
        local css_files=($(grep -o 'href="[^"]*\.css"' "$file" | sed 's/href="//g' | sed 's/"//g'))
        local missing_css=0
        
        for css_file in "${css_files[@]}"; do
            # Convertir ruta relativa a absoluta
            local full_css_path
            if [[ "$css_file" == /* ]]; then
                full_css_path="frontend$css_file"
            else  
                local dir=$(dirname "$file")
                full_css_path="$dir/$css_file"
            fi
            
            if [ ! -f "$full_css_path" ]; then
                ((missing_css++))
            fi
        done
        
        if [ $missing_css -gt 0 ]; then
            echo "⚠️  $file - CSS faltantes: $missing_css/${#css_files[@]}"
        else
            echo "✅ $file - CSS OK"
        fi
    fi
}

echo ""
echo "🎨 Verificando CSS en páginas esenciales:"
for page in "${ESSENTIAL_PAGES[@]}"; do
    if [ -f "$page" ]; then
        check_css_availability "$page"
    fi
done

echo ""
echo "📈 RESUMEN DE CONSOLIDACIÓN"
echo "=========================="
echo ""

# Contar páginas después
TOTAL_AFTER=$(find . -name "*.html" -not -path "*/node_modules/*" -not -path "*/backups/*" -not -path "*/lighthouse-reports/*" -not -path "*/consolidacion-backups/*" | wc -l)

echo "📊 ESTADÍSTICAS:"
echo "   • Páginas antes: 142"
echo "   • Páginas después: $TOTAL_AFTER"
echo "   • Eliminadas: $((142 - TOTAL_AFTER))"
echo "   • Esenciales identificadas: ${#ESSENTIAL_PAGES[@]}"
echo ""
echo "📁 Backups guardados en: $BACKUP_DIR"
echo ""
echo "✅ CONSOLIDACIÓN COMPLETADA"
echo "=========================="
echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "   1. Verificar páginas esenciales funcionando"
echo "   2. Crear/arreglar archivos CSS faltantes"
echo "   3. Probar navegación entre páginas" 
echo "   4. Actualizar navegacion-central.html"
echo ""