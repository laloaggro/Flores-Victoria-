#!/bin/bash

# Script para eliminar archivos CSS duplicados
# Mantener estructura: css/ (usado por HTML)
# Eliminar: src/css/, public/css/
# Fecha: 2025-01-05

set -e

echo "🧹 Limpiando archivos CSS duplicados..."
echo ""

# Backup
BACKUP_DIR="css-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Backup: $BACKUP_DIR"
echo ""

echo "=== Eliminando directorios CSS duplicados ==="

# Mover src/css/ a backup (Vite no lo necesita, los HTML usan /css/)
if [ -d "./src/css" ]; then
    mv "./src/css" "$BACKUP_DIR/src-css"
    echo "  ✓ src/css/ movido a backup"
fi

# Mover public/css/ a backup (duplicado de css/)
if [ -d "./public/css" ]; then
    mv "./public/css" "$BACKUP_DIR/public-css"
    echo "  ✓ public/css/ movido a backup"
fi

echo ""
echo "✅ Limpieza CSS completada!"
echo ""
echo "📊 RESUMEN:"
echo "   - Estructura mantenida: css/ (usado por todos los HTML)"
echo "   - Eliminados: src/css/, public/css/ (duplicados)"
echo "   - Backup en: $BACKUP_DIR"
echo ""

total=$(find "$BACKUP_DIR" -type f -name "*.css" | wc -l)
echo "📈 Archivos CSS movidos a backup: $total"
