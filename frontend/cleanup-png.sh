#!/bin/bash

# Script para eliminar archivos PNG que tienen equivalente WebP
# Fecha: 2025-01-05

set -e

echo "🧹 Eliminando archivos PNG redundantes..."
echo ""

# Backup
BACKUP_DIR="png-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Backup: $BACKUP_DIR"
echo ""

# Contadores
deleted=0
kept=0

# Buscar todos los PNG
find images -name "*.png" -type f | while read png_file; do
    # Obtener ruta sin extensión
    base="${png_file%.png}"
    webp_file="${base}.webp"
    
    # Verificar si existe el WebP
    if [ -f "$webp_file" ]; then
        # Crear estructura de directorio en backup
        backup_path="$BACKUP_DIR/$png_file"
        mkdir -p "$(dirname "$backup_path")"
        
        # Mover PNG a backup
        mv "$png_file" "$backup_path"
        ((deleted++))
        echo "  ✓ $png_file → backup (WebP existe)"
    else
        ((kept++))
        echo "  ⚠ Mantenido: $png_file (sin WebP)"
    fi
done

echo ""
echo "✅ Limpieza completada!"
echo ""
echo "📊 RESUMEN:"
echo "   - PNG eliminados (tienen WebP): $deleted"
echo "   - PNG mantenidos (sin WebP): $kept"
echo "   - Backup en: $BACKUP_DIR"
echo ""

# Espacio liberado
du -sh "$BACKUP_DIR" | awk '{print "💾 Espacio liberado: "$1}'
