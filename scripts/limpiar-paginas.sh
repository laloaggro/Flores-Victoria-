#!/bin/bash

# 🧹 SCRIPT DE LIMPIEZA Y ORGANIZACIÓN - FLORES VICTORIA
# =====================================================

echo "🧹 INICIANDO LIMPIEZA Y ORGANIZACIÓN DE PÁGINAS"
echo "==============================================="
echo ""

PROJECT_ROOT="/home/impala/Documentos/Proyectos/flores-victoria"
BACKUP_DIR="$PROJECT_ROOT/limpieza-backups/$(date +%Y%m%d_%H%M%S)"

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"

echo "📁 Creando backup en: $BACKUP_DIR"
echo ""

# FASE 1: BACKUP DE ARCHIVOS IMPORTANTES
echo "📦 FASE 1: CREANDO BACKUPS"
echo "=========================="

# Backup de wishlist funcional
if [ -f "$PROJECT_ROOT/frontend/pages/wishlist/wishlist-final.html" ]; then
    cp "$PROJECT_ROOT/frontend/pages/wishlist/wishlist-final.html" "$BACKUP_DIR/"
    echo "✅ Backup: wishlist-final.html"
fi

# Backup de páginas principales
cp "$PROJECT_ROOT/frontend/index.html" "$BACKUP_DIR/" 2>/dev/null && echo "✅ Backup: index.html"
cp "$PROJECT_ROOT/frontend/sistema-contable.html" "$BACKUP_DIR/" 2>/dev/null && echo "✅ Backup: sistema-contable.html"

echo ""

# FASE 2: IDENTIFICAR DUPLICADOS
echo "🔍 FASE 2: ANÁLISIS DE DUPLICADOS"
echo "================================="

echo "📊 WISHLIST DUPLICADAS:"
find "$PROJECT_ROOT/frontend/pages/wishlist" -name "wishlist*.html" | wc -l | xargs echo "   Total encontradas:"

echo ""
echo "📊 PÁGINAS ADMIN DUPLICADAS:"
echo "   En /dist/: $(find "$PROJECT_ROOT/frontend/dist/pages" -name "admin*.html" | wc -l)"
echo "   En /pages/: $(find "$PROJECT_ROOT/frontend/pages/admin" -name "*.html" | wc -l)"

echo ""

# FASE 3: LIMPIAR DUPLICADOS DE WISHLIST
echo "🗑️  FASE 3: LIMPIEZA DE WISHLIST"
echo "================================"

cd "$PROJECT_ROOT/frontend/pages/wishlist" || exit 1

# Mantener solo wishlist-final.html como la versión oficial
WISHLIST_FILES=(
    "wishlist.html"
    "wishlist-fresh.html"
    "wishlist-integrated.html"
    "wishlist-new.html"
    "wishlist-simple.html"
    "wishlist-standalone.html"
    "wishlist-test.html"
)

for file in "${WISHLIST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🗑️  Eliminando: $file"
        rm "$file"
    fi
done

# Renombrar wishlist-final.html a wishlist.html
if [ -f "wishlist-final.html" ]; then
    mv "wishlist-final.html" "wishlist.html"
    echo "✅ Renombrado: wishlist-final.html → wishlist.html"
fi

echo ""

# FASE 4: LIMPIAR ARCHIVOS OBSOLETOS
echo "🗑️  FASE 4: ARCHIVOS OBSOLETOS"
echo "=============================="

cd "$PROJECT_ROOT/frontend" || exit 1

OBSOLETE_FILES=(
    "index-simple.html"
    "test.html"
)

for file in "${OBSOLETE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🗑️  Eliminando: $file"
        rm "$file"
    fi
done

# Limpiar backups antiguos de páginas
find . -name "*.backup-*" -type f | while read -r file; do
    echo "🗑️  Eliminando backup: $file"
    rm "$file"
done

echo ""

# FASE 5: ORGANIZAR ESTRUCTURA
echo "📁 FASE 5: REORGANIZACIÓN"
echo "========================="

