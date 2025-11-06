#!/bin/bash

# Script para eliminar archivos duplicados manteniendo la estructura canónica
# Directorio canónico: src/ (entrada de Vite)
# Fecha: 2025-01-05

set -e  # Salir si hay error

echo "🧹 Iniciando limpieza de archivos duplicados..."
echo ""

# Crear backup antes de eliminar
BACKUP_DIR="duplicates-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Backup creado en: $BACKUP_DIR"
echo ""

# Función para mover a backup y eliminar
backup_and_remove() {
    local file=$1
    if [ -f "$file" ]; then
        local backup_path="$BACKUP_DIR/$file"
        mkdir -p "$(dirname "$backup_path")"
        mv "$file" "$backup_path"
        echo "  ✓ Movido a backup: $file"
    fi
}

echo "=== 1. Limpiando Service Workers duplicados ==="
# Mantener: public/sw.js (usado por navegador)
# Eliminar: sw.js, js/sw.js, public/js/sw.js
backup_and_remove "./sw.js"
backup_and_remove "./js/sw.js"
backup_and_remove "./public/js/sw.js"
backup_and_remove "./sw-advanced.js"
backup_and_remove "./service-worker.js"
backup_and_remove "./js/sw-register.js"
backup_and_remove "./public/js/sw-register.js"
echo ""

echo "=== 2. Limpiando directorios completos duplicados ==="
# La estructura es: src/ (canónico), components/, js/, public/js/
# Mantener: src/ para lógica de app, public/ para assets estáticos
# Eliminar: js/ (duplicado de public/js y src/), components/ (duplicado)

echo "Moviendo /js/ completo a backup..."
if [ -d "./js" ]; then
    mv "./js" "$BACKUP_DIR/js"
    echo "  ✓ Directorio js/ movido a backup"
fi

echo "Moviendo /components/ completo a backup..."
if [ -d "./components" ]; then
    mv "./components" "$BACKUP_DIR/components"
    echo "  ✓ Directorio components/ movido a backup"
fi
echo ""

echo "=== 3. Limpiando archivos duplicados en public/js/ vs src/ ==="
# Mantener versiones en src/ si existen, eliminar de public/js/

# Utils duplicados
backup_and_remove "./public/js/utils.js"
backup_and_remove "./public/js/components/utils/utils.js"
backup_and_remove "./public/js/components/utils/auth.js"
backup_and_remove "./public/js/utils/auth.js"
backup_and_remove "./public/js/components/utils/user.js"
backup_and_remove "./public/js/utils/user.js"
backup_and_remove "./public/js/components/utils/theme.js"
backup_and_remove "./public/js/utils/theme.js"
backup_and_remove "./public/js/components/utils/accessibility.js"
backup_and_remove "./public/js/utils/accessibility.js"
backup_and_remove "./public/js/utils/http.js"
backup_and_remove "./public/js/utils/httpClient.js"
backup_and_remove "./public/js/utils/validations.js"
backup_and_remove "./public/js/utils/roleManager.js"
echo ""

echo "=== 4. Limpiando componentes duplicados en public/js/ ==="
# ProductCard, Products, CartItem, Header, Footer, Button, Card
backup_and_remove "./public/js/components/product/ProductCard.js"
backup_and_remove "./public/js/components/product/Products.js"
backup_and_remove "./public/js/components/product/ProductManager.js"
backup_and_remove "./public/js/components/cart/CartItem.js"
backup_and_remove "./public/js/components/cart/checkout.js"
backup_and_remove "./public/js/components/cart/persistentCart.js"
backup_and_remove "./public/js/components/ui/Header.js"
backup_and_remove "./public/js/components/ui/Footer.js"
backup_and_remove "./public/js/components/ui/Testimonials.js"
backup_and_remove "./public/js/components/ui/LatestTestimonials.js"
backup_and_remove "./public/js/components/shared/Button.js"
backup_and_remove "./public/js/components/shared/Card.js"
echo ""

