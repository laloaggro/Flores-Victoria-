#!/bin/bash

# Script de Optimización de Componentes
# Elimina console.logs de producción y optimiza código

echo "🔧 Optimizando componentes JavaScript..."

COMPONENTS_DIR="frontend/js/components"
BACKUP_DIR="frontend/js/components/.backup-$(date +%Y%m%d)"

# Crear backup
echo "📦 Creando backup en $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"

# Lista de componentes a optimizar
COMPONENTS=(
    "quick-view-modal.js"
    "products-carousel.js"
    "product-comparison.js"
    "instant-search.js"
    "form-validator.js"
    "cart-manager.js"
    "analytics.js"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$COMPONENTS_DIR/$component" ]; then
        echo "  ⚙️  Procesando $component..."
        
        # Backup
        cp "$COMPONENTS_DIR/$component" "$BACKUP_DIR/$component"
        
        # Eliminar console.log (excepto console.error y console.warn)
        sed -i '/console\.log/d' "$COMPONENTS_DIR/$component"
        
        # Reemplazar múltiples espacios en blanco por uno solo
        sed -i 's/  \+/ /g' "$COMPONENTS_DIR/$component"
        
        echo "    ✅ $component optimizado"
    fi
done

echo ""
echo "✨ Optimización completada!"
echo "📊 Backup guardado en: $BACKUP_DIR"
echo ""
echo "Para revertir cambios:"
echo "  cp $BACKUP_DIR/* $COMPONENTS_DIR/"
