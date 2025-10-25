#!/bin/bash

# Script para consolidar archivos backup del frontend
# Mueve todos los archivos backup a un directorio centralizado

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/frontend/backups/$(date +%Y%m%d_%H%M%S)"

echo "=== Consolidación de Backups Frontend ==="
echo "Directorio destino: $BACKUP_DIR"
echo ""

# Crear directorio de destino
mkdir -p "$BACKUP_DIR"

# Contador
count=0

# Buscar archivos backup
backup_files=$(find "$PROJECT_ROOT/frontend/pages" \( -name "*backup*" -o -name "*.new" -o -name "*-backup-*" \) -type f)

# Mover archivos
for file in $backup_files; do
    if [ -f "$file" ]; then
        # Obtener ruta relativa
        rel_path="${file#$PROJECT_ROOT/frontend/pages/}"
        dest_dir="$BACKUP_DIR/$(dirname "$rel_path")"
        
        # Crear directorio de destino
        mkdir -p "$dest_dir"
        
        # Mover archivo
        echo "Moviendo: $rel_path"
        mv "$file" "$dest_dir/" || true
        count=$((count + 1))
    fi
done

echo ""
echo "=== Resumen ==="
echo "Archivos movidos: $count"
echo "Ubicación: $BACKUP_DIR"
echo ""

if [ $count -gt 0 ]; then
    echo "✅ Backups consolidados exitosamente"
    echo "📁 Puedes revisar los archivos en: frontend/backups/"
    echo "💡 Tip: Estos archivos ahora están ignorados por .gitignore"
else
    echo "ℹ️  No se encontraron archivos backup para mover"
fi