echo "=== 5. Limpiando páginas duplicadas en public/js/ ==="
backup_and_remove "./public/js/pages/admin.js"
backup_and_remove "./public/js/pages/products.js"
backup_and_remove "./public/js/pages/contact.js"
backup_and_remove "./public/js/pages/home.js"
backup_and_remove "./public/js/components/pages/admin.js"
backup_and_remove "./public/js/components/pages/products.js"
backup_and_remove "./public/js/components/pages/contact.js"
backup_and_remove "./public/js/components/pages/profile.js"
backup_and_remove "./public/js/components/pages/wishlist.js"
backup_and_remove "./public/js/components/pages/wishlist-page.js"
backup_and_remove "./public/js/components/pages/forgot-password.js"
backup_and_remove "./public/js/components/pages/orders.js"
backup_and_remove "./public/js/components/pages/admin-orders.js"
backup_and_remove "./public/js/components/pages/homeProducts.js"
echo ""

echo "=== 6. Limpiando archivos de optimización duplicados ==="
backup_and_remove "./public/js/performance-optimizer.js"
backup_and_remove "./public/js/image-optimizer.js"
backup_and_remove "./public/js/seo-optimizer.js"
backup_and_remove "./public/js/seo-manager.js"
echo ""

echo "=== 7. Limpiando otros archivos duplicados ==="
backup_and_remove "./public/js/main.js"
backup_and_remove "./pages/js/main.js"
backup_and_remove "./assets/js/main.js"
backup_and_remove "./public/js/i18n/index.js"
backup_and_remove "./public/js/i18n/en.js"
backup_and_remove "./public/js/i18n/es.js"
backup_and_remove "./public/js/analytics.js"
backup_and_remove "./public/js/analytics/ga4-enhanced.js"
backup_and_remove "./public/js/ux-enhancements.js"
backup_and_remove "./public/js/automated-tests.js"
backup_and_remove "./public/js/payments.js"
backup_and_remove "./public/js/components-loader.js"
backup_and_remove "./public/js/accessibility-enhancer.js"
backup_and_remove "./public/js/security/csp-manager.js"
backup_and_remove "./public/js/config/api.js"
backup_and_remove "./public/js/config/business-config.js"
backup_and_remove "./public/js/monitoring/error-tracker.js"
backup_and_remove "./public/js/monitoring/performance-budget.js"
backup_and_remove "./public/js/monitoring/metrics-dashboard.js"
backup_and_remove "./public/js/components/utils/lazyLoad.js"
backup_and_remove "./public/js/components/utils/userMenu.js"
backup_and_remove "./public/js/components/utils/headerMenu.js"
backup_and_remove "./public/js/components/utils/pageUserMenu.js"
backup_and_remove "./public/js/components/utils/errorHandler.js"
echo ""

echo "=== 8. Limpiando archivos de assets antiguos ==="
if [ -d "./assets/js" ]; then
    mv "./assets" "$BACKUP_DIR/assets"
    echo "  ✓ Directorio assets/ movido a backup"
fi
echo ""

echo "✅ Limpieza completada!"
echo ""
echo "📊 RESUMEN:"
echo "   - Backup guardado en: $BACKUP_DIR"
echo "   - Estructura mantenida:"
echo "     • src/ - Código fuente principal (usado por Vite)"
echo "     • public/ - Assets estáticos (load-products.js, sw.js)"
echo "     • tests/ - Tests unitarios"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Verifica que el sitio funcione correctamente"
echo "   - Si algo falla, restaura desde: $BACKUP_DIR"
echo "   - Para revertir: cp -r $BACKUP_DIR/* ."
echo ""

# Contar archivos eliminados
total_backed=$(find "$BACKUP_DIR" -type f | wc -l)
echo "📈 Total de archivos movidos a backup: $total_backed"