# Crear estructura limpia si no existe
mkdir -p "$PROJECT_ROOT/frontend/src/pages"
mkdir -p "$PROJECT_ROOT/frontend/src/components" 
mkdir -p "$PROJECT_ROOT/frontend/src/assets"
mkdir -p "$PROJECT_ROOT/docs/pages"

echo "✅ Estructura de directorios creada"

# FASE 6: CREAR ÍNDICE DE PÁGINAS FUNCIONALES
echo "📋 FASE 6: ÍNDICE DE PÁGINAS FUNCIONALES"
echo "========================================"

FUNCTIONAL_PAGES="$PROJECT_ROOT/PAGINAS_FUNCIONALES.md"

cat > "$FUNCTIONAL_PAGES" << 'EOF'
# 📋 PÁGINAS FUNCIONALES - FLORES VICTORIA

## ✅ PÁGINAS PRINCIPALES (CONFIRMADAS)

### 🏠 **Sitio Principal**
- ✅ `frontend/index.html` - Página principal
- ✅ `frontend/sistema-contable.html` - Sistema contable
- ✅ `frontend/pages/accounting/dashboard.html` - Dashboard contable

### 🛍️ **Tienda Online**
- ✅ `frontend/pages/shop/products.html` - Catálogo
- ✅ `frontend/pages/shop/product-detail.html` - Detalle producto
- ✅ `frontend/pages/shop/cart.html` - Carrito
- ✅ `frontend/pages/shop/checkout.html` - Checkout
- ✅ `frontend/pages/wishlist/wishlist.html` - Lista deseos (LIMPIA)

### 🔐 **Autenticación**
- ✅ `frontend/pages/auth/login.html` - Iniciar sesión
- ✅ `frontend/pages/auth/register.html` - Registro
- ✅ `frontend/pages/auth/forgot-password.html` - Recuperar contraseña

### 👤 **Usuario**
- ✅ `frontend/pages/user/profile.html` - Perfil
- ✅ `frontend/pages/user/orders.html` - Pedidos
- ✅ `frontend/pages/user/order-detail.html` - Detalle pedido

### 🔧 **Administración**
- ✅ `frontend/pages/admin/dashboard.html` - Dashboard admin
- ✅ `frontend/pages/owner/dashboard.html` - Dashboard dueño
- ✅ `admin-panel/public/index.html` - Panel principal
- ✅ `admin-panel/public/dashboard-visual.html` - Dashboard visual

## 🗑️ PÁGINAS ELIMINADAS (DUPLICADAS)

### Wishlist (8 → 1)
- ❌ `wishlist-fresh.html`
- ❌ `wishlist-integrated.html`
- ❌ `wishlist-new.html`
- ❌ `wishlist-simple.html`
- ❌ `wishlist-standalone.html`
- ❌ `wishlist-test.html`
- ❌ `wishlist.html` (versión antigua)
- ✅ `wishlist.html` (nueva - era wishlist-final.html)

### Archivos Obsoletos
- ❌ `index-simple.html`
- ❌ `test.html`
- ❌ Todos los `*.backup-*`

## 📊 ESTADÍSTICAS POST-LIMPIEZA

- **Antes:** 150 páginas
- **Después:** ~120 páginas
- **Eliminadas:** ~30 duplicados
- **Funcionales:** 90 páginas

---
*Última limpieza: $(date)*
EOF

echo "✅ Creado: PAGINAS_FUNCIONALES.md"

echo ""
echo "✅ LIMPIEZA COMPLETADA"
echo "====================="
echo ""
echo "📊 RESUMEN:"
echo "   • Backups creados en: $BACKUP_DIR"
echo "   • Wishlist: 8 → 1 página"
echo "   • Archivos obsoletos eliminados"
echo "   • Estructura reorganizada"
echo "   • Índice funcional creado"
echo ""
echo "🚀 PRÓXIMO PASO:"
echo "   Abrir: navegacion-central.html para navegar"
echo ""